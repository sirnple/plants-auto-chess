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
  Widget,
} from "cc";
import { PlantConfig } from "../types/GameTypes";

const { ccclass, property } = _decorator;

@ccclass("Plant")
export class Plant extends Component {
  @property(Label)
  emojiLabel: Label = null;

  @property(Label)
  starLabel: Label = null;

  @property(Node)
  healthBar: Node = null;

  config: PlantConfig = null;
  starLevel: number = 1;
  currentHealth: number = 0;
  maxHealth: number = 0;
  damage: number = 0;
  lastAttackTime: number = 0;
  isDead: boolean = false;
  row: number = -1;
  col: number = -1;

  private healthBarWidth: number = 50;

  init(config: PlantConfig, starLevel: number = 1) {
    this.config = config;
    this.starLevel = starLevel;
    this.maxHealth = config.health * Math.pow(1.5, starLevel - 1);
    this.currentHealth = this.maxHealth;
    this.damage = config.damage * starLevel;
    this.lastAttackTime = 0;
    this.isDead = false;

    this.updateDisplay();
    this.updateHealthBar();
  }

  updateDisplay() {
    if (this.emojiLabel) {
      this.emojiLabel.string = this.config.emoji;
    }
    if (this.starLabel) {
      this.starLabel.string = "⭐".repeat(this.starLevel);
    }
  }

  updateHealthBar() {
    if (!this.healthBar) return;

    const healthPercent = this.currentHealth / this.maxHealth;
    const barTransform = this.healthBar.getComponent(UITransform);
    if (barTransform) {
      barTransform.width = this.healthBarWidth * healthPercent;
    }

    // 根据血量改变颜色
    const sprite = this.healthBar.getComponent(Sprite);
    if (sprite) {
      sprite.color =
        healthPercent > 0.5 ? new Color(46, 204, 113) : new Color(231, 76, 60);
    }
  }

  update(deltaTime: number) {
    if (this.isDead) return;
    this.lastAttackTime += deltaTime * 1000;
  }

  canAttack(): boolean {
    if (this.config.attackSpeed === 0) return false;
    return this.lastAttackTime >= this.config.attackSpeed;
  }

  attack() {
    this.lastAttackTime = 0;
    // 攻击动画
    tween(this.node)
      .to(0.1, { scale: new Vec3(1.2, 1.2, 1) })
      .to(0.1, { scale: new Vec3(1, 1, 1) })
      .start();
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

  heal(amount: number) {
    this.currentHealth = Math.min(this.currentHealth + amount, this.maxHealth);
    this.updateHealthBar();
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

  setGridPosition(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  getGridPosition() {
    return {
      row: this.row,
      col: this.col,
      x: this.node.position.x,
      y: this.node.position.y,
    };
  }
}
