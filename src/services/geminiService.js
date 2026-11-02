export const VIDEO_TYPES = [
  {
    id: 'explainer',
    name: 'Explainer Video',
    desc: 'Deep multi-stage concept breakdown with evolving mind-map diagrams'
  },
  {
    id: 'demo_howto',
    name: 'Demo / How-To',
    desc: 'Sequential software walkthrough across multiple application screens'
  },
  {
    id: 'brand_promo',
    name: 'Brand & Promo',
    desc: 'Punchy product launch story: Hook -> Problem -> Solution -> 10x Metric -> Call to Action'
  },
  {
    id: 'live_vs_anim',
    name: 'Live-Action vs. Anim',
    desc: 'Side-by-side progression: The Bottleneck -> The Turning Point -> The Future'
  },
  {
    id: 'ugc',
    name: 'User-Generated Content',
    desc: 'Real creator journey: The Struggle -> The Discovery -> The Unboxing -> Real Results'
  },
  {
    id: 'screencast',
    name: 'Screencast / Tutorial',
    desc: 'Progressive coding tutorial: Setup -> Implementation -> Execution -> Output'
  },
  {
    id: 'stickman_cartoon',
    name: 'Stickman / Cartoon',
    desc: 'Dynamic cartoon comic story with scene-by-scene character mood and story progression'
  }
];

