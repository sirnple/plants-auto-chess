import Phaser from 'phaser'
import { Plant } from '../entities/index.js'

export class MergeSystem {
  private scene: Phaser.Scene
  private bench: (Plant | null)[]
  private maxStars: number = 4

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.bench = Array(8).fill(null)
  }

  canAddToBench(plant: Plant): boolean {
    if (this.hasSpace()) return true

    const tempBench = [...this.bench]
    const emptyIndex = tempBench.findIndex(slot => slot === null)
    if (emptyIndex === -1) return false

    tempBench[emptyIndex] = plant

    const groups: Record<string, number> = {}
    tempBench.forEach((p) => {
      if (p && p.starLevel < this.maxStars) {
        const key = `${p.config.id}_${p.starLevel}`
        groups[key] = (groups[key] || 0) + 1
      }
    })

    return Object.values(groups).some(count => count >= 3)
  }

  addToBench(plant: Plant): number {
    const emptyIndex = this.bench.findIndex(slot => slot === null)
    if (emptyIndex === -1) return -1

    this.bench[emptyIndex] = plant

    const result = this.checkAndMerge()

    if (result.merged && result.index !== undefined) {
      return result.index
    }

    return emptyIndex
  }
  
  removeFromBench(index: number): Plant | null {
    const plant = this.bench[index]
    this.bench[index] = null
    return plant
  }
  
  checkAndMerge(): { merged: boolean; newPlant?: Plant; index?: number } {
    let anyMerged = false
    let lastMergedIndex: number | undefined
    let lastNewPlant: Plant | undefined

    let canContinue = true
    while (canContinue) {
      const groups: Record<string, number[]> = {}

      this.bench.forEach((plant, index) => {
        if (plant && plant.starLevel < this.maxStars) {
          const key = `${plant.config.id}_${plant.starLevel}`
          if (!groups[key]) groups[key] = []
          groups[key].push(index)
        }
      })

      let foundMerge = false
      for (const key in groups) {
        const indices = groups[key]
        if (indices.length >= 3) {
          const mergeIndices = indices.slice(0, 3)
          const plant = this.bench[mergeIndices[0]]

          for (const index of mergeIndices) {
            this.bench[index]?.destroy()
            this.bench[index] = null
          }

          const newPlant = new Plant(
            this.scene,
            0,
            0,
            plant!.config,
            plant!.starLevel + 1
          )

          this.bench[mergeIndices[0]] = newPlant

          this.playMergeEffect(mergeIndices[0])

          anyMerged = true
          lastMergedIndex = mergeIndices[0]
          lastNewPlant = newPlant
          foundMerge = true
          break
        }
      }

      if (!foundMerge) {
        canContinue = false
      }
    }

    if (anyMerged) {
      return {
        merged: true,
        newPlant: lastNewPlant,
        index: lastMergedIndex,
      }
    }

    return { merged: false }
  }
  
  private playMergeEffect(index: number): void {
    const plant = this.bench[index]
    if (!plant) return
    
    this.scene.tweens.add({
      targets: plant,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      yoyo: true,
      ease: 'Power2',
    })
    
    const particles = this.scene.add.particles(plant.x, plant.y, 'sun', {
      speed: { min: 100, max: 200 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      quantity: 10,
      tint: 0xffd700,
    })
    
    this.scene.time.delayedCall(500, () => {
      particles.destroy()
    })
  }
  
  getBenchState(): (Plant | null)[] {
    return [...this.bench]
  }
  
  isBenchFull(): boolean {
    return this.bench.every(slot => slot !== null)
  }
  
  hasSpace(): boolean {
    return this.bench.some(slot => slot === null)
  }
  
  getEmptySlots(): number {
    return this.bench.filter(slot => slot === null).length
  }
}