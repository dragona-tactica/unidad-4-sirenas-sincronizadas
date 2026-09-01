import { AGENTS } from './agents.js';

let nextId = 0;
const TAU = Math.PI * 2;

export class Sirena {
  constructor({ agentIndex, x, baseY }) {
    this.id = nextId++;
    this.agent = AGENTS[agentIndex];

    // theta: en qué punto de su ciclo de ida-y-vuelta por las 4 notas está.
    // Arranca en un punto aleatorio -- el desorden inicial es real.
    this.theta = Math.random() * TAU;
    this.prevTheta = this.theta;

    // omega: qué tan rápido completa el recorrido de ida y vuelta por sus
    // 4 notas. Cada agente tiene su propio ritmo base, con una variación
    // individual para que el desorden inicial no sea idéntico entre runs.
    this.omega = this.agent.baseOmega * (0.75 + Math.random() * 0.5);
    // El Navegante puede acelerar/frenar su ciclo arrastrándola verticalmente.
    this.omegaMultiplier = 1;

    this.sizeScale = 0.85 + Math.random() * 0.3;

    // "Casa" de la sirena: el usuario puede arrastrarla un poco desde aquí.
    this.homeX = x;
    this.homeY = baseY;
    this.x = x;
    this.baseY = baseY;
    this.y = baseY;

    // 0 = totalmente acoplable, 1 = totalmente aislada del acoplamiento
    // (piedra). Esto es literalmente "alterar la K de las que impacta".
    this.disturbance = 0;

    this.noteIndex = this.currentNoteIndex();
    this.prevNoteIndex = this.noteIndex;
    this.justChangedNote = false;
    this.phaseVelocity = 0;

    // Pulso visual/sonoro que se dispara justo cuando cambia de nota y se
    // apaga solo -- consecuencia del mismo evento que dispara su canto.
    this.singPulse = 0;
  }

  // Posición continua (0..3) dentro de su escala de 4 notas, en forma de
  // péndulo: sube de la nota 0 a la 3 en la primera mitad del ciclo, y baja
  // de vuelta de la 3 a la 0 en la segunda mitad. Un solo giro completo de
  // theta (0..2π) = un recorrido completo de ida y vuelta.
  notePosition() {
    const f = this.theta / TAU;
    return 3 - Math.abs(6 * f - 3);
  }

  currentNoteIndex() {
    return Math.min(3, Math.max(0, Math.round(this.notePosition())));
  }

  // Ecuación de Kuramoto sin modificar: dtheta/dt = omega + (K/N)*sum(...).
  // La única extensión (topología espacial: el acoplamiento decae con la
  // distancia mítica) sigue siendo la misma de antes. K sincroniza el RITMO
  // de subida/bajada de nota entre agentes -- no el tono, cada uno sigue
  // tocando su propia escala.
  step(sirenas, globalK, dt, noiseOmega = 0) {
    this.prevTheta = this.theta;
    let coupling = 0;
    const n = sirenas.length;

    for (const other of sirenas) {
      if (other === this) continue;
      const dist = Math.abs(this.x - other.x);
      const spatial = Math.exp(-dist / 220);
      const localFactor = spatial * (1 - this.disturbance) * (1 - other.disturbance);
      coupling += localFactor * Math.sin(other.theta - this.theta);
    }

    const effectiveOmega = this.omega * this.omegaMultiplier;
    const dtheta = effectiveOmega + noiseOmega + (globalK / n) * coupling;
    this.phaseVelocity = dtheta;
    this.theta = (this.theta + dtheta * dt) % TAU;
    if (this.theta < 0) this.theta += TAU;

    this.prevNoteIndex = this.noteIndex;
    this.noteIndex = this.currentNoteIndex();
    this.justChangedNote = this.noteIndex !== this.prevNoteIndex;

    // La perturbación decae sola: la sirena vuelve a estar disponible para
    // el acoplamiento y el coro puede "tirar" de ella otra vez.
    this.disturbance = Math.max(0, this.disturbance - dt * 0.6);

    this.y = this.baseY;
    if (this.justChangedNote) this.singPulse = 1;
    this.singPulse = Math.max(0, this.singPulse - dt * 2.2);
  }

  // El Navegante manipula manualmente en qué nota está: la avanza un paso
  // en su recorrido de ida y vuelta (1/6 de un ciclo completo).
  advanceNote() {
    this.theta = (this.theta + TAU / 6) % TAU;
  }

  disturb(amount) {
    this.disturbance = Math.min(1, this.disturbance + amount);
  }

  // Arrastre limitado: horizontal cambia su distancia mítica con las
  // vecinas (x); vertical acelera o frena su propio ciclo (omega).
  dragTo(px, py, xRange = 70, yRange = 100) {
    this.x = Math.max(this.homeX - xRange, Math.min(this.homeX + xRange, px));
    const dy = Math.max(-yRange, Math.min(yRange, py - this.homeY));
    // arriba (dy negativo) = más rápido; abajo = más lento.
    this.omegaMultiplier = Math.max(0.4, Math.min(2.5, 1 - dy / yRange));
  }
}

export function computeOrderParameter(sirenas) {
  let sumSin = 0;
  let sumCos = 0;
  for (const s of sirenas) {
    sumSin += Math.sin(s.theta);
    sumCos += Math.cos(s.theta);
  }
  const n = sirenas.length;
  const r = Math.sqrt(sumSin * sumSin + sumCos * sumCos) / n;
  const psi = Math.atan2(sumSin, sumCos);
  return { r, psi };
}
