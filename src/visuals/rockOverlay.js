import rocaSvgRaw from '../assets/roca.svg?raw';
import { createCharacterOverlay } from './characterOverlay.js';

// Roca estática bajo cada sirena (menos Campana, que ya trae la suya propia
// dibujada junto con su cuerpo). Reutiliza el mismo motor de overlay que los
// personajes, pero sin brazo/cola/pelo -- los selectores no existen en este
// SVG, así que el motor simplemente no anima nada, solo posiciona la roca.
// zIndex más bajo que los personajes (3 vs 5) para que quede detrás.
//
// anchorY calculado directamente de la propia Campana como referencia (el
// usuario lo pidió así): en su archivo, el grupo de la roca ocupa del 48.9%
// al 89.2% de su alto total -- es decir, queda bajo el torso/cadera, y la
// punta de la cola sigue bajando 10.8% MÁS ABAJO que la roca hasta tocar el
// borde inferior real (sirena.y). anchorY=1.28 reproduce esa misma banda
// relativa: el fondo de la roca queda ~16px arriba de sirena.y (no por
// debajo, que era el error -- la sirena quedaba flotando sobre un vacío en
// vez de sentada), dejando ese margen para que la cola se vea apoyada en su
// borde superior y siga bajando hasta el piso como en la referencia.
//
// glowOnDisturbance: la roca se ilumina con sirena.disturbance (real, sube
// cuando la piedra lanzada al mar la golpea) -- así se ve claramente CUÁL
// sirena acaba de perder acoplamiento por la piedra, sin tocar el color de
// la sirena misma.
export function createRockOverlay() {
  return createCharacterOverlay({
    svgRaw: rocaSvgRaw,
    viewW: 442,
    viewH: 300,
    displayH: 60,
    zIndex: 3,
    anchorY: 1.28,
    armGroupSelector: null,
    tailSelector: null,
    hairSelector: null,
    glowOnDisturbance: true,
  });
}
