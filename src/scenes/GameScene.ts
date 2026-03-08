import Phaser from 'phaser'
import { BattleSystem, ShopSystem, MergeSystem, WaveSystem, SynergySystem } from '../systems/index.js'
import { Plant } from '../entities/index.js'
import { ZOMBIES, GAME_CONFIG } from '../config/index.js'

export class GameScene extends Phaser.Scene {
  private sun: number = 100
  private health: number = 20
  private round: number = 1
  private isBattlePhase: boolean = false

  private battleSystem!: BattleSystem
  private shopSystem!: ShopSystem
  private mergeSystem!: MergeSystem
  private waveSystem!: WaveSystem
  private synergySystem!: SynergySystem

  private sunText!: Phaser.GameObjects.Text
  private healthText!: Phaser.GameObjects.Text
  private roundText!: Phaser.GameObjects.Text
  private infoPanel: Phaser.GameObjects.Container | null = null
  private selectedPlant: Plant | null = null
  private selectedBenchIndex: number = -1
  private showInfoMode: boolean = false

  constructor() {
    super({ key: 'GameScene' })
  }

  create(): void {
    this.createBackground()
    this.createSystems()
    this.createUI()
    this.setupEventListeners()
  }

  update(_time: number, delta: number): void {
    this.battleSystem.update(delta)
    this.waveSystem.update(delta, this.battleSystem.getZombieCount())
  }

