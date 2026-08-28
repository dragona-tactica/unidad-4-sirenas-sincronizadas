# Unidad 4 · Sirenas: Canto de Fase

Prueba de concepto para el reto de Unidad 4 (modelo de Kuramoto) del curso
[Simulación 2026-20](https://juanferfranco.github.io/simulacion-2026-20/units/unit4/).

## Concepto

Un coro de 8 sirenas emerge del mar. Cada una es un oscilador acoplado:

- **θᵢ (fase)**: el punto de su ciclo de respiración/canto (inspiración →
  nota → silencio). Se mapea a su posición vertical (`sin(θ)`) y dispara su
  voz cada vez que cruza por cero.
- **ωᵢ (frecuencia natural)**: su registro/temperamento base. Cada
  personalidad tiene un registro característico, y cada individuo dentro de
  esa personalidad tiene una variación propia.
- **K (acoplamiento)**: la "Marea" — controlada en vivo con el slider. A
  diferencia del Kuramoto clásico (todos-con-todos por igual), aquí el
  acoplamiento entre dos sirenas decae con su **distancia visual** ("distancia
  mítica"): las que están cerca en el mar se escuchan mejor. Esto es lo que
  permite que se formen "corros" parciales en vez de saltar directo de
  desorden a sincronía total.

Las **4 personalidades audiovisuales** (Melismática, Staccato, Dronera,
Brillante) definen forma, tipo de movimiento, ataque/decay sonoro y timbre.
Cada una tiene 2 individuos con su propio registro (ω), tamaño y matiz de
color — 8 identidades reconocibles, no 4 repetidas.

## Interacciones

- **Slider "Marea" (K)**: control global obligatorio del modelo.
- **Clic sobre una sirena** — *El Grito de Ulises*: perturbación individual,
  la desfasa +π/2 del grupo.
- **Clic sobre el mar** — *piedra en el agua*: mecanismo de perturbación.
  Genera un frente de onda que viaja horizontalmente; al pasar por una
  sirena le da un golpe de fase y la desconecta brevemente del acoplamiento
  ("rompe el agua que las une"), antes de que el resto del coro intente
  recuperarla si K es suficientemente alto.
- **Faro** (esquina inferior izquierda): indicador del parámetro de orden
  `r` — rojo parpadeante en desorden, amarillo intermitente en organización
  parcial, blanco fijo (con haz de luz) en organización estable.

## Correr en local

```bash
npm install
npm run dev
```

Haz clic en la pantalla de inicio para activar el audio (requerido por las
políticas de autoplay del navegador).

## Build / despliegue

```bash
npm run build
npm run preview
```

El repo incluye `.github/workflows/deploy.yml`: al hacer push a `main`, se
publica automáticamente en GitHub Pages (Settings → Pages → Source: GitHub
Actions).

## Estado del prototipo

Esto es una base de pruebas de concepto: el modelo, las 4 personalidades y
las 3 interacciones mínimas ya funcionan. Pendiente de iterar: diseño
sonoro más fino por personalidad, texturas visuales (partículas, estelas),
y ajuste de las constantes de acoplamiento espacial/perturbación.
