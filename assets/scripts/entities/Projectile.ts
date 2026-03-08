import { _decorator, Component, Node, Label, tween, Vec3 } from 'cc';
import { ProjectileData } from '../types/GameTypes';

const { ccclass, property } = _decorator;

@ccclass('Projectile')
export class Projectile extends Component {
    private data: ProjectileData | null = null;
    private label: Label | null = null;
    private onHitCallback: ((projectile: Projectile, zombie: Node) => void) | null = null;

    init(data: ProjectileData) {
        this.data = { ...data };
        this.node.setPosition(data.x, data.y, 0);
        this.updateDisplay();
    }

    private updateDisplay() {
        if (!this.data) return;

        this.node.removeAllChildren();

        const projNode = new Node('ProjDisplay');
        projNode.setParent(this.node);

        const label = projNode.addComponent(Label);
        
        if (this.data.isIce) {
            label.string = '❄️';
        } else {
            label.string = '🔵';
        }
        label.fontSize = 16;
        label.lineHeight = 16;
    }

    setOnHit(callback: (projectile: Projectile, zombie: Node) => void) {
        this.onHitCallback = callback;
    }

    update(deltaTime: number) {
        if (!this.data) return;

        this.data.x += this.data.speed * deltaTime * 200;
        this.node.setPosition(this.data.x, this.node.position.y, 0);

        if (this.data.x > GAME_CONFIG.CANVAS_WIDTH + 50) {
            this.node.destroy();
        }
    }

    getData(): ProjectileData | null {
        return this.data;
    }

    hit(zombie: Node) {
        if (this.onHitCallback && this.data) {
            this.onHitCallback(this, zombie);
        }
        this.node.destroy();
    }
}

import { GAME_CONFIG } from '../config/GameConfig';
