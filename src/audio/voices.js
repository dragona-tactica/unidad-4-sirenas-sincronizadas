import * as Tone from 'tone';

// Una voz de Tone.js por agente, nunca compartida (evita el choque de
// triggerAttackRelease en el mismo instante que ya rompió el draw() antes).
// Cada receta es un instrumento genuinamente distinto, no una variación de
// pitch sobre el mismo synth -- corresponde 1:1 al timbre descrito para
// cada uno de los 8 agentes.
const RECIPES = {
  lira: {
    kind: 'note',
    // Antes: attack 0.5 + release 1.8 (~2.3s de cola) sonaba más largo que
    // el tiempo entre sus propios cambios de nota, así que las notas se
    // acumulaban unas sobre otras y nunca había silencio real entre ellas.
    duration: 0.4,
    build: (master) =>
      new Tone.MonoSynth({
        oscillator: { type: 'fatsawtooth', count: 2, spread: 15 },
        envelope: { attack: 0.15, decay: 0.2, sustain: 0.25, release: 0.4 },
        filterEnvelope: { attack: 0.15, decay: 0.2, sustain: 0.3, release: 0.4, baseFrequency: 200, octaves: 2 },
      }).connect(new Tone.Vibrato(4.5, 0.15).connect(master)),
  },
  pipa: {
    kind: 'pluck',
    build: (master) =>
      new Tone.PluckSynth({ attackNoise: 1, dampening: 3200, resonance: 0.85 }).connect(master),
  },
  xilofono: {
    kind: 'metal',
    duration: 0.22,
    build: (master) =>
      new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.22, release: 0.06 },
        harmonicity: 6.5,
        modulationIndex: 20,
        resonance: 3200,
        octaves: 1,
      }).connect(master),
  },
  viento: {
    kind: 'note',
    duration: 0.9,
    build: (master) =>
      new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.25, decay: 0.2, sustain: 0.6, release: 0.9 },
      }).connect(new Tone.Vibrato(5.5, 0.08).connect(master)),
  },
  metal: {
    kind: 'metal',
    duration: 2.2,
    build: (master) =>
      new Tone.MetalSynth({
        envelope: { attack: 0.01, decay: 1.8, release: 2 },
        harmonicity: 2.1,
        modulationIndex: 8,
        resonance: 900,
        octaves: 0.8,
      }).connect(master),
  },
  arpa: {
    kind: 'pluck',
    build: (master) =>
      new Tone.PluckSynth({ attackNoise: 2, dampening: 4500, resonance: 0.94 }).connect(
        new Tone.PingPongDelay('16n', 0.1).connect(master)
      ),
  },
  campana: {
    kind: 'note',
    duration: 1.1,
    build: (master) =>
      new Tone.FMSynth({
        harmonicity: 3.5,
        modulationIndex: 10,
        envelope: { attack: 0.005, decay: 0.9, sustain: 0.1, release: 1.1 },
        modulationEnvelope: { attack: 0.005, decay: 0.4, sustain: 0, release: 0.4 },
      }).connect(master),
  },
  sintetizador: {
    kind: 'note',
    duration: 2.6,
    build: (master) =>
      new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 1.1, decay: 0.6, sustain: 0.7, release: 2.6 },
      }).connect(new Tone.Chorus(1.5, 3.5, 0.4).start().connect(master)),
  },
};

export function createMaster() {
  return new Tone.Volume(-8).toDestination();
}

export function createVoice(synthType, master) {
  const recipe = RECIPES[synthType];
  return { kind: recipe.kind, duration: recipe.duration, synth: recipe.build(master), lastTime: 0 };
}

export function triggerSirena(sirena) {
  const voice = sirena.voice;
  if (!voice) return;

  const noteName = sirena.agent.notes[sirena.noteIndex];
  const freq = Tone.Frequency(noteName).toFrequency();
  const velocity = Math.min(1, 0.3 + Math.abs(sirena.phaseVelocity) * 0.25);

  // Tiempo estrictamente creciente por voz -- protege contra dos disparos
  // muy pegados en frames consecutivos (p.ej. un click de avance de nota
  // justo cuando ya iba a cruzar sola).
  const time = Math.max(Tone.now(), voice.lastTime + 0.005);
  voice.lastTime = time;

  if (voice.kind === 'metal') {
    voice.synth.frequency.value = freq;
    voice.synth.triggerAttackRelease(voice.duration, time, velocity);
  } else if (voice.kind === 'pluck') {
    voice.synth.triggerAttack(freq, time);
  } else {
    voice.synth.triggerAttackRelease(freq, voice.duration, time, velocity);
  }
}
