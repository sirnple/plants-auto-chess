import { _decorator, Component, Node, Sprite, Color, Label, tween, Vec3, UIOpacity } from 'cc';
import { PlantConfig, PlantData } from '../types/GameTypes';
import { GAME_CONFIG } from '../config/GameConfig';

const { ccclass, property } = _decorator;

@ccclass('Plant')
export class Plant extends Component {
    private data: PlantData | null = null;
    private sprite: Sprite | null = null;
    private label: Label | null = null;
    private starLabel: Label | null = null;
    private healthLabel: Label | null = null;
    private attackTimer: number = 0;
    private onAttackCallback: ((plant: Plant) => void) | null = null;
    private onDeathCallback: ((plant: Plant) => void) | null = null;
    private onGenerateSunCallback: ((plant: Plant, amount: number) => void) | null = null;
    private isOnField: boolean = false;

    init(config: PlantConfig, starLevel: number = 1, benchIndex: number = -1) {
        this.data = {
            config: config,
            starLevel: starLevel,
            currentHealth: this.calculateHealth(config.health, starLevel),
            maxHealth: this.calculateHealth(config.health, starLevel),
            damage: this.calculateDamage(config.damage, starLevel),
            row: -1,
            col: -1,
            benchIndex: benchIndex
        };
        
        this.updateDisplay();
    }

    private calculateHealth(baseHealth: number, starLevel: number): number {
        return Math.floor(baseHealth * Math.pow(GAME_CONFIG.STAR_MULTIPLIER, starLevel - 1));
    }

    private calculateDamage(baseDamage: number, starLevel: number): number {
        return Math.floor(baseDamage * Math.pow(GAME_CONFIG.STAR_MULTIPLIER, starLevel - 1));
    }

    private updateDisplay() {
        if (!this.data) return;

        this.node.removeAllChildren();

        const plantNode = new Node('PlantDisplay');
        plantNode.setParent(this.node);

        const emojiLabel = plantNode.addComponent(Label);
        emojiLabel.string = this.data.config.emoji;
        emojiLabel.fontSize = 40;
        emojiLabel.lineHeight = 40;

        const starNode = new Node('Stars');
        starNode.setParent(this.node);
        starNode.setPosition(0, -30, 0);
        const starLabel = starNode.addComponent(Label);
        starLabel.string = '⭐'.repeat(this.data.starLevel);
        starLabel.fontSize = 12;
        starLabel.lineHeight = 12;

        const healthNode = new Node('Health');
        healthNode.setParent(this.node);
        healthNode.setPosition(0, 35, 0);
        const healthLabel = healthNode.addComponent(Label);
        healthLabel.string = `${this.data.currentHealth}/${this.data.maxHealth}`;
        healthLabel.fontSize = 10;
        healthLabel.lineHeight = 10;
        healthLabel.color = Color.GREEN;

        this.healthLabel = healthLabel;
    }

    setData(data: PlantData) {
        this.data = { ...data };
        this.updateDisplay();
    }

    getData(): PlantData | null {
        return this.data;
    }

    setPosition(row: number, col: number) {
        if (this.data) {
            this.data.row = row;
            this.data.col = col;
            this.data.benchIndex = -1;
        }
        this.isOnField = true;

        const x = GAME_CONFIG.GRID_START_X + col * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2;
        const y = GAME_CONFIG.GRID_START_Y + row * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2;
        this.node.setPosition(x, y, 0);
    }

    setBenchPosition(index: number) {
        if (this.data) {
            this.data.benchIndex = index;
            this.data.row = -1;
            this.data.col = -1;
        }
        this.isOnField = false;
    }

    setOnAttack(callback: (plant: Plant) => void) {
        this.onAttackCallback = callback;
    }

    setOnDeath(callback: (plant: Plant) => void) {
        this.onDeathCallback = callback;
    }

    setOnGenerateSun(callback: (plant: Plant, amount: number) => void) {
        this.onGenerateSunCallback = callback;
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

    private playDamageEffect() {
        const originalScale = this.node.scale.clone();
        tween(this.node)
            .to(0.05, { scale: new Vec3(0.9, 0.9, 1) })
            .to(0.05, { scale: originalScale })
            .start();
    }

    heal(amount: number) {
        if (!this.data) return;
        
        this.data.currentHealth = Math.min(
            this.data.currentHealth + amount,
            this.data.maxHealth
        );
        
        if (this.healthLabel) {
            this.healthLabel.string = `${this.data.currentHealth}/${this.data.maxHealth}`;
        }
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

    update(deltaTime: number) {
        if (!this.data || !this.isOnField) return;

        if (this.data.config.attackSpeed > 0) {
            this.attackTimer += deltaTime;
            
            if (this.attackTimer >= this.data.config.attackSpeed) {
                this.attackTimer = 0;
                
                if (this.data.config.special && 'generate_sun' in this.data.config.special) {
                    const sunAmount = this.data.config.special.generate_sun as number * this.data.starLevel;
                    if (this.onGenerateSunCallback) {
                        this.onGenerateSunCallback(this, sunAmount);
                    }
                } else if (this.data.damage > 0) {
                    if (this.onAttackCallback) {
                        this.onAttackCallback(this);
                    }
                }
            }
        }
    }

    upgradeStar(): boolean {
        if (!this.data || this.data.starLevel >= GAME_CONFIG.MAX_STAR_LEVEL) {
            return false;
        }

        this.data.starLevel++;
        this.data.maxHealth = this.calculateHealth(this.data.config.health, this.data.starLevel);
        this.data.currentHealth = this.data.maxHealth;
        this.data.damage = this.calculateDamage(this.data.config.damage, this.data.starLevel);
        
        this.updateDisplay();
        this.playUpgradeEffect();
        
        return true;
    }

    private playUpgradeEffect() {
        const originalScale = this.node.scale.clone();
        tween(this.node)
            .to(0.2, { scale: new Vec3(1.3, 1.3, 1) })
            .to(0.2, { scale: originalScale })
            .start();
    }

    getSellValue(): number {
        if (!this.data) return 0;
        return Math.floor(this.data.config.cost * this.data.starLevel * 0.5);
    }

    getRow(): number {
        return this.data?.row ?? -1;
    }

    getCol(): number {
        return this.data?.col ?? -1;
    }

    isOnField_(): boolean {
        return this.isOnField;
    }
}
