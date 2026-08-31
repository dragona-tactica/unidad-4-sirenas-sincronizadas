# Unidad 4 · Sirenas: Canto de Fase

Prueba de concepto para el reto de Unidad 4 (modelo de Kuramoto) del curso
[Simulación 2026-20](https://juanferfranco.github.io/simulacion-2026-20/units/unit4/).

## Concepto

Un coro de 8 sirenas emerge del mar. Cada una es un oscilador acoplado:

- **θᵢ (fase)**: el punto de su ciclo de respiración/canto (inspiración →
  nota → silencio). Se mapea directamente a la posición del frente de su
  ola en su carril (`θ/2π` de recorrido entre el mar abierto arriba y la
  costa abajo) y dispara su voz cada vez que cruza por cero.
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

Cada sirena tiene su propio **carril vertical**, independiente de las demás
(inspirado en el experimento [Rhythm de Chrome Music Lab](https://musiclab.chromeexperiments.com/Rhythm/):
varios carriles bajando a su propio ritmo, cuya interacción produce el patrón
colectivo). El frente que baja por su carril **no es un objeto físico
simulado aparte**: su posición es literalmente `θ_i / 2π` — el mismo ángulo
que ya gobierna todo lo demás. Cuando `θ_i` completa una vuelta (el mismo
cruce por cero que dispara su canto), el frente llega a la costa, se dispersa
ahí, y un nuevo frente arranca desde arriba. Si dos sirenas están acopladas,
sus frentes bajan al mismo ritmo porque sus `θ` reales ya están alineadas —
no hay ninguna capa intermedia que sincronizar aparte, ni un reloj que
reemplace al modelo. La suma de Kuramoto ponderada por distancia
(`(K/N)·Σ spatial(i,j)·sin(θⱼ−θᵢ)`, en [`sirena.js`](src/simulation/sirena.js))
sigue siendo la única ecuación que mueve las fases; el carril es su
representación directa, no una aproximación ni un reemplazo.

Mover una sirena de su sitio solo cambia **su propio carril** (su distancia
mítica con las vecinas). Nunca reposiciona a otra — si otro carril cambia de
ritmo después de mover una, es porque el acoplamiento real hizo que su `θ`
cambiara con el tiempo, no porque el arrastre la haya movido directamente.

## Interacciones

- **Slider "Marea" (K)**: control global obligatorio del modelo.
- **Clic sobre una sirena** — *El Grito de Ulises*: perturbación individual,
  la desfasa +π/2 del grupo (se ve como su frente saltando de posición en su
  propio carril).
- **Arrastrar una sirena**: mueve un poco su sitio (rango corto, no la sueltas
  en otro lugar del mar) — cambia su distancia mítica con las vecinas (x) y
  su profundidad de costa (y), sin afectar directamente a ninguna otra.
- **Clic sobre el mar** — *piedra en el agua*: mecanismo de perturbación.
  Genera un frente de onda real que viaja horizontalmente; al pasar por una
  sirena le da un golpe de fase y la desconecta brevemente del acoplamiento
  ("rompe el agua que las une"). El efecto se ve directamente como un salto
  en su carril — no hay una animación paralela dibujando el golpe, es el
  mismo carril reaccionando a la θ real que cambió.
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
