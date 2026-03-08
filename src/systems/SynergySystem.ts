import { Plant } from '../entities/index.js'
import { TRAITS } from '../config/index.js'

export interface ActiveTrait {
  id: string
  name: string
  level: number
  maxLevel: number
  description: string
  effect: TraitEffect
}

export interface TraitEffect {
  type: string
  value: number
}

export class SynergySystem {
  private activeTraits: Map<string, ActiveTrait> = new Map()
  
  calculateTraits(plants: Plant[]): ActiveTrait[] {
    this.activeTraits.clear()
    
    const traitCounts: Record<string, number> = {}
    
    for (const plant of plants) {
      for (const traitId of plant.config.traits) {
        traitCounts[traitId] = (traitCounts[traitId] || 0) + 1
      }
    }
    
    for (const [traitId, count] of Object.entries(traitCounts)) {
      const traitConfig = TRAITS[traitId]
      if (!traitConfig) continue
      
      let level = 0
      for (let i = 0; i < traitConfig.thresholds.length; i++) {
        if (count >= traitConfig.thresholds[i]) {
          level = i + 1
        }
      }
      
      if (level > 0) {
        this.activeTraits.set(traitId, {
          id: traitId,
          name: traitConfig.name,
          level,
          maxLevel: traitConfig.thresholds.length,
          description: traitConfig.description,
          effect: traitConfig.effects[level - 1],
        })
      }
    }
    
    return Array.from(this.activeTraits.values())
  }
  
  applyTraitEffects(plants: Plant[]): void {
    for (const [traitId, activeTrait] of this.activeTraits) {
      const effect = activeTrait.effect
      
      for (const plant of plants) {
        if (plant.config.traits.includes(traitId)) {
          this.applyEffect(plant, effect)
        }
      }
    }
  }
  
  private applyEffect(plant: Plant, effect: TraitEffect): void {
    switch (effect.type) {
      case 'attack_speed':
        if (plant.config.attackSpeed > 0) {
          plant.config.attackSpeed *= (1 - effect.value)
        }
        break
      case 'health':
        plant.maxHealth *= (1 + effect.value)
        plant.currentHealth = plant.maxHealth
        break
      case 'damage':
        plant.damage *= (1 + effect.value)
        break
    }
  }
  
  getActiveTraits(): ActiveTrait[] {
    return Array.from(this.activeTraits.values())
  }
  
  hasTrait(traitId: string): boolean {
    return this.activeTraits.has(traitId)
  }
  
  getTraitLevel(traitId: string): number {
    return this.activeTraits.get(traitId)?.level || 0
  }
}