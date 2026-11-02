// Unified Web Audio Stream Mixer for Video Export
// Seamlessly merges Canvas Visuals + Voiceover Narration + Background Synthesizer Music into the exported video

class AudioExportMixer {
  constructor() {
    this.audioCtx = null;
    this.destination = null;
    this.activeSourceNodes = [];
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    if (!this.destination) {
      this.destination = this.audioCtx.createMediaStreamDestination();
    }
    return this.destination;
  }

  // Decode audio buffer once so it starts with ZERO delay
  async prepareAudioBuffer(audioUrl) {
    if (!audioUrl) return null;
    this.init();
    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      return await this.audioCtx.decodeAudioData(arrayBuffer);
    } catch (err) {
      console.warn('Audio decoding error:', err);
      return null;
    }
  }

  // Play audio buffer directly into the MediaRecorder stream destination
  playBuffer(audioBuffer) {
    if (!audioBuffer) return;
    this.init();

    try {
      const sourceNode = this.audioCtx.createBufferSource();
      sourceNode.buffer = audioBuffer;

      sourceNode.connect(this.destination);
      sourceNode.connect(this.audioCtx.destination);

      sourceNode.start(0);
      this.activeSourceNodes.push(sourceNode);

      return sourceNode;
    } catch (err) {
      console.warn('Audio export stream track error:', err);
    }
  }

  getAudioStream() {
    this.init();
    return this.destination.stream;
  }

  stopAll() {
    this.activeSourceNodes.forEach(node => {
      try {
        node.stop();
        node.disconnect();
      } catch {}
    });
    this.activeSourceNodes = [];
  }
}

export const audioExportMixer = new AudioExportMixer();
