import arpaSvgRaw from '../assets/arpa-sirena.svg?raw';
import { createCharacterOverlay } from './characterOverlay.js';

// Puntos medidos con getBBox() sobre arpa-sirena.svg (viewBox recortado a
// "8 6 350 765"). El archivo traía dos grupos sin nombre propio
// ("Objeto_generativo" x2, restos del renombrado automático de Firefly) --
// se identificaron por posición y se renombraron en el propio SVG:
// - arpa_w (antes "Objeto_generativo"): x163.7-346.8, y135.9-414.1 --
//   el arpa, a la derecha y debajo de la cabeza. Se queda fija; un arpa
//   real casi no se mueve al tocarla.
// - pelo_arpa (antes "Objeto_generativo-2"): x33-186.7, y16.1-156.5 --
//   el halo más ancho que la cabeza (cabeza en x90.8-153, y73.2-152.2).
// - grupo_brazo_mano_w (x64.9-249.1, y257-320.6): el codo es su borde
//   derecho, junto al torso.
export function createArpaOverlay() {
  return createCharacterOverlay({
    svgRaw: arpaSvgRaw,
    viewW: 350,
    viewH: 765,
    elbow: { x: 70, y: 290 },
    sweepAngle: 12,
    tailPivot: { x: 150, y: 328 },
    hairSelector: '#pelo_arpa',
    hairPivot: { x: 110, y: 45 },
  });
}
