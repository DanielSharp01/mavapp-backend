module.exports = class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(vec) {
    return new Vec2(this.x + vec.x, this.y + vec.y);
  }

  sub(vec) {
    return new Vec2(this.x - vec.x, this.y - vec.y);
  }

  mul(scalar) {
    return new Vec2(this.x * scalar, this.y * scalar);
  }

  div(scalar) {
    return new Vec2(this.x / scalar, this.y / scalar);
  }

  dot(vec) {
    return this.x * vec.x + this.y * vec.y;
  }

  get length() {
    return Math.sqrt(this.dot(this));
  }
}