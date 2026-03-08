import {
  _decorator,
  Component,
  Node,
  Label,
  Button,
  director,
  Prefab,
  instantiate,
  Vec3,
  Color,
  Widget,
  UITransform,
} from "cc";
import { Plant } from "../entities/Plant";
import { BattleManager } from "../managers/BattleManager";
import { ShopManager } from "../managers/ShopManager";
import { MergeManager } from "../managers/MergeManager";
import { WaveManager } from "../managers/WaveManager";
import { DragDropManager } from "../managers/DragDropManager";
import { GAME_CONFIG, GameEvent } from "../config/GameConstants";
import { PLANTS } from "../config/GameConfig";

const { ccclass, property } = _decorator;

@ccclass("GameScene")
export class GameScene extends Component {
  @property(Label)
  sunLabel: Label = null;

  @property(Label)
  healthLabel: Label = null;

  @property(Label)
  roundLabel: Label = null;

  @property(Button)
  startBattleButton: Button = null;

  @property(Button)
  refreshShopButton: Button = null;

  @property(Node)
  gameOverPanel: Node = null;

  @property(Node)
  victoryPanel: Node = null;

  @property(BattleManager)
  battleManager: BattleManager = null;

  @property(ShopManager)
  shopManager: ShopManager = null;

  @property(MergeManager)
  mergeManager: MergeManager = null;

  @property(WaveManager)
  waveManager: WaveManager = null;

  @property(DragDropManager)
  dragDropManager: DragDropManager = null;

  private sun: number = GAME_CONFIG.INITIAL_SUN;
  private health: number = GAME_CONFIG.INITIAL_HEALTH;
  private round: number = 1;
  private isBattlePhase: boolean = false;
  private selectedBenchIndex: number = -1;
  private draggedPlant: Plant | null = null;

  onLoad() {
    this.setupEventListeners();
    this.setupDragDrop();
    this.updateUI();
  }

  setupEventListeners() {
    if (this.battleManager) {
      this.battleManager.eventTarget.on(
        GameEvent.ZOMBIE_KILLED,
        (reward: number) => {
          this.addSun(reward);
        },
        this,
      );

      this.battleManager.eventTarget.on(
        GameEvent.BATTLE_END,
        () => {
          this.onBattleEnd();
        },
        this,
      );
    }

    if (this.waveManager) {
      this.waveManager.eventTarget.on(
        "spawnZombie",
        (type: string, row: number) => {
          this.battleManager.spawnZombie(type, row);
        },
        this,
      );

      this.waveManager.eventTarget.on(
        "waveComplete",
        () => {
          this.onWaveComplete();
        },
        this,
      );
    }

    if (this.startBattleButton) {
      this.startBattleButton.node.on(
        Button.EventType.CLICK,
        this.onStartBattle,
        this,
      );
    }

    if (this.refreshShopButton) {
      this.refreshShopButton.node.on(
        Button.EventType.CLICK,
        this.onRefreshShop,
        this,
      );
    }
  }

  setupDragDrop() {
    if (!this.dragDropManager) return;

    this.dragDropManager.registerCallbacks({
      onDragStart: (node: Node) => {
        const plant = node.getComponent(Plant);
        if (plant) {
          this.draggedPlant = plant;
        }
      },
      onDragMove: (node: Node, position: Vec3) => {},
      onDragEnd: (node: Node, startPos: Vec3, endPos: Vec3) => {
        this.handleDrop(node, startPos, endPos);
        this.draggedPlant = null;
      },
    });
  }

