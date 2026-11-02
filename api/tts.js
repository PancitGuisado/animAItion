export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured on the server.' });
  }

  try {
    const { text, voiceName = 'Puck' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Missing text parameter' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-lite-tts:generateContent?key=${apiKey}`;

    const ttsRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName
              }
            }
          }
        }
      })
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.json().catch(() => ({}));
      return res.status(ttsRes.status).json({ error: err.error?.message || 'TTS generation failed' });
    }

    const data = await ttsRes.json();
    const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!inlineData || !inlineData.data) {
      return res.status(500).json({ error: 'No audio returned' });
    }

    return res.status(200).json({
      data: inlineData.data,
      mimeType: inlineData.mimeType || 'audio/wav'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
