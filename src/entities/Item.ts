import Phaser from 'phaser'
import { ItemConfig } from '../config/index.js'
import { Plant } from './Plant'

export class Item extends Phaser.GameObjects.Container {
  config: ItemConfig
  equipped: boolean = false
  equippedTo: Plant | null = null
  
  private sprite: Phaser.GameObjects.Text
  private glow: Phaser.GameObjects.Graphics
  
  constructor(scene: Phaser.Scene, x: number, y: number, config: ItemConfig) {
    super(scene, x, y)
    
    this.config = config
    
    this.glow = scene.add.graphics()
    this.updateGlow()
    
    this.sprite = scene.add.text(0, 0, config.emoji, {
      fontSize: '36px',
    }).setOrigin(0.5)
    
    this.add([this.glow, this.sprite])
    scene.add.existing(this)
    
    this.setSize(50, 50)
    this.setInteractive({ useHandCursor: true })
  }
  
  private updateGlow(): void {
    this.glow.clear()
    const color = this.getRarityColor()
    this.glow.lineStyle(3, color, 0.8)
    this.glow.strokeCircle(0, 0, 28)
  }
  
  private getRarityColor(): number {
    switch (this.config.rarity) {
      case 'common':
        return 0xbdc3c7
      case 'rare':
        return 0x3498db
      case 'epic':
        return 0x9b59b6
      case 'legendary':
        return 0xf1c40f
      default:
        return 0xbdc3c7
    }
  }
  
  equip(plant: Plant): boolean {
    if (this.config.type === 'consumable') {
      return this.useConsumable(plant)
    }
    
    if (this.equipped) {
      this.unequip()
    }
    
    this.equipped = true
    this.equippedTo = plant
    
    this.applyEffect(plant)
    
    this.setVisible(false)
    
    return true
  }
  
  unequip(): void {
    if (!this.equipped || !this.equippedTo) return
    
    this.removeEffect(this.equippedTo)
    
    this.equipped = false
    this.equippedTo = null
    this.setVisible(true)
  }
  
  private useConsumable(plant: Plant): boolean {
    switch (this.config.effect.type) {
      case 'heal':
        plant.heal(this.config.effect.value)
        this.playHealEffect()
        return true
      default:
        return false
    }
  }
  
  private applyEffect(plant: Plant): void {
    const effect = this.config.effect
    
    switch (effect.type) {
      case 'damage':
        plant.damage += effect.value
        break
      case 'attackSpeed':
        if (plant.config.attackSpeed > 0) {
          plant.config.attackSpeed *= (1 - effect.value)
        }
        break
      case 'health':
        plant.maxHealth += effect.value
        plant.currentHealth += effect.value
        break
    }
  }
  
  private removeEffect(plant: Plant): void {
    const effect = this.config.effect
    
    switch (effect.type) {
      case 'damage':
        plant.damage -= effect.value
        break
      case 'attackSpeed':
        if (plant.config.attackSpeed > 0) {
          plant.config.attackSpeed /= (1 - effect.value)
        }
        break
      case 'health':
        plant.maxHealth -= effect.value
        plant.currentHealth = Math.min(plant.currentHealth, plant.maxHealth)
        break
    }
  }
  
  private playHealEffect(): void {
    const particles = this.scene.add.particles(this.x, this.y, 'sun', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      quantity: 10,
      tint: 0x2ecc71,
    })
    
    this.scene.time.delayedCall(500, () => {
      particles.destroy()
    })
  }
  
  destroy(fromScene?: boolean): void {
    if (this.equipped) {
      this.unequip()
    }
    super.destroy(fromScene)
  }
}
