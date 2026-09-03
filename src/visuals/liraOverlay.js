import liraSvgRaw from '../assets/lira-sirena.svg?raw';

// La ilustración de la Lira vive como SVG real en el DOM, encima del canvas
// de p5 -- no como dibujo procedural. El propio archivo ya trae el brazo y
// la mano agrupados como una sola pieza (grupo_brazo_mano_w), conectados
// entre sí, y la lira (lira_W) ya posicionada contra su vientre -- no hace
// falta recalcular ninguna alineación: solo animar. Todo lo animado sale de
// su theta real (nunca un reloj aparte):
// - grupo_brazo_mano_w: gira como un solo bloque rígido desde el codo,
//   siguiendo notePosition() (0..3, el mismo péndulo de la escalera de
//   notas), con un golpe extra en justChangedNote.
// - cola y pelo: oscilan con sin(theta) directamente, como el bobbing
//   original -- misma idea, aplicada como rotación en vez de posición Y.
const VIEW_W = 376.53;
const VIEW_H = 757.61;
const DISPLAY_H = 150; // alto en pantalla, en px

// Codo: donde grupo_brazo_mano_w (x51.6-241, y274.2-316.9, medido con
// getBBox()) se separó del torso -- su borde izquierdo, junto a las
// costillas. El antebrazo+mano es la pieza que se agrupó; el brazo
// superior hasta el hombro sigue siendo parte del torso fijo.
const ELBOW = { x: 55, y: 285 };
const SWEEP_ANGLE = 14; // grados, barrido del brazo completo al tocar

// Puntos de anclaje para la cola y el pelo (donde se unen al torso/cabeza).
const TAIL_PIVOT = { x: 200, y: 324 };
const HAIR_PIVOT = { x: 160, y: 58 };
const TAIL_AMPLITUDE = 4; // grados
const HAIR_AMPLITUDE = 3; // grados
const HAIR_LAG = 0.6; // rad, el pelo va un poco detrás de la cola

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
  const brazoMano = container.querySelector('#grupo_brazo_mano_w');
  const cola = container.querySelector('#cola');
  const pelo = container.querySelector('#pelo');
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

      if (brazoMano) {
        // notePosition(): 0..3 de ida y vuelta -- el mismo péndulo real.
        const f = sirena.notePosition() / 3; // 0..1
        const angle = (f - 0.5) * SWEEP_ANGLE - sirena.singPulse * 5;
        brazoMano.setAttribute('transform', `rotate(${angle.toFixed(2)} ${ELBOW.x} ${ELBOW.y})`);
      }

      if (cola) {
        const angle = Math.sin(sirena.theta) * TAIL_AMPLITUDE;
        cola.setAttribute('transform', `rotate(${angle.toFixed(2)} ${TAIL_PIVOT.x} ${TAIL_PIVOT.y})`);
      }

      if (pelo) {
        const angle = Math.sin(sirena.theta - HAIR_LAG) * HAIR_AMPLITUDE;
        pelo.setAttribute('transform', `rotate(${angle.toFixed(2)} ${HAIR_PIVOT.x} ${HAIR_PIVOT.y})`);
      }
    },
  };
}