  private createBackground(): void {
    const graphics = this.add.graphics()
    graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1)
    graphics.fillRect(0, 0, 1200, 800)
  }

  private createSystems(): void {
    this.battleSystem = new BattleSystem(this, () => {
      this.takeDamage()
    })

    this.shopSystem = new ShopSystem(this)
    this.mergeSystem = new MergeSystem(this)
    this.synergySystem = new SynergySystem()

    this.waveSystem = new WaveSystem(
      (type, row) => {
        this.spawnZombie(type, row)
      },
      () => {
        this.onWaveComplete()
      }
    )

    this.events.on('zombieKilled', (reward: number) => {
      this.addSun(reward)
    })

    this.events.on('sunGenerated', (amount: number) => {
      this.addSun(amount)
    })
  }

  private createUI(): void {
    this.createStatusBar()
    this.createShopUI()
    this.createSynergyUI()
    this.createBenchUI()
    this.createControlButtons()
    this.createInfoToggle()
  }

  private createStatusBar(): void {
    const barY = 30
    const barHeight = 50

    this.add.rectangle(600, barY, 1200, barHeight, 0x2c3e50, 0.95)

    this.sunText = this.add.text(150, barY, `☀️ ${this.sun}`, {
      fontSize: '24px',
      color: '#f1c40f',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    this.healthText = this.add.text(350, barY, `❤️ ${this.health}`, {
      fontSize: '24px',
      color: '#e74c3c',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    this.roundText = this.add.text(550, barY, `🎯 回合 ${this.round}`, {
      fontSize: '24px',
      color: '#3498db',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    this.add.text(900, barY, '💡 点击植物查看信息', {
      fontSize: '14px',
      color: '#95a5a6',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)
  }

  private createShopUI(): void {
    const shopX = 980
    const shopY = 200

    this.add.rectangle(shopX, shopY, 200, 280, 0x8e44ad, 0.9)
      .setStrokeStyle(2, 0x9b59b6)

    this.add.text(shopX, shopY - 120, '🛒 商店', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    const shopState = this.shopSystem.getShopState()

    for (let i = 0; i < shopState.length; i++) {
      const plant = shopState[i]
      const y = shopY - 70 + i * 50

      if (plant) {
        const slot = this.add.rectangle(shopX, y, 180, 45, 0x6c3483)
        slot.setStrokeStyle(2, 0x8e44ad)
        slot.setInteractive({ useHandCursor: true })

        this.add.text(shopX - 70, y, plant.emoji, {
          fontSize: '28px',
        }).setOrigin(0.5)

        this.add.text(shopX - 25, y - 8, plant.name, {
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: 'Microsoft YaHei',
        }).setOrigin(0, 0.5)

        this.add.text(shopX - 25, y + 10, `☀️${plant.cost}`, {
          fontSize: '12px',
          color: '#f1c40f',
          fontFamily: 'Microsoft YaHei',
        }).setOrigin(0, 0.5)

        slot.on('pointerdown', () => this.buyPlant(i))
      }
    }
  }

  private createSynergyUI(): void {
    const synergyX = 980
    const synergyY = 480

    this.add.rectangle(synergyX, synergyY, 200, 200, 0x2c3e50, 0.9)
      .setStrokeStyle(2, 0x34495e)

    this.add.text(synergyX, synergyY - 85, '🔗 羁绊', {
      fontSize: '18px',
      color: '#ffd700',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    const plants = this.battleSystem.getAllPlants()
    const traits = this.synergySystem.calculateTraits(plants)

    let y = synergyY - 55
    for (const trait of traits.slice(0, 5)) {
      this.add.text(synergyX, y, `${trait.name} ${trait.level}/${trait.maxLevel}`, {
        fontSize: '13px',
        color: '#7bed9f',
        fontFamily: 'Microsoft YaHei',
      }).setOrigin(0.5)
      y += 28
    }

    if (traits.length === 0) {
      this.add.text(synergyX, synergyY, '部署植物\n激活羁绊', {
        fontSize: '13px',
        color: '#95a5a6',
        fontFamily: 'Microsoft YaHei',
        align: 'center',
      }).setOrigin(0.5)
    }
  }

  private createBenchUI(): void {
    const benchY = 720
    const startX = 80
    const slotSize = 90

    this.add.rectangle(400, benchY, 720, 100, 0x34495e, 0.9)

    this.add.text(400, benchY - 40, '备战区 (点击选中，拖到场)', {
      fontSize: '14px',
      color: '#ecf0f1',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    const benchState = this.mergeSystem.getBenchState()

    for (let i = 0; i < 8; i++) {
      const x = startX + i * slotSize + slotSize / 2
      const plant = benchState[i]

      const slot = this.add.rectangle(x, benchY + 10, 80, 70,
        this.selectedBenchIndex === i ? 0xf1c40f : 0x2c3e50)
      slot.setStrokeStyle(2, this.selectedBenchIndex === i ? 0xffd700 : 0x34495e)

      if (plant) {
        slot.setInteractive({ useHandCursor: true })

        this.add.text(x, benchY + 5, plant.config.emoji, {
          fontSize: '36px',
        }).setOrigin(0.5)

        this.add.text(x + 25, benchY - 10, '⭐'.repeat(plant.starLevel), {
          fontSize: '10px',
        }).setOrigin(0.5)

        slot.on('pointerdown', () => this.selectBenchPlant(i))
      }
    }
  }

  private createControlButtons(): void {
    const btnX = 980

    const refreshBtn = this.add.rectangle(btnX, 620, 180, 40, 0x3498db)
    refreshBtn.setInteractive({ useHandCursor: true })

    this.add.text(btnX, 620, '🔄 刷新 (2☀️)', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    refreshBtn.on('pointerdown', () => this.refreshShop())

    const startBtn = this.add.rectangle(btnX, 670, 180, 40, 0xe74c3c)
    startBtn.setInteractive({ useHandCursor: true })

    this.add.text(btnX, 670, '⚔️ 开始战斗', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    startBtn.on('pointerdown', () => this.startBattle())
  }

  private createInfoToggle(): void {
    const toggle = this.add.rectangle(750, 30, 120, 30, 0x2c3e50)
    toggle.setStrokeStyle(2, 0x3498db)
    toggle.setInteractive({ useHandCursor: true })

    const text = this.add.text(750, 30, 'ℹ️ 信息模式', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    toggle.on('pointerdown', () => {
      this.showInfoMode = !this.showInfoMode
      toggle.setFillStyle(this.showInfoMode ? 0x3498db : 0x2c3e50)
      text.setColor(this.showInfoMode ? '#ffffff' : '#95a5a6')
    })
  }

  private setupEventListeners(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isBattlePhase) return

      const gridPos = this.battleSystem.getGridPosition(pointer.x, pointer.y)
      if (gridPos) {
        if (this.showInfoMode) {
          this.handleInfoClick(gridPos.row, gridPos.col)
        } else {
          this.handleGridClick(gridPos.row, gridPos.col)
        }
      }
    })
  }

  private handleInfoClick(row: number, col: number): void {
    const plant = this.battleSystem.getPlantAt(row, col)
    if (plant) {
      const pos = this.battleSystem.getPixelPosition(row, col)
      this.showEntityInfo(plant, pos.x, pos.y)
    }
  }

  private handleGridClick(row: number, col: number): void {
    const existingPlant = this.battleSystem.getPlantAt(row, col)

    if (this.selectedPlant && !existingPlant) {
      const success = this.battleSystem.deployPlant(this.selectedPlant, row, col)
      if (success) {
        this.mergeSystem.removeFromBench(this.selectedBenchIndex)
        this.selectedPlant = null
        this.selectedBenchIndex = -1
        this.createBenchUI()
        this.createSynergyUI()
      }
    } else if (existingPlant && !this.selectedPlant) {
      const plant = this.battleSystem.removePlant(row, col)
      if (plant) {
        const index = this.mergeSystem.addToBench(plant)
        if (index !== -1) {
          this.createBenchUI()
          this.createSynergyUI()
        } else {
          this.battleSystem.deployPlant(plant, row, col)
        }
      }
    }
  }

  private selectBenchPlant(index: number): void {
    const benchState = this.mergeSystem.getBenchState()
    const plant = benchState[index]

    if (!plant) return

    if (this.showInfoMode) {
      this.showEntityInfo(plant, 80 + index * 90 + 45, 730, index)
      return
    }

    if (this.selectedBenchIndex === index) {
      this.selectedBenchIndex = -1
      this.selectedPlant = null
    } else {
      this.selectedBenchIndex = index
      this.selectedPlant = plant
    }

    this.createBenchUI()
  }

  private buyPlant(index: number): void {
    const result = this.shopSystem.buy(index, this.sun)
    if (!result) return

    if (!this.mergeSystem.canAddToBench(result.plant)) {
      this.sun += result.cost
      return
    }

    this.sun -= result.cost
    this.mergeSystem.addToBench(result.plant)

    this.updateSunDisplay()
    this.createShopUI()
    this.createBenchUI()
  }

  private refreshShop(): void {
    if (this.sun >= GAME_CONFIG.SHOP.REFRESH_COST) {
      this.sun -= GAME_CONFIG.SHOP.REFRESH_COST
      this.shopSystem.refresh()
      this.updateSunDisplay()
      this.createShopUI()
    }
  }

  private startBattle(): void {
    if (this.isBattlePhase) return

    this.isBattlePhase = true
    this.battleSystem.startBattle()
    this.waveSystem.startRound(this.round)

    this.synergySystem.calculateTraits(this.battleSystem.getAllPlants())
    this.synergySystem.applyTraitEffects(this.battleSystem.getAllPlants())
  }

  private spawnZombie(type: string, row: number): void {
    const zombieConfig = ZOMBIES[type]
    if (zombieConfig) {
      this.battleSystem.spawnZombie(zombieConfig, row)
    }
  }

  private onWaveComplete(): void {
    this.isBattlePhase = false
    this.battleSystem.endBattle()

    this.round++
    this.addSun(20 + this.round * 2)

    this.shopSystem.unlockPlantsForRound(this.round)
    this.shopSystem.refresh()

    this.updateSunDisplay()
    this.updateRoundDisplay()
    this.createShopUI()

    if (this.round > GAME_CONFIG.MAX_ROUNDS) {
      this.gameWin()
    }
  }

  private takeDamage(): void {
    this.health--
    this.updateHealthDisplay()

    this.cameras.main.shake(200, 0.01)

    if (this.health <= 0) {
      this.gameOver()
    }
  }

  private addSun(amount: number): void {
    this.sun += amount
    this.updateSunDisplay()
  }

  private updateSunDisplay(): void {
    this.sunText.setText(`☀️ ${this.sun}`)
  }

  private updateHealthDisplay(): void {
    this.healthText.setText(`❤️ ${this.health}`)
  }

  private updateRoundDisplay(): void {
    this.roundText.setText(`🎯 回合 ${this.round}`)
  }

  private showEntityInfo(plant: any, x: number, y: number, benchIndex?: number): void {
    if (this.infoPanel) {
      this.infoPanel.destroy()
      this.infoPanel = null
    }

    const panelX = Math.min(Math.max(x, 150), 1050)
    const panelY = y - 120

    this.infoPanel = this.add.container(panelX, panelY)

    const bg = this.add.rectangle(0, 0, 180, 160, 0x2c3e50, 0.98)
    bg.setStrokeStyle(2, 0xf1c40f)

    const nameText = this.add.text(0, -60, `${plant.config.emoji} ${plant.config.name}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    const starText = this.add.text(0, -40, '⭐'.repeat(plant.starLevel), {
      fontSize: '14px',
    }).setOrigin(0.5)

    const healthText = this.add.text(0, -18, `❤️ ${Math.round(plant.currentHealth)}/${Math.round(plant.maxHealth)}`, {
      fontSize: '13px',
      color: '#e74c3c',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    const damageText = this.add.text(0, 2, `⚔️ ${Math.round(plant.damage)}`, {
      fontSize: '13px',
      color: '#e17055',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    let infoY = 22
    if (plant.config.attackSpeed > 0) {
      this.add.text(0, infoY, `🎯 ${plant.config.attackRange}格 ${(1000 / plant.config.attackSpeed).toFixed(1)}/s`, {
        fontSize: '11px',
        color: '#3498db',
        fontFamily: 'Microsoft YaHei',
      }).setOrigin(0.5)
      infoY += 20
    }

    const sellPrice = Math.ceil(plant.config.cost * plant.starLevel * 0.7)
    const sellBtn = this.add.rectangle(0, infoY + 15, 100, 28, 0xe74c3c)
    sellBtn.setInteractive({ useHandCursor: true })

    this.add.text(0, infoY + 15, `卖出 +${sellPrice}`, {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    sellBtn.on('pointerdown', () => {
      this.sellPlant(plant, sellPrice, benchIndex)
      this.infoPanel?.destroy()
      this.infoPanel = null
    })

    sellBtn.on('pointerover', () => sellBtn.setFillStyle(0xc0392b))
    sellBtn.on('pointerout', () => sellBtn.setFillStyle(0xe74c3c))

    this.infoPanel.add([bg, nameText, starText, healthText, damageText, sellBtn])

    this.time.delayedCall(4000, () => {
      if (this.infoPanel) {
        this.infoPanel.destroy()
        this.infoPanel = null
      }
    })
  }

  private sellPlant(plant: any, price: number, benchIndex?: number): void {
    if (benchIndex !== undefined) {
      this.mergeSystem.removeFromBench(benchIndex)
    } else {
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 8; col++) {
          const p = this.battleSystem.getPlantAt(row, col)
          if (p === plant) {
            this.battleSystem.removePlant(row, col)
            break
          }
        }
      }
    }

    this.addSun(price)
    this.createBenchUI()
    this.createSynergyUI()

    const text = this.add.text(600, 300, `+${price}☀️`, {
      fontSize: '28px',
      color: '#f1c40f',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    this.tweens.add({
      targets: text,
      y: 250,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy(),
    })
  }

  private gameWin(): void {
    this.add.rectangle(600, 400, 500, 250, 0x000000, 0.9)

    this.add.text(600, 350, '🎉 胜利！', {
      fontSize: '40px',
      color: '#2ecc71',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    this.add.text(600, 420, `存活 ${this.round} 回合`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    const btn = this.add.rectangle(600, 480, 150, 40, 0x27ae60)
    btn.setInteractive({ useHandCursor: true })

    this.add.text(600, 480, '重新开始', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    btn.on('pointerdown', () => this.scene.restart())
  }

  private gameOver(): void {
    this.add.rectangle(600, 400, 500, 250, 0x000000, 0.9)

    this.add.text(600, 350, '💀 游戏结束', {
      fontSize: '40px',
      color: '#e74c3c',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    this.add.text(600, 420, `存活 ${this.round} 回合`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    const btn = this.add.rectangle(600, 480, 150, 40, 0xe74c3c)
    btn.setInteractive({ useHandCursor: true })

    this.add.text(600, 480, '重新开始', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Microsoft YaHei',
    }).setOrigin(0.5)

    btn.on('pointerdown', () => this.scene.restart())
  }
}