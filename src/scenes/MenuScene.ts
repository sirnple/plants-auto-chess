import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  create(): void {
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    const title = this.add.text(width / 2, height / 3, '植物自走棋', {
      fontSize: '64px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei',
    })
    title.setOrigin(0.5)

    const subtitle = this.add.text(width / 2, height / 3 + 80, '融合金铲铲之战与植物大战僵尸的策略游戏', {
      fontSize: '24px',
      color: '#7bed9f',
      fontFamily: 'Microsoft YaHei',
    })
    subtitle.setOrigin(0.5)

    const startButton = this.add.rectangle(width / 2, height / 2 + 100, 200, 60, 0x27ae60)
    startButton.setInteractive({ useHandCursor: true })
    
    const startText = this.add.text(width / 2, height / 2 + 100, '开始游戏', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei',
    })
    startText.setOrigin(0.5)

    startButton.on('pointerover', () => {
      startButton.setFillStyle(0x2ecc71)
    })

    startButton.on('pointerout', () => {
      startButton.setFillStyle(0x27ae60)
    })

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene')
    })
  }
}