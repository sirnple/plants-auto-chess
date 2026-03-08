import {
  _decorator,
  Component,
  Node,
  Label,
  Sprite,
  Color,
  tween,
  Vec3,
  UITransform,
} from "cc";
import { ZombieConfig } from "../types/GameTypes";

const { ccclass, property } = _decorator;

@ccclass("Zombie")
export class Zombie extends Component {
  @property(Label)
  emojiLabel: Label = null;

  @property(Node)
  healthBar: Node = null;

  config: ZombieConfig = null;
  currentHealth: number = 0;
  maxHealth: number = 0;
  speed: number = 0;
  damage: number = 0;
  isDead: boolean = false;
  row: number = -1;

  private healthBarWidth: number = 50;
  private isAttacking: boolean = false;

  init(config: ZombieConfig, row: number) {
    this.config = config;
    this.row = row;
    this.maxHealth = config.health;
    this.currentHealth = this.maxHealth;
    this.speed = config.speed;
    this.damage = config.damage;
    this.isDead = false;
    this.isAttacking = false;

    this.updateDisplay();
    this.updateHealthBar();
  }

  updateDisplay() {
    if (this.emojiLabel) {
      this.emojiLabel.string = this.config.emoji;
    }
  }

  updateHealthBar() {
    if (!this.healthBar) return;

    const healthPercent = this.currentHealth / this.maxHealth;
    const barTransform = this.healthBar.getComponent(UITransform);
    if (barTransform) {
      barTransform.width = this.healthBarWidth * healthPercent;
    }
  }

  update(deltaTime: number) {
    if (this.isDead || this.isAttacking) return;

    // 向左移动
    const moveDistance = this.speed * deltaTime * 60;
    this.node.setPosition(
      this.node.position.x - moveDistance,
      this.node.position.y,
      this.node.position.z,
    );
  }

  takeDamage(amount: number): boolean {
    this.currentHealth -= amount;
    this.updateHealthBar();

    // 受伤闪烁
    const sprite = this.node.getComponent(Sprite);
    if (sprite) {
      const originalColor = sprite.color.clone();
      sprite.color = new Color(255, 0, 0, 128);
      this.scheduleOnce(() => {
        if (sprite) sprite.color = originalColor;
      }, 0.1);
    }

    if (this.currentHealth <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  startAttacking() {
    this.isAttacking = true;
  }

  stopAttacking() {
    this.isAttacking = false;
  }

  attack(): number {
    // 攻击动画
    tween(this.node)
      .by(0.1, { position: new Vec3(-10, 0, 0) })
      .by(0.1, { position: new Vec3(10, 0, 0) })
      .start();

    return this.damage;
  }

  die() {
    this.isDead = true;
    tween(this.node)
      .to(0.3, { scale: new Vec3(0, 0, 1), opacity: 0 })
      .call(() => {
        this.node.destroy();
      })
      .start();
  }

  hasReachedEnd(): boolean {
    return this.node.position.x <= 50;
  }

  getReward(): number {
    return this.config.reward;
  }
}
