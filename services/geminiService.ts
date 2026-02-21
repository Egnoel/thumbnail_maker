// NOTE: `@google/genai` is a server-side SDK and can break client bundles
// when imported at module scope. We dynamically import it inside the
// functions below and fall back to a local mock implementation when it's
// not available (e.g., running in the browser during development).

const IMAGE_MODEL_NAME = 'gemini-2.5-flash-image';
const TEXT_MODEL_NAME = 'gemini-3-flash-preview';

/**
 * System instruction to guide the model towards the "YouTube Thumbnail" aesthetic.
 */
const SYSTEM_INSTRUCTION = `
You are an elite YouTube Thumbnail Designer. Your goal is to create or edit images that are:
1. High-impact and click-worthy (not clickbait, but visually arresting).
2. Extremely vibrant with high color saturation and contrast.
3. Feature cinematic lighting (rim lights, glows, bokeh).
4. STRICTLY OPTIMIZED for the 16:9 aspect ratio. You must never output square or portrait crops.
5. Focused on a clear subject with a compelling background.

When editing an existing image:
- If asked to "remove background", replace it with a clean, high-contrast studio background or a thematic environment.
- If asked to "put me in [place]", seamlessly blend the subject into that environment with matching lighting.
- Ensure the subject remains sharp and the focal point.
- ALWAYS MAINTAIN A 16:9 COMPOSITION. If the input is not 16:9, re-compose the scene to fit a wide cinematic frame without stretching.
`;

export async function processThumbnailRequest(
  prompt: string,
  base64Image?: string | null,
): Promise<{ imageUrl: string; text: string }> {
  try {
    // 1) If client-side, prefer proxy backend
    if (typeof window !== 'undefined') {
      try {
        const resp = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, base64Image }),
        });
        if (resp.ok) {
          const json = await resp.json();
          if (json.imageUrl)
            return {
              imageUrl: json.imageUrl,
              text: json.text || 'Generated via proxy',
            };
        }
      } catch (e) {
        console.warn('Proxy generate failed, falling back to server SDK:', e);
      }
    }

    // 2) Try server-side GoogleGenAI SDK via dynamic import
    let ai: any = null;
    try {
      const mod = await import('@google/genai');
      ai = new mod.GoogleGenAI({ apiKey: process.env?.API_KEY });
    } catch (e) {
      console.warn('Google GenAI SDK not available, using mock behavior', e);
      ai = null;
    }

    const parts: any[] = [{ text: `${prompt} ${SYSTEM_INSTRUCTION}` }];
    if (base64Image) {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
      parts.unshift({
        inlineData: { data: cleanBase64, mimeType: 'image/png' },
      });
    }

    if (ai) {
      const response = await ai.models.generateContent({
        model: IMAGE_MODEL_NAME,
        contents: { parts },
        config: { imageConfig: { aspectRatio: '16:9' } },
      });
      let generatedImageUrl = '';
      let responseText = 'Thumbnail updated!';
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData)
            generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          else if (part.text) responseText = part.text;
        }
      }
      if (!generatedImageUrl)
        throw new Error(
          'The AI did not return a new image. Try a different prompt.',
        );
      return { imageUrl: generatedImageUrl, text: responseText };
    }

    // 3) Fallback: return input image or placeholder so UI still displays
    if (base64Image)
      return {
        imageUrl: base64Image,
        text: 'Preview (local mock): no remote AI available.',
      };
    const placeholder =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn0B9p3q2JQAAAAASUVORK5CYII=';
    return {
      imageUrl: placeholder,
      text: 'Preview (local mock): generate disabled.',
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    if (error?.message?.includes('429'))
      throw new Error('Too many requests. Please wait a moment.');
    throw new Error(error?.message || 'Failed to process thumbnail request.');
  }
}

/**
 * Generates creative suggestions for the next thumbnail edit, now multimodal.
 */
export async function getThumbnailSuggestions(
  lastMessage?: string,
  base64Image?: string | null,
): Promise<string[]> {
  // Try to dynamically import the SDK. Fall back to canned suggestions if not available.
  let ai: any = null;
  let Type: any = null;
  try {
    const mod = await import('@google/genai');
    ai = new mod.GoogleGenAI({ apiKey: process.env?.API_KEY });
    Type = mod.Type;
  } catch (e) {
    console.warn(
      'Google GenAI SDK not available for suggestions, using fallback.',
      e,
    );
  }

  let prompt = '';
  const parts: any[] = [];

  if (base64Image) {
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
    parts.push({
      inlineData: {
        data: cleanBase64,
        mimeType: 'image/png',
      },
    });
    prompt = `Look at this 16:9 thumbnail image. Based on its content and the user's recent request ("${lastMessage || 'None'}"), suggest 3 specific, highly effective "viral" edits to make it pop more. Return ONLY a JSON array of strings (max 6 words each).`;
  } else {
    prompt = `The user wants to create a viral YouTube thumbnail. Suggest 3 high-level, trending concepts for a thumbnail. Return ONLY a JSON array of strings.`;
  }

  parts.push({ text: prompt });

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      });

      const text = response.text || '[]';
      return JSON.parse(text);
    } catch (error) {
      console.error('Failed to get suggestions from AI:', error);
    }
  }

  // Fallback suggestions when AI is not available
  return base64Image
    ? [
        'Add cinematic glow',
        'Change to sunset background',
        'Intensify contrast',
      ]
    : ['Gaming room setup', 'Outdoor adventure', 'Luxury car showcase'];
}
