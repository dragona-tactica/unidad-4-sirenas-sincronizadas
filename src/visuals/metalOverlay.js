import metalSvgRaw from '../assets/metal-sirena.svg?raw';
import { createCharacterOverlay } from './characterOverlay.js';

// Puntos medidos con getBBox() sobre metal-sirena.svg (viewBox recortado a
// "-6 37 320 730"). Igual que en Xilófono: grupo_brazo_mano_w se reemplazó
// por la pieza nueva ya unida, alineada con el pecho_w original vía
// armRestTransform, y el mazo del cuenco (antes suelto y estático dentro de
// "cuenco_tibetano") se re-parentó dentro del nuevo grupo.
// - cola: se une al torso en ~(160,328). pelo: nace cerca de la cabeza,
//   ~(145,50) -- este pelo es largo y recto, baja hasta y400.
export function createMetalOverlay() {
  return createCharacterOverlay({
    svgRaw: metalSvgRaw,
    viewW: 320,
    viewH: 730,
    armRestTransform: 'translate(6,-29)',
    elbow: { x: 170, y: 285 },
    // El mazo recorre el borde del cuenco de lado a lado -- deslizar en
    // horizontal, no girar desde el codo (mismo motivo que el xilófono).
    sweepMode: 'translateX',
    sweepDistance: 40,
    tailPivot: { x: 160, y: 328 },
    hairSelector: '#pelo',
    hairPivot: { x: 145, y: 50 },
  });
}
