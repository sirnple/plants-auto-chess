import { _decorator, Component, director, EventTarget } from "cc";
import { GameEvent, GAME_CONFIG } from "../config/GameConstants";
import { ZOMBIES } from "../config/GameConfig";

const { ccclass, property } = _decorator;

interface WaveZombie {
  type: string;
  count: number;
  delay: number;
}

interface WaveData {
  zombies: WaveZombie[];
  interval: number;
}

@ccclass("WaveManager")
export class WaveManager extends Component {
  eventTarget: EventTarget = new EventTarget();

  private currentRound: number = 1;
  private waveData: WaveData[] = [];
  private activeZombies: number = 0;
  private isWaveActive: boolean = false;
  private spawnTimer: number = 0;
  private waveTimer: number = 0;
  private currentWaveZombies: Array<{ type: string; spawnTime: number }> = [];

  onLoad() {
    this.generateWaveData();
  }

  generateWaveData() {
    this.waveData = [];

    for (let round = 1; round <= GAME_CONFIG.MAX_ROUNDS; round++) {
      const zombies: WaveZombie[] = [];
      const difficulty = Math.floor(round / 3) + 1;

      if (round <= 5) {
        zombies.push({ type: "normal", count: 3 + round, delay: 2000 });
        if (round >= 3) {
          zombies.push({
            type: "cone",
            count: Math.floor(round / 2),
            delay: 3000,
          });
        }
      } else if (round <= 10) {
        zombies.push({ type: "normal", count: 5 + round, delay: 1500 });
        zombies.push({
          type: "cone",
          count: 2 + Math.floor(round / 3),
          delay: 2500,
        });
        if (round >= 8) {
          zombies.push({
            type: "bucket",
            count: Math.floor(round / 4),
            delay: 4000,
          });
        }
      } else if (round <= 15) {
        zombies.push({ type: "normal", count: 4 + round, delay: 1200 });
        zombies.push({
          type: "cone",
          count: 3 + Math.floor(round / 3),
          delay: 2000,
        });
        zombies.push({
          type: "bucket",
          count: 1 + Math.floor(round / 5),
          delay: 3500,
        });
        zombies.push({
          type: "runner",
          count: Math.floor(round / 4),
          delay: 2500,
        });
      } else {
        zombies.push({ type: "normal", count: 3 + round, delay: 1000 });
        zombies.push({
          type: "cone",
          count: 3 + Math.floor(round / 2),
          delay: 1500,
        });
        zombies.push({
          type: "bucket",
          count: 2 + Math.floor(round / 4),
          delay: 2500,
        });
        zombies.push({
          type: "runner",
          count: Math.floor(round / 3),
          delay: 2000,
        });
        zombies.push({
          type: "pole_vaulter",
          count: Math.floor(round / 6),
          delay: 4000,
        });
      }

      if (round === GAME_CONFIG.MAX_ROUNDS) {
        zombies.push({ type: "zomboss", count: 1, delay: 5000 });
      } else if (round % 5 === 0) {
        zombies.push({
          type: "gargantuar",
          count: Math.floor(round / 10) + 1,
          delay: 6000,
        });
      }

      this.waveData.push({
        zombies,
        interval: 10000 - round * 300,
      });
    }
  }

  startRound(round: number) {
    this.currentRound = round;
    this.isWaveActive = true;
    this.activeZombies = 0;
    this.spawnTimer = 0;
    this.waveTimer = 0;

    this.prepareWaveZombies();
  }

  prepareWaveZombies() {
    this.currentWaveZombies = [];
    const wave = this.waveData[this.currentRound - 1];

    if (!wave) return;

    let currentTime = 0;
    for (const zombieGroup of wave.zombies) {
      for (let i = 0; i < zombieGroup.count; i++) {
        this.currentWaveZombies.push({
          type: zombieGroup.type,
          spawnTime: currentTime + i * zombieGroup.delay,
        });
      }
      currentTime += zombieGroup.count * zombieGroup.delay + 1000;
    }

    this.currentWaveZombies.sort((a, b) => a.spawnTime - b.spawnTime);
  }

  update(deltaTime: number, zombieCount: number) {
    if (!this.isWaveActive) return;

    this.spawnTimer += deltaTime * 1000;
    this.waveTimer += deltaTime * 1000;

    this.spawnZombies();

    if (this.currentWaveZombies.length === 0 && zombieCount === 0) {
      this.endWave();
    }
  }

  spawnZombies() {
    while (
      this.currentWaveZombies.length > 0 &&
      this.currentWaveZombies[0].spawnTime <= this.spawnTimer
    ) {
      const zombie = this.currentWaveZombies.shift();
      if (zombie) {
        const row = Math.floor(Math.random() * 5);
        this.eventTarget.emit("spawnZombie", zombie.type, row);
        this.activeZombies++;
      }
    }
  }

  endWave() {
    this.isWaveActive = false;
    this.eventTarget.emit("waveComplete");
  }

  stop() {
    this.isWaveActive = false;
  }

  isActive(): boolean {
    return this.isWaveActive;
  }

  getRemainingZombies(): number {
    return this.currentWaveZombies.length;
  }
}
