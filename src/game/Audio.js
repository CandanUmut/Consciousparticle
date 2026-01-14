const DEFAULT_SFX = {
  pickup: { type: "sine", freq: 420, duration: 0.12 },
  boost: { type: "sawtooth", freq: 160, duration: 0.2 },
  upgrade: { type: "triangle", freq: 520, duration: 0.25 },
  hit: { type: "square", freq: 220, duration: 0.18 },
  death: { type: "sine", freq: 140, duration: 0.6 },
};

const AUDIO_FILES = {
  pickup: "assets/sfx/pickup.mp3",
  boost: "assets/sfx/boost.mp3",
  upgrade: "assets/sfx/upgrade.mp3",
  hit: "assets/sfx/hit.mp3",
  death: "assets/sfx/death.mp3",
};

export class AudioManager {
  constructor() {
    this.context = null;
    this.volume = 0.6;
    this.muted = false;
    this.buffers = new Map();
  }

  ensureContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.context.state === "suspended") {
      this.context.resume();
    }
  }

  async load() {
    await Promise.all(
      Object.entries(AUDIO_FILES).map(async ([key, url]) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error("Missing audio asset");
          const data = await response.arrayBuffer();
          const buffer = await this.context.decodeAudioData(data);
          this.buffers.set(key, buffer);
        } catch (error) {
          console.info(`Audio asset ${url} unavailable, using synth fallback.`);
        }
      })
    );
  }

  play(key) {
    if (this.muted) return;
    this.ensureContext();
    const buffer = this.buffers.get(key);
    if (buffer) {
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      const gain = this.context.createGain();
      gain.gain.value = this.volume;
      source.connect(gain).connect(this.context.destination);
      source.start();
      return;
    }
    const fallback = DEFAULT_SFX[key];
    if (!fallback) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = fallback.type;
    osc.frequency.value = fallback.freq;
    gain.gain.value = this.volume * 0.6;
    osc.connect(gain).connect(this.context.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + fallback.duration);
    osc.stop(this.context.currentTime + fallback.duration);
  }

  setVolume(value) {
    this.volume = value;
  }

  setMuted(muted) {
    this.muted = muted;
  }
}
