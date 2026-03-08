import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    const graphics = this.make.graphics({ x: 0, y: 0 })
    
    graphics.fillStyle(0x2ecc71)
    graphics.fillRect(0, 0, 64, 64)
    graphics.generateTexture('grass', 64, 64)
    
    graphics.clear()
    graphics.fillStyle(0xe74c3c)
    graphics.fillRect(0, 0, 64, 64)
    graphics.generateTexture('zombie', 64, 64)
    
    graphics.clear()
    graphics.fillStyle(0x3498db)
    graphics.fillCircle(8, 8, 8)
    graphics.generateTexture('projectile', 16, 16)
    
    graphics.clear()
    graphics.fillStyle(0xf1c40f)
    graphics.fillCircle(16, 16, 16)
    graphics.generateTexture('sun', 32, 32)

    graphics.clear()
    graphics.lineStyle(2, 0x34495e)
    graphics.strokeRect(0, 0, 70, 70)
    graphics.generateTexture('grid-cell', 70, 70)
  }

  create(): void {
    this.scene.start('MenuScene')
  }
}