import liraSvgRaw from '../assets/lira-sirena.svg?raw';

// La ilustración de la Lira vive como SVG real en el DOM, encima del canvas
// de p5 -- no como dibujo procedural. Solo la mano derecha se anima: se
// mueve sobre el instrumento siguiendo notePosition() (su theta real, 0..3
// de ida y vuelta por su escala) y da un pequeño golpe cada vez que canta
// (justChangedNote). El resto de la ilustración (cuerpo, lira) es estática.
const VIEW_W = 495.84;
const VIEW_H = 757.61;
const DISPLAY_H = 150; // alto en pantalla, en px

// La mano y la lira quedaron dibujadas en posiciones sueltas dentro del
// mismo lienzo (mano_derecha centrada en ~452,174; las cuerdas de la lira
// en ~355,240 -- medido con getBBox()). Este offset base la trae hasta
// las cuerdas; el barrido de "tocar" se suma encima de este punto.
const BASE_DX = -97;
const BASE_DY = 68;

// Rango de barrido de la mano sobre la lira, en unidades del propio SVG.
const SWEEP_X = 20;
const SWEEP_Y = 6;

export function createLiraOverlay() {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '5';
  container.innerHTML = liraSvgRaw;
  document.body.appendChild(container);

  const svg = container.querySelector('svg');
  const mano = container.querySelector('#mano_derecha');
  const scale = DISPLAY_H / VIEW_H;
  const displayW = VIEW_W * scale;

  svg.style.position = 'absolute';
  svg.style.left = '0';
  svg.style.top = '0';
  svg.style.width = `${displayW}px`;
  svg.style.height = `${DISPLAY_H}px`;
  svg.style.overflow = 'visible';

  return {
    displayW,
    displayH: DISPLAY_H,

    // Ancla el pie de la cola en sirena.y, y centra horizontalmente en sirena.x.
    update(sirena) {
      const left = sirena.x - displayW / 2;
      const top = sirena.y - DISPLAY_H;
      container.style.transform = `translate(${left}px, ${top}px)`;

      if (!mano) return;
      const f = sirena.notePosition() / 3; // 0..1, ida y vuelta
      const dx = BASE_DX + (f - 0.5) * SWEEP_X;
      const dy = BASE_DY - Math.abs(f - 0.5) * SWEEP_Y - sirena.singPulse * 6;
      mano.setAttribute('transform', `translate(${dx.toFixed(2)},${dy.toFixed(2)})`);
    },
  };
}
