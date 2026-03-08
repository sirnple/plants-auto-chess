import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
import { Plant, Zombie, Projectile } from '../entities/index';
import { PlantData, ZombieData, ProjectileData } from '../types/GameTypes';
import { GAME_CONFIG } from '../config/GameConfig';

const { ccclass, property } = _decorator;

@ccclass('BattleSystem')
export class BattleSystem extends Component {
    @property(Prefab)
    projectilePrefab: Prefab | null = null;

    private plants: Map<string, Plant> = new Map();
    private zombies: Zombie[] = [];
    private projectiles: Projectile[] = [];
    private grid: (Plant | null)[][] = [];
    private onZombieKilled: ((zombie: Zombie) => void) | null = null;
    private onZombieReachBase: ((zombie: Zombie) => void) | null = null;
    private onPlantDeath: ((plant: Plant) => void) | null = null;

    onLoad() {
        this.initGrid();
    }

    private initGrid() {
        this.grid = [];
        for (let row = 0; row < GAME_CONFIG.GRID_ROWS; row++) {
            this.grid[row] = [];
            for (let col = 0; col < GAME_CONFIG.GRID_COLS; col++) {
                this.grid[row][col] = null;
            }
        }
    }

    setOnZombieKilled(callback: (zombie: Zombie) => void) {
        this.onZombieKilled = callback;
    }

    setOnZombieReachBase(callback: (zombie: Zombie) => void) {
        this.onZombieReachBase = callback;
    }

    setOnPlantDeath(callback: (plant: Plant) => void) {
        this.onPlantDeath = callback;
    }

    deployPlant(plantNode: Node, row: number, col: number): boolean {
        if (row < 0 || row >= GAME_CONFIG.GRID_ROWS || col < 0 || col >= GAME_CONFIG.GRID_COLS) {
            return false;
        }

        if (this.grid[row][col] !== null) {
            return false;
        }

        const plant = plantNode.getComponent(Plant);
        if (!plant) return false;

        plant.setPosition(row, col);
        plant.setOnAttack(() => this.onPlantAttack(plant));
        plant.setOnDeath(() => this.onPlantDie(plant));
        plant.setOnGenerateSun(() => {});

        const key = `${row}_${col}`;
        this.plants.set(key, plant);
        this.grid[row][col] = plant;

        return true;
    }

    removePlant(row: number, col: number): Node | null {
        if (row < 0 || row >= GAME_CONFIG.GRID_ROWS || col < 0 || col >= GAME_CONFIG.GRID_COLS) {
            return null;
        }

        const plant = this.grid[row][col];
        if (!plant) return null;

        const key = `${row}_${col}`;
        this.plants.delete(key);
        this.grid[row][col] = null;

        return plant.node;
    }

    getPlantAt(row: number, col: number): Plant | null {
        if (row < 0 || row >= GAME_CONFIG.GRID_ROWS || col < 0 || col >= GAME_CONFIG.GRID_COLS) {
            return null;
        }
        return this.grid[row][col];
    }

    private onPlantAttack(plant: Plant) {
        const data = plant.getData();
        if (!data) return;

        const projectileNode = new Node('Projectile');
        const projectile = projectileNode.addComponent(Projectile);

        let damage = data.damage;
        let shotCount = 1;

        if (data.config.special) {
            if ('double_shot' in data.config.special) {
                shotCount = 2;
            }
            if ('triple_row' in data.config.special) {
                const rows = [data.row - 1, data.row, data.row + 1].filter(r => r >= 0 && r < GAME_CONFIG.GRID_ROWS);
                rows.forEach(row => {
                    this.createProjectile(plant, row, damage);
                });
                return;
            }
        }

        for (let i = 0; i < shotCount; i++) {
            this.createProjectile(plant, data.row, damage);
        }
    }

    private createProjectile(plant: Plant, targetRow: number, damage: number) {
        const data = plant.getData();
        if (!data) return;

        const projData: ProjectileData = {
            type: data.config.id,
            damage: damage,
            x: GAME_CONFIG.GRID_START_X + (data.col + 1) * GAME_CONFIG.CELL_SIZE,
            y: GAME_CONFIG.GRID_START_Y + targetRow * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2,
            targetRow: targetRow,
            speed: 400,
            isIce: data.config.traits.includes('ICE'),
            owner: plant
        };

        const projectileNode = new Node('Projectile');
        const projectile = projectileNode.addComponent(Projectile);
        projectile.init(projData);
        projectile.setOnHit((proj, zombie) => this.onProjectileHit(proj, zombie));

        projectileNode.setParent(this.node.parent);
        this.projectiles.push(projectile);
    }