  handleDrop(node: Node, startPos: Vec3, endPos: Vec3) {
    if (this.isBattlePhase) {
      node.setPosition(startPos);
      return;
    }

    const plant = node.getComponent(Plant);
    if (!plant) return;

    const gridPos = this.battleManager.getGridFromPosition(endPos.x, endPos.y);

    if (gridPos) {
      const existingPlant = this.battleManager.getPlantAt(
        gridPos.row,
        gridPos.col,
      );

      if (!existingPlant) {
        const fromBench = this.mergeManager
          .getBenchState()
          .findIndex((p) => p === plant);
        if (fromBench !== -1) {
          this.mergeManager.removeFromBench(fromBench);
        }

        this.battleManager.deployPlant(plant, gridPos.row, gridPos.col);
      } else {
        node.setPosition(startPos);
      }
    } else {
      const benchIndex = this.getBenchIndexFromPosition(endPos);
      if (benchIndex !== -1) {
        const existingAtBench = this.mergeManager.getPlantAt(benchIndex);
        if (!existingAtBench) {
          const fromBench = this.mergeManager
            .getBenchState()
            .findIndex((p) => p === plant);
          if (fromBench !== -1) {
            this.mergeManager.removeFromBench(fromBench);
          }

          const fromGrid = this.findPlantInGrid(plant);
          if (fromGrid) {
            this.battleManager.removePlant(fromGrid.row, fromGrid.col);
          }

          this.mergeManager.addToBench(plant);
        } else {
          node.setPosition(startPos);
        }
      } else {
        node.setPosition(startPos);
      }
    }
  }

  getBenchIndexFromPosition(pos: Vec3): number {
    return 0;
  }

  findPlantInGrid(plant: Plant): { row: number; col: number } | null {
    for (let row = 0; row < GAME_CONFIG.GRID.ROWS; row++) {
      for (let col = 0; col < GAME_CONFIG.GRID.COLS; col++) {
        if (this.battleManager.getPlantAt(row, col) === plant) {
          return { row, col };
        }
      }
    }
    return null;
  }

  update(deltaTime: number) {
    if (this.battleManager) {
      this.battleManager.update(deltaTime);
    }

    if (this.waveManager) {
      this.waveManager.update(deltaTime, this.battleManager.getZombieCount());
    }
  }

  onStartBattle() {
    if (this.isBattlePhase) return;

    this.isBattlePhase = true;
    this.battleManager.startBattle(() => {
      this.takeDamage();
    });

    this.waveManager.startRound(this.round);

    if (this.startBattleButton) {
      this.startBattleButton.interactable = false;
    }
  }

  onBattleEnd() {
    this.isBattlePhase = false;

    if (this.startBattleButton) {
      this.startBattleButton.interactable = true;
    }
  }

  onWaveComplete() {
    this.round++;
    this.addSun(20 + this.round * 2);

    this.shopManager.unlockPlantsForRound(this.round);
    this.shopManager.refresh();

    this.updateUI();

    if (this.round > GAME_CONFIG.MAX_ROUNDS) {
      this.showVictory();
    }
  }

  onRefreshShop() {
    if (this.sun >= GAME_CONFIG.SHOP.REFRESH_COST) {
      this.sun -= GAME_CONFIG.SHOP.REFRESH_COST;
      this.shopManager.refresh();
      this.updateUI();
    }
  }

  buyPlant(shopIndex: number) {
    const result = this.shopManager.buy(shopIndex, this.sun);
    if (!result) return;

    if (!this.mergeManager.canAddToBench()) {
      this.sun += result.cost;
      return;
    }

    this.sun -= result.cost;
    this.mergeManager.addToBench(result.plant);
    this.updateUI();
  }

  takeDamage() {
    this.health--;
    this.updateUI();

    if (this.health <= 0) {
      this.showGameOver();
    }
  }

  addSun(amount: number) {
    this.sun += amount;
    this.updateUI();
  }

  updateUI() {
    if (this.sunLabel) {
      this.sunLabel.string = `☀️ ${this.sun}`;
    }

    if (this.healthLabel) {
      this.healthLabel.string = `❤️ ${this.health}`;
    }

    if (this.roundLabel) {
      this.roundLabel.string = `🎯 回合 ${this.round}`;
    }
  }

  showGameOver() {
    if (this.gameOverPanel) {
      this.gameOverPanel.active = true;
    }

    this.waveManager.stop();
    this.battleManager.endBattle();
  }

  showVictory() {
    if (this.victoryPanel) {
      this.victoryPanel.active = true;
    }

    this.waveManager.stop();
    this.battleManager.endBattle();
  }

  restartGame() {
    director.loadScene("GameScene");
  }
}
