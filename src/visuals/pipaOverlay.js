import pipaSvgRaw from '../assets/pipa-sirena.svg?raw';
import { createCharacterOverlay } from './characterOverlay.js';

// Puntos medidos con getBBox() sobre pipa-sirena.svg (viewBox recortado a
// "-8 30 296 731" -- el archivo original traía el lienzo de trabajo
// completo de 903 de ancho, con el personaje ocupando solo una franja):
// - grupo_brazo_mano_w (x0.3-183.3, y226.6-307.2): el codo es su borde
//   izquierdo, junto al torso (parte_superior arranca en x18).
// - cola: se une al torso en ~(140,328). pelo_nuevo: nace cerca de la
//   cabeza, ~(115,55).
export function createPipaOverlay() {
  return createCharacterOverlay({
    svgRaw: pipaSvgRaw,
    viewW: 296,
    viewH: 731,
    elbow: { x: 20, y: 270 },
    sweepAngle: 12,
    tailPivot: { x: 140, y: 328 },
    hairSelector: '#pelo_nuevo',
    hairPivot: { x: 115, y: 55 },
  });
}
