import p5 from 'p5';
import * as Tone from 'tone';
import { AGENTS } from './simulation/agents.js';
import { Sirena, computeOrderParameter } from './simulation/sirena.js';
import { Ripple } from './simulation/ripple.js';
import { createMaster, createVoice, triggerSirena } from './audio/voices.js';
import { createLiraOverlay } from './visuals/liraOverlay.js';
import { createVientoOverlay } from './visuals/vientoOverlay.js';
import { createPipaOverlay } from './visuals/pipaOverlay.js';
import { createXilofonoOverlay } from './visuals/xilofonoOverlay.js';
import { createMetalOverlay } from './visuals/metalOverlay.js';
import { createArpaOverlay } from './visuals/arpaOverlay.js';
import { createSintetizadorOverlay } from './visuals/sintetizadorOverlay.js';
import { createCampanaOverlay } from './visuals/campanaOverlay.js';
import { createRockOverlay } from './visuals/rockOverlay.js';

// Registro de sirenas con ilustración propia (SVG animado en el DOM,
// aislado por shadow DOM para que sus colores nunca se mezclen entre sí)
// -- las que no aparecen aquí siguen con la forma procedural de drawSirena().
const illustratedOverlays = {
  lira: createLiraOverlay(),
  viento: createVientoOverlay(),
  pipa: createPipaOverlay(),
  xilofono: createXilofonoOverlay(),
  metal: createMetalOverlay(),
  arpa: createArpaOverlay(),
  sintetizador: createSintetizadorOverlay(),
  campana: createCampanaOverlay(),
};

// Roca bajo cada sirena, salvo Campana -- su propio SVG ya trae la suya
// dibujada junto con el cuerpo. Una instancia propia por sirena (no
// compartida) para que cada una tenga su propio contenedor posicionado.
const rockOverlays = {};
for (const agent of AGENTS) {
  if (agent.id === 'campana') continue;
  rockOverlays[agent.id] = createRockOverlay();
}