    private onProjectileHit(projectile: Projectile, zombieNode: Node) {
        const zombie = zombieNode.getComponent(Zombie);
        if (!zombie) return;

        const projData = projectile.getData();
        if (!projData) return;

        if (zombie.getRow() !== projData.targetRow) return;

        const isDead = zombie.takeDamage(projData.damage);

        if (projData.isIce) {
            zombie.applySlow(0.5, 2);
        }

        const idx = this.projectiles.indexOf(projectile);
        if (idx > -1) {
            this.projectiles.splice(idx, 1);
        }
    }

    private onPlantDie(plant: Plant) {
        const data = plant.getData();
        if (!data) return;

        const key = `${data.row}_${data.col}`;
        this.plants.delete(key);
        
        if (data.row >= 0 && data.row < GAME_CONFIG.GRID_ROWS && 
            data.col >= 0 && data.col < GAME_CONFIG.GRID_COLS) {
            this.grid[data.row][data.col] = null;
        }

        if (this.onPlantDeath) {
            this.onPlantDeath(plant);
        }

        if (data.config.special && 'death_explosion' in data.config.special) {
            this.handleDeathExplosion(plant, data.config.special.death_explosion as number);
        }
    }

    private handleDeathExplosion(plant: Plant, damage: number) {
        const data = plant.getData();
        if (!data) return;

        this.zombies.forEach(zombie => {
            const zombieData = zombie.getData();
            if (zombieData && zombieData.row === data.row) {
                const dist = Math.abs(zombieData.x - (GAME_CONFIG.GRID_START_X + data.col * GAME_CONFIG.CELL_SIZE));
                if (dist < GAME_CONFIG.CELL_SIZE * 2) {
                    zombie.takeDamage(damage);
                }
            }
        });
    }

    spawnZombie(zombieNode: Node, row: number) {
        const zombie = zombieNode.getComponent(Zombie);
        if (!zombie) return;

        const startX = GAME_CONFIG.GRID_START_X + GAME_CONFIG.GRID_COLS * GAME_CONFIG.CELL_SIZE + 50;
        zombie.init(zombie.getConfig()!, row, startX);
        zombie.setOnReachBase((z) => this.onZombieReachBaseHandler(z));
        zombie.setOnDeath((z) => this.onZombieDeathHandler(z));

        zombieNode.setParent(this.node.parent);
        this.zombies.push(zombie);
    }

    private onZombieReachBaseHandler(zombie: Zombie) {
        if (this.onZombieReachBase) {
            this.onZombieReachBase(zombie);
        }

        const idx = this.zombies.indexOf(zombie);
        if (idx > -1) {
            this.zombies.splice(idx, 1);
        }
    }

    private onZombieDeathHandler(zombie: Zombie) {
        if (this.onZombieKilled) {
            this.onZombieKilled(zombie);
        }

        const idx = this.zombies.indexOf(zombie);
        if (idx > -1) {
            this.zombies.splice(idx, 1);
        }
    }

    update(deltaTime: number) {
        this.plants.forEach(plant => {
            plant.update(deltaTime);
        });

        this.zombies.forEach(zombie => {
            zombie.update(deltaTime);
            this.checkZombiePlantCollision(zombie);
        });

        this.projectiles.forEach(projectile => {
            projectile.update(deltaTime);
            this.checkProjectileZombieCollision(projectile);
        });
    }

    private checkZombiePlantCollision(zombie: Zombie) {
        const zombieData = zombie.getData();
        if (!zombieData) return;

        const col = Math.floor((zombieData.x - GAME_CONFIG.GRID_START_X) / GAME_CONFIG.CELL_SIZE);
        
        if (col >= 0 && col < GAME_CONFIG.GRID_COLS) {
            const plant = this.grid[zombieData.row]?.[col];
            if (plant && plant.node.active) {
                if (zombie.canJump()) {
                    zombie.jump();
                    const newCol = col - 1;
                    if (newCol >= 0 && !this.grid[zombieData.row]?.[newCol]) {
                        return;
                    }
                }
                zombie.setTargetPlant(plant.node);
            } else {
                zombie.setTargetPlant(null);
            }
        }
    }

    private checkProjectileZombieCollision(projectile: Projectile) {
        const projData = projectile.getData();
        if (!projData) return;

        for (const zombie of this.zombies) {
            const zombieData = zombie.getData();
            if (!zombieData) continue;

            if (zombieData.row !== projData.targetRow) continue;

            const dist = Math.abs(zombieData.x - projData.x);
            if (dist < 20) {
                projectile.hit(zombie.node);
                break;
            }
        }
    }

    hasZombies(): boolean {
        return this.zombies.length > 0;
    }

    getDeployedPlants(): Plant[] {
        return Array.from(this.plants.values());
    }

    getAllZombies(): Zombie[] {
        return this.zombies;
    }

    clearZombies() {
        this.zombies.forEach(z => z.node.destroy());
        this.zombies = [];
    }

    clearProjectiles() {
        this.projectiles.forEach(p => p.node.destroy());
        this.projectiles = [];
    }
}
