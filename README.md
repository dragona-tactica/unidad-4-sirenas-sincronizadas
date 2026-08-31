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

## La ola: por qué Kuramoto está íntegramente visible

La superficie del mar que se dibuja **no es un objeto físico simulado aparte**.
Es literalmente la curva que conecta `(x_i, sin(θ_i))` de las 8 sirenas, cada
frame. No hay ninguna capa intermedia: si las fases están sincronizadas, la
curva se ve como una ola limpia porque las 8 fases realmente están alineadas;
si perturbas una con la piedra, la curva se abolla porque esa θ realmente
cambió. La suma de Kuramoto ponderada por distancia
(`(K/N)·Σ spatial(i,j)·sin(θⱼ−θᵢ)`, en [`sirena.js`](src/simulation/sirena.js))
sigue siendo la única ecuación que mueve las fases — la ola es su
representación directa, no una aproximación ni un reemplazo.

## Interacciones

- **Slider "Marea" (K)**: control global obligatorio del modelo.
- **Clic sobre una sirena** — *El Grito de Ulises*: perturbación individual,
  la desfasa +π/2 del grupo.
- **Arrastrar una sirena**: mueve un poco su sitio (rango corto, no la sueltas
  en otro lugar del mar) — cambia su distancia mítica con las vecinas (x) y
  cuándo la alcanza la superficie (profundidad).
- **Clic sobre el mar** — *piedra en el agua*: mecanismo de perturbación.
  Genera un frente de onda real que viaja horizontalmente; al pasar por una
  sirena le da un golpe de fase y la desconecta brevemente del acoplamiento
  ("rompe el agua que las une"). El efecto se ve directamente como una
  abolladura en la ola — no hay una animación paralela dibujando el golpe,
  es la misma curva reaccionando a la θ real que cambió.
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
