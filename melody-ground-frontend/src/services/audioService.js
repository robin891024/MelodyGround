import * as Tone from 'tone';

class AudioService {
  constructor() {
    this.instruments = {};
    this.currentInstrument = 'piano';
    this.isInitialized = false;
    this.limiter = new Tone.Limiter(-2).toDestination();
    
    // 初始化時先不建立任何東西，全部交給 initialize
  }

  // 初始化音訊系統與樂器
  async initialize() {
    if (this.isInitialized && Object.keys(this.instruments).length > 0) return;
    
    try {
      Tone.context.lookahead = 0.01;
    } catch (e) {
      console.warn("Could not set lookahead", e);
    }
    
    await Tone.start();
    
    const samplerBase = "https://gleitz.github.io/midi-js-soundfonts/FatBoy/";
    
    // 建立所有樂器
    this.instruments = {
      piano: new Tone.Sampler({
        urls: {
          "C4": "acoustic_grand_piano-mp3/C4.mp3",
          "D#4": "acoustic_grand_piano-mp3/Ds4.mp3",
          "F#4": "acoustic_grand_piano-mp3/Fs4.mp3",
          "A4": "acoustic_grand_piano-mp3/A4.mp3",
        },
        release: 1,
        baseUrl: samplerBase,
      }).connect(this.limiter),
      
      synth: new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
      }).connect(this.limiter),
      
      guitar: new Tone.Sampler({
        urls: {
          "E2": "acoustic_guitar_steel-mp3/E2.mp3",
          "G2": "acoustic_guitar_steel-mp3/G2.mp3",
          "C3": "acoustic_guitar_steel-mp3/C3.mp3",
          "E3": "acoustic_guitar_steel-mp3/E3.mp3",
          "G3": "acoustic_guitar_steel-mp3/G3.mp3",
          "C4": "acoustic_guitar_steel-mp3/C4.mp3",
        },
        release: 1.5,
        baseUrl: samplerBase,
        volume: 10,
      }).connect(this.limiter),
      
      bass: new Tone.Sampler({
        urls: {
          "E1": "electric_bass_finger-mp3/E1.mp3",
          "G1": "electric_bass_finger-mp3/G1.mp3",
          "C2": "electric_bass_finger-mp3/C2.mp3",
          "E2": "electric_bass_finger-mp3/E2.mp3",
        },
        release: 1,
        baseUrl: samplerBase,
      }).connect(this.limiter)
    };

    this.isInitialized = true;
    console.log('Audio Service: Context & All Instruments Ready');
  }

  // 設定主音量 (0 到 100)
  setMasterVolume(value) {
    const db = Tone.gainToDb(value / 100);
    Tone.Destination.volume.rampTo(db, 0.1);
  }

  playNote(note, duration = '8n', velocity = 1, specificInstrument = null) {
    const instrumentName = specificInstrument || this.currentInstrument;
    const instrument = this.instruments[instrumentName];
    
    if (instrument) {
      // 核心邏輯：如果是 Sampler 且已加載，則播放；否則使用合成器
      if (instrument instanceof Tone.Sampler) {
        if (instrument.loaded) {
          instrument.triggerAttackRelease(note, duration, undefined, velocity);
        } else {
          // 降級播放
          this.instruments.synth.triggerAttackRelease(note, duration, undefined, velocity);
        }
      } else {
        // 非 Sampler (例如 synth) 直接播放
        instrument.triggerAttackRelease(note, duration, undefined, velocity);
      }
    } else {
      // 如果 instruments 對象還沒建立，這是最後的保險
      console.warn(`Instrument ${instrumentName} not found, check initialization`);
    }
  }

  setInstrument(instrumentName) {
    if (this.instruments[instrumentName]) {
      this.currentInstrument = instrumentName;
    }
  }

  getCurrentInstrument() {
    return this.currentInstrument;
  }

  stopAll() {
    Tone.Transport.stop();
    Tone.Transport.cancel(0);
    Object.values(this.instruments).forEach(inst => {
      if (inst.releaseAll) inst.releaseAll();
    });
  }
}

export default new AudioService();
