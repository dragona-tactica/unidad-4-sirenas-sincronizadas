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
// Pivote rehecho desde cero (el punto anterior, x2,y230, caía fuera del
// parche real de pecho_w-2 -- estaba en el borde de su bbox, no dentro de
// la forma dibujada). Esta vez se verificó con pecho_w-2.isPointInFill()
// que el punto cae DENTRO del parche del hombro, y se barrieron varios
// candidatos vecinos midiendo el desplazamiento real de mano_derecha con
// rotate(20, x, y) + getBoundingClientRect(). (73,202) da -94px horizontal
// y solo 0.4px vertical -- prácticamente puro horizontal, con el hombro
// siempre dentro de su propio parche (nunca se despega del torso).
export function createXilofonoOverlay() {
  return createCharacterOverlay({
    svgRaw: xilofonoSvgRaw,
    viewW: 320,
    viewH: 750,
    elbow: { x: 73, y: 202 },
    sweepAngle: 20,
    tailPivot: { x: 160, y: 328 },
    hairSelector: '#pelo_xilo',
    hairPivot: { x: 145, y: 35 },
  });
}
