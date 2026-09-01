// Una piedra lanzada al mar: un frente que viaja y, al pasar por una
// sirena, le baja temporalmente su K efectiva -- se desconecta un rato del
// ritmo del coro. No le toca la fase directamente; solo el acoplamiento.
const SPEED = 260; // px/s
const MAX_RADIUS = 900;
const FRONT_WIDTH = 46;

export class Ripple {
  constructor(x) {
    this.x = x;
    this.radius = 0;
    this.hitIds = new Set();
    this.dead = false;
  }

  step(sirenas, dt) {
    this.radius += SPEED * dt;
    if (this.radius > MAX_RADIUS) {
      this.dead = true;
      return;
    }

    const strength = Math.max(0, 1 - this.radius / MAX_RADIUS);

    for (const s of sirenas) {
      if (this.hitIds.has(s.id)) continue;
      const dist = Math.abs(s.x - this.x);
      if (Math.abs(dist - this.radius) < FRONT_WIDTH) {
        this.hitIds.add(s.id);
        s.disturb(0.85 * strength + 0.15);
      }
    }
  }
}
