import p5 from 'p5';
import * as Tone from 'tone';
import { Sirena, computeOrderParameter } from './simulation/sirena.js';
import { Ripple } from './simulation/ripple.js';
import { createVoices, triggerSirena } from './audio/voices.js';

const N_PERSONALITIES = 4;
const SIRENAS_PER_PERSONALITY = 2;

let sirenas = [];
let ripples = [];
let voices = null;
let audioStarted = false;
let globalK = 0.5;
let hoverRadius = 26;
let draggingSirena = null;
let dragMoved = false;

const kSlider = document.getElementById('kSlider');
const stateLabel = document.getElementById('stateLabel');
const startOverlay = document.getElementById('start-overlay');

kSlider.addEventListener('input', () => {
  globalK = Number(kSlider.value);
});

startOverlay.addEventListener('click', async () => {
  await Tone.start();
  voices = createVoices();
  audioStarted = true;
  startOverlay.style.display = 'none';
});

function buildSirenas(width, height) {
  const list = [];
  const margin = width * 0.1;
  const usableWidth = width - margin * 2;
  const total = N_PERSONALITIES * SIRENAS_PER_PERSONALITY;

  for (let p = 0; p < N_PERSONALITIES; p++) {
    for (let i = 0; i < SIRENAS_PER_PERSONALITY; i++) {
      const index = p * SIRENAS_PER_PERSONALITY + i;
      const x = margin + (usableWidth * (index + 0.5)) / total;
      const baseY = height * 0.55;
      list.push(new Sirena({ personalityIndex: p, individualIndex: i, x, baseY }));
    }
  }
  return list;
}

function drawSirena(p, s) {
  p.push();
  p.translate(s.x, s.y);

  const col = p.color(s.personality.color);
  const h = p.hue(col) + s.hueShift;
  p.colorMode(p.HSB, 360, 100, 100, 100);
  // Brillo de fondo: vivo por su velocidad de fase, con un golpe extra justo
  // cuando su ola llega a la costa (singPulse), no por un timer aparte.
  const glow = 40 + Math.abs(s.phaseVelocity) * 60 + s.singPulse * 50;

  p.noStroke();
  p.fill(h, p.saturation(col), p.brightness(col), 25 + s.singPulse * 35);
  p.circle(0, 0, glow * s.sizeScale);

  p.fill(h, p.saturation(col), p.brightness(col), 90);

  const size = 34 * s.sizeScale;
  switch (s.personality.shape) {
    case 'sinuosa': {
      p.push();
      p.rotate(Math.sin(s.theta) * 0.2);
      p.ellipse(0, 0, size * 1.6, size * 0.8);
      p.pop();
      break;
    }
    case 'espinada': {
      p.beginShape();
      const spikes = 8;
      for (let i = 0; i < spikes; i++) {
        const a = (Math.PI * 2 * i) / spikes;
        const r = size * 0.5 * (i % 2 === 0 ? 1 : 0.6 + Math.abs(s.phaseVelocity) * 0.15);
        p.vertex(Math.cos(a) * r, Math.sin(a) * r);
      }
      p.endShape(p.CLOSE);
      break;
    }
    case 'pesada': {
      p.ellipse(0, 0, size * 1.8, size * 1.3);
      break;
    }
    case 'espiral': {
      p.push();
      p.rotate(s.theta * 0.5);
      for (let i = 0; i < 5; i++) {
        const a = (Math.PI * 2 * i) / 5 + s.theta;
        const r = size * 0.6;
        p.circle(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4, 6);
      }
      p.ellipse(0, 0, size, size);
      p.pop();
      break;
    }
  }

  p.colorMode(p.RGB, 255);
  p.pop();
}

// Cada sirena tiene su propio carril, independiente de las demás — mover una
// no reacomoda a las otras. El frente que baja por el carril NO es un objeto
// físico aparte: su posición es literalmente theta_i (waveProgress = theta/2π).
// Cuando theta completa una vuelta (el mismo cruce por cero que dispara su
// canto), el frente llega a la costa y un nuevo frente arranca desde arriba.
// Si Kuramoto acopla dos sirenas, sus frentes bajan al mismo ritmo porque sus
// theta reales ya están alineadas — no hay ninguna capa que sincronizar aparte.
function drawLane(p, s, topY) {
  const progress = s.waveProgress();
  const frontY = topY + progress * (s.y - topY);
  const col = p.color(s.personality.color);

  p.push();
  p.colorMode(p.HSB, 360, 100, 100, 100);
  const h = p.hue(col) + s.hueShift;

  // Guía tenue de todo el carril, de arriba a la costa.
  p.stroke(h, 20, 80, 25);
  p.strokeWeight(2);
  p.line(s.x, topY, s.x, s.y);

  // Tramo ya recorrido por la ola: sólido, brillo proporcional a qué tan
  // acoplada está (menos disturbance = coro más presente).
  p.stroke(h, 60, 95, 55 + 35 * (1 - s.disturbance));
  p.strokeWeight(3);
  p.line(s.x, topY, s.x, frontY);

  // El frente mismo.
  p.strokeWeight(1);
  p.fill(h, 40, 100, 90);
  p.noStroke();
  p.ellipse(s.x, frontY, 16, 5);
  p.pop();
}

