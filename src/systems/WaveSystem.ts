import { WaveConfig } from '../types/index'
import { WAVES } from '../config/index'

export class WaveSystem {
  private currentRound: number = 1
  private currentWave: WaveConfig | null = null
  private zombiesToSpawn: { type: string; row: number; delay: number }[] = []
  private spawnTimer: number = 0
  private isActive: boolean = false
  private onSpawnZombie: (type: string, row: number) => void
  private onWaveComplete: () => void
  
  constructor(
    onSpawnZombie: (type: string, row: number) => void,
    onWaveComplete: () => void
  ) {
    this.onSpawnZombie = onSpawnZombie
    this.onWaveComplete = onWaveComplete
  }
  
  startRound(round: number): void {
    this.currentRound = round
    this.currentWave = WAVES.find(w => w.round === round) || null
    
    if (!this.currentWave) {
      this.generateRandomWave(round)
    }
    
    this.prepareZombies()
    this.isActive = true
    this.spawnTimer = 0
  }
  
  private generateRandomWave(round: number): void {
    const zombieCount = Math.floor(3 + round * 1.5)
    const availableTypes = this.getAvailableZombieTypes(round)
    
    this.currentWave = {
      round,
      zombies: [{
        type: availableTypes[Math.floor(Math.random() * availableTypes.length)],
        count: zombieCount,
        spawnInterval: Math.max(1500, 3000 - round * 100),
      }],
    }
  }
  
  private getAvailableZombieTypes(round: number): string[] {
    const types = ['normal']
    if (round >= 3) types.push('cone')
    if (round >= 5) types.push('bucket')
    if (round >= 4) types.push('fast')
    if (round >= 7) types.push('pole_vault')
    if (round >= 9) types.push('catapult')
    if (round >= 10) types.push('gargantuar')
    if (round >= 20) types.push('zomboss')
    return types
  }
  
  private prepareZombies(): void {
    this.zombiesToSpawn = []
    
    if (!this.currentWave) return
    
    let totalDelay = 0
    
    for (const zombieGroup of this.currentWave.zombies) {
      for (let i = 0; i < zombieGroup.count; i++) {
        this.zombiesToSpawn.push({
          type: zombieGroup.type,
          row: Math.floor(Math.random() * 5),
          delay: totalDelay,
        })
        totalDelay += zombieGroup.spawnInterval
      }
    }
    
    this.zombiesToSpawn.sort((a, b) => a.delay - b.delay)
  }
  
  update(delta: number, currentZombieCount: number): void {
    if (!this.isActive) return
    
    this.spawnTimer += delta
    
    for (let i = this.zombiesToSpawn.length - 1; i >= 0; i--) {
      const zombie = this.zombiesToSpawn[i]
      if (this.spawnTimer >= zombie.delay) {
        this.onSpawnZombie(zombie.type, zombie.row)
        this.zombiesToSpawn.splice(i, 1)
      }
    }
    
    if (this.zombiesToSpawn.length === 0 && currentZombieCount === 0) {
      this.isActive = false
      this.onWaveComplete()
    }
  }
  
  isRoundComplete(): boolean {
    return !this.isActive && this.zombiesToSpawn.length === 0
  }
  
  getCurrentRound(): number {
    return this.currentRound
  }
  
  getRemainingZombies(): number {
    return this.zombiesToSpawn.length
  }
  
  getTotalZombiesInWave(): number {
    if (!this.currentWave) return 0
    return this.currentWave.zombies.reduce((sum, z) => sum + z.count, 0)
  }
  
  isBossRound(): boolean {
    return this.currentWave?.isBoss || false
  }
}