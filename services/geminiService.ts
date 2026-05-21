
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const improveDescription = async (text: string, type: 'personality' | 'background'): Promise<string> => {
  if (!text.trim()) return text;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `身為一位 Final Fantasy XIV 的資深玩家與劇情作家，請幫我潤飾以下的角色${type === 'personality' ? '性格描述' : '背景故事'}。請保持 FF14 的世界觀風格，使其更有史詩感或生活氣息。原文：${text}`,
      config: {
        temperature: 0.8,
      }
    });
    
    return response.text?.trim() || text;
  } catch (error) {
    console.error('Gemini improvement failed:', error);
    return text;
  }
};