// Cuando el frente de una sirena toca la costa, se dispersa ahí mismo —
// consecuencia directa del mismo cruce por cero, no una animación aparte.
function drawSplash(p, s) {
  p.push();
  p.noFill();
  p.stroke(220, 235, 255, 140);
  p.strokeWeight(2);
  for (let i = 0; i < 3; i++) {
    const spread = 14 + i * 12;
    p.arc(s.x, s.y, spread * 2, spread, Math.PI, Math.PI * 2);
  }
  p.pop();
}

function drawFaro(p, r) {
  const cx = 50;
  const cy = p.height - 50;
  let col;
  let alpha = 255;

  if (r < 0.35) {
    col = p.color(220, 60, 60);
    alpha = 150 + 105 * Math.abs(Math.sin(p.frameCount * 0.4));
  } else if (r < 0.8) {
    col = p.color(230, 190, 60);
    alpha = 150 + 105 * Math.abs(Math.sin(p.frameCount * 0.15));
  } else {
    col = p.color(255, 255, 245);
    alpha = 255;
  }

  p.noStroke();
  if (r > 0.92) {
    p.fill(255, 255, 240, 30);
    p.rect(cx, 0, p.width - cx, cy, 0);
  }

  p.fill(p.red(col), p.green(col), p.blue(col), alpha);
  p.circle(cx, cy, 28);
}

const sketch = (p) => {
  p.setup = () => {
    const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent(document.body);
    sirenas = buildSirenas(p.width, p.height);
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    sirenas = buildSirenas(p.width, p.height);
  };

  p.draw = () => {
    p.background(4, 14, 28);
    const dt = Math.min(0.05, p.deltaTime / 1000);
    const topY = p.height * 0.1;

    for (const s of sirenas) {
      s.step(sirenas, globalK, dt);
      if (s.justCrossedZero && audioStarted) triggerSirena(voices, s);
    }

    ripples = ripples.filter((r) => !r.dead);
    for (const ripple of ripples) ripple.step(sirenas, dt);

    for (const s of sirenas) drawLane(p, s, topY);

    for (const ripple of ripples) {
      p.noFill();
      p.stroke(255, 255, 255, 70 * (1 - ripple.radius / 900));
      p.strokeWeight(1.5);
      p.circle(ripple.x, p.height * 0.55, ripple.radius * 2);
    }

    for (const s of sirenas) {
      if (s.justCrossedZero) drawSplash(p, s);
      drawSirena(p, s);
    }

    const { r } = computeOrderParameter(sirenas);
    drawFaro(p, r);

    stateLabel.textContent =
      'Estado: ' + (r < 0.35 ? 'Desorden' : r < 0.8 ? 'Organización parcial' : 'Organización estable') +
      ` (r=${r.toFixed(2)}, K=${globalK.toFixed(2)})`;
  };

  p.mousePressed = () => {
    if (p.mouseY < 0 || p.mouseY > p.height || p.mouseX < 0 || p.mouseX > p.width) return;
    if (!audioStarted) return;

    const target = sirenas.find((s) => Math.hypot(s.x - p.mouseX, s.y - p.mouseY) < hoverRadius);
    if (target) {
      draggingSirena = target;
      dragMoved = false;
    } else {
      // Piedra en el agua: perturbación real que viaja y golpea la fase/acoplamiento a su paso.
      ripples.push(new Ripple(p.mouseX));
    }
  };

  p.mouseDragged = () => {
    if (!draggingSirena) return;
    if (Math.hypot(p.mouseX - draggingSirena.x, p.mouseY - draggingSirena.y) > 3) dragMoved = true;
    draggingSirena.dragTo(p.mouseX, p.mouseY);
  };

  p.mouseReleased = () => {
    if (draggingSirena && !dragMoved) {
      // No se movió: fue un clic, no un arrastre. El Grito de Ulises.
      draggingSirena.kick(Math.PI / 2);
    }
    draggingSirena = null;
  };
};

new p5(sketch);
