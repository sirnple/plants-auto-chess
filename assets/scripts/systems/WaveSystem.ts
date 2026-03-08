import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { WaveConfig } from '../types/GameTypes';
import { WAVES, GAME_CONFIG } from '../config/GameConfig';
import { Zombie } from '../entities/Zombie';
import { ZOMBIES } from '../config/GameConfig';

const { ccclass, property } = _decorator;

@ccclass('WaveSystem')
export class WaveSystem extends Component {
    @property(Prefab)
    zombiePrefab: Prefab | null = null;

    private currentRound: number = 1;
    private zombiesToSpawn: { type: string; delay: number }[] = [];
    private spawnTimer: number = 0;
    private isSpawning: boolean = false;
    private onSpawnZombieCallback: ((zombieNode: Node, row: number) => void) | null = null;
    private onWaveCompleteCallback: (() => void) | null = null;

    setOnSpawnZombie(callback: (zombieNode: Node, row: number) => void) {
        this.onSpawnZombieCallback = callback;
    }

    setOnWaveComplete(callback: () => void) {
        this.onWaveCompleteCallback = callback;
    }

    getRound(): number {
        return this.currentRound;
    }

    setRound(round: number) {
        this.currentRound = round;
    }

    isLastRound(): boolean {
        return this.currentRound >= GAME_CONFIG.TOTAL_ROUNDS;
    }

    isBossRound(): boolean {
        const wave = this.getCurrentWave();
        return wave?.isBoss || false;
    }

    private getCurrentWave(): WaveConfig | null {
        return WAVES.find(w => w.round === this.currentRound) || null;
    }

    startWave() {
        const wave = this.getCurrentWave();
        if (!wave) {
            if (this.onWaveCompleteCallback) {
                this.onWaveCompleteCallback();
            }
            return;
        }

        this.zombiesToSpawn = [];
        
        wave.zombies.forEach(z => {
            for (let i = 0; i < z.count; i++) {
                this.zombiesToSpawn.push({
                    type: z.type,
                    delay: z.delay || (i * 1.5)
                });
            }
        });

        this.spawnTimer = 0;
        this.isSpawning = true;
    }

    update(deltaTime: number) {
        if (!this.isSpawning || this.zombiesToSpawn.length === 0) {
            return;
        }

        this.spawnTimer += deltaTime;

        const toSpawn: number[] = [];
        
        this.zombiesToSpawn.forEach((z, index) => {
            if (this.spawnTimer >= z.delay) {
                toSpawn.push(index);
            }
        });

        toSpawn.reverse().forEach(index => {
            const zombieData = this.zombiesToSpawn.splice(index, 1)[0];
            this.spawnZombie(zombieData.type);
        });

        if (this.zombiesToSpawn.length === 0) {
            this.isSpawning = false;
        }
    }

    private spawnZombie(type: string) {
        const config = ZOMBIES[type];
        if (!config) return;

        const zombieNode = new Node('Zombie');
        const zombie = zombieNode.addComponent(Zombie);
        
        const row = Math.floor(Math.random() * GAME_CONFIG.GRID_ROWS);

        if (this.onSpawnZombieCallback) {
            this.onSpawnZombieCallback(zombieNode, row);
        }
    }

    isWaveComplete(): boolean {
        return !this.isSpawning && this.zombiesToSpawn.length === 0;
    }

    nextRound(): boolean {
        if (this.currentRound >= GAME_CONFIG.TOTAL_ROUNDS) {
            return false;
        }

        this.currentRound++;
        return true;
    }

    getRoundReward(): number {
        return GAME_CONFIG.BASE_ROUND_REWARD + this.currentRound * GAME_CONFIG.ROUND_REWARD_MULTIPLIER;
    }
}
