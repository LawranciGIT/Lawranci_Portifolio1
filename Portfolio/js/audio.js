/**
 * Retro Audio System using Web Audio API
 * Generates pure 90s chiptune & synthwave sound effects and ambient arpeggiated music
 * Completely self-contained - zero external audio assets required!
 */

class RetroAudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('synthwave_sound_muted') === 'true';
    this.isBgmPlaying = false;
    this.bgmTimer = null;
    this.stepIndex = 0;
    
    // Synthwave Chord Progression in frequencies (Hz)
    // Progression: D minor -> Bb Major -> C Major -> A minor
    this.chords = [
      // Dm (D3, F3, A3, D4)
      [146.83, 174.61, 220.00, 293.66],
      // Bb (Bb2, D3, F3, Bb3)
      [116.54, 146.83, 174.61, 233.08],
      // C (C3, E3, G3, C4)
      [130.81, 164.81, 196.00, 261.63],
      // Am (A2, C3, E3, A3)
      [110.00, 130.81, 164.81, 220.00]
    ];
    this.chordIndex = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    localStorage.setItem('synthwave_sound_muted', muted);
    if (this.isMuted && this.isBgmPlaying) {
      this.stopBgm();
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return !this.isMuted;
  }

  // 8-bit arcade hover blip
  playHover() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  // Retro arcade select button click
  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  // Classic 90s dual-tone "Coin Inserted" sound
  playCoin() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();

      osc1.type = 'square';
      osc1.frequency.setValueAtTime(987.77, t); // B5
      osc1.frequency.setValueAtTime(1318.51, t + 0.09); // E6

      gain1.gain.setValueAtTime(0.08, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc1.start(t);
      osc1.stop(t + 0.35);
    } catch (e) {}
  }

  // Success / Achievement Unlocked Chime
  playSuccess() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const startT = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = startT + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.07, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.18);
      });
    } catch (e) {}
  }

  // Glitch / Error buzzer
  playError() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.linearRampToValueAtTime(80, t + 0.2);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);
    } catch (e) {}
  }

  // Ambient Synthwave Background Music Loop
  toggleBgm() {
    if (this.isBgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  startBgm() {
    this.init();
    if (!this.ctx) return;
    this.isBgmPlaying = true;
    this.stepIndex = 0;
    this.chordIndex = 0;

    const playNextNote = () => {
      if (!this.isBgmPlaying) return;

      try {
        const chord = this.chords[this.chordIndex];
        const freq = chord[this.stepIndex % chord.length];

        // Soft synth pulse
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        // Warm filtered saw/triangle mix
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.25);

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.28);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.28);

        // Advance arpeggio step
        this.stepIndex++;
        if (this.stepIndex >= 8) {
          this.stepIndex = 0;
          this.chordIndex = (this.chordIndex + 1) % this.chords.length;
        }
      } catch (err) {}

      // 120 BPM 16th notes = ~130ms
      this.bgmTimer = setTimeout(playNextNote, 135);
    };

    playNextNote();
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

// Global instance
window.retroAudio = new RetroAudioSystem();
