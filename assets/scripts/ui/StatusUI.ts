import { _decorator, Component, Node, Label, Color, Sprite, UITransform, Vec3 } from 'cc';
import { GAME_CONFIG } from '../config/GameConfig';

const { ccclass, property } = _decorator;

@ccclass('StatusUI')
export class StatusUI extends Component {
    @property(Label)
    sunLabel: Label | null = null;

    @property(Label)
    healthLabel: Label | null = null;

    @property(Label)
    roundLabel: Label | null = null;

    @property(Node)
    infoModeButton: Node | null = null;

    private isInfoMode: boolean = false;
    private onInfoModeToggle: ((enabled: boolean) => void) | null = null;

    onLoad() {
        this.createStatusUI();
    }

    private createStatusUI() {
        const transform = this.node.addComponent(UITransform);
        transform.setContentSize(new Vec2(GAME_CONFIG.CANVAS_WIDTH, 50));

        const bgNode = new Node('BG');
        const bgSprite = bgNode.addComponent(Sprite);
        bgSprite.color = new Color(44, 62, 80, 255);
        const bgTransform = bgNode.addComponent(UITransform);
        bgTransform.setContentSize(new Vec2(GAME_CONFIG.CANVAS_WIDTH, 50));
        bgNode.setPosition(0, 0, 0);
        bgNode.setParent(this.node);

        const sunNode = new Node('SunLabel');
        this.sunLabel = sunNode.addComponent(Label);
        this.sunLabel.string = '☀️ 100';
        this.sunLabel.fontSize = 24;
        sunNode.setPosition(-450, 0, 0);
        sunNode.setParent(this.node);

        const healthNode = new Node('HealthLabel');
        this.healthLabel = healthNode.addComponent(Label);
        this.healthLabel.string = '❤️ 20';
        this.healthLabel.fontSize = 24;
        healthNode.setPosition(-250, 0, 0);
        healthNode.setParent(this.node);

        const roundNode = new Node('RoundLabel');
        this.roundLabel = roundNode.addComponent(Label);
        this.roundLabel.string = '回合 1';
        this.roundLabel.fontSize = 24;
        roundNode.setPosition(-50, 0, 0);
        roundNode.setParent(this.node);

        const infoButtonNode = new Node('InfoModeButton');
        const infoLabel = infoButtonNode.addComponent(Label);
        infoLabel.string = 'ℹ️ 信息模式';
        infoLabel.fontSize = 18;
        infoButtonNode.setPosition(450, 0, 0);
        infoButtonNode.setParent(this.node);
        this.infoModeButton = infoButtonNode;
    }

    setOnInfoModeToggle(callback: (enabled: boolean) => void) {
        this.onInfoModeToggle = callback;
    }

    toggleInfoMode() {
        this.isInfoMode = !this.isInfoMode;
        if (this.infoModeButton) {
            const label = this.infoModeButton.getComponent(Label);
            if (label) {
                label.color = this.isInfoMode ? Color.YELLOW : Color.WHITE;
            }
        }
        if (this.onInfoModeToggle) {
            this.onInfoModeToggle(this.isInfoMode);
        }
    }

    updateSun(sun: number) {
        if (this.sunLabel) {
            this.sunLabel.string = `☀️ ${sun}`;
        }
    }

    updateHealth(health: number) {
        if (this.healthLabel) {
            this.healthLabel.string = `❤️ ${health}`;
        }
    }

    updateRound(round: number) {
        if (this.roundLabel) {
            this.roundLabel.string = `回合 ${round}`;
        }
    }

    getIsInfoMode(): boolean {
        return this.isInfoMode;
    }
}
