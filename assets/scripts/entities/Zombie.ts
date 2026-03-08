import { _decorator, Component, Node, Label, tween, Vec3, Color } from 'cc';
import { ZombieConfig, ZombieData } from '../types/GameTypes';
import { GAME_CONFIG } from '../config/GameConfig';

const { ccclass, property } = _decorator;

@ccclass('Zombie')
export class Zombie extends Component {
    private data: ZombieData | null = null;
    private label: Label | null = null;
    private healthLabel: Label | null = null;
    private slowEffect: number = 1;
    private slowTimer: number = 0;
    private isAttacking: boolean = false;
    private hasJumped: boolean = false;
    private onReachBaseCallback: ((zombie: Zombie) => void) | null = null;
    private onDeathCallback: ((zombie: Zombie) => void) | null = null;
    private targetPlant: Node | null = null;
    private attackTimer: number = 0;

    init(config: ZombieConfig, row: number, startX: number) {
        this.data = {
            config: config,
            currentHealth: config.health,
            maxHealth: config.health,
            row: row,
            x: startX,
            isSlowed: false,
            slowTimer: 0
        };

        this.hasJumped = false;
        this.isAttacking = false;
        this.slowEffect = 1;
        this.slowTimer = 0;

        this.node.setPosition(startX, GAME_CONFIG.GRID_START_Y + row * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2, 0);
        
        this.updateDisplay();
    }

    private updateDisplay() {
        if (!this.data) return;

        this.node.removeAllChildren();

        const zombieNode = new Node('ZombieDisplay');
        zombieNode.setParent(this.node);

        const emojiLabel = zombieNode.addComponent(Label);
        emojiLabel.string = this.data.config.emoji;
        emojiLabel.fontSize = 36;
        emojiLabel.lineHeight = 36;

        const healthNode = new Node('Health');
        healthNode.setParent(this.node);
        healthNode.setPosition(0, 30, 0);
        const healthLabel = healthNode.addComponent(Label);
        healthLabel.string = `${this.data.currentHealth}/${this.data.maxHealth}`;
        healthLabel.fontSize = 10;
        healthLabel.lineHeight = 10;
        healthLabel.color = Color.RED;

        this.healthLabel = healthLabel;
    }

    setOnReachBase(callback: (zombie: Zombie) => void) {
        this.onReachBaseCallback = callback;
    }

    setOnDeath(callback: (zombie: Zombie) => void) {
        this.onDeathCallback = callback;
    }

    takeDamage(damage: number): boolean {
        if (!this.data) return true;

        this.data.currentHealth -= damage;
        
        if (this.healthLabel) {
            this.healthLabel.string = `${Math.max(0, this.data.currentHealth)}/${this.data.maxHealth}`;
        }

        this.playDamageEffect();

        if (this.data.currentHealth <= 0) {
            this.die();
            return true;
        }
        return false;
    }

    applySlow(effect: number, duration: number) {
        this.slowEffect = effect;
        this.slowTimer = duration;
        if (this.data) {
            this.data.isSlowed = true;
        }
    }

    private playDamageEffect() {
        const originalScale = this.node.scale.clone();
        tween(this.node)
            .to(0.05, { scale: new Vec3(0.9, 0.9, 1) })
            .to(0.05, { scale: originalScale })
            .start();
    }

    private die() {
        if (this.onDeathCallback && this.data) {
            this.onDeathCallback(this);
        }

        tween(this.node)
            .to(0.3, { scale: new Vec3(0, 0, 0) })
            .call(() => {
                this.node.destroy();
            })
            .start();
    }

    setTargetPlant(plant: Node | null) {
        this.targetPlant = plant;
        this.isAttacking = plant !== null;
    }

    update(deltaTime: number) {
        if (!this.data) return;

        if (this.slowTimer > 0) {
            this.slowTimer -= deltaTime;
            if (this.slowTimer <= 0) {
                this.slowEffect = 1;
                this.data.isSlowed = false;
            }
        }

        if (this.isAttacking && this.targetPlant) {
            this.attackTimer += deltaTime;
            if (this.attackTimer >= 1) {
                this.attackTimer = 0;
                this.attackPlant();
            }
        } else {
            const actualSpeed = this.data.config.speed * this.slowEffect;
            this.data.x -= actualSpeed * deltaTime * 100;
            this.node.setPosition(this.data.x, this.node.position.y, 0);

            if (this.data.x <= GAME_CONFIG.GRID_START_X - 30) {
                if (this.onReachBaseCallback) {
                    this.onReachBaseCallback(this);
                }
                this.node.destroy();
            }
        }
    }

    private attackPlant() {
        if (this.data && this.targetPlant) {
            const plant = this.targetPlant.getComponent('Plant') as any;
            if (plant && plant.takeDamage) {
                const isDead = plant.takeDamage(this.data.damage);
                if (isDead) {
                    this.isAttacking = false;
                    this.targetPlant = null;
                }
            }
        }
    }

    canJump(): boolean {
        if (this.data && this.data.config.special && 'jump' in this.data.config.special) {
            return !this.hasJumped;
        }
        return false;
    }

    jump() {
        this.hasJumped = true;
    }

    getRow(): number {
        return this.data?.row ?? -1;
    }

    getX(): number {
        return this.data?.x ?? 0;
    }

    getConfig(): ZombieConfig | null {
        return this.data?.config ?? null;
    }

    getReward(): number {
        return this.data?.config.reward ?? 0;
    }
}
