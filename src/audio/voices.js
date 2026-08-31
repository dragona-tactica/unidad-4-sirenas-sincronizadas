import * as Tone from 'tone';

// Cada sirena tiene SU PROPIO sintetizador -- nunca comparte instancia con
// otra, ni siquiera con su misma personalidad. Compartir una sola voz entre
// las 2 sirenas de un arquetipo hacía que, al sincronizarse (que es el punto
// de la pieza), ambas dispararan triggerAttackRelease casi en el mismo
// instante sobre el mismo synth -- Tone.js exige tiempos estrictamente
// crecientes por instrumento y tira un error que rompe el draw() de p5.
// Con una voz por agente esa colisión ya no puede pasar.
const RECIPES = {
  melismatica: (master) =>
    new Tone.FMSynth({
      harmonicity: 1.5,
      modulationIndex: 3,
      envelope: { attack: 0.35, decay: 0.4, sustain: 0.4, release: 1.2 },
      modulationEnvelope: { attack: 0.4, decay: 0.2, sustain: 0.3, release: 1 },
    }).connect(new Tone.Vibrato(5, 0.25).connect(master)),

  staccato: (master) =>
    new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.18, release: 0.05 },
      harmonicity: 5.1,
      modulationIndex: 16,
      resonance: 2000,
      octaves: 1.2,
    }).connect(master),

  dronera: (master) =>
    new Tone.MonoSynth({
      oscillator: { type: 'fatsawtooth', count: 3, spread: 25 },
      envelope: { attack: 0.6, decay: 0.3, sustain: 0.9, release: 2 },
      filterEnvelope: { attack: 0.6, decay: 0.3, sustain: 0.5, release: 2, baseFrequency: 120, octaves: 2 },
    }).connect(new Tone.Distortion(0.25).connect(master)),

  brillante: (master) =>
    new Tone.Synth({
      oscillator: { type: 'triangle8' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.1, release: 0.6 },
    }).connect(new Tone.PingPongDelay('16n', 0.15).connect(master)),
};

export function createMaster() {
  return new Tone.Volume(-8).toDestination();
}

export function createVoice(synthType, master) {
  return { synth: RECIPES[synthType](master), lastTime: 0 };
}

const REGISTER_MIDI_BASE = { melismatica: 62, staccato: 74, dronera: 43, brillante: 84 };

export function triggerSirena(sirena) {
  const voice = sirena.voice;
  if (!voice) return;

  const base = REGISTER_MIDI_BASE[sirena.personality.synth];
  const registerOffset = (sirena.omega / sirena.personality.baseOmega - 1) * 12;
  const midi = base + registerOffset;
  const freq = Tone.Frequency(midi, 'midi').toFrequency();
  const velocity = Math.min(1, 0.25 + Math.abs(sirena.phaseVelocity) * 0.3);

  // Aunque cada sirena ya tiene su propia voz, si un golpe (Ulises/piedra) la
  // hace cruzar cero dos veces en frames consecutivos muy pegados, forzamos
  // que el tiempo de disparo siga siendo estrictamente creciente.
  const time = Math.max(Tone.now(), voice.lastTime + 0.005);
  voice.lastTime = time;

  const synth = voice.synth;
  if (sirena.personality.synth === 'staccato') {
    synth.frequency.value = freq;
    synth.triggerAttackRelease('16n', time, velocity);
  } else if (sirena.personality.synth === 'dronera') {
    synth.triggerAttackRelease(freq, 1.4, time, velocity * 0.8);
  } else {
    synth.triggerAttackRelease(freq, '8n', time, velocity);
  }
}
