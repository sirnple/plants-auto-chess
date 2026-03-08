import { _decorator, Component, Node, Prefab, instantiate, Label, Color, Sprite, UITransform, Vec3 } from 'cc';
import { BattleSystem } from '../systems/BattleSystem';
import { ShopSystem } from '../systems/ShopSystem';
import { MergeSystem } from '../systems/MergeSystem';
import { SynergySystem } from '../systems/SynergySystem';
import { WaveSystem } from '../systems/WaveSystem';
import { Plant } from '../entities/Plant';
import { Zombie } from '../entities/Zombie';
import { PlantData, GameState, ShopSlot, TraitStatus, PlantConfig } from '../types/GameTypes';
import { PLANTS, GAME_CONFIG, ZOMBIES, TRAITS } from '../config/GameConfig';

const { ccclass, property } = _decorator;

@ccclass('GameScene')
export class GameScene extends Component {
    @property(Prefab)
    plantPrefab: Prefab | null = null;
    @property(Prefab)
    zombiePrefab: Prefab | null = null;
    @property(Node)
    battleSystemNode: Node | null = null;
    @property(Node)
    shopPanel: Node | null = null;
    @property(Node)
    benchPanel: Node | null = null;
    @property(Node)
    synergyPanel: Node | null = null;
    @property(Node)
    statusPanel: Node | null = null;

    private battleSystem: BattleSystem | null = null;
    private shopSystem: ShopSystem | null = null;
    private mergeSystem: MergeSystem | null = null;
    private synergySystem: SynergySystem | null = null;
    private waveSystem: WaveSystem | null = null;

    private gameState: GameState | null = null;
    private selectedPlant: Plant | null = null;
    private isInfoMode: boolean = false;
    private infoPanel: Node | null = null;

    onLoad() {
        this.initGameState();
        this.initSystems();
        this.initUI();
    }

    private initGameState() {
        this.gameState = {
            sun: GAME_CONFIG.INITIAL_SUN,
            baseHealth: GAME_CONFIG.INITIAL_HEALTH,
            round: 1,
            isBattlePhase: false,
            isGameOver: false,
            isVictory: false,
            unlockedPlants: [],
            bench: Array(GAME_CONFIG.BENCH_SIZE).fill(null),
            shop: Array(GAME_CONFIG.SHOP_SIZE).fill(null).map(s => ({ plant: null, isLocked: false })),
            deployedPlants: []
        };

        this.updateUnlockedPlants();
    }

    private initSystems() {
        this.battleSystem = this.battleSystemNode?.getComponent(BattleSystem);
        this.shopSystem = this.shopPanel?.getComponent(ShopSystem);
        this.mergeSystem = this.benchPanel?.getComponent(MergeSystem);
        this.synergySystem = this.synergyPanel?.getComponent(SynergySystem);
        this.waveSystem = this.node.getComponent(WaveSystem);

        this.battleSystem.setOnZombieKilled((z) => this.onZombieKilled(z));
        this.battleSystem.setOnZombieReachBase((z) => this.onZombieReachBase(z));
        this.battleSystem.setOnPlantDeath((p) => this.onPlantDeath(p));

        this.waveSystem.setOnZombieSpawn((node, row) => this.onZombieSpawn(node, row));
        this.waveSystem.setOnWaveComplete(() => this.onWaveComplete());
    }

    private initUI() {
        this.updateStatusUI();
        this.refreshShop();
    }

    private updateUnlockedPlants() {
        const unlocked: string[] = [];
        Object.values(PLANTS).forEach(plant => {
            if (plant.unlockRound <= this.gameState.round) {
                unlocked.push(plant.id);
            }
        });
        this.gameState.unlockedPlants = unlocked;
    }

    private updateStatusUI() {
        if (!this.statusPanel) return;

        const sunLabel = this.statusPanel.getChildByName('SunLabel')?.getComponent(Label);
        const healthLabel = this.statusPanel.getChildByName('HealthLabel')?.getComponent(Label);
        const roundLabel = this.statusPanel.getChildByName('RoundLabel')?.getComponent(Label);

        if (sunLabel) sunLabel.string = `☀️ ${this.gameState.sun}`;
        if (healthLabel) healthLabel.string = `❤️ ${this.gameState.baseHealth}`;
        if (roundLabel) roundLabel.string = `回合 ${this.gameState.round}`;
    }

    private refreshShop() {
        if (this.shopSystem) {
            this.shopSystem.setRound(this.gameState.round);
            this.shopSystem.refreshShop();
            this.updateShopUI();
        }
    }

    private updateShopUI() {
        if (!this.shopPanel || !this.shopSystem) return;

        const shop = this.shopSystem.getShop();
        shop.forEach((slot, index) => {
            const slotNode = this.shopPanel.getChildByName(`Slot_${index}`);
            if (slotNode) {
                const plantLabel = slotNode.getChildByName('PlantEmoji')?.getComponent(Label);
                const costLabel = slotNode.getChildByName('Cost')?.getComponent(Label);

                if (slot.plant) {
                    if (plantLabel) plantLabel.string = slot.plant.emoji;
                    if (costLabel) costLabel.string = `${slot.plant.cost}☀️`;
                } else {
                    if (plantLabel) plantLabel.string = '';
                    if (costLabel) costLabel.string = '';
                }
            }
        });
    }

