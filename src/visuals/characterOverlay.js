// Motor genérico para montar una ilustración de sirena como SVG real en el
// DOM, encima del canvas de p5 -- no como dibujo procedural. Cada agente
// ilustrado (Lira, Viento, ...) solo aporta su SVG y los puntos de anclaje
// medidos con getBBox() sobre su propio dibujo; la lógica de animación es
// la misma para todos, y sale siempre de su theta real (nunca un reloj
// aparte):
// - el grupo de brazo+mano (ya viene fusionado en el archivo) se mueve como
//   un solo bloque rígido siguiendo notePosition() (0..3, el mismo péndulo
//   de la escalera de notas). Dos modos, según el instrumento:
//   'rotate' (por defecto) gira desde el codo -- para instrumentos que se
//   sostienen y se pulsan (lira, arpa, pipa...). 'translateX' desliza el
//   brazo en línea horizontal -- para instrumentos donde la mano golpea de
//   lado a lado sobre una superficie fija (xilófono, cuenco tibetano): con
//   la forma ancha/horizontal de ese brazo, rotarlo desde un punto lateral
//   mueve la mano sobre todo verticalmente (perpendicular al brazo), no de
//   lado a lado como debería verse un mazo recorriendo las teclas/el borde.
//   Sin golpe de singPulse encima: ese golpe salta de 0 a 1 en un solo
//   frame (por diseño, para el destello), y sumarlo a un movimiento
//   continuo se siente como un salto en vez de algo fluido.
// - cola y pelo oscilan con sin(theta) directamente, como el bobbing
//   original -- misma idea, aplicada como rotación en vez de posición Y.
export function createCharacterOverlay({
  svgRaw,
  viewW,
  viewH,
  displayH = 150,
  zIndex = 5,
  anchorY = 1, // fracción de displayH que queda POR ENCIMA de sirena.y (1 = todo arriba, como los personajes; <1 deja parte abajo, para la roca)
  armGroupSelector = '#grupo_brazo_mano_w',
  armRestTransform = '', // alineación fija (traslación/rotación) antes del barrido animado
  elbow,
  sweepAngle = 14,
  sweepMode = 'rotate', // 'rotate' | 'translateX'
  sweepDistance = 8, // unidades del propio SVG, solo para 'translateX'
  tailSelector = '#cola',
  tailPivot,
  tailAmplitude = 4,
  hairSelector = '#pelo',
  hairPivot,
  hairAmplitude = 3,
  hairLag = 0.6,
  // Algunos personajes traen el pelo dividido en dos grupos (mechones de
  // fondo + mechones delanteros); si se da, se mueve junto con el primero.
  hairSelector2,
  hairPivot2,
  hairAmplitude2,
  // Si se activa, la roca se ilumina con sirena.disturbance (0..1, real --
  // sube cuando la piedra lanzada al mar la golpea y baja su K efectiva;
  // decae sola en sirena.step()). Es la señal visible de "aquí pegó la
  // piedra y esta sirena se desacopló un rato del coro".
  glowOnDisturbance = false,
}) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.pointerEvents = 'none';
  container.style.zIndex = String(zIndex);
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
  const pelo2 = hairSelector2 ? shadow.querySelector(hairSelector2) : null;
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
      const top = sirena.y - displayH * anchorY;
      container.style.transform = `translate(${left}px, ${top}px)`;

      if (brazoMano && elbow) {
        const f = sirena.notePosition() / 3; // 0..1, el mismo péndulo real.
        // armRestTransform primero (alinea el brazo con el hombro/instrumento
        // de este personaje), y el barrido animado encima -- si solo se
        // pusiera el barrido, se perdería la alineación fija en cada frame.
        if (sweepMode === 'translateX') {
          const dx = (f - 0.5) * sweepDistance;
          brazoMano.setAttribute('transform', `${armRestTransform} translate(${dx.toFixed(2)},0)`);
        } else {
          const angle = (f - 0.5) * sweepAngle;
          brazoMano.setAttribute(
            'transform',
            `${armRestTransform} rotate(${angle.toFixed(2)} ${elbow.x} ${elbow.y})`
          );
        }
      }

      if (cola && tailPivot) {
        const angle = Math.sin(sirena.theta) * tailAmplitude;
        cola.setAttribute('transform', `rotate(${angle.toFixed(2)} ${tailPivot.x} ${tailPivot.y})`);
      }

      if (pelo && hairPivot) {
        const angle = Math.sin(sirena.theta - hairLag) * hairAmplitude;
        pelo.setAttribute('transform', `rotate(${angle.toFixed(2)} ${hairPivot.x} ${hairPivot.y})`);
      }

      if (pelo2 && (hairPivot2 || hairPivot)) {
        const pivot2 = hairPivot2 || hairPivot;
        const amp2 = hairAmplitude2 ?? hairAmplitude;
        const angle2 = Math.sin(sirena.theta - hairLag) * amp2;
        pelo2.setAttribute('transform', `rotate(${angle2.toFixed(2)} ${pivot2.x} ${pivot2.y})`);
      }

      if (glowOnDisturbance) {
        const d = sirena.disturbance ?? 0;
        if (d > 0.01) {
          svg.style.filter = `brightness(${(1 + d * 1.3).toFixed(2)}) drop-shadow(0 0 ${(6 + d * 14).toFixed(1)}px rgba(255, 235, 160, ${(d * 0.9).toFixed(2)}))`;
        } else {
          svg.style.filter = '';
        }
      }
    },
  };
}
