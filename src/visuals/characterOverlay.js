// Motor genérico para montar una ilustración de sirena como SVG real en el
// DOM, encima del canvas de p5 -- no como dibujo procedural. Cada agente
// ilustrado (Lira, Viento, ...) solo aporta su SVG y los puntos de anclaje
// medidos con getBBox() sobre su propio dibujo; la lógica de animación es
// la misma para todos, y sale siempre de su theta real (nunca un reloj
// aparte):
// - el grupo de brazo+mano (ya viene fusionado en el archivo) gira como un
//   solo bloque rígido desde el codo, siguiendo notePosition() (0..3, el
//   mismo péndulo de la escalera de notas). Sin golpe de singPulse encima:
//   ese golpe salta de 0 a 1 en un solo frame (por diseño, para el
//   destello), y sumarlo a una rotación continua se siente como un salto
//   en vez de un movimiento fluido.
// - cola y pelo oscilan con sin(theta) directamente, como el bobbing
//   original -- misma idea, aplicada como rotación en vez de posición Y.
export function createCharacterOverlay({
  svgRaw,
  viewW,
  viewH,
  displayH = 150,
  armGroupSelector = '#grupo_brazo_mano_w',
  elbow,
  sweepAngle = 14,
  tailSelector = '#cola',
  tailPivot,
  tailAmplitude = 4,
  hairSelector = '#pelo',
  hairPivot,
  hairAmplitude = 3,
  hairLag = 0.6,
}) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '5';
  document.body.appendChild(container);

  // Illustrator exporta las clases de color con nombres genéricos (.cls-1,
  // .cls-2, ...) en cada archivo. Sin aislar, el <style> de una sirena
  // pisa los colores de otra si comparten el mismo número de clase --
  // el shadow DOM encapsula el CSS de cada una por separado.
  const shadow = container.attachShadow({ mode: 'open' });
  shadow.innerHTML = svgRaw;

  const svg = shadow.querySelector('svg');
  const brazoMano = armGroupSelector ? shadow.querySelector(armGroupSelector) : null;
  const cola = tailSelector ? shadow.querySelector(tailSelector) : null;
  const pelo = hairSelector ? shadow.querySelector(hairSelector) : null;
  const scale = displayH / viewH;
  const displayW = viewW * scale;

  svg.style.position = 'absolute';
  svg.style.left = '0';
  svg.style.top = '0';
  svg.style.width = `${displayW}px`;
  svg.style.height = `${displayH}px`;
  svg.style.overflow = 'visible';

  return {
    displayW,
    displayH,

    // Ancla el pie de la cola en sirena.y, y centra horizontalmente en sirena.x.
    update(sirena) {
      const left = sirena.x - displayW / 2;
      const top = sirena.y - displayH;
      container.style.transform = `translate(${left}px, ${top}px)`;

      if (brazoMano && elbow) {
        const f = sirena.notePosition() / 3; // 0..1, el mismo péndulo real.
        const angle = (f - 0.5) * sweepAngle;
        brazoMano.setAttribute('transform', `rotate(${angle.toFixed(2)} ${elbow.x} ${elbow.y})`);
      }

      if (cola && tailPivot) {
        const angle = Math.sin(sirena.theta) * tailAmplitude;
        cola.setAttribute('transform', `rotate(${angle.toFixed(2)} ${tailPivot.x} ${tailPivot.y})`);
      }

      if (pelo && hairPivot) {
        const angle = Math.sin(sirena.theta - hairLag) * hairAmplitude;
        pelo.setAttribute('transform', `rotate(${angle.toFixed(2)} ${hairPivot.x} ${hairPivot.y})`);
      }
    },
  };
}
