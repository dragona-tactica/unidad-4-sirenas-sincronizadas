import liraSvgRaw from '../assets/lira-sirena.svg?raw';

// La ilustración de la Lira vive como SVG real en el DOM, encima del canvas
// de p5 -- no como dibujo procedural. En el archivo original, la lira y la
// mano quedaron sueltas en el lienzo (lejos del cuerpo); según el boceto de
// referencia del usuario, la lira debe quedar sostenida contra el pecho, no
// flotando al costado. Se reubica la lira completa como una unidad, y la
// mano se engancha encima con un pivote en el codo (no una traslación
// recta). Todo lo animado sale de su theta real (nunca un reloj aparte):
// - mano_derecha: pivota desde el codo, barriendo las cuerdas siguiendo
//   notePosition() (0..3, el mismo péndulo de la escalera de notas), con
//   un golpe extra en justChangedNote.
// - cola y pelo: oscilan con sin(theta) directamente, como el bobbing
//   original -- misma idea, aplicada como rotación en vez de posición Y.
const VIEW_W = 495.84;
const VIEW_H = 757.61;
const DISPLAY_H = 150; // alto en pantalla, en px

// La lira (medida con getBBox(): centro original ~349.8,289.5) se traslada
// como un bloque hasta el pecho (centro del grupo "top", ~209,250.2).
const LIRA_DX = -160;
const LIRA_DY = -10;

// Punto de la propia mano (en sus coordenadas originales del SVG) que hace
// de muñeca/puño -- el borde por donde se une al antebrazo. brazo_derecho
// ya trae dibujada una mano apoyada en la cadera; visualmente esa mano
// mira hacia la izquierda con el puño del lado derecho de su silueta, así
// que el punto de unión de mano_derecha (x408-495.8, y152.1-195.5) es su
// borde DERECHO, no el izquierdo.
const WRIST = { x: 495.8, y: 173.8 };

// El codo/muñeca real: medido directamente sobre el renderizado (no solo
// el bbox) -- la mano que brazo_derecho ya dibuja apoyada en la cadera
// cae en ~(242,291). Enganchar mano_derecha ahí, en el mismo sitio donde
// el brazo realmente termina, es lo que evita la costura/salto visual.
const ELBOW = { x: 242, y: 291 };
const BASE_ANGLE = 12; // grados, pose de descanso apuntando a las cuerdas
const SWEEP_ANGLE = 20; // grados, barrido adicional al tocar

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
  const lira = container.querySelector('#lira');
  const cola = container.querySelector('#cola');
  const pelo = container.querySelector('#pelo');
  const scale = DISPLAY_H / VIEW_H;
  const displayW = VIEW_W * scale;
  const dx = ELBOW.x - WRIST.x;
  const dy = ELBOW.y - WRIST.y;

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

      if (mano) {
        // notePosition(): 0..3 de ida y vuelta -- el mismo péndulo real.
        const f = sirena.notePosition() / 3; // 0..1
        const angle = BASE_ANGLE + (f - 0.5) * SWEEP_ANGLE - sirena.singPulse * 8;
        // Rota primero alrededor de su propia muñeca (queda en el mismo
        // sitio relativo a la mano), y ESE resultado se traslada al codo --
        // así el pivote de giro es siempre el punto de unión con el brazo.
        mano.setAttribute(
          'transform',
          `translate(${dx.toFixed(2)},${dy.toFixed(2)}) rotate(${angle.toFixed(2)} ${WRIST.x} ${WRIST.y})`
        );
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
