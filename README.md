# Unidad 4 · Sirenas: Canto de Fase

Prueba de concepto para el reto de Unidad 4 (modelo de Kuramoto) del curso
[Simulación 2026-20](https://juanferfranco.github.io/simulacion-2026-20/units/unit4/).

## Concepto

Un coro de 8 sirenas, cada una un agente/oscilador distinto con su propia
escala de 4 notas y su propio timbre — no hay personalidades compartidas
entre agentes, cada una es única:

1. **Lira** (cuerda frotada grave) — C2, G2, C3, G3
2. **Pipa** (plucked tradicional) — A2, C3, E3, A3
3. **Xilófono** (percusión brillante) — E3, G3, B3, E4
4. **Viento** (flauta de bambú) — G3, A3, D4, E4
5. **Metal** (tazón tibetano) — C4, D4, G4, A4
6. **Arpa** (cuerda pulsada) — E4, G4, B4, D5
7. **Campana** (Glockenspiel) — G4, A4, C5, E5
8. **Sintetizador** (textura ambiental áurea) — B4, D5, E5, G5

- **θᵢ (fase)**: en qué punto de su ciclo está la sirena — no un ángulo
  abstracto, sino literalmente **en cuál de sus 4 notas se encuentra**. El
  recorrido es de ida y vuelta (péndulo): sube de la nota 1 a la 4 en la
  primera mitad del ciclo y baja de vuelta de la 4 a la 1 en la segunda
  mitad. Un giro completo de θ (0→2π) es un recorrido completo de ida y
  vuelta por su escala.
- **ωᵢ (frecuencia natural)**: cuánto se demora esa sirena en completar su
  recorrido de ida y vuelta — su tempo propio, distinto para cada agente.
- **K (acoplamiento)**: la "Marea". No sincroniza el *tono* (cada sirena
  sigue tocando su propia escala) sino el **ritmo de subida y bajada de
  nota** — con K alto, todas terminan subiendo y bajando de nota al mismo
  compás, aunque cada una diga algo distinto con su voz. La sincronía
  **emerge**, nunca se fuerza: el acoplamiento solo empuja, no fija el
  resultado.
- **Extensión justificada**: el acoplamiento no es todos-con-todos por
  igual — decae con la **distancia visual** entre sirenas ("distancia
  mítica"). Esto es lo que permite que se formen corros parciales en vez de
  saltar directo de desorden a sincronía total.
- **r (parámetro de orden)**: qué tan alineado está ese ritmo colectivo de
  cambio de nota. 0 = cada quien a su compás, 1 = todas cambiando de nota
  exactamente juntas.

## Por qué Kuramoto está íntegramente visible

La escalera de 4 peldaños que se dibuja sobre cada sirena **no es una
animación aparte**: el marcador que sube y baja por ella es literalmente
`notePosition()`, una reformulación directa de `θ_i` (`3 - |6·(θ/2π) − 3|`,
el mismo péndulo de ida y vuelta). La suma de Kuramoto ponderada por
distancia (`(K/N)·Σ spatial(i,j)·sin(θⱼ−θᵢ)`, en
[`sirena.js`](src/simulation/sirena.js)) sigue siendo la única ecuación que
mueve las fases — la escalera es su lectura directa, no una aproximación.
Cada vez que el marcador cruza un peldaño entero, esa sirena canta esa
nota — el ritmo del canto emerge de θ real, no de un reloj aparte.

Mover una sirena solo cambia **su propio ciclo**: arrastrar en horizontal
cambia su distancia mítica con las vecinas (afecta cuánto le pesa el
acoplamiento); arrastrar en vertical acelera o frena su propio ω. Ninguna
de las dos reposiciona a otra sirena directamente — si otra cambia de ritmo
después, es porque el acoplamiento real tiró de su θ con el tiempo.

## Interacciones

- **Slider "Marea" (K)**: control global obligatorio del modelo.
- **Clic sobre una sirena**: el Navegante manipula manualmente en qué nota
  está — la avanza un paso en su recorrido de ida y vuelta.
- **Arrastrar una sirena**: horizontal cambia su distancia mítica con las
  vecinas; vertical acelera/frena su ω (su tempo propio).
- **Clic sobre el mar** — *piedra en el agua*: mecanismo de perturbación.
  Genera un frente que viaja y, al pasar por una sirena, le baja
  temporalmente su K efectiva — se desconecta un rato del ritmo del coro
  antes de que el resto la vuelva a jalar (si K global es suficiente).
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

El modelo, los 8 agentes con su escala/timbre propio, y las interacciones
mínimas ya funcionan. Pendiente de iterar: diseño visual más elaborado por
agente, y afinar las constantes de acoplamiento espacial/perturbación con
más tiempo de prueba.
