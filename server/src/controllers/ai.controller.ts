import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db } from '../db/db';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
export const isGeminiConfigured = !!apiKey;

const ai = isGeminiConfigured ? new GoogleGenAI({ apiKey }) : null;

if (isGeminiConfigured) {
  console.log('AI Engine connected: Gemini 2.5 Flash is active.');
} else {
  console.log('AI Engine: Gemini API key not found. Falling back to AI Simulator.');
}

/**
 * 1. AI Writing Assistant
 * Helps user write structured development suggestions.
 */
export const getWritingAssist = async (req: Request, res: Response) => {
  const { title, description, category, language } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  // Fallback simulator if Gemini is not configured
  if (!ai) {
    const questions: string[] = [];
    let improvedText = description;

    if (category === 'School' || category === 'College') {
      questions.push(
        'How many children in the village are currently out of school or traveling far?',
        'What is the distance to the nearest existing educational institute?',
        'Is there any government-owned land or building available for this school/college?'
      );
      improvedText = `Proposal for development: We need a new ${category} in our village. This will benefit the student community significantly. Currently, students travel a long distance. ${description}`;
    } else if (category === 'Road' || category === 'Bridge') {
      questions.push(
        'What is the approximate length of the damaged road/bridge?',
        'Which villages or wards does this road/bridge connect?',
        'Has this issue caused any minor accidents or blocked transport during rains?'
      );
      improvedText = `Road Development Proposal: Urgently require repair and widening of the road. ${description}`;
    } else if (category === 'PHC' || category === 'Hospital') {
      questions.push(
        'What is the population of the village/block served by this health facility?',
        'What are the main services missing? (e.g., maternity ward, pharmacy, clean water, regular doctors)',
        'Where is the nearest alternative hospital located?'
      );
      improvedText = `Health Infrastructure Request: Improving healthcare facilities for the village. ${description}`;
    } else {
      questions.push(
        'Approximately how many residents will benefit from this development?',
        'Are there existing facilities of this type nearby?',
        'What is the main urgency level for this project?'
      );
    }

    return res.json({
      questions,
      improvedText,
      languageDetected: language || 'en',
      completenessScore: description.length > 100 ? 85 : 45
    });
  }

  try {
    const prompt = `
      You are an AI Writing Assistant for a citizen portal called "Jansunwai AI".
      Citizens submit development suggestions (NOT complaints) to their MP.
      
      User's Category: "${category || 'General'}"
      User's Language: "${language || 'en'}"
      User's Title: "${title || ''}"
      User's Text: "${description}"

      Tasks:
      1. Analyze the user's input. Identify missing critical details for development planning (e.g. population size, nearest alternative, land availability, impact).
      2. Formulate exactly 2 to 3 clarifying questions in the user's selected language to help them improve their proposal.
      3. Rewrite the user's suggestion to be highly professional, structured, and formal (maintaining the original language or translating to English if they request, but keep it in user's language by default).
      4. Assign a completeness score from 0 to 100 based on the depth of information provided.

      Return ONLY a JSON object with this schema:
      {
        "questions": ["Question 1", "Question 2"],
        "improvedText": "Sleek professional draft of the proposal...",
        "languageDetected": "en or hi or bjp",
        "completenessScore": 75
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const resultText = response.text || '{}';
    const result = JSON.parse(resultText);
    return res.json(result);
  } catch (error: any) {
    console.error('Error in writing assist API:', error);
    return res.status(500).json({ error: 'AI Writing Assist failed', details: error.message });
  }
};

/**
 * 2. Voice Suggestions / Speech-to-Text
 * Receives audio file, transcribes it, and structures it into a Suggestion form.
 */
export const processVoiceSuggestion = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Audio file is required' });
  }

  // Fallback simulator if Gemini is not configured
  if (!ai) {
    // Return mock structured suggestion based on a random template
    const categories = ['Road', 'School', 'PHC', 'Water Supply', 'Street Lights'];
    const mockCategory = categories[Math.floor(Math.random() * categories.length)];
    return res.json({
      title: `Improvement of local ${mockCategory.toLowerCase()} infrastructure`,
      category: mockCategory,
      description: 'This suggestion was generated via voice input transcription. The citizen recorded a request regarding developmental needs in their ward.',
      urgency: 'high',
      transcription: 'नमस्ते सांसद जी, हमारे वार्ड में सड़क और पानी की बहुत समस्या है। कृपया इस पर ध्यान दें।'
    });
  }

  try {
    const audioBuffer = req.file.buffer;
    const base64Audio = audioBuffer.toString('base64');
    const mimeType = req.file.mimetype || 'audio/webm';

    const prompt = `
      You are an AI Speech-to-Text and structuring system for "Jansunwai AI".
      Below is an audio recording of a citizen explaining a development suggestion in Hindi, English, Bhojpuri, Urdu, or Hinglish.
      
      Task:
      1. Transcribe the audio verbatim.
      2. Translate/summarize the request into a structured JSON proposal.
      3. Identify:
         - A formal 'title' (in English)
         - An appropriate 'category' from this list: Road, Bridge, School, College, Hospital, PHC, Water Supply, Drainage, Street Lights, Electricity, Library, Park, Sports Ground, Skill Center, Women's Safety, Public Transport, Internet, Waste Management, Environment, Agriculture, Others.
         - A detailed 'description' (in English or Hindi, depending on which fits best, but write a complete proposal).
         - Estimated 'urgency': 'low', 'medium', 'high', or 'critical'.

      Return ONLY a JSON object with this schema:
      {
        "transcription": "The direct transcription of the speech...",
        "title": "A concise formal title in English...",
        "category": "Road",
        "description": "A well-structured formal description of the development request...",
        "urgency": "high"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Audio
          }
        },
        { text: prompt }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const result = JSON.parse(response.text || '{}');
    return res.json(result);
  } catch (error: any) {
    console.error('Error in voice suggest API:', error);
    return res.status(500).json({ error: 'Voice Suggestion processing failed', details: error.message });
  }
};

