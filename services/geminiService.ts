
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

export async function processThumbnailRequest(
  prompt: string,
  base64Image?: string | null
): Promise<{ imageUrl: string; text: string }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Enhancement for YouTube style
  const enhancedPrompt = base64Image 
    ? `As an expert YouTube thumbnail designer, modify this image: ${prompt}. Ensure the output is vibrant, high-contrast, and optimized for 16:9 YouTube visibility.`
    : `Create a professional YouTube thumbnail: ${prompt}. Use bold colors, high contrast, and cinematic lighting. Aspect ratio must be 16:9.`;

  try {
    const parts: any[] = [{ text: enhancedPrompt }];
    
    if (base64Image) {
      // Remove data:image/...;base64, prefix if present
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
      parts.unshift({
        inlineData: {
          data: cleanBase64,
          mimeType: 'image/png'
        }
      });
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    let generatedImageUrl = '';
    let responseText = 'Here is your updated thumbnail!';

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
        } else if (part.text) {
          responseText = part.text;
        }
      }
    }

    if (!generatedImageUrl) {
      throw new Error('Failed to generate image data.');
    }

    return { imageUrl: generatedImageUrl, text: responseText };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(error.message || 'Failed to communicate with AI');
  }
}
