import { PlantConfig, ZombieConfig, TraitConfig, ItemConfig } from '../types/GameTypes';

export const PLANTS: Record<string, PlantConfig> = {
    sunflower: {
        id: 'sunflower',
        name: '向日葵',
        emoji: '🌻',
        cost: 2,
        health: 80,
        damage: 0,
        attackSpeed: 3,
        type: 'producer',
        traits: ['SUN'],
        special: { type: 'generate_sun', value: 5 },
        unlockRound: 1
    },
    peashooter: {
        id: 'peashooter',
        name: '豌豆射手',
        emoji: '🌱',
        cost: 1,
        health: 100,
        damage: 15,
        attackSpeed: 1.5,
        type: 'shooter',
        traits: ['PEASHOOTER'],
        special: null,
        unlockRound: 1
    },
    wall_nut: {
        id: 'wall_nut',
        name: '坚果墙',
        emoji: '🥜',
        cost: 2,
        health: 300,
        damage: 0,
        attackSpeed: 0,
        type: 'tank',
        traits: ['DEFENSE'],
        special: null,
        unlockRound: 1
    },
    snow_pea: {
        id: 'snow_pea',
        name: '寒冰射手',
        emoji: '❄️',
        cost: 2,
        health: 100,
        damage: 12,
        attackSpeed: 1.5,
        type: 'shooter',
        traits: ['PEASHOOTER', 'ICE'],
        special: { type: 'slow', value: 0.5 },
        unlockRound: 2
    },
    cherry_bomb: {
        id: 'cherry_bomb',
        name: '樱桃炸弹',
        emoji: '🍒',
        cost: 3,
        health: 50,
        damage: 200,
        attackSpeed: 0,
        type: 'explosive',
        traits: ['EXPLOSIVE'],
        special: { type: 'death_explosion', value: 200 },
        unlockRound: 3
    },
    repeater: {
        id: 'repeater',
        name: '双发射手',
        emoji: '🌿',
        cost: 3,
        health: 120,
        damage: 15,
        attackSpeed: 1.5,
        type: 'shooter',
        traits: ['PEASHOOTER'],
        special: { type: 'double_shot', value: 2 },
        unlockRound: 3
    },
    twin_sunflower: {
        id: 'twin_sunflower',
        name: '双子葵',
        emoji: '🌼',
        cost: 4,
        health: 100,
        damage: 0,
        attackSpeed: 3,
        type: 'producer',
        traits: ['SUN'],
        special: { type: 'generate_sun', value: 10 },
        unlockRound: 4
    },
    jalapeno: {
        id: 'jalapeno',
        name: '火爆辣椒',
        emoji: '🌶️',
        cost: 4,
        health: 80,
        damage: 150,
        attackSpeed: 0,
        type: 'explosive',
        traits: ['EXPLOSIVE', 'FIRE'],
        special: { type: 'row_explosion', value: 150 },
        unlockRound: 5
    },
    tall_nut: {
        id: 'tall_nut',
        name: '高坚果',
        emoji: '🌰',
        cost: 4,
        health: 500,
        damage: 0,
        attackSpeed: 0,
        type: 'tank',
        traits: ['DEFENSE'],
        special: null,
        unlockRound: 6
    },
    threepeater: {
        id: 'threepeater',
        name: '三线射手',
        emoji: '🎋',
        cost: 4,
        health: 140,
        damage: 15,
        attackSpeed: 1.4,
        type: 'shooter',
        traits: ['PEASHOOTER'],
        special: { type: 'triple_row', value: 3 },
        unlockRound: 7
    },
    melon_pult: {
        id: 'melon_pult',
        name: '西瓜投手',
        emoji: '🍉',
        cost: 5,
        health: 150,
        damage: 40,
        attackSpeed: 2.5,
        type: 'shooter',
        traits: ['PEASHOOTER', 'EXPLOSIVE'],
        special: { type: 'splash', value: 40 },
        unlockRound: 8
    },
    squash: {
        id: 'squash',
        name: '倭瓜',
        emoji: '🎃',
        cost: 3,
        health: 100,
        damage: 150,
        attackSpeed: 0,
        type: 'explosive',
        traits: ['EXPLOSIVE'],
        special: { type: 'melee_explosion', value: 150 },
        unlockRound: 9
    },
    torchwood: {
        id: 'torchwood',
        name: '火炬树桩',
        emoji: '🔥',
        cost: 3,
        health: 150,
        damage: 0,
        attackSpeed: 0,
        type: 'support',
        traits: ['FIRE'],
        special: { type: 'boost_damage', value: 0.5 },
        unlockRound: 10
    },
    cactus: {
        id: 'cactus',
        name: '仙人掌',
        emoji: '🌵',
        cost: 3,
        health: 120,
        damage: 20,
        attackSpeed: 1.8,
        type: 'shooter',
        traits: ['PEASHOOTER'],
        special: { type: 'pierce', value: 1 },
        unlockRound: 11
    },
    cob_cannon: {
        id: 'cob_cannon',
        name: '玉米加农炮',
        emoji: '🌽',
        cost: 6,
        health: 200,
        damage: 100,
        attackSpeed: 6,
        type: 'shooter',
        traits: ['PEASHOOTER', 'EXPLOSIVE'],
        special: { type: 'global_damage', value: 100 },
        unlockRound: 14
    },
    marigold: {
        id: 'marigold',
        name: '金盏花',
        emoji: '🌸',
        cost: 3,
        health: 90,
        damage: 0,
        attackSpeed: 0,
        type: 'producer',
        traits: ['SUN'],
        special: { type: 'kill_sun', value: 3 },
        unlockRound: 12
    },
    pumpkin: {
        id: 'pumpkin',
        name: '南瓜头',
        emoji: '🥧',
        cost: 3,
        health: 250,
        damage: 0,
        attackSpeed: 0,
        type: 'tank',
        traits: ['DEFENSE'],
        special: { type: 'overlay', value: 250 },
        unlockRound: 13
    },
    doom_shroom: {
        id: 'doom_shroom',
        name: '毁灭菇',
        emoji: '🍄',
        cost: 6,
        health: 100,
        damage: 500,
        attackSpeed: 0,
        type: 'explosive',
        traits: ['EXPLOSIVE'],
        special: { type: 'mega_explosion', value: 500 },
        unlockRound: 15
    }
};

