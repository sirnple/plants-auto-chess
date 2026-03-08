export interface WaveConfig {
  round: number
  zombies: {
    type: string
    count: number
    spawnInterval: number
  }[]
  isBoss?: boolean
}

export const WAVES: WaveConfig[] = [
  { round: 1, zombies: [{ type: 'normal', count: 3, spawnInterval: 3000 }] },
  { round: 2, zombies: [{ type: 'normal', count: 5, spawnInterval: 2500 }] },
  { 
    round: 3, 
    zombies: [
      { type: 'normal', count: 3, spawnInterval: 2000 },
      { type: 'cone', count: 1, spawnInterval: 4000 },
    ] 
  },
  { 
    round: 4, 
    zombies: [
      { type: 'normal', count: 4, spawnInterval: 2000 },
      { type: 'fast', count: 2, spawnInterval: 3000 },
    ] 
  },
  { 
    round: 5, 
    zombies: [
      { type: 'normal', count: 3, spawnInterval: 1800 },
      { type: 'cone', count: 2, spawnInterval: 3500 },
      { type: 'bucket', count: 1, spawnInterval: 5000 },
    ],
    isBoss: true,
  },
  { 
    round: 6, 
    zombies: [
      { type: 'fast', count: 4, spawnInterval: 2000 },
      { type: 'cone', count: 2, spawnInterval: 3000 },
    ] 
  },
  { 
    round: 7, 
    zombies: [
      { type: 'normal', count: 4, spawnInterval: 1500 },
      { type: 'pole_vault', count: 2, spawnInterval: 3500 },
      { type: 'bucket', count: 1, spawnInterval: 4500 },
    ] 
  },
  { 
    round: 8, 
    zombies: [
      { type: 'cone', count: 4, spawnInterval: 2000 },
      { type: 'fast', count: 3, spawnInterval: 2500 },
    ] 
  },
  { 
    round: 9, 
    zombies: [
      { type: 'normal', count: 5, spawnInterval: 1500 },
      { type: 'catapult', count: 1, spawnInterval: 6000 },
    ] 
  },
  { 
    round: 10, 
    zombies: [
      { type: 'bucket', count: 3, spawnInterval: 3000 },
      { type: 'gargantuar', count: 1, spawnInterval: 10000 },
    ],
    isBoss: true,
  },
  { 
    round: 11, 
    zombies: [
      { type: 'fast', count: 6, spawnInterval: 1500 },
      { type: 'pole_vault', count: 3, spawnInterval: 2500 },
    ] 
  },
  { 
    round: 12, 
    zombies: [
      { type: 'cone', count: 5, spawnInterval: 2000 },
      { type: 'catapult', count: 2, spawnInterval: 5000 },
    ] 
  },
  { 
    round: 13, 
    zombies: [
      { type: 'bucket', count: 4, spawnInterval: 2500 },
      { type: 'pole_vault', count: 3, spawnInterval: 3000 },
    ] 
  },
  { 
    round: 14, 
    zombies: [
      { type: 'fast', count: 8, spawnInterval: 1200 },
      { type: 'cone', count: 4, spawnInterval: 2000 },
    ] 
  },
  { 
    round: 15, 
    zombies: [
      { type: 'bucket', count: 5, spawnInterval: 2500 },
      { type: 'gargantuar', count: 1, spawnInterval: 8000 },
    ],
    isBoss: true,
  },
  { 
    round: 16, 
    zombies: [
      { type: 'catapult', count: 3, spawnInterval: 4000 },
      { type: 'pole_vault', count: 4, spawnInterval: 2500 },
    ] 
  },
  { 
    round: 17, 
    zombies: [
      { type: 'bucket', count: 6, spawnInterval: 2000 },
      { type: 'fast', count: 5, spawnInterval: 1800 },
    ] 
  },
  { 
    round: 18, 
    zombies: [
      { type: 'cone', count: 8, spawnInterval: 1500 },
      { type: 'catapult', count: 3, spawnInterval: 3500 },
    ] 
  },
  { 
    round: 19, 
    zombies: [
      { type: 'bucket', count: 7, spawnInterval: 1800 },
      { type: 'pole_vault', count: 5, spawnInterval: 2200 },
    ] 
  },
  { 
    round: 20, 
    zombies: [
      { type: 'gargantuar', count: 2, spawnInterval: 6000 },
      { type: 'zomboss', count: 1, spawnInterval: 15000 },
    ],
    isBoss: true,
  },
]