import Phaser from 'phaser'
import { Zombie } from './Zombie'

export class Projectile extends Phaser.GameObjects.Container {
  damage: number
  effect?: string
  isDead: boolean
  row: number
  speed: number = 5
  piercing: boolean
  hitZombies: Set<Zombie>
  
  private sprite: Phaser.GameObjects.Graphics
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: string,
    damage: number,
    effect?: string,
    piercing: boolean = false
  ) {
    super(scene, x, y)
    
    this.damage = damage
    this.effect = effect
    this.isDead = false
    this.row = -1
    this.piercing = piercing
    this.hitZombies = new Set()
    
    this.sprite = scene.add.graphics()
    this.drawProjectile(type)
    
    this.add(this.sprite)
    scene.add.existing(this)
  }
  
  private drawProjectile(type: string): void {
    this.sprite.clear()
    
    switch (type) {
      case 'pea':
        this.sprite.fillStyle(0x2ecc71)
        this.sprite.fillCircle(0, 0, 8)
        break
      case 'snow':
        this.sprite.fillStyle(0x74b9ff)
        this.sprite.fillCircle(0, 0, 10)
        this.sprite.lineStyle(2, 0xffffff)
        this.sprite.strokeCircle(0, 0, 10)
        break
      case 'spike':
        this.sprite.fillStyle(0x27ae60)
        this.sprite.beginPath()
        this.sprite.moveTo(10, 0)
        this.sprite.lineTo(-5, -5)
        this.sprite.lineTo(-5, 5)
        this.sprite.closePath()
        this.sprite.fillPath()
        break
      case 'melon':
        this.sprite.fillStyle(0xe74c3c)
        this.sprite.fillCircle(0, 0, 12)
        this.sprite.fillStyle(0x2ecc71)
        this.sprite.fillCircle(-3, -3, 3)
        this.sprite.fillCircle(4, 2, 3)
        break
      case 'corn':
        this.sprite.fillStyle(0xf1c40f)
        this.sprite.fillCircle(0, 0, 15)
        break
      default:
        this.sprite.fillStyle(0x3498db)
        this.sprite.fillCircle(0, 0, 8)
    }
  }
  
  update(delta: number, zombies: Zombie[]): void {
    if (this.isDead) return
    
    this.x += this.speed * delta * 0.1
    
    for (const zombie of zombies) {
      if (zombie.row === this.row && !zombie.isDead && !this.hitZombies.has(zombie)) {
        const distance = Math.abs(this.x - zombie.x)
        if (distance < 30) {
          this.hit(zombie)
          
          if (!this.piercing) {
            this.isDead = true
            this.destroy()
            return
          } else {
            this.hitZombies.add(zombie)
          }
        }
      }
    }
    
    if (this.x > 1200) {
      this.isDead = true
      this.destroy()
    }
  }
  
  private hit(zombie: Zombie): void {
    zombie.takeDamage(this.damage)
    
    if (this.effect === 'slow') {
      zombie.applySlow(3000)
    }
    
    this.createHitEffect()
  }
  
  private createHitEffect(): void {
    const particles = this.scene.add.particles(this.x, this.y, 'projectile', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      lifespan: 300,
      quantity: 5,
    })
    
    this.scene.time.delayedCall(300, () => {
      particles.destroy()
    })
  }
  
  setRow(row: number): void {
    this.row = row
  }
}