export interface ItemConfig {
  id: string
  name: string
  emoji: string
  type: 'weapon' | 'armor' | 'accessory' | 'consumable'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  description: string
  effect: ItemEffect
}

export interface ItemEffect {
  type: 'damage' | 'attackSpeed' | 'health' | 'lifeSteal' | 'splash' | 'heal' | 'refresh'
  value: number
}

export const ITEMS: Record<string, ItemConfig> = {
  fertilizer: {
    id: 'fertilizer',
    name: '肥料',
    emoji: '💩',
    type: 'consumable',
    rarity: 'common',
    description: '恢复50点生命值',
    effect: { type: 'heal', value: 50 },
  },
  miracle_gro: {
    id: 'miracle_gro',
    name: '超级肥料',
    emoji: '✨',
    type: 'consumable',
    rarity: 'rare',
    description: '恢复100点生命值',
    effect: { type: 'heal', value: 100 },
  },
  shop_refresh: {
    id: 'shop_refresh',
    name: '刷新卷轴',
    emoji: '📜',
    type: 'consumable',
    rarity: 'common',
    description: '免费刷新商店',
    effect: { type: 'refresh', value: 1 },
  },
  peashooter_seed: {
    id: 'peashooter_seed',
    name: '豌豆种子',
    emoji: '🌱',
    type: 'weapon',
    rarity: 'common',
    description: '攻击力+5',
    effect: { type: 'damage', value: 5 },
  },
  sharp_spikes: {
    id: 'sharp_spikes',
    name: '锋利尖刺',
    emoji: '📌',
    type: 'weapon',
    rarity: 'rare',
    description: '攻击力+12',
    effect: { type: 'damage', value: 12 },
  },
  golden_pea: {
    id: 'golden_pea',
    name: '金豌豆',
    emoji: '🏆',
    type: 'weapon',
    rarity: 'epic',
    description: '攻击力+25',
    effect: { type: 'damage', value: 25 },
  },
  hardened_shell: {
    id: 'hardened_shell',
    name: '硬化外壳',
    emoji: '🐚',
    type: 'armor',
    rarity: 'common',
    description: '生命值+50',
    effect: { type: 'health', value: 50 },
  },
  iron_bark: {
    id: 'iron_bark',
    name: '铁树皮',
    emoji: '🛡️',
    type: 'armor',
    rarity: 'rare',
    description: '生命值+120',
    effect: { type: 'health', value: 120 },
  },
  diamond_leaf: {
    id: 'diamond_leaf',
    name: '钻石叶',
    emoji: '💎',
    type: 'armor',
    rarity: 'epic',
    description: '生命值+250',
    effect: { type: 'health', value: 250 },
  },
  coffee_bean: {
    id: 'coffee_bean',
    name: '咖啡豆',
    emoji: '☕',
    type: 'accessory',
    rarity: 'rare',
    description: '攻击速度+20%',
    effect: { type: 'attackSpeed', value: 0.2 },
  },
  vampire_fang: {
    id: 'vampire_fang',
    name: '吸血鬼之牙',
    emoji: '🧛',
    type: 'accessory',
    rarity: 'epic',
    description: '攻击附带15%吸血',
    effect: { type: 'lifeSteal', value: 0.15 },
  },
  splash_nut: {
    id: 'splash_nut',
    name: '爆裂坚果',
    emoji: '💥',
    type: 'accessory',
    rarity: 'legendary',
    description: '攻击附带溅射效果',
    effect: { type: 'splash', value: 0.3 },
  },
}

export function getRarityColor(rarity: string): number {
  switch (rarity) {
    case 'common':
      return 0xbdc3c7
    case 'rare':
      return 0x3498db
    case 'epic':
      return 0x9b59b6
    case 'legendary':
      return 0xf1c40f
    default:
      return 0xbdc3c7
  }
}

export function getDropRarity(): string {
  const roll = Math.random()
  if (roll < 0.03) return 'legendary'
  if (roll < 0.15) return 'epic'
  if (roll < 0.4) return 'rare'
  return 'common'
}

export function getRandomItem(): string {
  const rarity = getDropRarity()
  const itemsOfRarity = Object.values(ITEMS).filter(item => item.rarity === rarity)
  if (itemsOfRarity.length === 0) {
    const commonItems = Object.values(ITEMS).filter(item => item.rarity === 'common')
    return commonItems[Math.floor(Math.random() * commonItems.length)].id
  }
  return itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)].id
}
