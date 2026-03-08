import { _decorator, Component, Node, Prefab, instantiate, Label } from "cc";
import { Plant } from "../entities/Plant";
import { PLANTS } from "../config/GameConfig";
import { PlantConfig, ShopPlant } from "../types/GameTypes";

const { ccclass, property } = _decorator;

@ccclass("ShopManager")
export class ShopManager extends Component {
  @property(Prefab)
  shopSlotPrefab: Prefab = null;

  @property(Node)
  slotsContainer: Node = null;

  @property(Node)
  refreshButton: Node = null;

  private slots: (ShopPlant | null)[] = [];
  private unlockedPlants: string[] = [];
  private round: number = 1;

  onLoad() {
    this.initializeUnlockedPlants();
    this.refresh();
  }

  initializeUnlockedPlants() {
    this.unlockedPlants = Object.keys(PLANTS).filter((key) => {
      return PLANTS[key].cost <= 3;
    });
  }

  unlockPlantsForRound(round: number) {
    this.round = round;
    const newUnlocked = Object.keys(PLANTS).filter((key) => {
      const cost = PLANTS[key].cost;
      return cost <= 3 + Math.floor(round / 3);
    });

    for (const plant of newUnlocked) {
      if (!this.unlockedPlants.includes(plant)) {
        this.unlockedPlants.push(plant);
      }
    }
  }

  refresh() {
    this.slots = [];

    for (let i = 0; i < 5; i++) {
      const randomPlant = this.getRandomPlant();
      if (randomPlant) {
        this.slots.push({
          config: randomPlant,
          starLevel: 1,
        });
      } else {
        this.slots.push(null);
      }
    }

    this.updateUI();
  }

  buy(
    index: number,
    availableSun: number,
  ): { plant: Plant; cost: number } | null {
    const slot = this.slots[index];
    if (!slot) return null;

    if (availableSun < slot.config.cost) return null;

    const plantNode = instantiate(this.shopSlotPrefab);
    const plant = plantNode.getComponent(Plant);

    if (plant) {
      plant.init(slot.config, slot.starLevel);
      this.slots[index] = null;
      this.updateUI();
      return { plant, cost: slot.config.cost };
    }

    return null;
  }

  getShopState(): (ShopPlant | null)[] {
    return [...this.slots];
  }

  private getRandomPlant(): PlantConfig | null {
    if (this.unlockedPlants.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * this.unlockedPlants.length);
    const plantId = this.unlockedPlants[randomIndex];
    return PLANTS[plantId];
  }

  private updateUI() {
    if (!this.slotsContainer) return;

    this.slotsContainer.removeAllChildren();

    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      const slotNode = instantiate(this.shopSlotPrefab);

      if (slot) {
        const plant = slotNode.getComponent(Plant);
        if (plant) {
          plant.init(slot.config, slot.starLevel);
        }

        const costLabel = slotNode
          .getChildByName("CostLabel")
          ?.getComponent(Label);
        if (costLabel) {
          costLabel.string = `☀️${slot.config.cost}`;
        }
      }

      this.slotsContainer.addChild(slotNode);
    }
  }
}
