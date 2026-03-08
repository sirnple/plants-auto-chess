import Phaser from 'phaser'
import { PlantConfig, Position } from '../types/index'

export class Plant extends Phaser.GameObjects.Container {
  config: PlantConfig
  starLevel: number
  currentHealth: number
  maxHealth: number
  damage: number
  lastAttackTime: number
  isDead: boolean
  row: number
  col: number
  
  private healthBar: Phaser.GameObjects.Graphics
  private starText: Phaser.GameObjects.Text
  private sprite: Phaser.GameObjects.Text
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: PlantConfig,
    starLevel: number = 1
  ) {
    super(scene, x, y)
    
    this.config = config
    this.starLevel = starLevel
    this.maxHealth = config.health * Math.pow(1.5, starLevel - 1)
    this.currentHealth = this.maxHealth
    this.damage = config.damage * starLevel
    this.lastAttackTime = 0
    this.isDead = false
    this.row = -1
    this.col = -1
    
    this.sprite = scene.add.text(0, 0, config.emoji, {
      fontSize: '48px',
    }).setOrigin(0.5)
    
    this.starText = scene.add.text(20, -25, '⭐'.repeat(starLevel), {
      fontSize: '14px',
    }).setOrigin(0.5)
    
    this.healthBar = scene.add.graphics()
    this.updateHealthBar()
    
    this.add([this.sprite, this.starText, this.healthBar])
    scene.add.existing(this)
  }
  
  update(delta: number): void {
    if (this.isDead) return
    
    this.lastAttackTime += delta
    
    if (this.config.ability === 'generateSun' && this.lastAttackTime >= 3000) {
      this.lastAttackTime = 0
    }
  }
  
  canAttack(): boolean {
    if (this.config.attackSpeed === 0) return false
    return this.lastAttackTime >= this.config.attackSpeed
  }
  
  attack(): void {
    this.lastAttackTime = 0
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
    })
  }
  
  takeDamage(amount: number): boolean {
    this.currentHealth -= amount
    this.updateHealthBar()
    
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
    })
    
    if (this.currentHealth <= 0) {
      this.die()
      return true
    }
    return false
  }
  
  heal(amount: number): void {
    this.currentHealth = Math.min(this.currentHealth + amount, this.maxHealth)
    this.updateHealthBar()
  }
  
  private updateHealthBar(): void {
    this.healthBar.clear()
    
    const barWidth = 50
    const barHeight = 6
    const healthPercent = this.currentHealth / this.maxHealth
    
    this.healthBar.fillStyle(0x2c3e50)
    this.healthBar.fillRect(-barWidth / 2, 25, barWidth, barHeight)
    
    const color = healthPercent > 0.5 ? 0x2ecc71 : 0xe74c3c
    this.healthBar.fillStyle(color)
    this.healthBar.fillRect(-barWidth / 2, 25, barWidth * healthPercent, barHeight)
  }
  
  private die(): void {
    this.isDead = true
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 300,
      onComplete: () => {
        this.destroy()
      },
    })
  }
  
  setGridPosition(row: number, col: number): void {
    this.row = row
    this.col = col
  }
  
  getGridPosition(): Position {
    return {
      row: this.row,
      col: this.col,
      x: this.x,
      y: this.y,
    }
  }
}