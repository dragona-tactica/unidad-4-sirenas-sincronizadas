import rocaSvgRaw from '../assets/roca.svg?raw';
import { createCharacterOverlay } from './characterOverlay.js';

// Roca estática bajo cada sirena (menos Campana, que ya trae la suya propia
// dibujada junto con su cuerpo). Reutiliza el mismo motor de overlay que los
// personajes, pero sin brazo/cola/pelo -- los selectores no existen en este
// SVG, así que el motor simplemente no anima nada, solo posiciona la roca.
// zIndex más bajo que los personajes (5) para que quede detrás, y anchorY
// deja una parte de la roca por debajo de sirena.y para que la cola de la
// sirena parezca apoyarse sobre su borde superior en vez de flotar encima.
export function createRockOverlay() {
  return createCharacterOverlay({
    svgRaw: rocaSvgRaw,
    viewW: 442,
    viewH: 300,
    displayH: 60,
    zIndex: 3,
    anchorY: 0.55,
    armGroupSelector: null,
    tailSelector: null,
    hairSelector: null,
  });
}