    onShopSlotClick(index: number) {
        if (this.gameState.isBattlePhase) return;

        const plant = this.shopSystem.getPlantAt(index);
        if (!plant) return;

        if (!this.shopSystem.canAfford(index, this.gameState.sun)) {
            return;
        }

        const canAdd = this.mergeSystem?.canAddToBench(plant.id);
        if (!canAdd) {
            return;
        }

        this.gameState.sun -= plant.cost;

        const plantNode = this.shopSystem.purchase(index);
        if (plantNode) {
            this.gameState.bench = this.mergeSystem.getBench();
            this.updateBenchUI();
            this.checkAndMerge();
            this.updateStatusUI();
        }
    }

    onRefreshShopClick() {
        if (this.gameState.isBattlePhase) return;

        const cost = this.shopSystem?.getRefreshCost() || 2;
        if (this.gameState.sun < cost) return;

        this.gameState.sun -= cost;
        this.refreshShop();
        this.updateStatusUI();
    }

    private updateBenchUI() {
        if (!this.benchPanel || !this.mergeSystem) return;

        const bench = this.mergeSystem.getBench();
        bench.forEach((plant, index) => {
            const slotNode = this.benchPanel.getChildByName(`Slot_${index}`);
            if (slotNode) {
                const plantLabel = slotNode.getChildByName('PlantEmoji')?.getComponent(Label);
                const starLabel = slotNode.getChildByName('Stars')?.getComponent(Label);

                if (plant) {
                    const data = plant.getData();
                    if (data && plantLabel) plantLabel.string = data.config.emoji;
                    if (data && starLabel) starLabel.string = '⭐'.repeat(data.starLevel);
                } else {
                    if (plantLabel) plantLabel.string = '';
                    if (starLabel) starLabel.string = '';
                }
            }
        });
    }

    private checkAndMerge() {
        if (!this.mergeSystem) return;

        let result = this.mergeSystem.checkAndMerge();
        while (result.merged) {
            this.gameState.bench = this.mergeSystem.getBench();
            this.updateBenchUI();
            this.updateSynergyUI();
            result = this.mergeSystem.checkAndMerge();
        }
    }

    private updateSynergyUI() {
        if (!this.synergyPanel || !this.synergySystem) return;

        const traits = this.synergySystem.calculateTraits(this.getDeployedPlants());
        const container = this.synergyPanel.getChildByName('TraitList');

        if (container) {
            container.removeAllChildren();

            traits.forEach(trait => {
                if (trait.activeLevel > 0) {
                    const config = TRAITS[trait.traitId];
                    const traitNode = new Node(`Trait_${trait.traitId}`);
                    const label = traitNode.addComponent(Label);
                    label.string = `${config.name}: Lv${trait.activeLevel}`;
                    label.fontSize = 14;
                    traitNode.setParent(container);
                }
            });
        }
    }

    private getDeployedPlants(): Plant[] {
        if (!this.battleSystem) return [];
        return this.battleSystem.getDeployedPlants();
    }

    onBenchSlotClick(index: number) {
        if (this.gameState.isBattlePhase) return;

        const plant = this.mergeSystem?.getBenchPlant(index);
        if (!plant) return;

        if (this.selectedPlant === plant) {
            this.selectedPlant = null;
        } else {
            this.selectedPlant = plant;
        }
    }

    onGridCellClick(row: number, col: number) {
        if (this.gameState.isBattlePhase) return;

        if (this.selectedPlant) {
            const data = this.selectedPlant.getData();
            if (!data) return;

            if (this.battleSystem?.isCellEmpty(row, col)) {
                const plantNode = this.mergeSystem?.removeFromBench(data.benchIndex);
                if (plantNode && this.battleSystem.deployPlant(plantNode, row, col)) {
                    this.gameState.bench = this.mergeSystem?.getBench() || [];
                    this.selectedPlant = null;
                    this.updateBenchUI();
                    this.updateSynergyUI();
                }
            }
        } else {
            const plant = this.battleSystem?.getPlantAt(row, col);
            if (plant) {
                if (this.isInfoMode) {
                    this.showPlantInfo(plant);
                } else {
                    const plantNode = this.battleSystem.removePlant(row, col);
                    if (plantNode && this.mergeSystem) {
                        const data = plant.getData();
                        const config = data.config;
                        const starLevel = data.starLevel;
                        const newPlantNode = this.createPlantNode(config, starLevel);
                        this.mergeSystem.addToBench(newPlantNode);
                        this.gameState.bench = this.mergeSystem.getBench();
                        this.updateBenchUI();
                        this.updateSynergyUI();
                    }
                }
            }
        }
    }