let sirenas = [];
let ripples = [];
let bubbles = [];
let fishes = [];
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

  // Zigzag: una de cada dos queda más abajo, como en la referencia del
  // usuario -- así la roca y la escalera de notas de cada una (ambas
  // ancladas a su propio baseY) también siguen el mismo vaivén, en vez de
  // quedar todas en una fila perfectamente plana.
  const zigzagOffset = height * 0.05;

  for (let i = 0; i < total; i++) {
    const x = margin + (usableWidth * (i + 0.5)) / total;
    const baseY = height * 0.62 + (i % 2 === 1 ? zigzagOffset : 0);
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
function drawNoteLadder(p, s, sideOffset) {
  const rungGap = 34;
  const bottomY = s.y - 26;
  const ladderX = s.x + sideOffset;
  const col = p.color(s.agent.color);

  p.push();
  p.colorMode(p.HSB, 360, 100, 100, 100);
  const h = p.hue(col);

  p.stroke(h, 20, 85, 30);
  p.strokeWeight(2);
  p.line(ladderX, bottomY, ladderX, bottomY - rungGap * 3);

  p.textAlign(p.LEFT, p.CENTER);
  p.textSize(10);
  for (let i = 0; i < 4; i++) {
    const ry = bottomY - i * rungGap;
    const active = i === s.noteIndex;
    p.noStroke();
    p.fill(h, active ? 70 : 25, active ? 100 : 70, active ? 90 : 40);
    p.circle(ladderX, ry, active ? 7 : 4);
    p.fill(h, 30, 90, active ? 90 : 45);
    p.text(s.agent.notes[i], ladderX + 8, ry);
  }

  // El marcador: posición continua entre peldaños, literalmente notePosition().
  const markerY = bottomY - s.notePosition() * rungGap;
  p.noStroke();
  p.fill(h, 50, 100, 95);
  p.circle(ladderX, markerY, 9);
  p.pop();
}

// Rayos de luz submarina (ambiente decorativo, como el "god ray" de la
// referencia del usuario) -- no es una de las 8 personalidades Kuramoto,
// así que no necesita salir de theta; se mueve con un balanceo lento y
// propio. Sí se apoya en el order parameter real (r) para su nitidez: entre
// más sincronizadas están las sirenas, más definidos se ven los rayos, como
// si el agua se aquietara -- un enlace más con el estado real del modelo,
// no un reemplazo de él.
let lightRays = [];

function buildLightRays(width) {
  const count = 6;
  const rays = [];
  for (let i = 0; i < count; i++) {
    rays.push({
      xFrac: (i + 0.5) / count + (Math.sin(i * 12.9) * 0.04),
      topWidth: width * (0.03 + 0.02 * ((i * 37) % 5) / 5),
      speed: 0.15 + 0.05 * (i % 3),
      phase: i * 1.7,
      sway: width * 0.025,
    });
  }
  return rays;
}

function drawLightRays(p, r) {
  const t = p.frameCount * 0.01;
  const clarity = 0.5 + 0.5 * r; // más sync = rayos más definidos
  const segments = 24;
  const fadeDepth = p.height * 0.75; // los rayos se apagan antes de llegar al fondo

  p.push();
  p.blendMode(p.ADD);
  p.noStroke();
  for (const ray of lightRays) {
    const topX = ray.xFrac * p.width + Math.sin(t * ray.speed + ray.phase) * ray.sway;
    const botX = topX + Math.sin(t * ray.speed * 0.6 + ray.phase + 1.3) * ray.sway * 1.6;
    const topW = ray.topWidth;
    const botW = topW * 2.6;
    const flicker = 0.65 + 0.35 * Math.abs(Math.sin(t * ray.speed * 1.3 + ray.phase));
    const peakAlpha = 55 * clarity * flicker;

    // Segmentado de arriba (brillante) a abajo (se apaga) -- sin usar
    // gradientes nativos, varios cuadriláteros con alpha decreciente.
    for (let i = 0; i < segments; i++) {
      const y0 = (fadeDepth * i) / segments;
      const y1 = (fadeDepth * (i + 1)) / segments;
      const f0 = 1 - i / segments;
      const f1 = 1 - (i + 1) / segments;
      const fMid = (f0 + f1) / 2;
      const x0 = p.lerp(topX, botX, y0 / p.height);
      const x1 = p.lerp(topX, botX, y1 / p.height);
      const w0 = p.lerp(topW, botW, y0 / p.height);
      const w1 = p.lerp(topW, botW, y1 / p.height);

      p.fill(190, 230, 255, peakAlpha * fMid * fMid);
      p.beginShape();
      p.vertex(x0 - w0 / 2, y0);
      p.vertex(x0 + w0 / 2, y0);
      p.vertex(x1 + w1 / 2, y1);
      p.vertex(x1 - w1 / 2, y1);
      p.endShape(p.CLOSE);
    }
  }
  p.blendMode(p.BLEND);
  p.pop();
}

// Hilo de acoplamiento entre cada par de sirenas -- no es decoración: usa
// EXACTAMENTE los mismos términos que Sirena.step() calcula para la propia
// ecuación de Kuramoto (spatial = decaimiento por distancia mítica,
// localFactor = ese decaimiento ya descontando la piedra si alguna está
// perturbada), más el desfase real cos(theta_j - theta_i). Un par que
// apenas se nota es uno cuyo término de acoplamiento real es casi cero
// (muy lejos, o alguna está aislada por la piedra); un hilo bien visible y
// dorado es un par con acoplamiento fuerte Y en fase -- literalmente
// sincronizándose. No se dibuja nada por debajo de un umbral mínimo, así
// que el hilo APARECE solo cuando el acoplamiento real empieza a pesar.
function drawCouplingLinks(p, sirenas, globalK) {
  p.push();
  p.blendMode(p.ADD);
  p.strokeCap(p.ROUND);
  for (let i = 0; i < sirenas.length; i++) {
    for (let j = i + 1; j < sirenas.length; j++) {
      const a = sirenas[i];
      const b = sirenas[j];
      const dist = Math.abs(a.x - b.x);
      const spatial = Math.exp(-dist / 220);
      const localFactor = spatial * (1 - a.disturbance) * (1 - b.disturbance);
      const strength = localFactor * globalK;
      if (strength < 0.03) continue;

      const alignment = (Math.cos(b.theta - a.theta) + 1) / 2; // 0 = en contrafase, 1 = en fase
      const alpha = Math.min(90, strength * 130);
      if (alpha < 4) continue;

      // Frío/tenue cuando están acopladas pero aún desfasadas; dorado y
      // más grueso cuando el acoplamiento realmente las sincroniza.
      const r = p.lerp(120, 255, alignment);
      const g = p.lerp(160, 225, alignment);
      const bch = p.lerp(220, 140, alignment);
      const weight = p.lerp(0.6, 2.6, alignment * strength);

      const overlayA = illustratedOverlays[a.agent.id];
      const overlayB = illustratedOverlays[b.agent.id];
      const ay = a.y - (overlayA ? overlayA.displayH : 150) * 0.55;
      const by = b.y - (overlayB ? overlayB.displayH : 150) * 0.55;

      p.stroke(r, g, bch, alpha);
      p.strokeWeight(weight);
      p.line(a.x, ay, b.x, by);
    }
  }
  p.blendMode(p.BLEND);
  p.pop();
}

// Burbujas ambiente: decoración de fondo, igual que los rayos de luz. La
// tasa de aparición sí depende de K (la Marea real, no un valor inventado)
// -- más acoplamiento, más turbulencia visible en el agua.
function spawnBubbles(p, k) {
  const chance = 0.006 + k * 0.02;
  if (Math.random() < chance) {
    bubbles.push({
      x: Math.random() * p.width,
      y: p.height + 10,
      r: 2 + Math.random() * 4,
      speed: 18 + Math.random() * 22,
      wobbleFreq: 0.8 + Math.random() * 1.2,
      wobbleAmp: 6 + Math.random() * 10,
      phase: Math.random() * Math.PI * 2,
      bornAt: p.frameCount,
    });
  }
}

function updateAndDrawBubbles(p, dt) {
  const t = p.frameCount * 0.016;
  p.push();
  p.noStroke();
  for (const b of bubbles) {
    b.y -= b.speed * dt;
    const age = (p.frameCount - b.bornAt) / 60;
    const fadeIn = Math.min(1, age * 2);
    const fadeOut = Math.min(1, (b.y - 40) / 120);
    const alpha = 90 * Math.max(0, Math.min(fadeIn, fadeOut));
    const x = b.x + Math.sin(t * b.wobbleFreq + b.phase) * b.wobbleAmp;

    p.fill(220, 245, 255, alpha);
    p.circle(x, b.y, b.r * 2);
    p.fill(255, 255, 255, alpha * 0.8);
    p.circle(x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.6);
  }
  p.pop();
  bubbles = bubbles.filter((b) => b.y > -20);
}

// Peces ocasionales cruzando de fondo: siluetas simples, sin relación con
// ninguna sirena -- solo fauna de escena, como los rayos y las burbujas.
function maybeSpawnFish(p) {
  if (Math.random() < 0.003 && fishes.length < 4) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    fishes.push({
      x: dir === 1 ? -40 : p.width + 40,
      y: p.height * (0.15 + Math.random() * 0.35),
      dir,
      speed: 30 + Math.random() * 35,
      size: 10 + Math.random() * 14,
      phase: Math.random() * Math.PI * 2,
    });
  }
}

