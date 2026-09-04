import metalSvgRaw from '../assets/metal-sirena.svg?raw';
import { createCharacterOverlay } from './characterOverlay.js';

// Segunda entrega del usuario: el mazo (grupo sin nombre propio) ya viene
// anidado DENTRO de grupo_brazo_mano_w -- confirmado inspeccionando el
// árbol real del DOM -- así que se mueve con la mano automáticamente. El
// cuenco (cuenco_tibetano) se queda fijo. No hace falta armRestTransform:
// el brazo ya queda bien alineado con el torso tal como viene dibujado.
// - cola: se une al torso en ~(160,328). El pelo viene en dos grupos
//   (pelo + pelo-2, mechones de fondo y delanteros) -- ambos se mueven
//   juntos con el mismo pivote, ~(145,50).
// Pivote rehecho desde cero (el punto anterior, x2,y225, caía fuera del
// parche real de pecho_w-2). Verificado con pecho_w-2.isPointInFill() que
// el punto cae DENTRO del parche del hombro, barriendo candidatos vecinos
// y midiendo el desplazamiento real de mano_derecha con
// rotate(20, x, y) + getBoundingClientRect(). (76,200) da -162px
// horizontal y solo 0.2px vertical -- prácticamente puro horizontal.
export function createMetalOverlay() {
  return createCharacterOverlay({
    svgRaw: metalSvgRaw,
    viewW: 320,
    viewH: 730,
    elbow: { x: 76, y: 200 },
    sweepAngle: 20,
    tailPivot: { x: 160, y: 328 },
    hairSelector: '#pelo',
    hairPivot: { x: 145, y: 50 },
    hairSelector2: '#pelo-2',
  });
}
