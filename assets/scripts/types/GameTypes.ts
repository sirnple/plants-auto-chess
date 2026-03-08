export interface PlantConfig {
    id: string;
    name: string;
    emoji: string;
    cost: number;
    health: number;
    damage: number;
    attackSpeed: number;
    type?: string;
    traits: string[];
    special?: { type: string; value: number | string } | null;
    unlockRound: number;
}

export interface ZombieConfig {
    id: string;
    name: string;
    emoji: string;
    health: number;
    damage: number;
    speed: number;
    reward: number;
    special?: { type: string; value: number } | null;
    firstAppear: number;
}

export interface TraitConfig {
    id: string;
    name: string;
    thresholds: number[];
    effects: string[];
}

export interface ItemConfig {
    id: string;
    name: string;
    emoji: string;
    type: 'weapon' | 'armor' | 'accessory' | 'consumable';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    effect: {
        health?: number;
        damage?: number;
        attackSpeed?: number;
        special?: string;
    };
    dropRate: number;
}

export interface WaveConfig {
    round: number;
    zombies: {
        type: string;
        count: number;
        delay?: number;
    }[];
    isBoss?: boolean;
}

export interface PlantData {
    config: PlantConfig;
    starLevel: number;
    currentHealth: number;
    maxHealth: number;
    damage: number;
    row: number;
    col: number;
    benchIndex: number;
}

export interface ZombieData {
    config: ZombieConfig;
    currentHealth: number;
    maxHealth: number;
    row: number;
    x: number;
    isSlowed: boolean;
    slowTimer: number;
}

export interface ProjectileData {
    type: string;
    damage: number;
    x: number;
    y: number;
    targetRow: number;
    speed: number;
    isIce: boolean;
    owner: any;
}

export interface ShopSlot {
    plant: PlantConfig | null;
    isLocked: boolean;
}

export interface GameState {
    sun: number;
    baseHealth: number;
    round: number;
    isBattlePhase: boolean;
    isGameOver: boolean;
    isVictory: boolean;
    unlockedPlants: string[];
    bench: (PlantData | null)[];
    shop: ShopSlot[];
    deployedPlants: PlantData[];
}

export interface TraitStatus {
    traitId: string;
    count: number;
    activeLevel: number;
}

export enum GameEvent {
    ZOMBIE_KILLED = 'zombieKilled',
    SUN_GENERATED = 'sunGenerated',
    ZOMBIE_REACHED_BASE = 'zombieReachedBase',
    PLANT_DIED = 'plantDied',
    ROUND_START = 'roundStart',
    ROUND_END = 'roundEnd',
    GAME_OVER = 'gameOver',
    GAME_WIN = 'gameWin',
    PLANT_MERGED = 'plantMerged',
    PLANT_PURCHASED = 'plantPurchased',
    SHOP_REFRESHED = 'shopRefreshed',
}

export interface UILayout {
    CANVAS_WIDTH: number;
    CANVAS_HEIGHT: number;
    GRID_ROWS: number;
    GRID_COLS: number;
    CELL_SIZE: number;
    GRID_START_X: number;
    GRID_START_Y: number;
    BENCH_SIZE: number;
    SHOP_SIZE: number;
}
