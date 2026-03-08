// 游戏实体类型定义

export interface Position {
  x: number;
  y: number;
  row?: number;
  col?: number;
}

export interface PlantConfig {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  health: number;
  damage: number;
  attackSpeed: number;
  attackRange: number;
  ability?: string;
  traits: string[];
  description: string;
}

export interface ZombieConfig {
  id: string;
  name: string;
  emoji: string;
  health: number;
  speed: number;
  damage: number;
  reward: number;
  ability?: string;
  description: string;
}

export interface ItemConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  effect: string;
  type: "consumable" | "equipment";
}

export interface TraitConfig {
  id: string;
  name: string;
  description: string;
  levels: number[];
  effects: string[];
}

export interface WaveConfig {
  round: number;
  zombies: Array<{
    type: string;
    count: number;
    delay: number;
  }>;
  interval: number;
}

export interface ShopPlant {
  config: PlantConfig;
  starLevel: number;
}

export interface GameState {
  sun: number;
  health: number;
  round: number;
  isBattlePhase: boolean;
}
