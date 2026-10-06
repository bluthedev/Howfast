// Lightweight Web Audio API synthesizer for instantaneous mobile audio feedback

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isHapticsEnabled = true;

    // Load persisted preferences
    if (typeof window !== 'undefined') {
      this.isMuted = localStorage.getItem('howfast_muted') === 'true';
      this.isHapticsEnabled = localStorage.getItem('howfast_haptics') !== 'false';
    }
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('howfast_muted', String(this.isMuted));
    }
    return this.isMuted;
  }

  toggleHaptics() {
    this.isHapticsEnabled = !this.isHapticsEnabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('howfast_haptics', String(this.isHapticsEnabled));
    }
    return this.isHapticsEnabled;
  }

  vibrate(pattern = [10]) {
    if (!this.isHapticsEnabled) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Silently ignore if not supported by browser permissions
      }
    }
  }

  // Crisp mechanical/bubble keypress click (12ms)
  playKeyClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch variation slightly per tap for organic feel
      const freq = 650 + Math.random() * 80;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (e) {}
  }

  // Low error thud / buzz on typo
  playErrorBuzz() {
    this.vibrate([35]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  // Rewarding rising chord on streak milestone (5x, 10x, 20x)
  playStreakChime(combo = 5) {
    this.vibrate([15, 30, 20]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const baseFreq = combo >= 20 ? 587.33 : combo >= 10 ? 523.25 : 440;
      const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]; // Major triad

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.05 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.05);
        osc.stop(this.ctx.currentTime + idx * 0.05 + 0.25);
      });
    } catch (e) {}
  }

  // Celebratory victory sound on finish
  playFinishFanfare() {
    this.vibrate([20, 40, 20, 40, 50]);
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.14, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.35);
      });
    } catch (e) {}
  }
}

export const sound = new SoundEngine();
