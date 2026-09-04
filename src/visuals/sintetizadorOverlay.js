import sintetizadorSvgRaw from '../assets/sintetizador-sirena.svg?raw';
import { createCharacterOverlay } from './characterOverlay.js';

// Segunda entrega del usuario: mismo archivo base que antes -- pelo_sinte
// (antes "Objeto_generativo") y sintetizador_w (antes "Objeto_generativo_45")
// renombrados tras identificarlos por posición. grupo_brazo_mano_w ya queda
// bien alineado con el torso tal como viene dibujado, sin necesidad de
// armRestTransform.
// - cola: se une al torso en ~(200,328). pelo_sinte: nace cerca de la
//   cabeza, ~(180,60).
// Pivote rehecho desde cero (el punto anterior, x44,y224, caía fuera del
// parche real de pecho_w-2). Verificado con pecho_w-2.isPointInFill() que
// el punto cae DENTRO del parche del hombro, barriendo candidatos vecinos
// y midiendo el desplazamiento real de mano_derecha con
// rotate(20, x, y) + getBoundingClientRect(). (123,200) da -178px
// horizontal y solo 0.2px vertical -- prácticamente puro horizontal.
export function createSintetizadorOverlay() {
  return createCharacterOverlay({
    svgRaw: sintetizadorSvgRaw,
    viewW: 368,
    viewH: 720,
    elbow: { x: 123, y: 200 },
    sweepAngle: 22,
    tailPivot: { x: 200, y: 328 },
    hairSelector: '#pelo_sinte',
    hairPivot: { x: 180, y: 60 },
  });
}
