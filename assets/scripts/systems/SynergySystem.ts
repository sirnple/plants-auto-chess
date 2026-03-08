import { _decorator, Component, Node } from 'cc';
import { TraitStatus, PlantData } from '../types/GameTypes';
import { TRAITS } from '../config/GameConfig';
import { Plant } from '../entities/Plant';

const { ccclass, property } = _decorator;

@ccclass('SynergySystem')
export class SynergySystem extends Component {
    private activeTraits: Map<string, TraitStatus> = new Map();

    calculateTraits(plants: Plant[]): TraitStatus[] {
        const traitCounts: Map<string, number> = new Map();

        plants.forEach(plant => {
            const data = plant.getData();
            if (!data) return;

            data.config.traits.forEach(traitId => {
                const count = traitCounts.get(traitId) || 0;
                traitCounts.set(traitId, count + 1);
            });
        });

        const result: TraitStatus[] = [];

        traitCounts.forEach((count, traitId) => {
            const config = TRAITS[traitId];
            if (!config) return;

            let activeLevel = 0;
            for (let i = config.thresholds.length - 1; i >= 0; i--) {
                if (count >= config.thresholds[i]) {
                    activeLevel = i + 1;
                    break;
                }
            }

            result.push({
                traitId: traitId,
                count: count,
                activeLevel: activeLevel
            });

            this.activeTraits.set(traitId, {
                traitId: traitId,
                count: count,
                activeLevel: activeLevel
            });
        });

        return result;
    }

    applyTraitBuffs(plants: Plant[]) {
        plants.forEach(plant => {
            const data = plant.getData();
            if (!data) return;

            data.config.traits.forEach(traitId => {
                const status = this.activeTraits.get(traitId);
                if (!status || status.activeLevel === 0) return;

                const config = TRAITS[traitId];
                if (!config) return;

                if (traitId === 'PEASHOOTER') {
                    const attackSpeedBonus = [0, 0.15, 0.35, 0.6][status.activeLevel];
                    if (data.config.attackSpeed > 0) {
                        const newData = { ...data };
                        newData.config = { ...data.config, attackSpeed: data.config.attackSpeed * (1 - attackSpeedBonus) };
                        plant.setData(newData);
                    }
                } else if (traitId === 'DEFENSE') {
                    const healthBonus = [0, 0.2, 0.4, 0.6][status.activeLevel];
                    const newMaxHealth = Math.floor(data.config.health * Math.pow(1.5, data.starLevel - 1) * (1 + healthBonus));
                    const healthDiff = newMaxHealth - data.maxHealth;
                    if (healthDiff > 0) {
                        plant.heal(healthDiff);
                    }
                }
            });
        });
    }

    getActiveTraits(): TraitStatus[] {
        return Array.from(this.activeTraits.values()).filter(t => t.activeLevel > 0);
    }

    clearTraits() {
        this.activeTraits.clear();
    }
}
