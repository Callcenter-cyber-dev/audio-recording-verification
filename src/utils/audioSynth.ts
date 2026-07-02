// A premium Web Audio API Synthesizer to simulate call center transmission line sounds
// This gives the preloaded/seeded records real playable sound that sounds like a radio telecom channel!

let audioCtx: AudioContext | null = null;
let humOscillator: OscillatorNode | null = null;
let staticFilter: BiquadFilterNode | null = null;
let noiseNode: AudioWorkletNode | ScriptProcessorNode | null = null;
let gainNode: GainNode | null = null;

export function playSimulatedTelecomAudio() {
  try {
    // Initialize AudioContext lazily on user interaction
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    // Stop existing sound first if any
    stopSimulatedTelecomAudio();

    const ctx = audioCtx;
    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime); // keep volume subtle and comfortable

    // 1. Create telephone line Hum (60Hz + 120Hz harmonics)
    humOscillator = ctx.createOscillator();
    humOscillator.type = "sine";
    humOscillator.frequency.setValueAtTime(120, ctx.currentTime);

    // Subtle frequency modulation to sound realistic
    const fmOsc = ctx.createOscillator();
    fmOsc.frequency.setValueAtTime(4, ctx.currentTime);
    const fmGain = ctx.createGain();
    fmGain.gain.setValueAtTime(8, ctx.currentTime);
    fmOsc.connect(fmGain);
    fmGain.connect(humOscillator.frequency);

    // 2. Create telephone static bandpass noise
    // We can use a ScriptProcessorNode to generate safe cross-browser white noise
    const bufferSize = 4096;
    const scriptNode = ctx.createScriptProcessor(bufferSize, 1, 1);
    scriptNode.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Generate random white noise
        output[i] = Math.random() * 2 - 1;
      }
    };
    noiseNode = scriptNode;

    // Filter static noise to telephone range (300Hz to 3400Hz bandpass)
    staticFilter = ctx.createBiquadFilter();
    staticFilter.type = "bandpass";
    staticFilter.frequency.setValueAtTime(1000, ctx.currentTime); // mid telephone band
    staticFilter.Q.setValueAtTime(0.8, ctx.currentTime);

    // Connect nodes
    humOscillator.connect(gainNode);
    
    noiseNode.connect(staticFilter);
    staticFilter.connect(gainNode);

    gainNode.connect(ctx.destination);

    // Start oscillators
    humOscillator.start();
    fmOsc.start();

    // Store fmOsc inside humOscillator for garbage collection and stopping
    (humOscillator as any).fmOsc = fmOsc;
  } catch (err) {
    console.warn("Web Audio API not fully supported or blocked:", err);
  }
}

export function stopSimulatedTelecomAudio() {
  try {
    if (humOscillator) {
      humOscillator.stop();
      if ((humOscillator as any).fmOsc) {
        (humOscillator as any).fmOsc.stop();
      }
      humOscillator = null;
    }
    if (noiseNode) {
      noiseNode.disconnect();
      noiseNode = null;
    }
    if (gainNode) {
      gainNode.disconnect();
      gainNode = null;
    }
  } catch (err) {
    console.warn("Error stopping synth:", err);
  }
}
