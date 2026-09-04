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
// - grupo_brazo_mano_w se reemplazó por la pieza nueva ya unida (brazo+mano
//   +parche de hombro en una sola pieza, sin costura). Su pecho_w se alineó
//   con el pecho_w original de este archivo, y se añadió una rotación para
//   que los dedos queden apuntando hacia el pad en vez de flotando sobre
//   él -- sin mazo aquí (se toca con la mano directa), así que la
//   orientación de la mano sí importa por sí sola.
export function createSintetizadorOverlay() {
  return createCharacterOverlay({
    svgRaw: sintetizadorSvgRaw,
    viewW: 368,
    viewH: 720,
    armRestTransform: 'translate(62,5) rotate(35 200 290)',
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
