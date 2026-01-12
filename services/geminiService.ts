
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * System instruction to guide the model towards the "YouTube Thumbnail" aesthetic.
 */
const SYSTEM_INSTRUCTION = `
You are an elite YouTube Thumbnail Designer. Your goal is to create or edit images that are:
1. High-impact and click-worthy (not clickbait, but visually arresting).
2. Extremely vibrant with high color saturation and contrast.
3. Feature cinematic lighting (rim lights, glows, bokeh).
4. Optimized for the 16:9 aspect ratio.
5. Focused on a clear subject with a compelling background.

When editing an existing image:
- If asked to "remove background", replace it with a clean, high-contrast studio background or a thematic environment.
- If asked to "put me in [place]", seamlessly blend the subject into that environment with matching lighting.
- Ensure the subject remains sharp and the focal point.
`;

export async function processThumbnailRequest(
  prompt: string,
  base64Image?: string | null
): Promise<{ imageUrl: string; text: string }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Refined prompt construction
  const finalPrompt = base64Image 
    ? `TASK: Edit the provided image based on this request: "${prompt}". Maintain the subject's identity but transform the style to be a viral YouTube thumbnail. ${SYSTEM_INSTRUCTION}`
    : `TASK: Generate a brand new YouTube thumbnail from scratch: "${prompt}". ${SYSTEM_INSTRUCTION}`;

  try {
    const parts: any[] = [{ text: finalPrompt }];
    
    if (base64Image) {
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
    let responseText = 'Thumbnail updated!';

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
      throw new Error('The AI did not return a new image. Try a different prompt.');
    }

    return { imageUrl: generatedImageUrl, text: responseText };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    if (error.message?.includes('429')) throw new Error('Too many requests. Please wait a moment.');
    throw new Error(error.message || 'Failed to process thumbnail request.');
  }
}
