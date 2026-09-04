import xilofonoSvgRaw from '../assets/xilofono-sirena.svg?raw';
import { createCharacterOverlay } from './characterOverlay.js';

// Puntos medidos con getBBox() sobre xilofono-sirena.svg (viewBox recortado
// a "-6 15 320 750"). El brazo+mano+parche de hombro (grupo_brazo_mano_w)
// se reemplazó por la pieza nueva ya unida que pasó el usuario -- su propio
// pecho_w se alineó con el pecho_w original de este archivo (mismo centro Y
// en las 3 sirenas afectadas, ~192.8; solo cambia X según el personaje) vía
// armRestTransform. El mazo, que antes vivía suelto y estático dentro del
// grupo "xilofono" (se comprobó ocultando brazo/mano: seguía flotando), se
// re-parentó dentro del nuevo grupo para que ahora sí se mueva con la mano.
export function createXilofonoOverlay() {
  return createCharacterOverlay({
    svgRaw: xilofonoSvgRaw,
    viewW: 320,
    viewH: 750,
    armRestTransform: 'translate(2,-29)',
    elbow: { x: 170, y: 290 },
    // El mazo golpea de lado a lado sobre las teclas -- deslizar en
    // horizontal, no girar desde el codo (esa forma de brazo, ancha y casi
    // horizontal, movería la mano sobre todo vertical si se rotara).
    sweepMode: 'translateX',
    sweepDistance: 45,
    tailPivot: { x: 160, y: 328 },
    hairSelector: '#pelo_nuevo',
    hairPivot: { x: 145, y: 45 },
  });
}
