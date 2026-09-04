import metalSvgRaw from '../assets/metal-sirena.svg?raw';
import { createCharacterOverlay } from './characterOverlay.js';

// Puntos medidos con getBBox() sobre metal-sirena.svg (viewBox recortado a
// "-6 37 320 730"):
// - grupo_brazo_mano_w (x2.6-174.8, y256.1-318.8): el codo es su borde
//   derecho, junto al torso. El cuenco tibetano (cuenco_tibetano) se
//   queda fijo.
// - cola: se une al torso en ~(160,328). pelo: nace cerca de la cabeza,
//   ~(145,50) -- este pelo es largo y recto, baja hasta y400.
export function createMetalOverlay() {
  return createCharacterOverlay({
    svgRaw: metalSvgRaw,
    viewW: 320,
    viewH: 730,
    elbow: { x: 170, y: 285 },
    sweepAngle: 16,
    tailPivot: { x: 160, y: 328 },
    hairSelector: '#pelo',
    hairPivot: { x: 145, y: 50 },
  });
}