export const ZOMBIES: Record<string, ZombieConfig> = {
    normal: {
        id: 'normal',
        name: '普通僵尸',
        emoji: '🧟',
        health: 80,
        damage: 10,
        speed: 0.3,
        reward: 5,
        special: null,
        firstAppear: 1
    },
    cone: {
        id: 'cone',
        name: '路障僵尸',
        emoji: '🧟‍♂️',
        health: 160,
        damage: 10,
        speed: 0.25,
        reward: 8,
        special: null,
        firstAppear: 3
    },
    bucket: {
        id: 'bucket',
        name: '铁桶僵尸',
        emoji: '🪣',
        health: 240,
        damage: 12,
        speed: 0.2,
        reward: 12,
        special: null,
        firstAppear: 5
    },
    fast: {
        id: 'fast',
        name: '跑酷僵尸',
        emoji: '🏃',
        health: 60,
        damage: 8,
        speed: 0.6,
        reward: 6,
        special: { type: 'fast', value: 2 },
        firstAppear: 4
    },
    pole_vault: {
        id: 'pole_vault',
        name: '撑杆跳僵尸',
        emoji: '🤸',
        health: 120,
        damage: 15,
        speed: 0.5,
        reward: 10,
        special: { type: 'jump', value: 1 },
        firstAppear: 7
    },
    catapult: {
        id: 'catapult',
        name: '投石车僵尸',
        emoji: '🎯',
        health: 150,
        damage: 20,
        speed: 0.15,
        reward: 15,
        special: { type: 'ranged', value: 20 },
        firstAppear: 9
    },
    gargantuar: {
        id: 'gargantuar',
        name: '巨人僵尸',
        emoji: '👹',
        health: 600,
        damage: 50,
        speed: 0.12,
        reward: 30,
        special: { type: 'boss', value: 1 },
        firstAppear: 10
    },
    zomboss: {
        id: 'zomboss',
        name: '僵王博士',
        emoji: '🤖',
        health: 2000,
        damage: 100,
        speed: 0,
        reward: 100,
        special: { type: 'final_boss', value: 1 },
        firstAppear: 20
    }
};

