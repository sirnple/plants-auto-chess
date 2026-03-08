import Phaser from 'phaser'
import { Plant } from '../entities/index.js'
import { PlantConfig } from '../types/index.js'
import { PLANTS, GAME_CONFIG } from '../config/index.js'

export class ShopSystem {
  private scene: Phaser.Scene
  private shopSlots: (PlantConfig | null)[]
  private isLocked: boolean
  private unlockedPlants: string[]
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.shopSlots = Array(GAME_CONFIG.SHOP.SIZE).fill(null)
    this.isLocked = false
    this.unlockedPlants = ['sunflower', 'peashooter', 'wall_nut']
    
    this.refresh()
  }
  
  refresh(): void {
    if (this.isLocked) return
    
    const availablePlants = Object.values(PLANTS).filter(
      plant => this.unlockedPlants.includes(plant.id)
    )
    
    for (let i = 0; i < GAME_CONFIG.SHOP.SIZE; i++) {
      const randomPlant = availablePlants[Math.floor(Math.random() * availablePlants.length)]
      this.shopSlots[i] = randomPlant
    }
  }
  
  buy(index: number, sun: number): { plant: Plant; cost: number } | null {
    const plantConfig = this.shopSlots[index]
    if (!plantConfig) return null
    
    if (sun < plantConfig.cost) return null
    
    this.shopSlots[index] = null
    
    return {
      plant: new Plant(this.scene, 0, 0, plantConfig, 1),
      cost: plantConfig.cost,
    }
  }
  
  getShopState(): (PlantConfig | null)[] {
    return [...this.shopSlots]
  }
  
  isSlotEmpty(index: number): boolean {
    return this.shopSlots[index] === null
  }
  
  toggleLock(): boolean {
    this.isLocked = !this.isLocked
    return this.isLocked
  }
  
  isShopLocked(): boolean {
    return this.isLocked
  }
  
  unlockPlant(plantId: string): void {
    if (!this.unlockedPlants.includes(plantId)) {
      this.unlockedPlants.push(plantId)
    }
  }
  
  unlockPlantsForRound(round: number): void {
    const unlockMap: Record<number, string[]> = {
      2: ['snow_pea'],
      3: ['cherry_bomb', 'repeater'],
      4: ['twin_sunflower', 'fast'],
      5: ['bucket', 'jalapeno'],
      6: ['threepeater'],
      7: ['tall_nut', 'pole_vault'],
      8: ['melon_pult', 'torchwood'],
      9: ['catapult', 'magnet_shroom'],
      10: ['gargantuar', 'cactus'],
      11: ['pumpkin'],
      12: ['squash'],
      15: ['doom_shroom'],
      18: ['cob_cannon'],
    }
    
    const plantsToUnlock = unlockMap[round] || []
    for (const plantId of plantsToUnlock) {
      this.unlockPlant(plantId)
    }
  }
  
  getRefreshCost(): number {
    return GAME_CONFIG.SHOP.REFRESH_COST
  }
}