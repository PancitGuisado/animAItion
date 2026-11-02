// Secure Multi-Voice Neural Engine
export const AI_VOICES = [
  { id: 'Puck', name: 'Puck', style: 'Energetic & Punchy (Viral Reels / Shorts)', type: 'neural', gender: 'Male' },
  { id: 'Charon', name: 'Charon', style: 'Deep & Cinematic (Documentary / Explainer)', type: 'neural', gender: 'Male' },
  { id: 'Kore', name: 'Kore', style: 'Warm & Professional (SaaS / How-To)', type: 'neural', gender: 'Female' },
  { id: 'Fenrir', name: 'Fenrir', style: 'Authoritative & Bold (Brand / Promo)', type: 'neural', gender: 'Male' },
  { id: 'Aoede', name: 'Aoede', style: 'Friendly & Conversational (UGC / Storytelling)', type: 'neural', gender: 'Female' },
  { id: 'browser_male', name: 'System Male', style: 'Fast Local', type: 'local', gender: 'Male' },
  { id: 'browser_female', name: 'System Female', style: 'Fast Local', type: 'local', gender: 'Female' }
];

class VoiceoverEngine {
  constructor() {
    this.audioCache = new Map();
    this.currentAudio = null;
    this.onWordCallback = null;
    this.onEndCallback = null;
    this.timerId = null;
    this.isSpeaking = false;
    this.activeSessionId = 0;
  }

  calculateTimings(text, speed = 1.0) {
    if (!text) return [];
    const words = text.trim().split(/\s+/);
    let currentMs = 80;
    return words.map((word, i) => {
      const cleanLen = Math.max(1, word.replace(/[^a-zA-Z0-9]/g, '').length);
      const hasPause = word.includes('.') || word.includes('!') || word.includes('?') || word.includes(',');
      const durationMs = Math.max(180, cleanLen * 52) / speed;
      const item = {
        index: i,
        word,
        startMs: currentMs,
        endMs: currentMs + durationMs
      };
      currentMs += durationMs + (hasPause ? 240 : 40);
      return item;
    });
  }

  // Secure Server-Side Proxy: never exposes API key
  async generateNeuralAudio(text, voiceName = 'Puck') {
    const cacheKey = `${voiceName}:${text}`;
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey);
    }

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName })
    });

    if (!res.ok) {
      throw new Error(`TTS server proxy failed: ${res.status}`);
    }

    const json = await res.json();
    if (!json.data) {
      throw new Error('No audio returned');
    }

    const byteChars = atob(json.data);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: json.mimeType || 'audio/wav' });
    const blobUrl = URL.createObjectURL(blob);
    this.audioCache.set(cacheKey, blobUrl);
    return blobUrl;
  }

  async speak(text, { voiceId = 'Puck', onWord, onEnd } = {}) {
    this.stop();

    const sessionId = ++this.activeSessionId;
    this.onWordCallback = onWord;
    this.onEndCallback = onEnd;
    this.isSpeaking = true;

    const timings = this.calculateTimings(text);
    const totalWords = timings.map(t => t.word);

    const isNeural = !voiceId.startsWith('browser_');

    if (isNeural) {
      try {
        const audioUrl = await this.generateNeuralAudio(text, voiceId);
        
        if (sessionId !== this.activeSessionId || !this.isSpeaking) {
          return;
        }

        if (this.currentAudio) {
          this.currentAudio.pause();
          this.currentAudio.src = '';
          this.currentAudio = null;
        }

        const audio = new Audio(audioUrl);
        this.currentAudio = audio;

        audio.onplay = () => {
          if (sessionId !== this.activeSessionId) {
            audio.pause();
            return;
          }
          const startTime = performance.now();
          const tick = () => {
            if (sessionId !== this.activeSessionId || !this.isSpeaking || audio.paused) return;
            const elapsed = performance.now() - startTime;
            let activeWordIdx = 0;
            for (let i = 0; i < timings.length; i++) {
              if (elapsed >= timings[i].startMs) {
                activeWordIdx = i;
              } else {
                break;
              }
            }
            if (this.onWordCallback) this.onWordCallback(activeWordIdx, totalWords[activeWordIdx]);
            this.timerId = requestAnimationFrame(tick);
          };
          this.timerId = requestAnimationFrame(tick);
        };

        audio.onended = () => {
          if (sessionId === this.activeSessionId) {
            this.isSpeaking = false;
            if (this.onEndCallback) this.onEndCallback();
          }
        };

        await audio.play();
        return;
      } catch (err) {
        console.warn('Neural TTS fallback:', err);
      }
    }

    if (sessionId !== this.activeSessionId || !this.isSpeaking) return;

    // Local fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.__activeUtterance = utterance;
      utterance.rate = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const isFem = voiceId === 'browser_female' || voiceId === 'Kore' || voiceId === 'Aoede';
      const targetVoice = voices.find(v => v.lang.startsWith('en') && (isFem ? (v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Female')) : (v.name.includes('David') || v.name.includes('Mark') || v.name.includes('Male')))) || voices.find(v => v.lang.startsWith('en'));

      if (targetVoice) utterance.voice = targetVoice;

      const startTime = performance.now();
      const tick = () => {
        if (sessionId !== this.activeSessionId || !this.isSpeaking) return;
        const elapsed = performance.now() - startTime;
        let activeWordIdx = 0;
        for (let i = 0; i < timings.length; i++) {
          if (elapsed >= timings[i].startMs) activeWordIdx = i;
          else break;
        }
        if (this.onWordCallback) this.onWordCallback(activeWordIdx, totalWords[activeWordIdx]);
        if (elapsed >= timings[timings.length - 1].endMs + 300) {
          this.isSpeaking = false;
          if (this.onEndCallback) this.onEndCallback();
          return;
        }
        this.timerId = requestAnimationFrame(tick);
      };

      utterance.onstart = () => {
        if (sessionId === this.activeSessionId) {
          this.timerId = requestAnimationFrame(tick);
        } else {
          window.speechSynthesis.cancel();
        }
      };

      utterance.onend = () => {
        if (sessionId === this.activeSessionId) {
          this.isSpeaking = false;
          if (this.onEndCallback) this.onEndCallback();
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  }

  stop() {
    this.isSpeaking = false;
    this.activeSessionId++;
    if (this.timerId) {
      cancelAnimationFrame(this.timerId);
      this.timerId = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio.src = '';
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceoverManager = new VoiceoverEngine();
