import campanaSvgRaw from '../assets/campana-sirena.svg?raw';
import { createCharacterOverlay } from './characterOverlay.js';

// Octava y última sirena: toca un hang (handpan) apoyado en su regazo, sobre
// una roca. grupo_brazo_mano_w (pecho_w-2 + brazo_derecho + mano_derecha) ya
// viene bien alineado con el torso tal como viene dibujado -- no hace falta
// armRestTransform. El hang en sí (grupo "hang") se queda fijo, apoyado en
// la roca (renombrada roca, antes "Objeto_generativo"); no hay mazo, se toca
// con los dedos, así que solo se mueve la mano.
// - cola: se une al torso en ~(245,328). pelo_campana (antes
//   "Objeto_generativo-2"): nace cerca de la cabeza, ~(230,65).
// El hombro (arriba de pecho_w-2, x155,y173) es el pivote real -- gira ahí,
// nunca se traslada. Medido en vivo: rotate(20, 155, 173) mueve la mano
// -114px horizontal y solo 0.6px vertical -- casi puramente horizontal,
// como un dedo recorriendo la superficie del hang.
export function createCampanaOverlay() {
  return createCharacterOverlay({
    svgRaw: campanaSvgRaw,
    viewW: 440,
    viewH: 720,
    elbow: { x: 155, y: 173 },
    sweepAngle: 20,
    tailPivot: { x: 245, y: 328 },
    hairSelector: '#pelo_campana',
    hairPivot: { x: 230, y: 65 },
  });
}
