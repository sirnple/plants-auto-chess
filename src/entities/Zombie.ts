import Phaser from 'phaser'
import { ZombieConfig } from '../types/index'
import { Plant } from './Plant'

export class Zombie extends Phaser.GameObjects.Container {
  config: ZombieConfig
  currentHealth: number
  maxHealth: number
  isDead: boolean
  row: number
  isSlowed: boolean
  slowTimer: number
  hasJumped: boolean
  
  private healthBar: Phaser.GameObjects.Graphics
  private sprite: Phaser.GameObjects.Text
  private targetPlant: Plant | null = null
  private attackCooldown: number = 0
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: ZombieConfig,
    row: number
  ) {
    super(scene, x, y)
    
    this.config = config
    this.maxHealth = config.health
    this.currentHealth = config.health
    this.isDead = false
    this.row = row
    this.isSlowed = false
    this.slowTimer = 0
    this.hasJumped = false
    
    this.sprite = scene.add.text(0, 0, config.emoji, {
      fontSize: '52px',
    }).setOrigin(0.5)
    
    this.healthBar = scene.add.graphics()
    this.updateHealthBar()
    
    this.add([this.sprite, this.healthBar])
    scene.add.existing(this)
    
    this.scene.tweens.add({
      targets: this.sprite,
      y: -5,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }
  
  update(delta: number, plants: Plant[]): void {
    if (this.isDead) return
    
    if (this.isSlowed) {
      this.slowTimer -= delta
      if (this.slowTimer <= 0) {
        this.isSlowed = false
        this.sprite.setAlpha(1)
      }
    }
    
    this.targetPlant = this.findTargetPlant(plants)
    
    if (this.targetPlant) {
      this.attackCooldown += delta
      if (this.attackCooldown >= 1000) {
        this.attackCooldown = 0
        this.attack(this.targetPlant)
      }
    } else {
      this.move(delta)
    }
  }
  
  private findTargetPlant(plants: Plant[]): Plant | null {
    for (const plant of plants) {
      if (plant.row === this.row && !plant.isDead) {
        const distance = Math.abs(this.x - plant.x)
        if (distance < 40) {
          return plant
        }
      }
    }
    return null
  }
  
  private move(delta: number): void {
    let speed = this.config.speed
    if (this.isSlowed) {
      speed *= 0.5
    }
    
    this.x -= speed * delta * 0.1
    
    if (this.x < 50) {
      this.reachedBase()
    }
  }
  
  private attack(plant: Plant): void {
    const isDead = plant.takeDamage(this.config.damage)
    
    this.scene.tweens.add({
      targets: this.sprite,
      x: -10,
      duration: 100,
      yoyo: true,
    })
    
    if (isDead) {
      this.targetPlant = null
    }
  }
  
  takeDamage(amount: number): void {
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
    }
  }
  
  applySlow(duration: number): void {
    this.isSlowed = true
    this.slowTimer = duration
    this.sprite.setAlpha(0.7)
  }
  
  private updateHealthBar(): void {
    this.healthBar.clear()
    
    const barWidth = 50
    const barHeight = 6
    const healthPercent = this.currentHealth / this.maxHealth
    
    this.healthBar.fillStyle(0x2c3e50)
    this.healthBar.fillRect(-barWidth / 2, -35, barWidth, barHeight)
    
    this.healthBar.fillStyle(0xe74c3c)
    this.healthBar.fillRect(-barWidth / 2, -35, barWidth * healthPercent, barHeight)
  }
  
  private die(): void {
    this.isDead = true
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      angle: 90,
      duration: 500,
      onComplete: () => {
        this.destroy()
      },
    })
  }
  
  private reachedBase(): void {
    this.isDead = true
    this.scene.events.emit('zombieReachedBase', this)
    this.destroy()
  }
  
  getReward(): number {
    return this.config.reward
  }
}