    private showPlantInfo(plant: Plant) {
        if (this.infoPanel) {
            this.infoPanel.destroy();
        }

        const data = plant.getData();
        if (!data) return;

        this.infoPanel = new Node('InfoPanel');

        const bg = new Node('BG');
        const bgSprite = bg.addComponent(Sprite);
        bgSprite.color = new Color(0, 0, 0, 180);
        const transform = bg.addComponent(UITransform);
        transform.setContentSize(new Vec2(180, 160));
        bg.setParent(this.infoPanel);

        const nameLabelNode = new Node('Name');
        const nameLabel = nameLabelNode.addComponent(Label);
        nameLabel.string = `${data.config.emoji} ${data.config.name}`;
        nameLabel.fontSize = 18;
        nameLabelNode.setPosition(0, 60, 0);
        nameLabelNode.setParent(this.infoPanel);

        const starLabelNode = new Node('Stars');
        const starLabel = starLabelNode.addComponent(Label);
        starLabel.string = '⭐'.repeat(data.starLevel);
        starLabel.fontSize = 14;
        starLabelNode.setPosition(0, 40, 0);
        starLabelNode.setParent(this.infoPanel);

        const healthLabelNode = new Node('Health');
        const healthLabel = healthLabelNode.addComponent(Label);
        healthLabel.string = `❤️ ${data.currentHealth}/${data.maxHealth}`;
        healthLabel.fontSize = 12;
        healthLabelNode.setPosition(0, 20, 0);
        healthLabelNode.setParent(this.infoPanel);

        const damageLabelNode = new Node('Damage');
        const damageLabel = damageLabelNode.addComponent(Label);
        damageLabel.string = `⚔️ ${data.damage}`;
        damageLabel.fontSize = 12;
        damageLabelNode.setPosition(0, 0, 0);
        damageLabelNode.setParent(this.infoPanel);

        const sellButton = new Node('SellButton');
        const sellLabel = sellButton.addComponent(Label);
        sellLabel.string = `卖出 +${plant.getSellValue()}☀️`;
        sellLabel.fontSize = 14;
        sellButton.setPosition(0, -40, 0);
        sellButton.setParent(this.infoPanel);

        const pos = plant.node.position;
        this.infoPanel.setPosition(pos.x, pos.y + 100, 0);
        this.infoPanel.setParent(this.node);

        this.schedule(() => {
            if (this.infoPanel) {
                this.infoPanel.destroy();
                this.infoPanel = null;
            }
        }, 4);
    }

    private createPlantNode(config: PlantConfig, starLevel: number): Node {
        const plantNode = new Node(config.id);
        const plant = plantNode.addComponent(Plant);
        plant.init(config, starLevel);
        return plantNode;
    }

    onStartBattleClick() {
        if (this.gameState.isBattlePhase) return;

        this.gameState.isBattlePhase = true;
        this.startWave();
    }

    private startWave() {
        if (!this.waveSystem) return;

        this.waveSystem.startWave(this.gameState.round);
    }

    onZombieSpawn(zombieNode: Node, row: number) {
        this.battleSystem?.spawnZombie(zombieNode, row);
    }

    onZombieKilled(zombie: Zombie) {
        const reward = zombie.getReward();
        this.gameState.sun += reward;
        this.updateStatusUI();
    }

    onZombieReachBase(zombie: Zombie) {
        this.gameState.baseHealth -= 1;
        this.updateStatusUI();

        if (this.gameState.baseHealth <= 0) {
            this.gameOver();
        }
    }

    onPlantDeath(plant: Plant) {
        this.updateSynergyUI();
    }

    onWaveComplete() {
        this.gameState.isBattlePhase = false;
        this.gameState.round++;

        if (this.gameState.round > GAME_CONFIG.TOTAL_ROUNDS) {
            this.victory();
            return;
        }

        const roundReward = GAME_CONFIG.BASE_ROUND_REWARD + this.gameState.round * GAME_CONFIG.ROUND_REWARD_MULTIPLIER;
        this.gameState.sun += roundReward;

        this.updateUnlockedPlants();
        this.refreshShop();
        this.updateStatusUI();
    }

    private gameOver() {
        this.gameState.isGameOver = true;
        this.showGameOverUI();
    }

    private victory() {
        this.gameState.isVictory = true;
        this.showVictoryUI();
    }

    private showGameOverUI() {
        const gameOverNode = new Node('GameOver');
        const label = gameOverNode.addComponent(Label);
        label.string = '游戏结束！ 点击重新开始';
        label.fontSize = 36;
        label.color = Color.RED;
        gameOverNode.setPosition(GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2, 0);
        gameOverNode.setParent(this.node);
    }

    private showVictoryUI() {
        const victoryNode = new Node('Victory');
        const label = victoryNode.addComponent(Label);
        label.string = '胜利！ 恭喜通关!';
        label.fontSize = 36;
        label.color = Color.YELLOW;
        victoryNode.setPosition(GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2, 0);
        victoryNode.setParent(this.node);
    }

    update(deltaTime: number) {
        if (this.gameState.isGameOver || this.gameState.isVictory) return;

        this.waveSystem?.update(deltaTime);

        if (this.gameState.isBattlePhase) {
            this.battleSystem?.update(deltaTime);

            if (!this.waveSystem?.hasZombiesLeft() && !this.battleSystem?.hasZombies()) {
                this.onWaveComplete();
            }
        }
    }
}
