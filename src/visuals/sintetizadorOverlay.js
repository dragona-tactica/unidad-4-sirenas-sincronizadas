import sintetizadorSvgRaw from '../assets/sintetizador-sirena.svg?raw';
import { createCharacterOverlay } from './characterOverlay.js';

// Puntos medidos con getBBox() sobre sintetizador-sirena.svg (viewBox
// recortado a "-6 47 368 720"). El archivo traía dos grupos sin nombre
// propio ("Objeto_generativo" y "Objeto_generativo (45, 0)"), renombrados
// en el propio SVG tras identificarlos por posición:
// - pelo_sinte (antes "Objeto_generativo"): x0-273.5, y51.1-334.2 -- el
//   halo esponjoso alrededor de la cabeza (cabeza en x163.6-225.8,
//   y73.2-152.2).
// - sintetizador_w (antes "Objeto_generativo (45, 0)"): x132.1-280.5,
//   y337.2-399.8 -- el pad a la altura del vientre. Se queda fijo.
// - grupo_brazo_mano_w (x43-207.9, y254.4-350.8): el codo es su borde
//   derecho, junto al torso.
export function createSintetizadorOverlay() {
  return createCharacterOverlay({
    svgRaw: sintetizadorSvgRaw,
    viewW: 368,
    viewH: 720,
    elbow: { x: 200, y: 290 },
    // Los dedos tocan distintos pads de lado a lado sobre la superficie --
    // deslizar en horizontal, no girar desde el codo (mismo motivo que el
    // xilófono/cuenco: ese brazo ancho y horizontal rotado desde un
    // extremo levantaba la mano del pad en vez de recorrerlo).
    sweepMode: 'translateX',
    sweepDistance: 40,
    tailPivot: { x: 200, y: 328 },
    hairSelector: '#pelo_sinte',
    hairPivot: { x: 180, y: 60 },
  });
}
