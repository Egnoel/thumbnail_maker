import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Note: don't import `@google/genai` at module scope because the package
// may expect server-side environment variables and throw during import.
let Type = null;

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));

const PORT = process.env.BACKEND_PORT || process.env.PORT || 4000;
const API_KEY = process.env.API_KEY;

if (!API_KEY)
  console.warn('Warning: API_KEY is not set. Real AI calls will fail.');

let ai = null;
if (API_KEY) {
  import('@google/genai')
    .then((mod) => {
      try {
        ai = new mod.GoogleGenAI({ apiKey: API_KEY });
        Type = mod.Type;
      } catch (e) {
        console.warn(
          'Failed to initialize GoogleGenAI client after dynamic import:',
          e,
        );
        ai = null;
      }
    })
    .catch((e) => {
      console.warn('Dynamic import of @google/genai failed:', e);
      ai = null;
    });
} else {
  console.warn('API_KEY not provided; proxy will return mock responses.');
}

const IMAGE_MODEL_NAME = 'gemini-2.5-flash-image';
const TEXT_MODEL_NAME = 'gemini-3-flash-preview';

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, base64Image } = req.body || {};
    // If AI client is not initialized, return a mock/fallback response so
    // the frontend can still show something instead of failing.
    if (!ai) {
      if (base64Image)
        return res.json({
          imageUrl: base64Image,
          text: 'Preview (proxy mock): no API key',
        });
      const placeholder =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn0B9p3q2JQAAAAASUVORK5CYII=';
      return res.json({
        imageUrl: placeholder,
        text: 'Preview (proxy mock): API key missing',
      });
    }

    const parts = [{ text: prompt || '' }];
    if (base64Image) {
      const cleanBase64 = (base64Image || '').replace(
        /^data:image\/\w+;base64,/,
        '',
      );
      parts.unshift({
        inlineData: { data: cleanBase64, mimeType: 'image/png' },
      });
    }

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: { parts },
      config: { imageConfig: { aspectRatio: '16:9' } },
    });
    let generatedImageUrl = '';
    let responseText = 'Thumbnail updated from proxy.';
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData)
          generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
        else if (part.text) responseText = part.text;
      }
    }
    if (!generatedImageUrl)
      return res.status(502).json({ error: 'AI did not return an image' });
    return res.json({ imageUrl: generatedImageUrl, text: responseText });
  } catch (err) {
    console.error('Backend /api/generate error:', err?.message || err);
    return res
      .status(500)
      .json({ error: err?.message || 'Internal server error' });
  }
});

app.post('/api/suggestions', async (req, res) => {
  try {
    const { lastMessage, base64Image } = req.body || {};
    const parts = [];
    let prompt = '';

    if (base64Image) {
      const cleanBase64 = (base64Image || '').replace(
        /^data:image\/\w+;base64,/,
        '',
      );
      parts.push({ inlineData: { data: cleanBase64, mimeType: 'image/png' } });
      prompt = `Look at this 16:9 thumbnail image. Based on its content and the user's recent request ("${lastMessage || 'None'}"), suggest 3 specific, highly effective "viral" edits to make it pop more. Return ONLY a JSON array of strings (max 6 words each).`;
    } else {
      prompt = `The user wants to create a viral YouTube thumbnail. Suggest 3 high-level, trending concepts for a thumbnail. Return ONLY a JSON array of strings.`;
    }

    parts.push({ text: prompt });

    if (!ai) {
      return res.json({
        suggestions: [
          'Add cinematic glow',
          'Change to sunset background',
          'Intensify contrast',
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    });

    const text = response.text || '[]';
    try {
      const arr = JSON.parse(text);
      return res.json({ suggestions: arr });
    } catch (e) {
      console.warn('Suggestions parse failed, returning fallback', e);
      return res.json({
        suggestions: [
          'Add cinematic glow',
          'Change to sunset background',
          'Intensify contrast',
        ],
      });
    }
  } catch (err) {
    console.error('Backend /api/suggestions error:', err?.message || err);
    return res
      .status(500)
      .json({
        suggestions: [
          'Add cinematic glow',
          'Change to sunset background',
          'Intensify contrast',
        ],
      });
  }
});

app.listen(PORT, () => {
  console.log(`Thumbnail proxy backend listening on http://localhost:${PORT}`);
});
