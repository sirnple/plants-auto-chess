import { WaveConfig } from '../types/GameTypes';

export const WAVES: WaveConfig[] = [
    {
        round: 1,
        zombies: [
            { type: 'normal', count: 3 }
        ]
    },
    {
        round: 2,
        zombies: [
            { type: 'normal', count: 4 }
        ]
    },
    {
        round: 3,
        zombies: [
            { type: 'normal', count: 3 },
            { type: 'cone', count: 1 }
        ]
    },
    {
        round: 4,
        zombies: [
            { type: 'normal', count: 3 },
            { type: 'cone', count: 2 },
            { type: 'fast', count: 1 }
        ]
    },
    {
        round: 5,
        zombies: [
            { type: 'cone', count: 3 },
            { type: 'fast', count: 2 },
            { type: 'bucket', count: 1 }
        ]
    },
    {
        round: 6,
        zombies: [
            { type: 'normal', count: 2 },
            { type: 'cone', count: 2 },
            { type: 'bucket', count: 2 }
        ]
    },
    {
        round: 7,
        zombies: [
            { type: 'fast', count: 3 },
            { type: 'bucket', count: 2 },
            { type: 'pole_vault', count: 1 }
        ]
    },
    {
        round: 8,
        zombies: [
            { type: 'cone', count: 4 },
            { type: 'bucket', count: 3 },
            { type: 'pole_vault', count: 2 }
        ]
    },
    {
        round: 9,
        zombies: [
            { type: 'bucket', count: 3 },
            { type: 'pole_vault', count: 2 },
            { type: 'catapult', count: 1 }
        ]
    },
    {
        round: 10,
        zombies: [
            { type: 'bucket', count: 4 },
            { type: 'pole_vault', count: 2 },
            { type: 'gargantuar', count: 1 }
        ],
        isBoss: true
    },
    {
        round: 11,
        zombies: [
            { type: 'fast', count: 5 },
            { type: 'bucket', count: 4 },
            { type: 'catapult', count: 2 }
        ]
    },
    {
        round: 12,
        zombies: [
            { type: 'pole_vault', count: 4 },
            { type: 'bucket', count: 4 },
            { type: 'catapult', count: 2 }
        ]
    },
    {
        round: 13,
        zombies: [
            { type: 'fast', count: 6 },
            { type: 'pole_vault', count: 3 },
            { type: 'gargantuar', count: 1 }
        ]
    },
    {
        round: 14,
        zombies: [
            { type: 'bucket', count: 6 },
            { type: 'catapult', count: 3 },
            { type: 'gargantuar', count: 1 }
        ]
    },
    {
        round: 15,
        zombies: [
            { type: 'fast', count: 8 },
            { type: 'pole_vault', count: 4 },
            { type: 'gargantuar', count: 2 }
        ],
        isBoss: true
    },
    {
        round: 16,
        zombies: [
            { type: 'bucket', count: 8 },
            { type: 'catapult', count: 4 },
            { type: 'gargantuar', count: 2 }
        ]
    },
    {
        round: 17,
        zombies: [
            { type: 'fast', count: 10 },
            { type: 'pole_vault', count: 5 },
            { type: 'catapult', count: 3 },
            { type: 'gargantuar', count: 2 }
        ]
    },
    {
        round: 18,
        zombies: [
            { type: 'bucket', count: 10 },
            { type: 'catapult', count: 5 },
            { type: 'gargantuar', count: 3 }
        ]
    },
    {
        round: 19,
        zombies: [
            { type: 'fast', count: 12 },
            { type: 'pole_vault', count: 6 },
            { type: 'catapult', count: 4 },
            { type: 'gargantuar', count: 3 }
        ],
        isBoss: true
    },
    {
        round: 20,
        zombies: [
            { type: 'fast', count: 10 },
            { type: 'pole_vault', count: 5 },
            { type: 'catapult', count: 5 },
            { type: 'gargantuar', count: 4 },
            { type: 'zomboss', count: 1 }
        ],
        isBoss: true
    }
];
