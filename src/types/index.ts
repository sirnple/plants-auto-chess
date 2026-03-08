export interface PlantConfig {
  id: string
  name: string
  emoji: string
  cost: number
  health: number
  damage: number
  attackSpeed: number
  attackRange: number
  ability?: string
  projectile?: string
  effect?: string
  traits: string[]
  description: string
}

export interface ZombieConfig {
  id: string
  name: string
  emoji: string
  health: number
  damage: number
  speed: number
  reward: number
  special?: string
}

export interface TraitConfig {
  id: string
  name: string
  description: string
  thresholds: number[]
  effects: TraitEffect[]
}

export interface TraitEffect {
  type: string
  value: number
}

export interface GameState {
  sun: number
  health: number
  round: number
  isBattlePhase: boolean
}

export interface Position {
  row: number
  col: number
  x: number
  y: number
}

export interface WaveConfig {
  round: number
  zombies: {
    type: string
    count: number
    spawnInterval: number
  }[]
  isBoss?: boolean
}