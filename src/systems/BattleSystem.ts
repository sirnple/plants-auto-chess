import Phaser from 'phaser'
import { Plant, Zombie, Projectile } from '../entities/index.js'
import { Position, ZombieConfig } from '../types/index.js'
import { GAME_CONFIG } from '../config/index.js'

export class BattleSystem {
  private scene: Phaser.Scene
  private plants: (Plant | null)[][]
  private zombies: Zombie[]
  private projectiles: Projectile[]
  private gridContainer!: Phaser.GameObjects.Container
  private isBattlePhase: boolean = false
  private onZombieReachedBase: () => void
  
  constructor(scene: Phaser.Scene, onZombieReachedBase: () => void) {
    this.scene = scene
    this.plants = Array(GAME_CONFIG.GRID.ROWS).fill(null).map(() => 
      Array(GAME_CONFIG.GRID.COLS).fill(null)
    )
    this.zombies = []
    this.projectiles = []
    this.onZombieReachedBase = onZombieReachedBase
    
    this.createGrid()
    
    this.scene.events.on('zombieReachedBase', () => {
      this.onZombieReachedBase()
    })
  }
  
  private createGrid(): void {
    this.gridContainer = this.scene.add.container(0, 0)
    
    for (let row = 0; row < GAME_CONFIG.GRID.ROWS; row++) {
      for (let col = 0; col < GAME_CONFIG.GRID.COLS; col++) {
        const x = GAME_CONFIG.GRID.OFFSET_X + col * GAME_CONFIG.GRID.CELL_SIZE + GAME_CONFIG.GRID.CELL_SIZE / 2
        const y = GAME_CONFIG.GRID.OFFSET_Y + row * GAME_CONFIG.GRID.CELL_SIZE + GAME_CONFIG.GRID.CELL_SIZE / 2
        
        const cell = this.scene.add.image(x, y, 'grid-cell')
        cell.setAlpha(0.2)
        this.gridContainer.add(cell)
      }
    }
  }
  
  update(delta: number): void {
    if (!this.isBattlePhase) return
    
    this.updatePlants(delta)
    this.updateZombies(delta)
    this.updateProjectiles(delta)
  }
  
  private updatePlants(delta: number): void {
    const allPlants = this.getAllPlants()
    
    for (const plant of allPlants) {
      plant.update(delta)
      
      if (plant.canAttack()) {
        const targets = this.findTargetsInRange(plant)
        if (targets.length > 0) {
          this.plantAttack(plant, targets[0])
        }
      }
      
      if (plant.config.ability === 'generateSun' && plant.lastAttackTime >= 3000) {
        plant.lastAttackTime = 0
        this.scene.events.emit('sunGenerated', 5 * plant.starLevel)
      }
    }
  }
  
  private updateZombies(delta: number): void {
    const allPlants = this.getAllPlants()
    
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const zombie = this.zombies[i]
      zombie.update(delta, allPlants)
      
      if (zombie.isDead) {
        this.zombies.splice(i, 1)
        this.scene.events.emit('zombieKilled', zombie.getReward())
      }
    }
  }
  
  private updateProjectiles(delta: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i]
      projectile.update(delta, this.zombies)
      
      if (projectile.isDead) {
        this.projectiles.splice(i, 1)
      }
    }
  }
  
  private findTargetsInRange(plant: Plant): Zombie[] {
    const targets: Zombie[] = []
    
    for (const zombie of this.zombies) {
      if (zombie.row === plant.row && !zombie.isDead) {
        const distance = (zombie.x - plant.x) / GAME_CONFIG.GRID.CELL_SIZE
        if (distance > 0 && distance <= plant.config.attackRange) {
          targets.push(zombie)
        }
      }
    }
    
    return targets.sort((a, b) => a.x - b.x)
  }
  
  private plantAttack(plant: Plant, _target: Zombie): void {
    plant.attack()
    
    const projectile = new Projectile(
      this.scene,
      plant.x,
      plant.y,
      plant.config.projectile || 'pea',
      plant.damage,
      plant.config.effect
    )
    projectile.setRow(plant.row)
    this.projectiles.push(projectile)
  }
  
  deployPlant(plant: Plant, row: number, col: number): boolean {
    if (this.plants[row][col]) return false
    
    const x = GAME_CONFIG.GRID.OFFSET_X + col * GAME_CONFIG.GRID.CELL_SIZE + GAME_CONFIG.GRID.CELL_SIZE / 2
    const y = GAME_CONFIG.GRID.OFFSET_Y + row * GAME_CONFIG.GRID.CELL_SIZE + GAME_CONFIG.GRID.CELL_SIZE / 2
    
    plant.x = x
    plant.y = y
    plant.setGridPosition(row, col)
    this.plants[row][col] = plant
    
    return true
  }
  
  removePlant(row: number, col: number): Plant | null {
    const plant = this.plants[row][col]
    if (plant) {
      this.plants[row][col] = null
    }
    return plant
  }
  
  spawnZombie(config: ZombieConfig, row: number): void {
    const x = GAME_CONFIG.GRID.OFFSET_X + GAME_CONFIG.GRID.COLS * GAME_CONFIG.GRID.CELL_SIZE + 50
    const y = GAME_CONFIG.GRID.OFFSET_Y + row * GAME_CONFIG.GRID.CELL_SIZE + GAME_CONFIG.GRID.CELL_SIZE / 2
    
    const zombie = new Zombie(this.scene, x, y, config, row)
    this.zombies.push(zombie)
  }
  
  startBattle(): void {
    this.isBattlePhase = true
  }
  
  endBattle(): void {
    this.isBattlePhase = false
    this.clearZombies()
    this.clearProjectiles()
  }
  
  private clearZombies(): void {
    for (const zombie of this.zombies) {
      zombie.destroy()
    }
    this.zombies = []
  }
  
  private clearProjectiles(): void {
    for (const projectile of this.projectiles) {
      projectile.destroy()
    }
    this.projectiles = []
  }
  
  getAllPlants(): Plant[] {
    const allPlants: Plant[] = []
    for (const row of this.plants) {
      for (const plant of row) {
        if (plant && !plant.isDead) {
          allPlants.push(plant)
        }
      }
    }
    return allPlants
  }
  
  getZombieCount(): number {
    return this.zombies.length
  }
  
  getPlantAt(row: number, col: number): Plant | null {
    return this.plants[row][col]
  }
  
  isPlantAt(row: number, col: number): boolean {
    return this.plants[row][col] !== null
  }
  
  getGridPosition(pixelX: number, pixelY: number): { row: number; col: number } | null {
    const col = Math.floor((pixelX - GAME_CONFIG.GRID.OFFSET_X) / GAME_CONFIG.GRID.CELL_SIZE)
    const row = Math.floor((pixelY - GAME_CONFIG.GRID.OFFSET_Y) / GAME_CONFIG.GRID.CELL_SIZE)
    
    if (row >= 0 && row < GAME_CONFIG.GRID.ROWS && col >= 0 && col < GAME_CONFIG.GRID.COLS) {
      return { row, col }
    }
    return null
  }
  
  getPixelPosition(row: number, col: number): Position {
    return {
      row,
      col,
      x: GAME_CONFIG.GRID.OFFSET_X + col * GAME_CONFIG.GRID.CELL_SIZE + GAME_CONFIG.GRID.CELL_SIZE / 2,
      y: GAME_CONFIG.GRID.OFFSET_Y + row * GAME_CONFIG.GRID.CELL_SIZE + GAME_CONFIG.GRID.CELL_SIZE / 2,
    }
  }
}