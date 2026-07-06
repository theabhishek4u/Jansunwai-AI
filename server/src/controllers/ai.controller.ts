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
    let generatedTitle = title || `Request for regional development`;

    if (category === 'School' || category === 'College' || description.toLowerCase().includes('school') || description.includes('स्कूल') || description.includes('कॉलेज')) {
      questions.push(
        'आपके क्षेत्र (जैसे वार्ड संख्या, मोहल्ला) का सटीक विवरण क्या है और इस विद्यालय/कॉलेज से कितनी आबादी लाभान्वित होगी?',
        'वर्तमान में, निकटतम सरकारी या निजी शैक्षणिक संस्थान आपके क्षेत्र से कितनी दूरी पर है?',
        'क्या आपके विचार में इस क्षेत्र में स्कूल के निर्माण के लिए कोई उपयुक्त सरकारी या निजी भूमि उपलब्ध है?'
      );
      improvedText = `माननीय सांसद महोदय,\n\nमैं इस पत्र के माध्यम से आपके संज्ञान में लाना चाहता हूँ कि हमारे क्षेत्र में शिक्षा सुविधाओं का भारी अभाव है। उचित दूरी पर कोई ${category || 'विद्यालय'} न होने के कारण हमारे बच्चों को लंबी दूरी तय करनी पड़ती है। अतः आपसे विनम्र अनुरोध है कि इस विषय पर त्वरित कार्रवाई करते हुए यहाँ एक ${category || 'विद्यालय/कॉलेज'} की स्थापना कराने की कृपा करें।\n\nभवदीय,\nसमस्त क्षेत्रवासी`;
      generatedTitle = `क्षेत्र में नए विद्यालय/कॉलेज के निर्माण हेतु प्रस्ताव`;
    } else if (category === 'Road' || category === 'Bridge' || description.toLowerCase().includes('road') || description.includes('सड़क') || description.includes('सड़क') || description.includes('मार्ग')) {
      questions.push(
        'सड़क की कुल लंबाई और चौड़ाई कितनी है जिसके निर्माण की आवश्यकता है?',
        'यह सड़क किन प्रमुख मुख्य मार्गों या वार्डों को जोड़ती है?',
        'क्या जलभराव या बारिश के दिनों में यातायात पूर्ण रूप से बाधित हो जाता है?'
      );
      improvedText = `माननीय सांसद महोदय,\n\nमैं इस पत्र के माध्यम से आपके संज्ञान में लाना चाहता हूँ कि हमारे क्षेत्र में मुख्य मार्ग की स्थिति अत्यंत जर्जर है। इस कारण क्षेत्र के नागरिकों को दैनिक आवागमन में अत्यधिक कठिनाइयों का सामना करना पड़ रहा है। आपातकालीन स्थितियों में एम्बुलेंस का पहुँचना भी दूभर हो जाता है। अतः जनहित में इस सड़क का पुनर्निर्माण व सुदृढ़ीकरण कराने की कृपा करें।\n\nभवदीय,\nक्षेत्र के जागरूक नागरिक`;
      generatedTitle = `जर्जर सड़क/मार्ग के पुनर्निर्माण व सुदृढ़ीकरण हेतु आवेदन`;
    } else if (category === 'PHC' || category === 'Hospital' || description.toLowerCase().includes('hospital') || description.includes('अस्पताल') || description.includes('इलाज') || description.includes('स्वास्थ्य')) {
      questions.push(
        'आपके क्षेत्र (जैसे वार्ड संख्या, मोहल्ला, या प्रमुख लैंडमार्क) का सटीक विवरण क्या है और इस प्रस्तावित अस्पताल से अनुमानित कितनी आबादी लाभान्वित होगी?',
        'वर्तमान में, निकटतम सरकारी या निजी अस्पताल आपके क्षेत्र से कितनी दूरी पर है और वहाँ तक पहुँचने में औसतन कितना समय लगता है?',
        'क्या आपके विचार में इस क्षेत्र में अस्पताल के निर्माण के लिए कोई उपयुक्त सरकारी या निजी भूमि उपलब्ध है?'
      );
      improvedText = `माननीय सांसद महोदय,\n\nमैं इस पत्र के माध्यम से आपके संज्ञान में लाना चाहता हूँ कि हमारे क्षेत्र में किसी भी प्राथमिक या द्वितीयक स्वास्थ्य सुविधा (अस्पताल) का अभाव है। इस कारणवश क्षेत्र की आम जनता को गंभीर स्वास्थ्य समस्याओं का सामना करना पड़ रहा है। आपातकालीन स्थितियों में मरीज को समय पर अस्पताल तक ले जाने में अत्यधिक समय व्यतीत होता है, जिससे जानमाल का जोखिम बढ़ जाता है। अतः जनहित में यहाँ एक प्राथमिक स्वास्थ्य केंद्र की स्थापना करने का कष्ट करें।\n\nभवदीय,\nसमस्त क्षेत्रवासी`;
      generatedTitle = `क्षेत्र में नए प्राथमिक स्वास्थ्य केंद्र (PHC) की स्थापना हेतु आवेदन`;
    } else {
      questions.push(
        'इस विकास कार्य से लगभग कितने स्थानीय निवासी लाभान्वित होंगे?',
        'क्या इस प्रकार की कोई अन्य सुविधा आपके वार्ड/ब्लॉक में पहले से उपलब्ध है?',
        'इस परियोजना को शुरू करने की मुख्य तात्कालिकता (Urgency) क्या है?'
      );
      improvedText = `माननीय सांसद महोदय,\n\nइस पत्र के माध्यम से मैं अपने क्षेत्र की महत्वपूर्ण विकास आवश्यकता: "${description}" की ओर आपका ध्यान आकर्षित करना चाहता हूँ। यह परियोजना हमारे ब्लॉक के विकास के लिए अत्यंत महत्वपूर्ण है। आशा है कि आप जनहित में इसे शीघ्र स्वीकृत करेंगे।\n\nभवदीय,\nक्षेत्र के जागरूक नागरिक`;
      generatedTitle = `क्षेत्रीय विकास व सुधार कार्य हेतु आवेदन प्रस्ताव`;
    }

    return res.json({
      title: generatedTitle,
      questions,
      improvedText,
      languageDetected: language || 'en',
      completenessScore: description.length > 50 ? 85 : 45
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
      2. Formulate exactly 2 to 3 clarifying questions STRICTLY in the user's selected language: "${language || 'English'}".
      3. Generate a formal, standardized title (concise, 5-8 words max) AND rewrite the user's suggestion into a professional, formal application addressed to the Member of Parliament/MLA. You MUST write both the generated title and the rewritten suggestion STRICTLY in the user's selected language: "${language || 'English'}". Ensure the tone is polite, human-like, and official (e.g., starting with "माननीय सांसद महोदय/महोदया" for Hindi, or "Respected Member of Parliament" for English).
      4. Assign a completeness score from 0 to 100 based on the depth of information provided.

      Return ONLY a JSON object with this schema:
      {
        "title": "Generated concise title in the selected language...",
        "questions": ["Question 1", "Question 2"],
        "improvedText": "Sleek professional application draft in the selected language...",
        "languageDetected": "en or hi or ur",
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

    const language = req.body.language || 'English';

    const prompt = `
      You are an AI Speech-to-Text and structuring system for "Jansunwai AI".
      Below is an audio recording of a citizen explaining a development suggestion.
      The user explicitly selected their preferred language as: "${language}".
      
      Task:
      1. Transcribe the audio verbatim in the language they spoke.
      2. Translate/summarize the request into a structured JSON proposal.
      3. Identify:
         - A formal 'title' (in English for standardized MP tracking)
         - An appropriate 'category' from this list: Road, Bridge, School, College, Hospital, PHC, Water Supply, Drainage, Street Lights, Electricity, Library, Park, Sports Ground, Skill Center, Women's Safety, Public Transport, Internet, Waste Management, Environment, Agriculture, Others.
         - A detailed 'description'. Since the citizen selected ${language}, you MUST write this description strictly in ${language}. Ensure it sounds highly professional and structured.
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
