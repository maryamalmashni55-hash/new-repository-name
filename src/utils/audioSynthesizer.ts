// Ambient deep space drone, procedural planetary audio signatures, and UI sound effects via Web Audio API
import { PlanetId } from '../types';

interface PlanetAudioState {
  planetId: PlanetId;
  masterGain: GainNode;
  nodes: (AudioNode | OscillatorNode | AudioBufferSourceNode)[];
}

class SpaceAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private noiseBuffer: AudioBuffer | null = null;

  // Master space drone (ambient cosmic background)
  private droneGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;

  // Active planet ambient audio
  private currentPlanetAudio: PlanetAudioState | null = null;
  private activePlanetId: PlanetId | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.ctx && !this.noiseBuffer) {
      this.createNoiseBuffer();
    }
  }

  // Pre-generate 3 seconds of pink/cosmic noise for atmospheric winds and plasma
  private createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    this.noiseBuffer = buffer;
  }

  public toggleMute(): boolean {
    this.initContext();
    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      this.stopDrone();
      this.stopPlanetAmbience(0.3);
    } else {
      this.startDrone();
      if (this.activePlanetId) {
        this.playPlanetAmbience(this.activePlanetId);
      }
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): boolean {
    if (this.isMuted !== muted) {
      return this.toggleMute();
    }
    return this.isMuted;
  }

  public getCurrentPlanetAmbience(): PlanetId | null {
    return this.activePlanetId;
  }

  // --- Master Deep-Space Ambient Drone ---
  public startDrone() {
    this.initContext();
    if (!this.ctx || this.droneGain) return;

    try {
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.droneGain.gain.exponentialRampToValueAtTime(0.05, this.ctx.currentTime + 3);

      this.droneFilter = this.ctx.createBiquadFilter();
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(140, this.ctx.currentTime);

      // Deep cosmic drone: 55Hz & 82.5Hz (A1 and E2)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'sine';
      this.droneOsc2.frequency.setValueAtTime(82.4, this.ctx.currentTime);

      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);

      this.droneOsc1.start();
      this.droneOsc2.start();
    } catch {
      // Audio context policy protection
    }
  }

  public stopDrone() {
    if (!this.ctx || !this.droneGain) return;
    try {
      this.droneGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      const osc1 = this.droneOsc1;
      const osc2 = this.droneOsc2;
      const gain = this.droneGain;
      setTimeout(() => {
        try {
          osc1?.stop();
          osc2?.stop();
          osc1?.disconnect();
          osc2?.disconnect();
          gain?.disconnect();
        } catch {
          // ignore
        }
      }, 550);
      this.droneOsc1 = null;
      this.droneOsc2 = null;
      this.droneGain = null;
    } catch {
      // ignore
    }
  }

  // --- Specialized Procedural Ambient Signature for Each Planet ---
  public playPlanetAmbience(planetId: PlanetId) {
    this.activePlanetId = planetId;
    if (this.isMuted) return;

    this.initContext();
    if (!this.ctx) return;

    // Cross-fade out existing planet ambience if different
    if (this.currentPlanetAudio) {
      if (this.currentPlanetAudio.planetId === planetId) {
        return; // Already playing this planet
      }
      this.stopPlanetAmbience(0.6);
    }

    try {
      const now = this.ctx.currentTime;
      const planetMasterGain = this.ctx.createGain();
      planetMasterGain.gain.setValueAtTime(0.0001, now);
      planetMasterGain.gain.exponentialRampToValueAtTime(0.16, now + 1.2);
      planetMasterGain.connect(this.ctx.destination);

      const nodes: (AudioNode | OscillatorNode | AudioBufferSourceNode)[] = [planetMasterGain];

      // Build customized synthesis architecture based on celestial body physics
      switch (planetId) {
        case 'sun': {
          // 1. Massive thermonuclear sub-bass plasma rumble
          const subOsc = this.ctx.createOscillator();
          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(44, now);
          const subGain = this.ctx.createGain();
          subGain.gain.setValueAtTime(0.35, now);
          subOsc.connect(subGain).connect(planetMasterGain);
          subOsc.start(now);
          nodes.push(subOsc, subGain);

          // 2. Secondary solar harmonic
          const harmOsc = this.ctx.createOscillator();
          harmOsc.type = 'sine';
          harmOsc.frequency.setValueAtTime(65.4, now);
          const harmGain = this.ctx.createGain();
          harmGain.gain.setValueAtTime(0.2, now);
          harmOsc.connect(harmGain).connect(planetMasterGain);
          harmOsc.start(now);
          nodes.push(harmOsc, harmGain);

          // 3. Turbulent boiling plasma noise
          if (this.noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.noiseBuffer;
            noise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.Q.setValueAtTime(3.5, now);
            filter.frequency.setValueAtTime(140, now);

            // Plasma convection LFO
            const lfo = this.ctx.createOscillator();
            lfo.frequency.setValueAtTime(0.25, now);
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.setValueAtTime(65, now);
            lfo.connect(lfoGain).connect(filter.frequency);
            lfo.start(now);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.25, now);

            noise.connect(filter).connect(noiseGain).connect(planetMasterGain);
            noise.start(now);
            nodes.push(noise, filter, lfo, lfoGain, noiseGain);
          }
          break;
        }

        case 'mercury': {
          // Stark, high-vacuum metallic resonance and solar proximity radiation
          const osc1 = this.ctx.createOscillator();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(587.3, now); // D5

          const osc2 = this.ctx.createOscillator();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(880, now); // A5

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1200, now);
          filter.Q.setValueAtTime(6, now);

          const pingGain = this.ctx.createGain();
          pingGain.gain.setValueAtTime(0.18, now);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(pingGain).connect(planetMasterGain);

          osc1.start(now);
          osc2.start(now);
          nodes.push(osc1, osc2, filter, pingGain);
          break;
        }

        case 'venus': {
          // Crushing dense CO2 atmosphere with whistling sulfuric acid winds & pressure beating
          const drone1 = this.ctx.createOscillator();
          drone1.type = 'triangle';
          drone1.frequency.setValueAtTime(110, now); // A2

          const drone2 = this.ctx.createOscillator();
          drone2.type = 'triangle';
          drone2.frequency.setValueAtTime(115.5, now); // Detuned beating for dense pressure

          const lowpass = this.ctx.createBiquadFilter();
          lowpass.type = 'lowpass';
          lowpass.frequency.setValueAtTime(220, now);

          const droneGain = this.ctx.createGain();
          droneGain.gain.setValueAtTime(0.28, now);

          drone1.connect(lowpass);
          drone2.connect(lowpass);
          lowpass.connect(droneGain).connect(planetMasterGain);

          drone1.start(now);
          drone2.start(now);
          nodes.push(drone1, drone2, lowpass, droneGain);

          // Dense wind roar
          if (this.noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.noiseBuffer;
            noise.loop = true;

            const windFilter = this.ctx.createBiquadFilter();
            windFilter.type = 'bandpass';
            windFilter.frequency.setValueAtTime(380, now);
            windFilter.Q.setValueAtTime(2.2, now);

            // Wind sweep LFO
            const windLfo = this.ctx.createOscillator();
            windLfo.frequency.setValueAtTime(0.18, now);
            const windLfoGain = this.ctx.createGain();
            windLfoGain.gain.setValueAtTime(120, now);
            windLfo.connect(windLfoGain).connect(windFilter.frequency);
            windLfo.start(now);

            const windGain = this.ctx.createGain();
            windGain.gain.setValueAtTime(0.24, now);

            noise.connect(windFilter).connect(windGain).connect(planetMasterGain);
            noise.start(now);
            nodes.push(noise, windFilter, windLfo, windLfoGain, windGain);
          }
          break;
        }

        case 'earth': {
          // Serene harmonic oasis: Schumann resonance harmonics & gentle ocean-swell filtering
          const freqs = [130.81, 196.00, 261.63, 329.63]; // C3, G3, C4, E4 major harmony
          const gains = [0.22, 0.18, 0.14, 0.10];

          const earthFilter = this.ctx.createBiquadFilter();
          earthFilter.type = 'lowpass';
          earthFilter.frequency.setValueAtTime(350, now);
          earthFilter.Q.setValueAtTime(1.8, now);

          // Ocean wave swell LFO
          const swellLfo = this.ctx.createOscillator();
          swellLfo.frequency.setValueAtTime(0.14, now);
          const swellLfoGain = this.ctx.createGain();
          swellLfoGain.gain.setValueAtTime(140, now);
          swellLfo.connect(swellLfoGain).connect(earthFilter.frequency);
          swellLfo.start(now);

          earthFilter.connect(planetMasterGain);
          nodes.push(earthFilter, swellLfo, swellLfoGain);

          freqs.forEach((f, idx) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now);
            const g = this.ctx.createGain();
            g.gain.setValueAtTime(gains[idx], now);
            osc.connect(g).connect(earthFilter);
            osc.start(now);
            nodes.push(osc, g);
          });
          break;
        }

        case 'mars': {
          // Solitary red desert: Whispering thin dust storms & hollow chill
          const bassDrone = this.ctx.createOscillator();
          bassDrone.type = 'sine';
          bassDrone.frequency.setValueAtTime(73.42, now); // D2
          const bassGain = this.ctx.createGain();
          bassGain.gain.setValueAtTime(0.22, now);
          bassDrone.connect(bassGain).connect(planetMasterGain);
          bassDrone.start(now);
          nodes.push(bassDrone, bassGain);

          // Thin howling dust devil wind
          if (this.noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.noiseBuffer;
            noise.loop = true;

            const dustFilter = this.ctx.createBiquadFilter();
            dustFilter.type = 'bandpass';
            dustFilter.frequency.setValueAtTime(290, now);
            dustFilter.Q.setValueAtTime(4.8, now);

            const dustLfo = this.ctx.createOscillator();
            dustLfo.frequency.setValueAtTime(0.3, now);
            const dustLfoGain = this.ctx.createGain();
            dustLfoGain.gain.setValueAtTime(90, now);
            dustLfo.connect(dustLfoGain).connect(dustFilter.frequency);
            dustLfo.start(now);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.26, now);

            noise.connect(dustFilter).connect(noiseGain).connect(planetMasterGain);
            noise.start(now);
            nodes.push(noise, dustFilter, dustLfo, dustLfoGain, noiseGain);
          }
          break;
        }

        case 'jupiter': {
          // Colossal Jovian magnetosphere roar & radio emissions (Voyager/Juno whistle)
          const sub = this.ctx.createOscillator();
          sub.type = 'sine';
          sub.frequency.setValueAtTime(48.99, now); // G1
          const subG = this.ctx.createGain();
          subG.gain.setValueAtTime(0.32, now);
          sub.connect(subG).connect(planetMasterGain);
          sub.start(now);
          nodes.push(sub, subG);

          // FM whistling radio radiation belts
          const carrier = this.ctx.createOscillator();
          carrier.type = 'sine';
          carrier.frequency.setValueAtTime(220, now);

          const modulator = this.ctx.createOscillator();
          modulator.type = 'sine';
          modulator.frequency.setValueAtTime(3.8, now);

          const modGain = this.ctx.createGain();
          modGain.gain.setValueAtTime(42, now);

          modulator.connect(modGain).connect(carrier.frequency);

          const fmGain = this.ctx.createGain();
          fmGain.gain.setValueAtTime(0.18, now);

          carrier.connect(fmGain).connect(planetMasterGain);

          carrier.start(now);
          modulator.start(now);
          nodes.push(carrier, modulator, modGain, fmGain);
          break;
        }

        case 'saturn': {
          // Ethereal ice ring resonance: Quintal crystal cluster and icy shimmer
          const ringHarmonies = [185.00, 277.18, 369.99, 554.37]; // F# minor / quintal celestial chord
          const chordGain = this.ctx.createGain();
          chordGain.gain.setValueAtTime(0.14, now);
          chordGain.connect(planetMasterGain);
          nodes.push(chordGain);

          ringHarmonies.forEach((f) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now);
            osc.connect(chordGain);
            osc.start(now);
            nodes.push(osc);
          });

          // High crystalline ring dust shimmer (>3000Hz)
          if (this.noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.noiseBuffer;
            noise.loop = true;

            const highFilter = this.ctx.createBiquadFilter();
            highFilter.type = 'highpass';
            highFilter.frequency.setValueAtTime(3400, now);
            highFilter.Q.setValueAtTime(2.0, now);

            const shimmerLfo = this.ctx.createOscillator();
            shimmerLfo.frequency.setValueAtTime(0.4, now);
            const shimmerGain = this.ctx.createGain();
            shimmerGain.gain.setValueAtTime(0.08, now);

            noise.connect(highFilter).connect(shimmerGain).connect(planetMasterGain);
            shimmerLfo.start(now);
            noise.start(now);
            nodes.push(noise, highFilter, shimmerLfo, shimmerGain);
          }
          break;
        }

        case 'uranus': {
          // Sideways ice giant: Cold minor second tension and sub-zero glacial whistling
          const cold1 = this.ctx.createOscillator();
          cold1.type = 'sine';
          cold1.frequency.setValueAtTime(164.81, now); // E3

          const cold2 = this.ctx.createOscillator();
          cold2.type = 'sine';
          cold2.frequency.setValueAtTime(174.61, now); // F3 (dissonant ice tension)

          const coldGain = this.ctx.createGain();
          coldGain.gain.setValueAtTime(0.18, now);

          cold1.connect(coldGain);
          cold2.connect(coldGain);
          coldGain.connect(planetMasterGain);

          cold1.start(now);
          cold2.start(now);
          nodes.push(cold1, cold2, coldGain);

          // Sub-zero high whistle
          const whistle = this.ctx.createOscillator();
          whistle.type = 'sine';
          whistle.frequency.setValueAtTime(1174.66, now); // D6
          const whistleGain = this.ctx.createGain();
          whistleGain.gain.setValueAtTime(0.06, now);

          whistle.connect(whistleGain).connect(planetMasterGain);
          whistle.start(now);
          nodes.push(whistle, whistleGain);
          break;
        }

        case 'neptune': {
          // Supersonic storm winds (2,100 km/h) & dark storm vortex roar
          const deepAbyss = this.ctx.createOscillator();
          deepAbyss.type = 'sine';
          deepAbyss.frequency.setValueAtTime(58.27, now); // Bb1
          const deepGain = this.ctx.createGain();
          deepGain.gain.setValueAtTime(0.3, now);
          deepAbyss.connect(deepGain).connect(planetMasterGain);
          deepAbyss.start(now);
          nodes.push(deepAbyss, deepGain);

          if (this.noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.noiseBuffer;
            noise.loop = true;

            const stormFilter = this.ctx.createBiquadFilter();
            stormFilter.type = 'bandpass';
            stormFilter.frequency.setValueAtTime(320, now);
            stormFilter.Q.setValueAtTime(3.2, now);

            // Fast supersonic wind gusts
            const stormLfo = this.ctx.createOscillator();
            stormLfo.frequency.setValueAtTime(0.7, now);
            const stormLfoGain = this.ctx.createGain();
            stormLfoGain.gain.setValueAtTime(180, now);
            stormLfo.connect(stormLfoGain).connect(stormFilter.frequency);
            stormLfo.start(now);

            const stormNoiseGain = this.ctx.createGain();
            stormNoiseGain.gain.setValueAtTime(0.32, now);

            noise.connect(stormFilter).connect(stormNoiseGain).connect(planetMasterGain);
            noise.start(now);
            nodes.push(noise, stormFilter, stormLfo, stormLfoGain, stormNoiseGain);
          }
          break;
        }
      }

      this.currentPlanetAudio = {
        planetId,
        masterGain: planetMasterGain,
        nodes,
      };
    } catch {
      // Audio playback restrictions fallback
    }
  }

  public stopPlanetAmbience(fadeDuration: number = 0.8) {
    if (!this.currentPlanetAudio || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const audioToStop = this.currentPlanetAudio;
      this.currentPlanetAudio = null;

      audioToStop.masterGain.gain.setValueAtTime(audioToStop.masterGain.gain.value, now);
      audioToStop.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + fadeDuration);

      setTimeout(() => {
        try {
          audioToStop.nodes.forEach((n) => {
            if ('stop' in n && typeof (n as OscillatorNode).stop === 'function') {
              (n as OscillatorNode).stop();
            }
            n.disconnect();
          });
        } catch {
          // ignore
        }
      }, fadeDuration * 1000 + 100);
    } catch {
      // ignore
    }
  }

  // --- Planetary Focus Sonic Ping / Scanner Chime ---
  public playPlanetFocus(planetId: PlanetId) {
    if (this.isMuted || !this.ctx) return;
    try {
      this.initContext();
      const now = this.ctx.currentTime;

      // Futuristic holographic frequency confirmation
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreqs: Record<PlanetId, number> = {
        sun: 220,
        mercury: 784,
        venus: 440,
        earth: 523.25,
        mars: 349.23,
        jupiter: 261.63,
        saturn: 659.25,
        uranus: 880,
        neptune: 493.88,
      };

      const f = baseFreqs[planetId] || 440;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f * 0.8, now);
      osc.frequency.exponentialRampToValueAtTime(f, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.4);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain).connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // ignore
    }
  }

  // --- General UI Feedback SFX ---
  public playWhoosh() {
    if (this.isMuted || !this.ctx) return;
    try {
      this.initContext();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.8);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch {
      // ignore
    }
  }

  public playClick() {
    if (this.isMuted || !this.ctx) return;
    try {
      this.initContext();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // ignore
    }
  }

  public playCorrect() {
    if (this.isMuted || !this.ctx) return;
    try {
      this.initContext();
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.06, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.12);
      gain2.gain.setValueAtTime(0.08, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.5);
    } catch {
      // ignore
    }
  }

  public playWrong() {
    if (this.isMuted || !this.ctx) return;
    try {
      this.initContext();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // ignore
    }
  }
}

export const spaceAudio = new SpaceAudioEngine();
