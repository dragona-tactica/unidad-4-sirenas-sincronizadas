import xilofonoSvgRaw from '../assets/xilofono-sirena.svg?raw';
import { createCharacterOverlay } from './characterOverlay.js';

// Segunda entrega del usuario: aquí el mazo (renombrado mazo_xilofono, antes
// "Objeto_generativo_-15_-30_") ya viene anidado DENTRO de grupo_brazo_mano_w
// -- confirmado inspeccionando el árbol real del DOM, no solo por nombre --
// así que se mueve con la mano automáticamente, sin necesidad de
// reubicarlo a mano. El xilófono en sí (xilofono_w) se queda fijo. No hace
// falta armRestTransform: el brazo ya queda bien alineado con el torso tal
// como viene dibujado.
// - cola: se une al torso en ~(160,328). pelo_xilo (antes "Objeto_generativo"):
//   nace cerca de la cabeza, ~(145,35).
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
    sweepDistance: 45,
    tailPivot: { x: 160, y: 328 },
    hairSelector: '#pelo_xilo',
    hairPivot: { x: 145, y: 35 },
  });
}
