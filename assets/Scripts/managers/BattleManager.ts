import {
  _decorator,
  Component,
  Node,
  Vec3,
  Prefab,
  instantiate,
  Label,
  director,
  EventTarget,
} from "cc";
import { Plant } from "../entities/Plant";
import { Zombie } from "../entities/Zombie";
import { Projectile } from "../entities/Projectile";
import { GAME_CONFIG, GameEvent } from "../config/GameConstants";
import { PLANTS, ZOMBIES } from "../config/GameConfig";

const { ccclass, property } = _decorator;

@ccclass("BattleManager")
export class BattleManager extends Component {
  @property(Prefab)
  plantPrefab: Prefab = null;

  @property(Prefab)
  zombiePrefab: Prefab = null;

  @property(Prefab)
  projectilePrefab: Prefab = null;

  @property(Node)
  gridContainer: Node = null;

  @property(Node)
  plantsContainer: Node = null;

  @property(Node)
  zombiesContainer: Node = null;

  @property(Node)
  projectilesContainer: Node = null;

  eventTarget: EventTarget = new EventTarget();

  private grid: (Plant | null)[][] = [];
  private zombies: Zombie[] = [];
  private projectiles: Projectile[] = [];
  private isBattleActive: boolean = false;
  private onZombieReachEnd: (() => void) | null = null;

  onLoad() {
    this.initializeGrid();
  }

  initializeGrid() {
    this.grid = [];
    for (let row = 0; row < GAME_CONFIG.GRID.ROWS; row++) {
      this.grid[row] = [];
      for (let col = 0; col < GAME_CONFIG.GRID.COLS; col++) {
        this.grid[row][col] = null;
      }
    }
  }

  startBattle(onZombieReachEnd: () => void) {
    this.isBattleActive = true;
    this.onZombieReachEnd = onZombieReachEnd;
    this.eventTarget.emit(GameEvent.BATTLE_START);
  }

  endBattle() {
    this.isBattleActive = false;
    this.clearZombies();
    this.eventTarget.emit(GameEvent.BATTLE_END);
  }

  spawnZombie(zombieType: string, row: number) {
    const config = ZOMBIES[zombieType];
    if (!config) return;

    const zombieNode = instantiate(this.zombiePrefab);
    const zombie = zombieNode.getComponent(Zombie);

    if (zombie) {
      zombie.init(config, row);

      const startX = 1000;
      const startY = this.getRowY(row);
      zombieNode.setPosition(startX, startY, 0);

      this.zombiesContainer.addChild(zombieNode);
      this.zombies.push(zombie);
    }
  }

  deployPlant(plant: Plant, row: number, col: number): boolean {
    if (this.grid[row][col] !== null) return false;

    const pos = this.getGridPosition(row, col);
    plant.node.setPosition(pos.x, pos.y, 0);
    plant.setGridPosition(row, col);

    this.plantsContainer.addChild(plant.node);
    this.grid[row][col] = plant;

    this.eventTarget.emit(GameEvent.PLANT_DEPLOYED, { plant, row, col });
    return true;
  }

  removePlant(row: number, col: number): Plant | null {
    const plant = this.grid[row][col];
    if (!plant) return null;

    this.grid[row][col] = null;
    plant.node.removeFromParent();

    this.eventTarget.emit(GameEvent.PLANT_REMOVED, { plant, row, col });
    return plant;
  }

  getPlantAt(row: number, col: number): Plant | null {
    if (
      row < 0 ||
      row >= GAME_CONFIG.GRID.ROWS ||
      col < 0 ||
      col >= GAME_CONFIG.GRID.COLS
    ) {
      return null;
    }
    return this.grid[row][col];
  }

  getAllPlants(): Plant[] {
    const plants: Plant[] = [];
    for (let row = 0; row < GAME_CONFIG.GRID.ROWS; row++) {
      for (let col = 0; col < GAME_CONFIG.GRID.COLS; col++) {
        if (this.grid[row][col]) {
          plants.push(this.grid[row][col]);
        }
      }
    }
    return plants;
  }

  getGridPosition(row: number, col: number): Vec3 {
    const x =
      GAME_CONFIG.GRID.START_X +
      col * GAME_CONFIG.GRID.CELL_WIDTH +
      GAME_CONFIG.GRID.CELL_WIDTH / 2;
    const y =
      GAME_CONFIG.GRID.START_Y +
      row * GAME_CONFIG.GRID.CELL_HEIGHT +
      GAME_CONFIG.GRID.CELL_HEIGHT / 2;
    return new Vec3(x, y, 0);
  }

