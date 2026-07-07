import { Request, Response } from 'express';
import { db, supabase } from '../db/db';
import { mockDb, Suggestion } from '../db/mockDb';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Submit suggestion, running AI vision scoring, duplicate detection, and updating contribution points.
 */
export const createSuggestion = async (req: Request, res: Response) => {
  const {
    citizen_id,
    title,
    description,
    state,
    district,
    village,
    block,
    location_lat,
    location_lng,
    estimated_beneficiaries,
    urgency
  } = req.body;

  // Fallback: take the first attached file for AI processing (if any)
  const files = req.files as Express.Multer.File[];
  const imageFile = files && files.length > 0 ? files[0] : null;

  if (!citizen_id || !title || !description || !state || !district) {
    return res.status(400).json({ error: 'Missing required parameters (citizen_id, title, description, state, district)' });
  }

  try {
    let completenessScore = 60;
    let computedUrgency = urgency || 'medium';
    let photoVerified = !!imageFile;
    let locationVerified = !!(location_lat && location_lng);
    let computedBeneficiaries = Number(estimated_beneficiaries) || 100;
    let computedImpact = 'Medium';
    let confidenceScore = 80;
    let aiCategory = 'Others';

    if (ai) {
      try {
        let contents: any[] = [];
        if (imageFile) {
          const base64Image = imageFile.buffer.toString('base64');
          contents.push({
            inlineData: {
              mimeType: imageFile.mimetype || 'image/jpeg',
              data: base64Image
            }
          });
        }
        
        const prompt = `
          Analyze the following citizen suggestion details:
          Title: "${title}"
          Description: "${description}"
          Location: Village: ${village || 'Unknown'}, Block: ${block || 'Unknown'}, District: ${district}, State: ${state}

          First, classify this complaint into exactly ONE of these categories:
          ["Road", "Bridge", "School", "College", "Hospital", "PHC", "Water Supply", "Drainage", "Street Lights", "Electricity", "Library", "Park", "Sports Ground", "Skill Center", "Women's Safety", "Public Transport", "Internet", "Waste Management", "Environment", "Agriculture", "Others"]

          Evaluate and output ONLY a JSON object:
          {
            "category": "Selected Category",
            "completenessScore": (0-100),
            "urgency": "low" | "medium" | "high" | "critical",
            "photoVerified": boolean (true if image matches description),
            "locationVerified": boolean,
            "estimatedBeneficiaries": integer,
            "impact": "Low" | "Medium" | "High" | "Critical",
            "confidenceScore": (0-100)
          }
        `;
        contents.push({ text: prompt });

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents,
          config: { responseMimeType: 'application/json' }
        });
        
        const evaluation = JSON.parse(response.text || '{}');
        aiCategory = evaluation.category || 'Others';
        completenessScore = evaluation.completenessScore ?? completenessScore;
        computedUrgency = evaluation.urgency ?? computedUrgency;
        photoVerified = evaluation.photoVerified ?? photoVerified;
        locationVerified = evaluation.locationVerified ?? locationVerified;
        computedBeneficiaries = evaluation.estimatedBeneficiaries ?? computedBeneficiaries;
        computedImpact = evaluation.impact ?? computedImpact;
        confidenceScore = evaluation.confidenceScore ?? confidenceScore;
      } catch (aiErr) {
        console.error('AI Suggestion evaluation error, using defaults:', aiErr);
      }
    }

    // 2. Duplicate Detection
    let duplicateOfId: string | null = null;
    try {
      const candidates = await db.getSuggestions({ category: aiCategory, district });
      if (candidates.length > 0) {
        if (ai) {
          const listPayload = candidates.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            village: c.village || 'Unknown'
          }));

          const dupPrompt = `
            Determine if the suggestion:
            Title: "${title}"
            Category: "${aiCategory}"
            Description: "${description}"
            Location: Village: ${village || 'Unknown'}, Block: ${block || 'Unknown'}
            
            is a DUPLICATE of any suggestion in this list (describing the exact same physical project/need at the same place):
            ${JSON.stringify(listPayload)}

            Return ONLY JSON:
            {
              "isDuplicate": boolean,
              "duplicateOfId": "the matching ID, or null"
            }
          `;
          
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: dupPrompt,
            config: { responseMimeType: 'application/json' }
          });
          const dupRes = JSON.parse(response.text || '{}');
          if (dupRes.isDuplicate && dupRes.duplicateOfId) {
            duplicateOfId = dupRes.duplicateOfId;
          }
        } else {
          // Simple string match fallback
          const match = candidates.find(c => c.title.toLowerCase().includes(title.toLowerCase().substring(0, 10)));
          if (match) duplicateOfId = match.id;
        }
      }
    } catch (dupErr) {
      console.error('Duplicate checking error:', dupErr);
    }

    // 3. Create Suggestion Record
    const suggestionInput: Omit<Suggestion, 'id' | 'created_at' | 'updated_at'> = {
      citizen_id,
      title,
      category: aiCategory,
      description,
      state,
      district,
      village,
      block,
      location_lat: location_lat ? Number(location_lat) : undefined,
      location_lng: location_lng ? Number(location_lng) : undefined,
      estimated_beneficiaries: computedBeneficiaries,
      urgency: computedUrgency as any,
      status: duplicateOfId ? 'duplicate_checked' : 'submitted',
      
      ai_score_completeness: completenessScore,
      ai_score_impact: computedImpact as any,
      ai_score_location_verified: locationVerified,
      ai_score_photo_verified: photoVerified,
      ai_score_confidence: confidenceScore,
      duplicate_of_id: duplicateOfId,
      complaint_number: `JSN-${Math.floor(100000 + Math.random() * 900000)}`
    } as any;

    const newSuggestion = await db.createSuggestion(suggestionInput);

    // 4. Handle attachments if present
    if (files && files.length > 0) {
      for (const file of files) {
        let fileUrl = `https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600&auto=format&fit=crop`; // fallback mock
        let fileType = 'document';
        
        if (file.mimetype.startsWith('image/')) fileType = 'image';
        else if (file.mimetype.startsWith('video/')) fileType = 'video';
        else if (file.mimetype.startsWith('audio/')) fileType = 'voice';

        if (supabase) {
          const ext = file.originalname.split('.').pop() || 'bin';
          const fileName = `${newSuggestion.id}_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
          
          const { data, error } = await supabase.storage
            .from('media')
            .upload(fileName, file.buffer, {
              contentType: file.mimetype,
              upsert: false
            });

          if (error) {
            console.error('Failed to upload file to Supabase Storage:', error);
          } else {
            const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
            fileUrl = publicUrl;
          }
        }

        await db.addMediaAttachment({
          suggestion_id: newSuggestion.id,
          file_url: fileUrl,
          file_type: fileType as any
        });
      }
    }

    return res.status(201).json({
      message: 'Suggestion submitted successfully!',
      suggestion: newSuggestion,
      isDuplicate: !!duplicateOfId,
      duplicateOfId
    });
  } catch (error: any) {
    console.error('Error submitting suggestion:', error);
    return res.status(500).json({ error: 'Failed to submit suggestion', details: error.message });
  }
};

/**
 * Fetch suggestions with optional filtering.
 */
export const getSuggestions = async (req: Request, res: Response) => {
  const { citizen_id, category, district } = req.query;
  console.log("=== GET /api/suggestions ===");
  console.log("Query:", req.query);

  try {
    const list = await db.getSuggestions({
      citizen_id: citizen_id as string,
      category: category as string,
      district: district as string
    });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch suggestions', details: error.message });
  }
};

/**
 * Get Suggestion details by ID, including timeline events and attachments.
 */
export const getSuggestionDetails = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const suggestion = await db.getSuggestionById(id);
    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    const timeline = await db.getTimelineEvents(id);
    const media = await db.getMediaAttachments(id);

    return res.json({
      ...suggestion,
      timeline,
      media
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve suggestion details', details: error.message });
  }
};

/**
 * Add status updates / timeline events (MP actions).
 */
export const addTimelineStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const event = await db.addTimelineEvent({
      suggestion_id: id,
      status,
      notes: notes || `Suggestion transitioned to state: ${status}`
    });

    return res.json({ message: 'Timeline updated successfully', event });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update timeline', details: error.message });
  }
};

/**
 * Profile Upsert (called on registration / login sync).
 */
export const syncProfile = async (req: Request, res: Response) => {
  const {
    id,
    full_name,
    phone,
    state,
    district,
    parliamentary_constituency,
    assembly_constituency,
    village_ward,
    pincode,
    language_preference,
    role,
    aadhaar_number,
    verification_status,
    avatar_url
  } = req.body;

  if (!id || !full_name || !state || !district) {
    return res.status(400).json({ error: 'ID, full_name, state, and district are required to sync profile.' });
  }

  try {
    const profile = await db.upsertProfile({
      id,
      full_name,
      phone,
      state,
      district,
      parliamentary_constituency,
      assembly_constituency,
      village_ward,
      pincode,
      language_preference: language_preference || 'en',
      role: role || 'citizen',
      aadhaar_number,
      verification_status,
      avatar_url
    });

    return res.json({ message: 'Profile synced successfully', profile });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to sync profile', details: error.message });
  }
};

/**
 * Fetch detailed profile info, points, and badges list.
 */
export const getProfileDetails = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const profile = await db.getProfile(id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    
    const suggestionsList = await db.getSuggestions({ citizen_id: id });

    return res.json({
      profile,
      suggestionsCount: suggestionsList.length
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to retrieve profile', details: error.message });
  }
};
