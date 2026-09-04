import sintetizadorSvgRaw from '../assets/sintetizador-sirena.svg?raw';
import { createCharacterOverlay } from './characterOverlay.js';

// Segunda entrega del usuario: mismo archivo base que antes -- pelo_sinte
// (antes "Objeto_generativo") y sintetizador_w (antes "Objeto_generativo_45")
// renombrados tras identificarlos por posición. grupo_brazo_mano_w ya queda
// bien alineado con el torso tal como viene dibujado, sin necesidad de
// armRestTransform.
// - cola: se une al torso en ~(200,328). pelo_sinte: nace cerca de la
//   cabeza, ~(180,60).
// El hombro (borde izquierdo de pecho_w-2, x44,y175-273) es el pivote real --
// gira ahí, nunca se traslada. Medido en vivo: rotate(20, 44, 224) mueve la
// mano -6.4px horizontal y solo 0.5px vertical.
export function createSintetizadorOverlay() {
  return createCharacterOverlay({
    svgRaw: sintetizadorSvgRaw,
    viewW: 368,
    viewH: 720,
    elbow: { x: 44, y: 224 },
    sweepAngle: 22,
    tailPivot: { x: 200, y: 328 },
    hairSelector: '#pelo_sinte',
    hairPivot: { x: 180, y: 60 },
  });
}
