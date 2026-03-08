import Phaser from 'phaser'

export class EffectSystem {
  private scene: Phaser.Scene
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }
  
  playAttackEffect(x: number, y: number, color: number = 0x3498db): void {
    const flash = this.scene.add.circle(x, y, 30, color, 0.8)
    
    this.scene.tweens.add({
      targets: flash,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy(),
    })
  }
  
  playHitEffect(x: number, y: number, color: number = 0xe74c3c): void {
    const particles = this.scene.add.particles(x, y, 'projectile', {
      speed: { min: 100, max: 200 },
      scale: { start: 0.8, end: 0 },
      lifespan: 300,
      quantity: 8,
      tint: color,
      emitting: false,
    })
    
    particles.explode()
    
    this.scene.time.delayedCall(300, () => particles.destroy())
  }
  
  playDeathEffect(x: number, y: number, isPlant: boolean = false): void {
    const color = isPlant ? 0x2ecc71 : 0xe74c3c
    
    const particles = this.scene.add.particles(x, y, 'projectile', {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 15,
      tint: color,
      emitting: false,
    })
    
    particles.explode()
    
    const ring = this.scene.add.circle(x, y, 10, color, 0.5)
    
    this.scene.tweens.add({
      targets: ring,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 400,
      onComplete: () => ring.destroy(),
    })
    
    this.scene.time.delayedCall(500, () => particles.destroy())
  }
  
  playMergeEffect(x: number, y: number, starLevel: number): void {
    const color = starLevel === 2 ? 0x3498db : 0xf1c40f
    
    const glow = this.scene.add.circle(x, y, 40, color, 0.3)
    
    this.scene.tweens.add({
      targets: glow,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => glow.destroy(),
    })
    
    const particles = this.scene.add.particles(x, y, 'sun', {
      speed: { min: 150, max: 300 },
      scale: { start: 0.8, end: 0 },
      lifespan: 800,
      quantity: 20,
      tint: color,
      emitting: false,
    })
    
    particles.explode()
    
    const stars = this.scene.add.text(x, y - 50, '⭐'.repeat(starLevel), {
      fontSize: '32px',
    }).setOrigin(0.5)
    
    this.scene.tweens.add({
      targets: stars,
      y: y - 100,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => stars.destroy(),
    })
    
    this.scene.time.delayedCall(800, () => particles.destroy())
  }
  
  playDamageNumber(x: number, y: number, damage: number, isCrit: boolean = false): void {
    const text = this.scene.add.text(x, y, damage.toString(), {
      fontSize: isCrit ? '32px' : '24px',
      color: isCrit ? '#e74c3c' : '#ffffff',
      fontFamily: 'Microsoft YaHei',
      fontStyle: isCrit ? 'bold' : 'normal',
    }).setOrigin(0.5)
    
    this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    })
    
    if (isCrit) {
      this.scene.tweens.add({
        targets: text,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 200,
        yoyo: true,
      })
    }
  }
  
  playHealEffect(x: number, y: number, amount: number): void {
    const particles = this.scene.add.particles(x, y, 'sun', {
      speed: { min: 30, max: 80 },
      scale: { start: 0.5, end: 0 },
      lifespan: 600,
      quantity: 10,
      tint: 0x2ecc71,
      emitting: false,
    })
    
    particles.explode()
    
    const text = this.scene.add.text(x, y, `+${amount}`, {
      fontSize: '24px',
      color: '#2ecc71',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)
    
    this.scene.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    })
    
    this.scene.time.delayedCall(600, () => particles.destroy())
  }
  
  playSunCollectEffect(x: number, y: number, targetX: number, targetY: number): void {
    const sun = this.scene.add.image(x, y, 'sun')
    
    this.scene.tweens.add({
      targets: sun,
      x: targetX,
      y: targetY,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        sun.destroy()
      },
    })
  }
  
  playShakeEffect(intensity: number = 0.01, duration: number = 200): void {
    this.scene.cameras.main.shake(duration, intensity)
  }
  
  playTrailEffect(x: number, y: number, color: number = 0x3498db): void {
    const trail = this.scene.add.circle(x, y, 5, color, 0.5)
    
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 300,
      onComplete: () => trail.destroy(),
    })
  }
  
  playFreezeEffect(x: number, y: number): void {
    const frost = this.scene.add.circle(x, y, 35, 0x74b9ff, 0.5)
    
    this.scene.tweens.add({
      targets: frost,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 400,
      onComplete: () => frost.destroy(),
    })
  }
  
  playExplosionEffect(x: number, y: number, radius: number = 100): void {
    const explosion = this.scene.add.circle(x, y, 10, 0xe74c3c, 0.8)
    
    this.scene.tweens.add({
      targets: explosion,
      scaleX: radius / 10,
      scaleY: radius / 10,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => explosion.destroy(),
    })
    
    const particles = this.scene.add.particles(x, y, 'projectile', {
      speed: { min: 200, max: 400 },
      scale: { start: 1.5, end: 0 },
      lifespan: 400,
      quantity: 20,
      tint: 0xe74c3c,
      emitting: false,
    })
    
    particles.explode()
    
    this.scene.time.delayedCall(400, () => particles.destroy())
    
    this.playShakeEffect(0.02, 300)
  }
  
  playLevelUpEffect(x: number, y: number): void {
    const rays = this.scene.add.graphics()
    rays.lineStyle(3, 0xf1c40f, 0.8)
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const endX = x + Math.cos(angle) * 80
      const endY = y + Math.sin(angle) * 80
      rays.lineBetween(x, y, endX, endY)
    }
    
    this.scene.tweens.add({
      targets: rays,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 600,
      ease: 'Power2',
      onComplete: () => rays.destroy(),
    })
  }
}
