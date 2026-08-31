/**
 * Web Audio API Synthesizer for high quality procedural sound effects & chimes.
 * Requires zero external audio assets or network requests.
 */

class SoundFX {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private isGameActive: boolean = false;
  private isTabHidden: boolean = false;
  private bgmIntervalId: number | null = null;
  private bgmStep: number = 0;

  constructor() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.isTabHidden = true;
          this.stopBGM();
          if (this.ctx && this.ctx.state === 'running') {
            this.ctx.suspend();
          }
        } else {
          this.isTabHidden = false;
          if (this.soundEnabled && this.isGameActive) {
            if (this.ctx && this.ctx.state === 'suspended') {
              this.ctx.resume();
            }
            this.startBGM();
          }
        }
      });
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setGameActive(active: boolean) {
    this.isGameActive = active;
    if (!active) {
      this.stopBGM();
    } else if (this.soundEnabled && !this.isTabHidden && typeof document !== 'undefined' && !document.hidden) {
      this.startBGM();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopBGM();
    } else if (this.isGameActive && !this.isTabHidden && typeof document !== 'undefined' && !document.hidden) {
      this.startBGM();
    }
  }

  public startBGM() {
    if (this.bgmIntervalId !== null || !this.soundEnabled || this.isTabHidden || (typeof document !== 'undefined' && document.hidden)) return;
    this.initCtx();
    if (!this.ctx) return;

    // Tropical Jungle Marimba Melody Notes (C Major / G Major Arpeggio Loop)
    const melody = [
      261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 329.63, // C Major
      293.66, 349.23, 440.00, 587.33, 440.00, 349.23, 293.66, 349.23, // D minor
      329.63, 392.00, 493.88, 659.25, 493.88, 392.00, 329.63, 392.00, // E minor
      349.23, 440.00, 523.25, 698.46, 523.25, 440.00, 349.23, 392.00  // F Major
    ];

    const bass = [130.81, 130.81, 146.83, 146.83, 164.81, 164.81, 174.61, 196.00];

    this.bgmStep = 0;
    const tempo = 220; // ms per beat

    this.bgmIntervalId = window.setInterval(() => {
      if (!this.soundEnabled || !this.ctx) return;

      const now = this.ctx.currentTime;
      const noteIdx = this.bgmStep % melody.length;
      const bassIdx = Math.floor(this.bgmStep / 4) % bass.length;

      // 1. Play Soft Tropical Marimba Melody Note
      const noteFreq = melody[noteIdx];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(noteFreq, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);

      // 2. Play Soft Warm Bass Note every 4 beats
      if (this.bgmStep % 4 === 0) {
        const bassFreq = bass[bassIdx];
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassGain.gain.setValueAtTime(0.09, now);
        bassGain.gain.exponentialRampToValueAtTime(0.004, now + 0.38);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);

        bassOsc.start(now);
        bassOsc.stop(now + 0.38);
      }

      this.bgmStep++;
    }, tempo);
  }

  public stopBGM() {
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  public playPop() {
    this.playCandyCrushPop(2);
  }

  public playCandyCrushPop(clusterSize: number = 2) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Crashing Candy Impact Noise / Low-end Punch
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(90, now + 0.05);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(now);
    } catch {
      // Fallback
    }

    // 2. High Juicy Candy "POP!" Tonal Sweeps
    const popCount = Math.min(Math.max(clusterSize, 2), 6);
    for (let i = 0; i < popCount; i++) {
      const delay = i * 0.022;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      const startFreq = 380 + i * 85 + Math.random() * 40;
      const endFreq = startFreq * 2.2;

      osc.frequency.setValueAtTime(startFreq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + delay + 0.07);

      gain.gain.setValueAtTime(0.3, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.07);
    }
  }

  public playRescueChime() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.3);
    });
  }

  public playCombo(comboCount: number) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const baseFreq = 400 + Math.min(comboCount, 8) * 60;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  public playBooster() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  public playExplosion() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playVictory() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.1);
      osc.stop(this.ctx.currentTime + idx * 0.1 + 0.4);
    });
  }

  public playGameOver() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [400, 350, 300, 250];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.15);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.15 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.15);
      osc.stop(this.ctx.currentTime + idx * 0.15 + 0.3);
    });
  }

  public playClick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  public playDinoRoar() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Low frequency rumble roar + pitch drop
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.55);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch {
      // Fallback
    }
  }

  public speakAnnouncer(phrase: string) {
    if (!this.soundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();

      const cleanText = phrase.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 0.92; // Deep energetic Candy Crush style arcade voice
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Daniel') || v.name.includes('Alex') || v.name.includes('Google') || v.name.includes('Male')));
      if (engVoice) {
        utterance.voice = engVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Fallback
    }
  }

  public playChaChing() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Metallic cash register 2-step chime (B5, E6)
    try {
      const notes = [987.77, 1318.51];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.25, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.2);
      });
    } catch {
      // Fallback
    }
  }
}

export const soundFX = new SoundFX();
