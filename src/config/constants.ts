export const GAME_CONFIG = {
  GRID: {
    ROWS: 5,
    COLS: 8,
    CELL_SIZE: 70,
    OFFSET_X: 50,
    OFFSET_Y: 120,
  },
  
  ECONOMY: {
    STARTING_SUN: 100,
    STARTING_HEALTH: 20,
    SHOP_REFRESH_COST: 2,
    ROUND_REWARD_BASE: 20,
  },
  
  SHOP: {
    SIZE: 5,
    REFRESH_COST: 2,
  },
  
  BENCH: {
    SIZE: 8,
  },
  
  MERGE: {
    REQUIRED_COUNT: 3,
    MAX_STAR: 3,
    STAR_SCALING: {
      HEALTH: 1.5,
      DAMAGE: 1.5,
    },
  },
  
  MAX_ROUNDS: 20,
  
  COLORS: {
    BACKGROUND: 0x1a1a2e,
    GRID: 0x34495e,
    PLANT: 0x2ecc71,
    ZOMBIE: 0xe74c3c,
    PROJECTILE: 0x3498db,
    SUN: 0xf1c40f,
    UI_BACKGROUND: 0x2c3e50,
  },
}