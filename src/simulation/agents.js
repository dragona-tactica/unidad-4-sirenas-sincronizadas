// Los 8 agentes. Cada uno es una identidad tímbrica y melódica completa —
// no hay "personalidades compartidas entre 2 individuos" como antes: cada
// sirena es su propio agente, con su propia escala de 4 notas y su propio
// timbre. baseOmega define qué tan rápido recorre su ciclo de ida y vuelta
// por esas 4 notas antes de que el acoplamiento (K) entre en juego.
export const AGENTS = [
  {
    id: 'lira',
    label: 'Lira (cuerda frotada grave)',
    notes: ['C2', 'G2', 'C3', 'G3'],
    color: '#5a7ba8',
    shape: 'arco',
    baseOmega: 0.5,
    synth: 'lira',
  },
  {
    id: 'pipa',
    label: 'Pipa (plucked tradicional)',
    notes: ['A2', 'C3', 'E3', 'A3'],
    color: '#c98a4b',
    shape: 'gota',
    baseOmega: 0.9,
    synth: 'pipa',
  },
  {
    id: 'xilofono',
    label: 'Lira Xilófono (percusión brillante)',
    notes: ['E3', 'G3', 'B3', 'E4'],
    color: '#e0c14b',
    shape: 'espinada',
    baseOmega: 1.8,
    synth: 'xilofono',
  },
  {
    id: 'viento',
    label: 'Viento (flauta de bambú)',
    notes: ['G3', 'A3', 'D4', 'E4'],
    color: '#7fd8c4',
    shape: 'aliento',
    baseOmega: 1.1,
    synth: 'viento',
  },
  {
    id: 'metal',
    label: 'Metal (tazón tibetano)',
    notes: ['C4', 'D4', 'G4', 'A4'],
    color: '#9b7bb8',
    shape: 'tazon',
    baseOmega: 0.6,
    synth: 'metal',
  },
  {
    id: 'arpa',
    label: 'Arpa pequeña (cuerda pulsada)',
    notes: ['E4', 'G4', 'B4', 'D5'],
    color: '#e88ba0',
    shape: 'cuerdas',
    baseOmega: 1.4,
    synth: 'arpa',
  },
  {
    id: 'campana',
    label: 'Campana / Glockenspiel',
    notes: ['G4', 'A4', 'C5', 'E5'],
    color: '#bfe8ff',
    shape: 'espiral',
    baseOmega: 2.1,
    synth: 'campana',
  },
  {
    id: 'sintetizador',
    label: 'Sintetizador (textura ambiental áurea)',
    notes: ['B4', 'D5', 'E5', 'G5'],
    color: '#f5d78e',
    shape: 'brillo',
    baseOmega: 0.7,
    synth: 'sintetizador',
  },
];
