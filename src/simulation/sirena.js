import { PERSONALITIES } from './personalities.js';

let nextId = 0;

export class Sirena {
  constructor({ personalityIndex, individualIndex, x, baseY }) {
    this.id = nextId++;
    this.personality = PERSONALITIES[personalityIndex];
    this.individualIndex = individualIndex;

    // theta: fase del ciclo de canto (0..2PI). Arranca en un punto aleatorio
    // para que el desorden inicial sea real, no escenificado.
    this.theta = Math.random() * Math.PI * 2;
    this.prevTheta = this.theta;

    // omega: tono base / temperamento. Comparten registro de familia
    // (baseOmega) pero cada individuo tiene su propio matiz.
    this.omega = this.personality.baseOmega * (0.85 + Math.random() * 0.3);

    // Identidad visual individual dentro del arquetipo compartido.
    this.hueShift = (Math.random() - 0.5) * 24;
    this.sizeScale = 0.85 + Math.random() * 0.3;
    this.phaseOffsetSeed = Math.random() * 1000;

    // "Casa" de la sirena: el usuario puede arrastrarla un poco desde aquí,
    // pero no soltarla lejos — sigue siendo la misma sirena en el mismo tramo
    // del coro, solo con su distancia mítica y su profundidad ajustadas.
    this.homeX = x;
    this.homeY = baseY;
    this.x = x;
    this.baseY = baseY;
    this.yOffset = 0;
    // coastY: donde vive su cuerpo y donde "rompe" su ola al llegar.
    this.y = baseY;

    // 0 = totalmente acoplable, 1 = totalmente aislada del agua (piedra).
    this.disturbance = 0;

    this.justCrossedZero = false;
    this.phaseVelocity = 0;
    // Pulso visual/sonoro que se dispara justo cuando su ola llega a la costa
    // (cruce por cero) y se apaga solo — no es un reloj, es consecuencia del
    // mismo evento que ya dispara su canto.
    this.singPulse = 0;
  }

  // Actualiza la fase con la ecuación de Kuramoto extendida:
  // dtheta/dt = omega + (K/N) * sum_j spatialCoupling(i,j) * disturbance(i,j) * sin(theta_j - theta_i)
  step(sirenas, globalK, dt, noiseOmega = 0) {
    this.prevTheta = this.theta;
    let coupling = 0;
    const n = sirenas.length;

    for (const other of sirenas) {
      if (other === this) continue;
      const dist = Math.abs(this.x - other.x);
      // "Distancia mítica": el acoplamiento decae con la distancia visual.
      const spatial = Math.exp(-dist / 420);
      const localFactor = spatial * (1 - this.disturbance) * (1 - other.disturbance);
      coupling += localFactor * Math.sin(other.theta - this.theta);
    }

    const dtheta = this.omega + noiseOmega + (globalK / n) * coupling;
    this.phaseVelocity = dtheta;
    this.theta = (this.theta + dtheta * dt) % (Math.PI * 2);
    if (this.theta < 0) this.theta += Math.PI * 2;

    // cruce por cero: dispara el canto (ritmo emergente, no un metrónomo)
    this.justCrossedZero = this.prevTheta > Math.PI * 1.5 && this.theta < Math.PI * 0.5;

    // la perturbación decae sola: la sirena vuelve a estar disponible
    // para el acoplamiento y el coro puede "tirar" de ella otra vez.
    this.disturbance = Math.max(0, this.disturbance - dt * 0.6);

    this.y = this.baseY + this.yOffset;
    if (this.justCrossedZero) this.singPulse = 1;
    this.singPulse = Math.max(0, this.singPulse - dt * 2.2);
  }

  // Progreso 0..1 de su ola en el carril: 0 = acaba de reiniciar arriba,
  // 1 = a punto de llegar a la costa. Es theta, sin más — nada se simula aparte.
  waveProgress() {
    return this.theta / (Math.PI * 2);
  }

  kick(amount) {
    this.theta = (this.theta + amount) % (Math.PI * 2);
    if (this.theta < 0) this.theta += Math.PI * 2;
  }

  disturb(amount) {
    this.disturbance = Math.min(1, this.disturbance + amount);
  }

  // El Navegante puede correr un poco a cada sirena de su sitio: cambia su
  // distancia mítica con las vecinas (x) y cuándo la alcanza la superficie
  // (yOffset). El rango es corto a propósito — sigue siendo su mismo lugar
  // en el coro, no puede llevarla a otro lado del mar.
  dragTo(px, py, xRange = 70, yRange = 40) {
    this.x = Math.max(this.homeX - xRange, Math.min(this.homeX + xRange, px));
    this.yOffset = Math.max(-yRange, Math.min(yRange, py - this.homeY));
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