// Secure server-side call: Never exposes API key in browser
export async function generateAnimationPlan(topic, style = 'minimal', videoType = 'explainer') {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, style, videoType })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Generation failed (${response.status})`);
  }

  return await response.json();
}

export const PRESET_TEMPLATES = [
  {
    title: "Mastering Habits: Full 35-Second Masterclass",
    topic: "Habit Stacking",
    videoType: "stickman_cartoon",
    aesthetic: "minimal",
    bgmTheme: "chill",
    scenes: [
      {
        id: 1,
        hookText: "THE PROCRASTINATION LOOP",
        voiceover: "Every single day you tell yourself you will start tomorrow. But tomorrow never actually comes because your brain craves instant dopamine right now.",
        visualTheme: { bgGradient: ["#000000", "#09090b"], accentColor: "#38bdf8" },
        customVisuals: { phaseNumber: 1, phaseName: "THE TRAP", speech: "I'LL DO IT TOMORROW... 😴", action: "thinking" },
        captions: [{ text: "Stop Waiting", emphasis: true }, { text: "For Tomorrow.", emphasis: true }]
      },
      {
        id: 2,
        hookText: "THE 2-MINUTE THRESHOLD",
        voiceover: "Here is the golden rule used by top performers. Lower the initial barrier so low that it is completely impossible for your mind to make excuses.",
        visualTheme: { bgGradient: ["#000000", "#0f172a"], accentColor: "#60a5fa" },
        customVisuals: { phaseNumber: 2, phaseName: "THE STRATEGY", speech: "JUST TWO MINUTES! ⏱️", action: "excited" },
        captions: [{ text: "Make It", emphasis: false }, { text: "Too Easy", emphasis: true }, { text: "To Fail.", emphasis: true }]
      },
      {
        id: 3,
        hookText: "HABIT ANCHORING",
        voiceover: "Never create a habit in a vacuum. Anchor it immediately onto an existing ritual you already perform without thinking, like your morning coffee.",
        visualTheme: { bgGradient: ["#022c22", "#064e3b"], accentColor: "#34d399" },
        customVisuals: { phaseNumber: 3, phaseName: "THE ANCHOR", speech: "STACK ON ROUTINES ☕", action: "running" },
        captions: [{ text: "Stack Habits", emphasis: true }, { text: "On Existing", emphasis: false }, { text: "Rituals.", emphasis: true }]
      },
      {
        id: 4,
        hookText: "NEVER MISS TWICE",
        voiceover: "Missing once is human error, but missing two consecutive days is the birth of an unintended bad habit. Guard your streak with your life.",
        visualTheme: { bgGradient: ["#1e1b4b", "#312e81"], accentColor: "#818cf8" },
        customVisuals: { phaseNumber: 4, phaseName: "THE RULE", speech: "PROTECT THE STREAK! 🔥", action: "shocked" },
        captions: [{ text: "Missing Once Is Okay.", emphasis: false }, { text: "Never Miss Twice.", emphasis: true }]
      },
      {
        id: 5,
        hookText: "EXPONENTIAL RESULTS",
        voiceover: "In ninety days, these tiny two-minute blocks compound into unstoppable momentum that will completely transform your career and life.",
        visualTheme: { bgGradient: ["#000000", "#111827"], accentColor: "#38bdf8" },
        customVisuals: { phaseNumber: 5, phaseName: "MASTERY", speech: "UNSTOPPABLE! 🚀", action: "celebrating" },
        captions: [{ text: "Small Steps.", emphasis: true }, { text: "Massive Transformation.", emphasis: true }]
      }
    ]
  },
  {
    title: "10x Video Production with AI",
    topic: "Video Automation",
    videoType: "brand_promo",
    aesthetic: "dynamic",
    bgmTheme: "upbeat",
    scenes: [
      {
        id: 1,
        hookText: "TIRED OF EDITING?",
        voiceover: "Creators spend fifteen hours every week wrestling with timeline cuts, keyframes, and sound design just to publish one video.",
        visualTheme: { bgGradient: ["#0f172a", "#3b0764"], accentColor: "#f43f5e" },
        customVisuals: { phaseNumber: 1, phaseName: "THE BOTTLENECK", headlineMetric: "15 HOURS LOST", subMetric: "MANUAL TIMELINES" },
        captions: [{ text: "Manual Editing", emphasis: true }, { text: "Is Burning You Out.", emphasis: true }]
      },
      {
        id: 2,
        hookText: "AUTONOMOUS ENGINES",
        voiceover: "animAItion turns raw text prompts into animated social videos in under thirty seconds using hardware accelerated browser canvases.",
        visualTheme: { bgGradient: ["#1e1b4b", "#4c0519"], accentColor: "#fb7185" },
        customVisuals: { phaseNumber: 2, phaseName: "THE ENGINE", headlineMetric: "< 30 SECONDS", subMetric: "INSTANT SYNTHESIS" },
        captions: [{ text: "Zero Waiting.", emphasis: true }, { text: "Instant Generation.", emphasis: true }]
      },
      {
        id: 3,
        hookText: "MULTI-PLATFORM EXPORT",
        voiceover: "One click automatically resizes and re-renders your project for TikTok, YouTube landscape, and Instagram feeds seamlessly.",
        visualTheme: { bgGradient: ["#1e1b4b", "#312e81"], accentColor: "#a855f7" },
        customVisuals: { phaseNumber: 3, phaseName: "DISTRIBUTION", headlineMetric: "4 FORMATS", subMetric: "TIKTOK • YT • IG" },
        captions: [{ text: "One Idea.", emphasis: false }, { text: "Published Everywhere.", emphasis: true }]
      },
      {
        id: 4,
        hookText: "ZERO TOKENS WASTED",
        voiceover: "Free browser-native vector rendering and procedural audio synthesizers eliminate costly recurring cloud GPU bills forever.",
        visualTheme: { bgGradient: ["#022c22", "#064e3b"], accentColor: "#10b981" },
        customVisuals: { phaseNumber: 4, phaseName: "FREE NATIVE", headlineMetric: "$0 COST", subMetric: "ZERO CLOUD OVERHEAD" },
        captions: [{ text: "Keep 100%", emphasis: true }, { text: "Of Your Margins.", emphasis: true }]
      },
      {
        id: 5,
        hookText: "DOMINATE THE FEED",
        voiceover: "Scale from publishing once a week to publishing five times every single day. Start your automated video engine right now.",
        visualTheme: { bgGradient: ["#0f172a", "#1e1b4b"], accentColor: "#f43f5e" },
        customVisuals: { phaseNumber: 5, phaseName: "SCALE", headlineMetric: "5X DAILY", subMetric: "DOMINATE ALGORITHMS" },
        captions: [{ text: "Start Today.", emphasis: true }, { text: "Scale Unstoppably.", emphasis: true }]
      }
    ]
  }
];
