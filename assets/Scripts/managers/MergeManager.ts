import { _decorator, Component, Node, Prefab, instantiate } from "cc";
import { Plant } from "../entities/Plant";
import { GAME_CONFIG } from "../config/GameConstants";

const { ccclass, property } = _decorator;

@ccclass("MergeManager")
export class MergeManager extends Component {
  @property(Prefab)
  plantPrefab: Prefab = null;

  @property(Node)
  benchContainer: Node = null;

  private bench: (Plant | null)[] = [];

  onLoad() {
    this.clearBench();
  }

  clearBench() {
    this.bench = new Array(GAME_CONFIG.BENCH.SLOTS).fill(null);
    this.updateUI();
  }

  canAddToBench(): boolean {
    return this.bench.some((slot) => slot === null);
  }

  addToBench(plant: Plant): number {
    const emptyIndex = this.bench.findIndex((slot) => slot === null);
    if (emptyIndex === -1) return -1;

    this.bench[emptyIndex] = plant;

    this.tryMerge();
    this.updateUI();

    return emptyIndex;
  }

  removeFromBench(index: number): Plant | null {
    const plant = this.bench[index];
    this.bench[index] = null;
    this.updateUI();
    return plant;
  }

  getBenchState(): (Plant | null)[] {
    return [...this.bench];
  }

  getPlantAt(index: number): Plant | null {
    if (index < 0 || index >= this.bench.length) return null;
    return this.bench[index];
  }

  private tryMerge() {
    const merges: { id: string; starLevel: number; indices: number[] }[] = [];

    for (let i = 0; i < this.bench.length; i++) {
      const plant = this.bench[i];
      if (!plant) continue;

      const key = `${plant.config?.id}_${plant.starLevel}`;
      const existing = merges.find((m) => `${m.id}_${m.starLevel}` === key);

      if (existing) {
        existing.indices.push(i);
      } else {
        merges.push({
          id: plant.config?.id || "",
          starLevel: plant.starLevel,
          indices: [i],
        });
      }
    }

    for (const merge of merges) {
      if (merge.indices.length >= 3) {
        this.performMerge(merge.indices.slice(0, 3));
      }
    }
  }

  private performMerge(indices: number[]) {
    const firstPlant = this.bench[indices[0]];
    if (!firstPlant || firstPlant.starLevel >= 3) return;

    for (const index of indices) {
      const plant = this.bench[index];
      if (plant && plant.node.isValid) {
        plant.node.destroy();
      }
      this.bench[index] = null;
    }

    const mergedNode = instantiate(this.plantPrefab);
    const mergedPlant = mergedNode.getComponent(Plant);

    if (mergedPlant && firstPlant.config) {
      mergedPlant.init(firstPlant.config, firstPlant.starLevel + 1);
      this.addToBench(mergedPlant);
    }
  }

  private updateUI() {
    if (!this.benchContainer) return;

    this.benchContainer.removeAllChildren();

    for (let i = 0; i < this.bench.length; i++) {
      const plant = this.bench[i];
      if (plant && plant.node.isValid) {
        this.benchContainer.addChild(plant.node);
      }
    }
  }
}
