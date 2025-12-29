import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Poem } from '../types';

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchPoemForSolarTerm = async (termName: string): Promise<Poem> => {
  const modelId = "gemini-3-flash-preview";
  
  const prompt = `
    Task: Recommend a classic Chinese poem or Ci (Tang Poetry or Song Ci) that is SPECIFICALLY about the Solar Term: "${termName}" (二十四节气之${termName}).
    
    CRITICAL INSTRUCTION: 
    1. The selection MUST be a masterpiece from either the Tang Dynasty (唐诗) or Song Dynasty (宋词).
    2. The poem MUST explicitly mention the weather, scenery, or feelings associated with ${termName}. 
    3. Do not recommend a general spring poem if the term is Winter.
    
    The response must be in JSON format.
    Provide:
    1. Title (Traditional Chinese)
    2. Dynasty (Must be "Tang" or "Song" or specific dynasty name in Chinese)
    3. Author
    4. Content (An array of strings, where each string is a line. Traditional Chinese).
    5. Translation (A beautiful, poetic English translation).
    6. Analysis (A brief 2-3 sentence appreciation of why this poem fits the solar term and its mood).
    7. Mood (One or two words describing the feeling, e.g., 'Serene', 'Melancholic').
    8. Background (The historical context or story behind when/why this poem was written).
    9. AuthorIntro (A brief, engaging introduction to the poet).
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          dynasty: { type: Type.STRING },
          author: { type: Type.STRING },
          content: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          translation: { type: Type.STRING },
          analysis: { type: Type.STRING },
          mood: { type: Type.STRING },
          background: { type: Type.STRING },
          authorIntro: { type: Type.STRING }
        },
        required: ["title", "dynasty", "author", "content", "translation", "analysis", "mood", "background", "authorIntro"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(text) as Poem;
};

export const generatePoemAudio = async (text: string): Promise<string> => {
  // Using the specific TTS model
  const modelId = "gemini-2.5-flash-preview-tts";
  
  const response = await ai.models.generateContent({
    model: modelId,
    contents: [{ parts: [{ text: `请用标准的普通话，深情、缓慢、富有韵味地朗诵这首诗：${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          // Using a voice that sounds reasonable for reading
          prebuiltVoiceConfig: { voiceName: 'Zephyr' }, 
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!base64Audio) {
    throw new Error("No audio generated");
  }

  return base64Audio;
};

export const generatePoemImage = async (poemPrompt: string): Promise<string> => {
  const modelId = "gemini-2.5-flash-image";

  // Creating a specific artistic prompt for Shanshui style
  const artsyPrompt = `
    Create a large, atmospheric traditional Chinese ink wash painting (Shanshui style) background wallpaper. 
    Theme: "${poemPrompt}".
    
    Style requirements:
    - Wide angle landscape.
    - Masterpiece, high quality, artistic.
    - Traditional Chinese Ink and Wash (Shui-mo).
    - Minimalist, elegant, atmospheric, utilizing negative space (Liu Bai).
    - Black ink on rice paper texture.
    - No text or calligraphy in the image.
    - Soft, faded edges suitable for a background.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: {
      parts: [{ text: artsyPrompt }]
    },
    config: {
      // Gemini 2.5 Flash Image doesn't support responseMimeType/responseSchema
      // We rely on the inlineData in the response
    }
  });

  // Extract image from response parts
  let base64Image = "";
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        base64Image = part.inlineData.data;
        break;
      }
    }
  }

  if (!base64Image) {
    throw new Error("No image generated");
  }

  return base64Image;
};