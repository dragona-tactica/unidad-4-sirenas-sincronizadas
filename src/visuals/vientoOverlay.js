import vientoSvgRaw from '../assets/viento-sirena.svg?raw';
import { createCharacterOverlay } from './characterOverlay.js';

// Puntos medidos con getBBox() sobre viento-sirena.svg (viewBox recortado a
// "245 17 330 750" -- el archivo original traía el lienzo de trabajo
// completo de 1186 de ancho, con el personaje ocupando solo una franja):
// - grupo_brazo_mano_w (x335.8-503.9, y190.8-312.9): el codo es su borde
//   izquierdo, junto a las costillas. La flauta (flauta_w) se sostiene
//   contra la boca y no se anima -- un flautista real casi no mueve el
//   instrumento al tocar, así que el barrido es más corto que el de la
//   Lira para que la mano no se le separe de los labios.
// - cola: se une al torso en ~(420,324). pelo (nuevo_pelo): nace cerca de
//   la cabeza, ~(400,60).
export function createVientoOverlay() {
  return createCharacterOverlay({
    svgRaw: vientoSvgRaw,
    viewW: 330,
    viewH: 750,
    elbow: { x: 340, y: 280 },
    sweepAngle: 8,
    tailPivot: { x: 420, y: 324 },
    hairSelector: '#nuevo_pelo',
    hairPivot: { x: 400, y: 60 },
  });
}