  getGridFromPosition(
    x: number,
    y: number,
  ): { row: number; col: number } | null {
    const col = Math.floor(
      (x - GAME_CONFIG.GRID.START_X) / GAME_CONFIG.GRID.CELL_WIDTH,
    );
    const row = Math.floor(
      (y - GAME_CONFIG.GRID.START_Y) / GAME_CONFIG.GRID.CELL_HEIGHT,
    );

    if (
      row >= 0 &&
      row < GAME_CONFIG.GRID.ROWS &&
      col >= 0 &&
      col < GAME_CONFIG.GRID.COLS
    ) {
      return { row, col };
    }
    return null;
  }

  update(deltaTime: number) {
    if (!this.isBattleActive) return;

    this.updateZombies(deltaTime);
    this.updatePlants(deltaTime);
    this.updateProjectiles(deltaTime);
    this.checkCollisions();
  }

  private updateZombies(deltaTime: number) {
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const zombie = this.zombies[i];
      if (!zombie || !zombie.node.isValid) {
        this.zombies.splice(i, 1);
        continue;
      }

      zombie.update(deltaTime);

      if (zombie.hasReachedEnd()) {
        if (this.onZombieReachEnd) {
          this.onZombieReachEnd();
        }
        zombie.die();
      }
    }
  }

  private updatePlants(deltaTime: number) {
    for (const row of this.grid) {
      for (const plant of row) {
        if (plant && plant.node.isValid) {
          plant.update(deltaTime);

          if (plant.canAttack()) {
            this.plantAttack(plant);
          }
        }
      }
    }
  }

  private updateProjectiles(deltaTime: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      if (!projectile || !projectile.node.isValid) {
        this.projectiles.splice(i, 1);
        continue;
      }
      projectile.update(deltaTime);
    }
  }

  private plantAttack(plant: Plant) {
    if (!plant.config) return;

    const target = this.findTargetInRow(plant.row, plant.config.attackRange);
    if (target) {
      plant.attack();
      this.spawnProjectile(plant, target);
    }
  }

  private findTargetInRow(row: number, range: number): Zombie | null {
    const plantX =
      GAME_CONFIG.GRID.START_X + range * GAME_CONFIG.GRID.CELL_WIDTH;

    for (const zombie of this.zombies) {
      if (
        zombie.row === row &&
        !zombie.isDead &&
        zombie.node.position.x <= plantX + 100
      ) {
        return zombie;
      }
    }
    return null;
  }

  private spawnProjectile(plant: Plant, target: Zombie) {
    if (!this.projectilePrefab) return;

    const projectileNode = instantiate(this.projectilePrefab);
    const projectile = projectileNode.getComponent(Projectile);

    if (projectile) {
      projectile.init(plant.damage, 15, target.node, () => {
        const killed = target.takeDamage(plant.damage);
        if (killed) {
          this.eventTarget.emit(GameEvent.ZOMBIE_KILLED, target.getReward());
        }
      });

      projectileNode.setPosition(
        plant.node.position.x + 30,
        plant.node.position.y,
        0,
      );
      this.projectilesContainer.addChild(projectileNode);
      this.projectiles.push(projectile);
    }
  }

  private checkCollisions() {
    for (const zombie of this.zombies) {
      if (zombie.isDead) continue;

      const plant = this.grid[zombie.row][0];
      if (plant && !plant.isDead) {
        const distance = Math.abs(
          zombie.node.position.x - plant.node.position.x,
        );
        if (distance < 30) {
          zombie.startAttacking();
          const damage = zombie.attack();
          const killed = plant.takeDamage(damage);
          if (killed) {
            this.removePlant(zombie.row, 0);
          }
        } else {
          zombie.stopAttacking();
        }
      }
    }
  }

  private clearZombies() {
    for (const zombie of this.zombies) {
      if (zombie && zombie.node.isValid) {
        zombie.node.destroy();
      }
    }
    this.zombies = [];

    for (const projectile of this.projectiles) {
      if (projectile && projectile.node.isValid) {
        projectile.node.destroy();
      }
    }
    this.projectiles = [];
  }

  private getRowY(row: number): number {
    return (
      GAME_CONFIG.GRID.START_Y +
      row * GAME_CONFIG.GRID.CELL_HEIGHT +
      GAME_CONFIG.GRID.CELL_HEIGHT / 2
    );
  }

  getZombieCount(): number {
    return this.zombies.filter((z) => z && !z.isDead).length;
  }
}
