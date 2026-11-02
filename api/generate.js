export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured on the server.' });
  }

  try {
    const { topic, style = 'minimal', videoType = 'explainer' } = req.body;

    const VIDEO_TYPE_DESCRIPTIONS = {
      explainer: 'Deep multi-stage concept breakdown with evolving mind-map diagrams',
      demo_howto: 'Sequential software walkthrough across multiple application screens',
      brand_promo: 'Punchy product launch story: Hook -> Problem -> Solution -> 10x Metric -> Call to Action',
      live_vs_anim: 'Side-by-side progression: The Bottleneck -> The Turning Point -> The Future',
      ugc: 'Real creator journey: The Struggle -> The Discovery -> The Unboxing -> Real Results',
      screencast: 'Progressive coding tutorial: Setup -> Implementation -> Execution -> Output',
      stickman_cartoon: 'Dynamic cartoon comic story with scene-by-scene character mood and story progression'
    };

    const stylePalettes = {
      minimal: { bg: ["#000000", "#09090b"], accent: "#38bdf8", bgm: "chill", desc: "clean Apple-like precision" },
      dynamic: { bg: ["#0f172a", "#3b0764"], accent: "#f43f5e", bgm: "upbeat", desc: "high energy viral tones" },
      cyberpunk: { bg: ["#050505", "#022c22"], accent: "#10b981", bgm: "cyber", desc: "cyber tech green grid" }
    };

    const currentTheme = stylePalettes[style] || stylePalettes.minimal;
    const typeDesc = VIDEO_TYPE_DESCRIPTIONS[videoType] || 'engaging social video';

    const prompt = `You are an elite video director creating a high-retention 30+ second social video about: "${topic}".
Format: "${videoType}" (${typeDesc}).
Visual Style: "${style}".

CRITICAL PRODUCTION RULES:
1. Generate EXACTLY 5 to 6 sequential scenes so the video runs for a FULL 30 to 40 SECONDS.
2. Each scene voiceover MUST be 2-3 substantive, well-paced sentences (around 20 to 25 words per scene) to guarantee proper 6-second narration duration per scene.
3. SCENE EVOLUTION: Every scene MUST introduce a COMPLETELY DIFFERENT phase of the story!
   - Scene 1: The Hook & Core Mystery/Problem
   - Scene 2: The Mechanism / How it works
   - Scene 3: The Secret / Key Insight or Pivot
   - Scene 4: Real-world Demo / Concrete Proof & Steps
   - Scene 5: The Breakthrough / High-Impact Result & Call to Action
4. All text in customVisuals MUST directly name concepts from "${topic}". Never use generic placeholders.

Respond strictly with valid JSON (NO markdown code fences, no backticks, ONLY raw JSON):
{
  "title": "Concise video title about ${topic}",
  "topic": "${topic}",
  "videoType": "${videoType}",
  "aesthetic": "${style}",
  "bgmTheme": "${currentTheme.bgm}",
  "scenes": [
    {
      "id": 1,
      "hookText": "PUNCHY 2-4 WORD HOOK",
      "voiceover": "Substantive 2-3 sentence narration for this phase of ${topic}.",
      "visualTheme": {
        "bgGradient": ["${currentTheme.bg[0]}", "${currentTheme.bg[1]}"],
        "accentColor": "${currentTheme.accent}"
      },
      "customVisuals": {
        "phaseNumber": 1,
        "phaseName": "THE HOOK",
        "speech": "Topic reaction quote",
        "action": "shocked",
        "coreConcept": "Phase Subject",
        "nodes": ["Concept 1", "Concept 2", "Concept 3"],
        "screenTitle": "Screen Title",
        "steps": ["Step 1 detail", "Step 2 detail", "Step 3 detail"],
        "headlineMetric": "Key Metric or Feature",
        "subMetric": "Primary Benefit",
        "leftTitle": "Traditional Obstacle",
        "leftPoints": ["Pain 1", "Pain 2"],
        "rightTitle": "The Innovation",
        "rightPoints": ["Advantage 1", "Advantage 2"],
        "creatorName": "@CreatorHandle",
        "stage": "The Initial Challenge",
        "reviewBadge": "PHASE 1",
        "fileName": "step1.ts",
        "codeLines": [
          "// 1. Setup for ${topic}",
          "const init = startEngine();"
        ]
      },
      "captions": [
        { "text": "Word1", "emphasis": true },
        { "text": "Word2", "emphasis": false },
        { "text": "Word3", "emphasis": true }
      ]
    }
  ]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => ({}));
      return res.status(geminiRes.status).json({ error: errData.error?.message || 'Gemini API failed' });
    }

    const data = await geminiRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(500).json({ error: 'No content generated from Gemini' });
    }

    try {
      const parsed = JSON.parse(text);
      parsed.aesthetic = style;
      parsed.videoType = videoType;
      return res.status(200).json(parsed);
    } catch {
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      parsed.aesthetic = style;
      parsed.videoType = videoType;
      return res.status(200).json(parsed);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
