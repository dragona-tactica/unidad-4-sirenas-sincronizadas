import xilofonoSvgRaw from '../assets/xilofono-sirena.svg?raw';
import { createCharacterOverlay } from './characterOverlay.js';

// Puntos medidos con getBBox() sobre xilofono-sirena.svg (viewBox recortado
// a "-6 15 320 750"):
// - grupo_brazo_mano_w (x0.7-174.1, y262.7-344): el codo es su borde
//   derecho, junto al torso (el mazo queda del otro lado, hacia la
//   izquierda). El xilófono (xilofono) se queda fijo.
// - cola: se une al torso en ~(160,328). pelo_nuevo: nace cerca de la
//   cabeza, ~(145,45).
export function createXilofonoOverlay() {
  return createCharacterOverlay({
    svgRaw: xilofonoSvgRaw,
    viewW: 320,
    viewH: 750,
    elbow: { x: 170, y: 290 },
    // El mazo golpea de lado a lado sobre las teclas -- deslizar en
    // horizontal, no girar desde el codo (esa forma de brazo, ancha y casi
    // horizontal, movería la mano sobre todo vertical si se rotara).
    sweepMode: 'translateX',
    sweepDistance: 14,
    tailPivot: { x: 160, y: 328 },
    hairSelector: '#pelo_nuevo',
    hairPivot: { x: 145, y: 45 },
  });
}