export const TRAITS: Record<string, TraitConfig> = {
    SUN: {
        id: 'SUN',
        name: '光合作用',
        thresholds: [2, 4],
        effects: ['每回合+3阳光', '每回合+8阳光']
    },
    PEASHOOTER: {
        id: 'PEASHOOTER',
        name: '神射手',
        thresholds: [2, 3, 5],
        effects: ['攻速+15%', '攻速+35%', '攻速+60%']
    },
    DEFENSE: {
        id: 'DEFENSE',
        name: '铜墙铁壁',
        thresholds: [2, 3, 4],
        effects: ['血量+20%', '血量+40%', '血量+60%']
    },
    EXPLOSIVE: {
        id: 'EXPLOSIVE',
        name: '爆裂火花',
        thresholds: [2, 3],
        effects: ['爆炸伤害+25%', '爆炸伤害+50%']
    },
    ICE: {
        id: 'ICE',
        name: '寒冰之心',
        thresholds: [2],
        effects: ['20%概率冻结1秒']
    },
    FIRE: {
        id: 'FIRE',
        name: '熊熊烈火',
        thresholds: [2, 3],
        effects: ['火焰伤害+20%', '火焰伤害+40%']
    },
    SUPPORT: {
        id: 'SUPPORT',
        name: '后勤保障',
        thresholds: [2],
        effects: ['辅助效果+50%']
    }
};

export const ITEMS: Record<string, ItemConfig> = {
    basic_sword: {
        id: 'basic_sword',
        name: '铁剑',
        emoji: '⚔️',
        type: 'weapon',
        rarity: 'common',
        effect: { damage: 10 },
        dropRate: 0.6
    },
    basic_armor: {
        id: 'basic_armor',
        name: '铁甲',
        emoji: '🛡️',
        type: 'armor',
        rarity: 'common',
        effect: { health: 30 },
        dropRate: 0.6
    },
    rare_sword: {
        id: 'rare_sword',
        name: '精钢剑',
        emoji: '🗡️',
        type: 'weapon',
        rarity: 'rare',
        effect: { damage: 25 },
        dropRate: 0.25
    },
    epic_sword: {
        id: 'epic_sword',
        name: '烈焰剑',
        emoji: '🔥',
        type: 'weapon',
        rarity: 'epic',
        effect: { damage: 50, special: 'fire' },
        dropRate: 0.12
    },
    legendary_sword: {
        id: 'legendary_sword',
        name: '圣剑',
        emoji: '✨',
        type: 'weapon',
        rarity: 'legendary',
        effect: { damage: 100, special: 'holy' },
        dropRate: 0.03
    }
};

export const GAME_CONFIG = {
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 800,
    GRID_START_X: 50,
    GRID_START_Y: 100,
    GRID_ROWS: 5,
    GRID_COLS: 8,
    CELL_SIZE: 70,
    BENCH_SIZE: 8,
    SHOP_SIZE: 5,
    INITIAL_SUN: 100,
    INITIAL_HEALTH: 20,
    SHOP_REFRESH_COST: 2,
    STAR_MULTIPLIER: 1.5,
    MAX_STAR_LEVEL: 4,
    MERGE_COUNT: 3,
    TOTAL_ROUNDS: 20,
    BASE_ROUND_REWARD: 20,
    ROUND_REWARD_MULTIPLIER: 2
};