/**
 * 3. AI Vision Analysis & Suggestion Scoring
 * Evaluates proposal and uploaded images to assign verification scores.
 */
export const analyzeSuggestion = async (req: Request, res: Response) => {
  const { title, description, category, state, district, village, location_lat, location_lng } = req.body;
  const imageFile = req.file;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  // Fallback simulator if Gemini is not configured
  if (!ai) {
    const hasImage = !!imageFile;
    const completeness = Math.min(100, 45 + (title?.length || 0) + (description.length > 100 ? 30 : 10) + (village ? 15 : 5));
    const urgency = description.toLowerCase().includes('accident') || description.toLowerCase().includes('danger') ? 'critical' : 'medium';
    
    return res.json({
      completenessScore: completeness,
      urgency: urgency,
      photoVerified: hasImage, // Auto-verify in mockup
      locationVerified: !!(location_lat && location_lng),
      estimatedBeneficiaries: description.toLowerCase().includes('village') ? 2500 : 450,
      impact: 'High',
      confidenceScore: 90
    });
  }

  try {
    let contents: any[] = [];

    // If citizen uploaded an image, pass it to Gemini Vision
    if (imageFile) {
      const base64Image = imageFile.buffer.toString('base64');
      const mimeType = imageFile.mimetype || 'image/jpeg';
      contents.push({
        inlineData: {
          mimeType,
          data: base64Image
        }
      });
    }

    const prompt = `
      You are an AI Auditor for the "Jansunwai AI" platform. 
      Analyze the submitted citizen development suggestion:
      
      Title: "${title || ''}"
      Category: "${category || 'General'}"
      Description: "${description}"
      Location details: Village: ${village || 'Unknown'}, District: ${district || 'Unknown'}, State: ${state || 'Unknown'}

      If an image is attached, verify if the image displays evidence of the issue described (e.g. if category is 'Road' and user describes deep potholes, check if the image displays broken roads, gravel, potholes, mud, etc.).

      Task:
      Generate evaluation scores and structured metrics for this suggestion:
      1. 'completenessScore': (integer 0-100) How detailed is the proposal? Does it include locations, beneficiary counts, and specific requests?
      2. 'urgency': 'low', 'medium', 'high', or 'critical'.
      3. 'photoVerified': (boolean) True if an image is uploaded and matches the description/category. False if no image is uploaded or it is unrelated.
      4. 'locationVerified': (boolean) True if geographic coordinates or clear local names are specified.
      5. 'estimatedBeneficiaries': (integer) Approximate number of people benefiting, based on context clues.
      6. 'impact': 'Low', 'Medium', 'High', or 'Critical'.
      7. 'confidenceScore': (integer 0-100) Overall confidence in the authenticity of this request.

      Return ONLY a JSON object with this schema:
      {
        "completenessScore": 85,
        "urgency": "high",
        "photoVerified": true,
        "locationVerified": true,
        "estimatedBeneficiaries": 1500,
        "impact": "High",
        "confidenceScore": 95
      }
    `;

    contents.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const result = JSON.parse(response.text || '{}');
    return res.json(result);
  } catch (error: any) {
    console.error('Error in analyze suggestion API:', error);
    return res.status(500).json({ error: 'AI Analysis failed', details: error.message });
  }
};

