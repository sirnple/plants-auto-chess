import { _decorator, Component, Node, Vec3, tween } from "cc";

const { ccclass, property } = _decorator;

@ccclass("Projectile")
export class Projectile extends Component {
  damage: number = 0;
  speed: number = 10;
  target: Node | null = null;
  onHit: (() => void) | null = null;

  init(damage: number, speed: number, target: Node, onHit: () => void) {
    this.damage = damage;
    this.speed = speed;
    this.target = target;
    this.onHit = onHit;
  }

  update(deltaTime: number) {
    if (!this.target || !this.target.isValid) {
      this.node.destroy();
      return;
    }

    const direction = new Vec3();
    Vec3.subtract(direction, this.target.position, this.node.position);
    const distance = direction.length();

    if (distance < 10) {
      if (this.onHit) this.onHit();
      this.node.destroy();
      return;
    }

    direction.normalize();
    const moveDistance = this.speed * deltaTime * 60;
    this.node.setPosition(
      this.node.position.x + direction.x * moveDistance,
      this.node.position.y + direction.y * moveDistance,
      this.node.position.z,
    );
  }
}
