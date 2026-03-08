import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { PlantData, ShopSlot, PlantConfig } from '../types/GameTypes';
import { PLANTS, GAME_CONFIG } from '../config/GameConfig';
import { Plant } from '../entities/Plant';

const { ccclass, property } = _decorator;

@ccclass('ShopSystem')
export class ShopSystem extends Component {
    @property(Prefab)
    plantPrefab: Prefab | null = null;

    private shop: ShopSlot[] = [];
    private unlockedPlants: string[] = [];
    private currentRound: number = 1;
    private onPurchaseCallback: ((plantConfig: PlantConfig, cost: number) => Node | null) | null = null;
    private onRefreshCallback: (() => void) | null = null;

    onLoad() {
        this.initShop();
        this.updateUnlockedPlants();
    }

    private initShop() {
        this.shop = [];
        for (let i = 0; i < GAME_CONFIG.SHOP_SIZE; i++) {
            this.shop.push({
                plant: null,
                isLocked: false
            });
        }
    }

    private updateUnlockedPlants() {
        this.unlockedPlants = [];
        
        Object.values(PLANTS).forEach(plant => {
            if (plant.unlockRound <= this.currentRound) {
                this.unlockedPlants.push(plant.id);
            }
        });
    }

    setRound(round: number) {
        this.currentRound = round;
        this.updateUnlockedPlants();
    }

    setOnPurchase(callback: (plantConfig: PlantConfig, cost: number) => Node | null) {
        this.onPurchaseCallback = callback;
    }

    setOnRefresh(callback: () => void) {
        this.onRefreshCallback = callback;
    }

    refreshShop(): boolean {
        for (let i = 0; i < this.shop.length; i++) {
            if (!this.shop[i].isLocked) {
                const randomPlant = this.getRandomPlant();
                this.shop[i].plant = randomPlant;
            }
        }

        if (this.onRefreshCallback) {
            this.onRefreshCallback();
        }

        return true;
    }

    private getRandomPlant(): PlantConfig {
        if (this.unlockedPlants.length === 0) {
            return PLANTS['peashooter'];
        }

        const weights: { plant: PlantConfig; weight: number }[] = [];
        
        this.unlockedPlants.forEach(id => {
            const plant = PLANTS[id];
            if (plant) {
                let weight = Math.max(1, 7 - plant.cost);
                weight = weight * (1 + (this.currentRound - plant.unlockRound) * 0.1);
                weights.push({ plant, weight });
            }
        });

        const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
        let random = Math.random() * totalWeight;

        for (const w of weights) {
            random -= w.weight;
            if (random <= 0) {
                return w.plant;
            }
        }

        return weights[0].plant;
    }

    purchase(index: number): Node | null {
        if (index < 0 || index >= this.shop.length) {
            return null;
        }

        const slot = this.shop[index];
        if (!slot.plant) {
            return null;
        }

        if (this.onPurchaseCallback) {
            const plantNode = this.onPurchaseCallback(slot.plant, slot.plant.cost);
            if (plantNode) {
                slot.plant = null;
                return plantNode;
            }
        }

        return null;
    }

    canAfford(index: number, sun: number): boolean {
        if (index < 0 || index >= this.shop.length) {
            return false;
        }

        const slot = this.shop[index];
        if (!slot.plant) {
            return false;
        }

        return sun >= slot.plant.cost;
    }

    getShop(): ShopSlot[] {
        return this.shop;
    }

    getPlantAt(index: number): PlantConfig | null {
        if (index < 0 || index >= this.shop.length) {
            return null;
        }
        return this.shop[index].plant;
    }

    toggleLock(index: number) {
        if (index < 0 || index >= this.shop.length) {
            return;
        }
        this.shop[index].isLocked = !this.shop[index].isLocked;
    }

    isLocked(index: number): boolean {
        if (index < 0 || index >= this.shop.length) {
            return false;
        }
        return this.shop[index].isLocked;
    }

    getRefreshCost(): number {
        return GAME_CONFIG.SHOP_REFRESH_COST;
    }
}