/**
 * 4. Duplicate Detection API
 * Checks if a similar suggestion has already been submitted in the constituency.
 */
export const checkDuplicate = async (req: Request, res: Response) => {
  const { title, description, category, district } = req.body;

  if (!description || !category || !district) {
    return res.status(400).json({ error: 'Description, category, and district are required' });
  }

  try {
    // 1. Fetch suggestions in the same category and district
    const candidates = await db.getSuggestions({ category, district });

    if (candidates.length === 0) {
      return res.json({ isDuplicate: false, duplicateOfId: null, supportCount: 0 });
    }

    // Fallback simulator if Gemini is not configured
    if (!ai) {
      // Mock duplicate check: if title is highly similar to candidate titles
      const match = candidates.find(c => {
        const words = title?.toLowerCase().split(' ') || [];
        const matchingWords = words.filter((w: string) => c.title.toLowerCase().includes(w) && w.length > 3);
        return matchingWords.length >= 2;
      });

      if (match) {
        // Random support count
        const supportCount = Math.floor(Math.random() * 450) + 15;
        return res.json({
          isDuplicate: true,
          duplicateOfId: match.id,
          duplicateTitle: match.title,
          supportCount
        });
      }

      return res.json({ isDuplicate: false, duplicateOfId: null, supportCount: 0 });
    }

    // Build comparison payload for Gemini
    const listPayload = candidates.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      village: c.village || 'Unknown'
    }));

    const prompt = `
      You are an AI Duplicate Detector for "Jansunwai AI".
      We want to avoid duplicate planning tasks for the Member of Parliament.
      
      New suggestion:
      Title: "${title || ''}"
      Category: "${category}"
      Description: "${description}"
      District: "${district}"

      Existing suggestions in same category & district:
      ${JSON.stringify(listPayload, null, 2)}

      Task:
      Determine if the new suggestion describes the SAME physical project or issue as any of the existing suggestions.
      A duplicate must refer to the same location and request.
      
      Return ONLY a JSON object with this schema:
      {
        "isDuplicate": true,
        "duplicateOfId": "the matching ID from the list, or null if no duplicate",
        "reason": "Brief reason why it matches or not"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    let supportCount = 0;
    if (result.isDuplicate && result.duplicateOfId) {
      // Fetch number of linked duplicates to calculate mock supports
      const allLinked = await db.getSuggestions();
      supportCount = allLinked.filter(s => s.duplicate_of_id === result.duplicateOfId || s.id === result.duplicateOfId).length;
    }

    return res.json({
      isDuplicate: result.isDuplicate,
      duplicateOfId: result.duplicateOfId,
      reason: result.reason,
      supportCount: supportCount || Math.floor(Math.random() * 120) + 12
    });
  } catch (error: any) {
    console.error('Error in duplicate check API:', error);
    return res.status(500).json({ error: 'Duplicate check failed', details: error.message });
  }
};
