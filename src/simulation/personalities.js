// Las 4 personalidades audiovisuales. Cada una define cómo se ve, cómo se
// mueve y cómo suena una sirena, independientemente de su registro (omega)
// individual.
export const PERSONALITIES = [
  {
    id: 'melismatica',
    label: 'La Melismática (flauta)',
    color: '#7fd8c4',
    shape: 'sinuosa',
    baseOmega: 1.0,
    synth: 'melismatica',
  },
  {
    id: 'staccato',
    label: 'La Staccato (campana)',
    color: '#f2b134',
    shape: 'espinada',
    baseOmega: 1.7,
    synth: 'staccato',
  },
  {
    id: 'dronera',
    label: 'La Dronera (cuerno)',
    color: '#7b5ea7',
    shape: 'pesada',
    baseOmega: 0.45,
    synth: 'dronera',
  },
  {
    id: 'brillante',
    label: 'La Brillante (cristal)',
    color: '#e8f0ff',
    shape: 'espiral',
    baseOmega: 2.5,
    synth: 'brillante',
  },
];
