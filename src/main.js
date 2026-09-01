import p5 from 'p5';
import * as Tone from 'tone';
import { AGENTS } from './simulation/agents.js';
import { Sirena, computeOrderParameter } from './simulation/sirena.js';
import { Ripple } from './simulation/ripple.js';
import { createMaster, createVoice, triggerSirena } from './audio/voices.js';

let sirenas = [];
let ripples = [];
let audioStarted = false;
let audioMaster = null;
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
  audioMaster = createMaster();
  // Una voz por sirena -- ver el comentario en audio/voices.js.
  for (const s of sirenas) s.voice = createVoice(s.agent.synth, audioMaster);
  audioStarted = true;
  startOverlay.style.display = 'none';
});

function buildSirenas(width, height) {
  const list = [];
  const margin = width * 0.1;
  const usableWidth = width - margin * 2;
  const total = AGENTS.length;

  for (let i = 0; i < total; i++) {
    const x = margin + (usableWidth * (i + 0.5)) / total;
    const baseY = height * 0.62;
    list.push(new Sirena({ agentIndex: i, x, baseY }));
  }
  return list;
}

function drawSirena(p, s) {
  p.push();
  p.translate(s.x, s.y);

  const col = p.color(s.agent.color);
  p.colorMode(p.HSB, 360, 100, 100, 100);
  const h = p.hue(col);
  const sat = p.saturation(col);
  const bri = p.brightness(col);
  const glow = 40 + Math.abs(s.phaseVelocity) * 40 + s.singPulse * 50;

  p.noStroke();
  p.fill(h, sat, bri, 25 + s.singPulse * 35);
  p.circle(0, 0, glow * s.sizeScale);

  p.fill(h, sat, bri, 90);
  p.stroke(h, sat, Math.min(100, bri + 20), 90);
  p.strokeWeight(1.5);

  const size = 30 * s.sizeScale;
  switch (s.agent.shape) {
    case 'arco': {
      // Lira: arco tenso con una cuerda que vibra según su velocidad de fase.
      p.push();
      p.rotate(Math.sin(s.theta) * 0.12);
      p.noFill();
      p.arc(0, size * 0.3, size * 2.2, size * 2.2, Math.PI * 1.15, Math.PI * 1.85);
      p.line(-size * 0.9, -size * 0.05, size * 0.9, -size * 0.05);
      p.pop();
      break;
    }
    case 'gota': {
      // Pipa: cuerpo de gota/laúd.
      p.beginShape();
      p.vertex(0, -size * 1.1);
      p.bezierVertex(size * 0.9, -size * 0.4, size * 0.9, size * 0.7, 0, size * 0.9);
      p.bezierVertex(-size * 0.9, size * 0.7, -size * 0.9, -size * 0.4, 0, -size * 1.1);
      p.endShape(p.CLOSE);
      break;
    }
    case 'espinada': {
      // Xilófono: estrella percusiva.
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
    case 'aliento': {
      // Viento: forma alargada que ondula suave, como aire moviéndose.
      p.push();
      p.rotate(Math.sin(s.theta * 0.7) * 0.25);
      p.ellipse(0, 0, size * 1.8, size * 0.75);
      p.pop();
      break;
    }
    case 'tazon': {
      // Metal: tazón tibetano, ancho y bajo, con un aro de resonancia.
      p.ellipse(0, size * 0.15, size * 2, size * 1.2);
      p.noFill();
      p.ellipse(0, size * 0.05, size * 1.4, size * 0.7);
      break;
    }
    case 'cuerdas': {
      // Arpa: marco con varias cuerdas verticales.
      p.noFill();
      const strings = 5;
      for (let i = 0; i < strings; i++) {
        const sx = (-size * 0.7) + (i * (size * 1.4)) / (strings - 1);
        p.line(sx, -size * 0.9, sx * 0.4, size * 0.9);
      }
      break;
    }
    case 'espiral': {
      // Campana / Glockenspiel: destellos en espiral.
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
    case 'brillo': {
      // Sintetizador: nube etérea con partículas orbitando lento.
      p.ellipse(0, 0, size * 1.3, size * 1.3);
      p.noStroke();
      for (let i = 0; i < 4; i++) {
        const a = s.theta * 0.3 + (Math.PI * 2 * i) / 4;
        p.circle(Math.cos(a) * size * 1.1, Math.sin(a) * size * 1.1, 5);
      }
      break;
    }
  }

  p.colorMode(p.RGB, 255);
  p.pop();
}

// Escalera de 4 peldaños = su escala de 4 notas, de ida y vuelta (péndulo).
// El marcador no es un objeto físico aparte: su posición ES notePosition(),
// es decir theta reformulado como recorrido por su propia escala. No hay
// ninguna capa intermedia entre el modelo y lo que se ve.
function drawNoteLadder(p, s) {
  const rungGap = 34;
  const bottomY = s.y - 26;
  const col = p.color(s.agent.color);

  p.push();
  p.colorMode(p.HSB, 360, 100, 100, 100);
  const h = p.hue(col);

  p.stroke(h, 20, 85, 30);
  p.strokeWeight(2);
  p.line(s.x, bottomY, s.x, bottomY - rungGap * 3);

  p.textAlign(p.RIGHT, p.CENTER);
  p.textSize(10);
  for (let i = 0; i < 4; i++) {
    const ry = bottomY - i * rungGap;
    const active = i === s.noteIndex;
    p.noStroke();
    p.fill(h, active ? 70 : 25, active ? 100 : 70, active ? 90 : 40);
    p.circle(s.x, ry, active ? 7 : 4);
    p.fill(h, 30, 90, active ? 90 : 45);
    p.text(s.agent.notes[i], s.x - 10, ry);
  }

  // El marcador: posición continua entre peldaños, literalmente notePosition().
  const markerY = bottomY - s.notePosition() * rungGap;
  p.noStroke();
  p.fill(h, 50, 100, 95);
  p.circle(s.x, markerY, 9);
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
    if (audioStarted) {
      for (const s of sirenas) s.voice = createVoice(s.agent.synth, audioMaster);
    }
  };

  p.draw = () => {
    p.background(4, 14, 28);
    const dt = Math.min(0.05, p.deltaTime / 1000);

    for (const s of sirenas) {
      s.step(sirenas, globalK, dt);
      if (s.justChangedNote && audioStarted) {
        // El audio nunca debe poder tumbar el draw() completo.
        try {
          triggerSirena(s);
        } catch (err) {
          console.warn('triggerSirena failed', err);
        }
      }
    }

    ripples = ripples.filter((r) => !r.dead);
    for (const ripple of ripples) ripple.step(sirenas, dt);

    for (const s of sirenas) drawNoteLadder(p, s);

    for (const ripple of ripples) {
      p.noFill();
      p.stroke(255, 255, 255, 70 * (1 - ripple.radius / 900));
      p.strokeWeight(1.5);
      p.circle(ripple.x, p.height * 0.62, ripple.radius * 2);
    }

    for (const s of sirenas) drawSirena(p, s);

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
      // Piedra en el agua: mecanismo de perturbación, altera la K de las que toca.
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
      // No se movió: fue un clic, no un arrastre. Avanza manualmente su nota.
      draggingSirena.advanceNote();
    }
    draggingSirena = null;
  };
};

new p5(sketch);
