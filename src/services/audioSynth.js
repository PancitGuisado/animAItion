// Free Sound & Audio Synthesizer using Web Audio API (zero external assets, 0 cost, instant)
class AudioManager {
  constructor() {
    this.ctx = null;
    this.bgmGain = null;
    this.bgmInterval = null;
    this.isPlayingBgm = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft modern Lo-fi / Synth chord progression
  startBGM(mood = 'upbeat') {
    this.init();
    if (this.isPlayingBgm) return;
    this.isPlayingBgm = true;

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    this.bgmGain.connect(this.ctx.destination);

    // Minor/major chord frequency sets (Hz)
    const chordProgressions = {
      upbeat: [
        [261.63, 329.63, 392.00], // C
        [220.00, 261.63, 329.63], // Am
        [174.61, 220.00, 261.63], // F
        [196.00, 246.94, 293.66], // G
      ],
      chill: [
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [196.00, 246.94, 293.66, 349.23], // G7
      ],
      cyber: [
        [146.83, 220.00, 261.63], // Dm
        [130.81, 196.00, 246.94], // C
        [116.54, 174.61, 220.00], // Bb
        [164.81, 246.94, 311.13], // E
      ]
    };

    const chords = chordProgressions[mood] || chordProgressions.upbeat;
    let step = 0;

    const playChord = () => {
      if (!this.isPlayingBgm || !this.ctx) return;
      const notes = chords[step % chords.length];
      step++;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = mood === 'cyber' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq * (mood === 'chill' ? 0.5 : 1), this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);

        noteGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.06, this.ctx.currentTime + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.8);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.bgmGain);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 2.0);
      });
    };

    playChord();
    this.bgmInterval = setInterval(playChord, 1800);
  }

  stopBGM() {
    this.isPlayingBgm = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  // Sound effects
  playPop() {
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Audio context might be restricted
    }
  }

  playWhoosh() {
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }
}

export const audioFx = new AudioManager();
