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

  // Play audio blob or URL directly into the MediaRecorder stream destination
  async playAudioIntoStream(audioUrl) {
    if (!audioUrl) return;
    this.init();

    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);

      const sourceNode = this.audioCtx.createBufferSource();
      sourceNode.buffer = audioBuffer;

      // Connect to MediaRecorder recording stream
      sourceNode.connect(this.destination);
      // Also connect to speaker so user hears export progress
      sourceNode.connect(this.audioCtx.destination);

      sourceNode.start(0);
      this.activeSourceNodes.push(sourceNode);

      return new Promise((resolve) => {
        sourceNode.onended = () => {
          resolve();
        };
      });
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
