import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { PlantData } from '../types/GameTypes';
import { GAME_CONFIG, PLANTS } from '../config/GameConfig';
import { Plant } from '../entities/Plant';

const { ccclass, property } = _decorator;

@ccclass('MergeSystem')
export class MergeSystem extends Component {
    @property(Prefab)
    plantPrefab: Prefab | null = null;

    private bench: (Plant | null)[] = [];
    private onMergeCallback: ((newPlant: Node, index: number) => void) | null = null;

    onLoad() {
        this.initBench();
    }

    private initBench() {
        this.bench = [];
        for (let i = 0; i < GAME_CONFIG.BENCH_SIZE; i++) {
            this.bench.push(null);
        }
    }

    setOnMerge(callback: (newPlant: Node, index: number) => void) {
        this.onMergeCallback = callback;
    }

    addToBench(plantNode: Node): boolean {
        const plant = plantNode.getComponent(Plant);
        if (!plant) return false;

        const emptyIndex = this.bench.findIndex(p => p === null);
        if (emptyIndex === -1) {
            return false;
        }

        plant.setBenchPosition(emptyIndex);
        this.bench[emptyIndex] = plant;
        plantNode.setParent(this.node);

        return true;
    }

    canAddToBench(plantConfigId: string, starLevel: number = 1): boolean {
        const emptyCount = this.bench.filter(p => p === null).length;
        if (emptyCount > 0) return true;

        const sameTypeCount = this.bench.filter(p => {
            if (!p) return false;
            const data = p.getData();
            return data && data.config.id === plantConfigId && data.starLevel === starLevel;
        }).length;

        return sameTypeCount >= GAME_CONFIG.MERGE_COUNT - 1;
    }

    removeFromBench(index: number): Node | null {
        if (index < 0 || index >= this.bench.length) return null;

        const plant = this.bench[index];
        if (!plant) return null;

        this.bench[index] = null;
        return plant.node;
    }

    getBench(): (Plant | null)[] {
        return this.bench;
    }

    getPlantAt(index: number): Plant | null {
        if (index < 0 || index >= this.bench.length) return null;
        return this.bench[index];
    }

    checkAndMerge(): { merged: boolean; newPlantNode: Node | null; index: number } {
        let canContinue = true;
        let lastMerged = false;
        let newPlantNode: Node | null = null;
        let newIndex = -1;

        while (canContinue) {
            canContinue = false;

            const groups = new Map<string, number[]>();

            this.bench.forEach((plant, index) => {
                if (!plant) return;
                const data = plant.getData();
                if (!data) return;

                if (data.starLevel >= GAME_CONFIG.MAX_STAR_LEVEL) return;

                const key = `${data.config.id}_${data.starLevel}`;
                if (!groups.has(key)) {
                    groups.set(key, []);
                }
                groups.get(key)!.push(index);
            });

            for (const [key, indices] of groups) {
                if (indices.length >= GAME_CONFIG.MERGE_COUNT) {
                    const [configId, starLevelStr] = key.split('_');
                    const starLevel = parseInt(starLevelStr);

                    const indicesToMerge = indices.slice(0, GAME_CONFIG.MERGE_COUNT);
                    const firstIndex = indicesToMerge[0];

                    indicesToMerge.forEach(idx => {
                        const plant = this.bench[idx];
                        if (plant) {
                            plant.node.destroy();
                            this.bench[idx] = null;
                        }
                    });

                    const config = PLANTS[configId];
                    if (config) {
                        const newPlantNode = new Node('Plant');
                        const newPlant = newPlantNode.addComponent(Plant);
                        newPlant.init(config, starLevel + 1, firstIndex);
                        newPlant.setBenchPosition(firstIndex);
                        newPlantNode.setParent(this.node);
                        this.bench[firstIndex] = newPlant;

                        canContinue = true;
                        lastMerged = true;
                        newIndex = firstIndex;

                        if (this.onMergeCallback) {
                            this.onMergeCallback(newPlantNode, firstIndex);
                        }
                    }

                    break;
                }
            }
        }

        return { merged: lastMerged, newPlantNode, index: newIndex };
    }

    getBenchPlantCount(): number {
        return this.bench.filter(p => p !== null).length;
    }

    isBenchFull(): boolean {
        return this.getBenchPlantCount() >= GAME_CONFIG.BENCH_SIZE;
    }
}