function updateAndDrawFish(p, dt) {
  const t = p.frameCount * 0.1;
  p.push();
  p.noStroke();
  for (const f of fishes) {
    f.x += f.dir * f.speed * dt;
    const bob = Math.sin(t + f.phase) * 4;
    const y = f.y + bob;
    const wiggle = Math.sin(t * 3 + f.phase) * 0.35;

    p.push();
    p.translate(f.x, y);
    p.scale(f.dir, 1);
    p.fill(30, 55, 75, 90);
    p.beginShape();
    p.vertex(-f.size, 0);
    p.vertex(-f.size * 0.3, -f.size * 0.4);
    p.vertex(f.size, 0);
    p.vertex(-f.size * 0.3, f.size * 0.4);
    p.endShape(p.CLOSE);
    p.push();
    p.rotate(wiggle);
    p.triangle(-f.size, 0, -f.size * 1.6, -f.size * 0.35, -f.size * 1.6, f.size * 0.35);
    p.pop();
    p.pop();
  }
  p.pop();
  fishes = fishes.filter((f) => f.x > -60 && f.x < p.width + 60);
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
    lightRays = buildLightRays(p.width);
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    sirenas = buildSirenas(p.width, p.height);
    lightRays = buildLightRays(p.width);
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

    const { r: syncR } = computeOrderParameter(sirenas);
    drawLightRays(p, syncR);
    drawCouplingLinks(p, sirenas, globalK);

    spawnBubbles(p, globalK);
    updateAndDrawBubbles(p, dt);
    maybeSpawnFish(p);
    updateAndDrawFish(p, dt);

    ripples = ripples.filter((r) => !r.dead);
    for (const ripple of ripples) ripple.step(sirenas, dt);

    for (const s of sirenas) {
      // La escalera va al costado, no debajo -- el hueco entre sirenas
      // vecinas, justo después del ancho real de su ilustración.
      const overlay = illustratedOverlays[s.agent.id];
      const sideOffset = (overlay ? overlay.displayW / 2 : 30) + 22;
      drawNoteLadder(p, s, sideOffset);
    }

    for (const ripple of ripples) {
      p.noFill();
      p.stroke(255, 255, 255, 70 * (1 - ripple.radius / 900));
      p.strokeWeight(1.5);
      p.circle(ripple.x, p.height * 0.62, ripple.radius * 2);
    }

    for (const s of sirenas) {
      // Roca bajo la sirena (todas menos Campana, que ya trae la suya
      // propia) -- se actualiza antes que el personaje pero queda detrás
      // por su propio zIndex, no por el orden de estas llamadas.
      rockOverlays[s.agent.id]?.update(s);

      // Las sirenas con ilustración propia usan su SVG animado (ver
      // visuals/) en vez del dibujo procedural -- el resto del modelo
      // (ladder, audio, K, arrastre) sigue siendo exactamente el mismo.
      const overlay = illustratedOverlays[s.agent.id];
      if (overlay) {
        overlay.update(s);
      } else {
        drawSirena(p, s);
      }
    }

    drawFaro(p, syncR);

    stateLabel.textContent =
      'Estado: ' + (syncR < 0.35 ? 'Desorden' : syncR < 0.8 ? 'Organización parcial' : 'Organización estable') +
      ` (r=${syncR.toFixed(2)}, K=${globalK.toFixed(2)})`;
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
