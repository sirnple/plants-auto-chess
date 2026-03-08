// 游戏常量配置

export const GAME_CONFIG = {
  // 游戏设置
  MAX_ROUNDS: 20,
  INITIAL_SUN: 100,
  INITIAL_HEALTH: 20,

  // 战场网格
  GRID: {
    ROWS: 5,
    COLS: 8,
    CELL_WIDTH: 90,
    CELL_HEIGHT: 90,
    START_X: 80,
    START_Y: 120,
  },

  // 商店设置
  SHOP: {
    SLOTS: 5,
    REFRESH_COST: 2,
  },

  // 备战区设置
  BENCH: {
    SLOTS: 8,
  },

  // 合成设置
  MERGE: {
    STARS_TO_UPGRADE: 3,
  },
};

// 游戏事件
export enum GameEvent {
  SUN_CHANGED = "sun_changed",
  HEALTH_CHANGED = "health_changed",
  ROUND_CHANGED = "round_changed",
  BATTLE_START = "battle_start",
  BATTLE_END = "battle_end",
  ZOMBIE_KILLED = "zombie_killed",
  SUN_GENERATED = "sun_generated",
  PLANT_DEPLOYED = "plant_deployed",
  PLANT_REMOVED = "plant_removed",
  SHOP_REFRESHED = "shop_refreshed",
  ITEM_DROPPED = "item_dropped",
  GAME_OVER = "game_over",
  GAME_WIN = "game_win",
}

// 拖拽状态
export enum DragState {
  IDLE = "idle",
  DRAGGING = "dragging",
  VALID_DROP = "valid_drop",
  INVALID_DROP = "invalid_drop",
}
