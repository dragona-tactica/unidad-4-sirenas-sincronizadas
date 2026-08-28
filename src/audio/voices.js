import * as Tone from 'tone';

// Cada personalidad tiene un sintetizador con envolvente/timbre propios,
// no solo un pitch distinto. El disparo ocurre en el cruce por cero de theta;
// el pitch sale del registro (omega) de cada sirena y la intensidad/vibrato
// de su velocidad de fase.
export function createVoices() {
  const master = new Tone.Volume(-8).toDestination();

  const melismatica = new Tone.FMSynth({
    harmonicity: 1.5,
    modulationIndex: 3,
    envelope: { attack: 0.35, decay: 0.4, sustain: 0.4, release: 1.2 },
    modulationEnvelope: { attack: 0.4, decay: 0.2, sustain: 0.3, release: 1 },
  }).connect(new Tone.Vibrato(5, 0.25).connect(master));

  const staccato = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.18, release: 0.05 },
    harmonicity: 5.1,
    modulationIndex: 16,
    resonance: 2000,
    octaves: 1.2,
  }).connect(master);

  const dronera = new Tone.MonoSynth({
    oscillator: { type: 'fatsawtooth', count: 3, spread: 25 },
    envelope: { attack: 0.6, decay: 0.3, sustain: 0.9, release: 2 },
    filterEnvelope: { attack: 0.6, decay: 0.3, sustain: 0.5, release: 2, baseFrequency: 120, octaves: 2 },
  }).connect(new Tone.Distortion(0.25).connect(master));

  const brillante = new Tone.Synth({
    oscillator: { type: 'triangle8' },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.1, release: 0.6 },
  }).connect(new Tone.PingPongDelay('16n', 0.15).connect(master));

  return { melismatica, staccato, dronera, brillante, master };
}

const REGISTER_MIDI_BASE = { melismatica: 62, staccato: 74, dronera: 43, brillante: 84 };

export function triggerSirena(voices, sirena) {
  const base = REGISTER_MIDI_BASE[sirena.personality.synth];
  const registerOffset = (sirena.omega / sirena.personality.baseOmega - 1) * 12;
  const midi = base + registerOffset;
  const freq = Tone.Frequency(midi, 'midi').toFrequency();
  const velocity = Math.min(1, 0.25 + Math.abs(sirena.phaseVelocity) * 0.3);

  const voice = voices[sirena.personality.synth];
  if (!voice) return;

  if (sirena.personality.synth === 'staccato') {
    voice.frequency.value = freq;
    voice.triggerAttackRelease('16n', undefined, velocity);
  } else if (sirena.personality.synth === 'dronera') {
    voice.triggerAttackRelease(freq, 1.4, undefined, velocity * 0.8);
  } else {
    voice.triggerAttackRelease(freq, '8n', undefined, velocity);
  }
}
