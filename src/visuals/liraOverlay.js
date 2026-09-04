import liraSvgRaw from '../assets/lira-sirena.svg?raw';
import { createCharacterOverlay } from './characterOverlay.js';

// Puntos medidos con getBBox() sobre lira-sirena.svg:
// - grupo_brazo_mano_w (x51.6-241, y274.2-316.9): el codo es su borde
//   izquierdo, donde el antebrazo+mano se separó del torso.
// - cola: se une al torso en ~(200,324). pelo: nace cerca de la cabeza,
//   ~(160,58).
export function createLiraOverlay() {
  return createCharacterOverlay({
    svgRaw: liraSvgRaw,
    viewW: 376.53,
    viewH: 757.61,
    elbow: { x: 55, y: 285 },
    sweepAngle: 14,
    tailPivot: { x: 200, y: 324 },
    hairSelector: '#pelo',
    hairPivot: { x: 160, y: 58 },
  });
}
