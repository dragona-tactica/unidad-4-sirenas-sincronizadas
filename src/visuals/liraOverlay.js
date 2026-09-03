import liraSvgRaw from '../assets/lira-sirena.svg?raw';

// La ilustración de la Lira vive como SVG real en el DOM, encima del canvas
// de p5 -- no como dibujo procedural. En el archivo original, la lira y la
// mano quedaron sueltas en el lienzo (lejos del cuerpo); la lira ahora vive
// contra su vientre/cadera (bloque trasladado), y brazo_derecho + mano_derecha
// se mueven como UNA SOLA PIEZA RÍGIDA, pivotando juntos desde el hombro --
// nunca se pueden desalinear entre sí porque comparten el mismo giro. Todo
// lo animado sale de su theta real (nunca un reloj aparte):
// - brazo_derecho + mano_derecha: giran juntos desde el hombro, siguiendo
//   notePosition() (0..3, el mismo péndulo de la escalera de notas), con
//   un golpe extra en justChangedNote.
// - cola y pelo: oscilan con sin(theta) directamente, como el bobbing
//   original -- misma idea, aplicada como rotación en vez de posición Y.
const VIEW_W = 495.84;
const VIEW_H = 757.61;
const DISPLAY_H = 150; // alto en pantalla, en px

// La lira (centro original ~349.8,289.5, medido con getBBox()) se traslada
// como un bloque hacia el vientre/cadera -- más abajo y a la izquierda de
// donde había quedado sobre el pecho.
const LIRA_DX = -180;
const LIRA_DY = 20;

// Punto de la propia mano (en sus coordenadas originales del SVG) que hace
// de muñeca/puño -- mano_derecha (x408-495.8, y152.1-195.5) mira hacia la
// izquierda con el puño del lado derecho de su silueta, así que su punto
// de unión es el borde DERECHO.
const WRIST = { x: 495.8, y: 173.8 };

// Dónde queda esa muñeca en reposo: el mismo sitio donde brazo_derecho ya
// dibuja la mano apoyada en la cadera (~242,291, medido sobre el
// renderizado). Esto NUNCA cambia con la animación -- es solo el punto de
// unión fijo entre las dos piezas.
const ATTACH = { x: 242, y: 291 };
const REST_ANGLE = 14; // grados, orientación fija de la mano al unirse

// El hombro: pivote compartido por brazo_derecho Y mano_derecha. Como las
// dos giran exactamente el mismo ángulo alrededor del mismo punto, quedan
// soldadas entre sí en cualquier momento de la animación -- no solo en el
// reposo.
const SHOULDER = { x: 72, y: 152 };
const SWEEP_ANGLE = 16; // grados, barrido del brazo completo al tocar

// Puntos de anclaje para la cola y el pelo (donde se unen al torso/cabeza).
const TAIL_PIVOT = { x: 200, y: 324 };
const HAIR_PIVOT = { x: 180, y: 58 };
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
  const mano = container.querySelector('#mano_derecha');
  const brazo = container.querySelector('#brazo_derecho');
  const lira = container.querySelector('#lira');
  const cola = container.querySelector('#cola');
  const pelo = container.querySelector('#pelo');
  const scale = DISPLAY_H / VIEW_H;
  const displayW = VIEW_W * scale;
  const dx = ATTACH.x - WRIST.x;
  const dy = ATTACH.y - WRIST.y;

  svg.style.position = 'absolute';
  svg.style.left = '0';
  svg.style.top = '0';
  svg.style.width = `${displayW}px`;
  svg.style.height = `${DISPLAY_H}px`;
  svg.style.overflow = 'visible';

  if (lira) lira.setAttribute('transform', `translate(${LIRA_DX},${LIRA_DY})`);

  return {
    displayW,
    displayH: DISPLAY_H,

    // Ancla el pie de la cola en sirena.y, y centra horizontalmente en sirena.x.
    update(sirena) {
      const left = sirena.x - displayW / 2;
      const top = sirena.y - DISPLAY_H;
      container.style.transform = `translate(${left}px, ${top}px)`;

      if (mano || brazo) {
        // notePosition(): 0..3 de ida y vuelta -- el mismo péndulo real.
        const f = sirena.notePosition() / 3; // 0..1
        const shoulderAngle = (f - 0.5) * SWEEP_ANGLE - sirena.singPulse * 6;
        const shoulderRotate = `rotate(${shoulderAngle.toFixed(2)} ${SHOULDER.x} ${SHOULDER.y})`;

        // El brazo gira solo alrededor del hombro -- su pose de reposo ya
        // es la dibujada originalmente.
        if (brazo) brazo.setAttribute('transform', shoulderRotate);

        // La mano primero se ancla al mismo punto donde el brazo termina
        // (con su orientación fija), y ESE resultado gira alrededor del
        // mismo hombro y el mismo ángulo que el brazo -- por eso nunca se
        // separan, sin importar el punto de la animación.
        if (mano) {
          mano.setAttribute(
            'transform',
            `${shoulderRotate} translate(${dx.toFixed(2)},${dy.toFixed(2)}) rotate(${REST_ANGLE} ${WRIST.x} ${WRIST.y})`
          );
        }
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
