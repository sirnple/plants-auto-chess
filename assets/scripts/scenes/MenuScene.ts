import { _decorator, Component, Node, Label, Color, Sprite, UITransform, Button, director } from 'cc';
import { GAME_CONFIG } from '../config/GameConfig';

const { ccclass, property } = _decorator;

@ccclass('MenuScene')
export class MenuScene extends Component {
    onLoad() {
        this.createMenuUI();
    }

    private createMenuUI() {
        const bgNode = new Node('Background');
        const bgSprite = bgNode.addComponent(Sprite);
        bgSprite.color = new Color(26, 26, 46, 255);
        const bgTransform = bgNode.addComponent(UITransform);
        bgTransform.setContentSize(new Vec2(GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT));
        bgNode.setPosition(0, 0, 0);
        bgNode.setParent(this.node);

        const titleNode = new Node('Title');
        const titleLabel = titleNode.addComponent(Label);
        titleLabel.string = '🌻 植物自走棋 🧟';
        titleLabel.fontSize = 48;
        titleLabel.color = Color.YELLOW;
        titleNode.setPosition(0, 200, 0);
        titleNode.setParent(this.node);

        const subtitleNode = new Node('Subtitle');
        const subtitleLabel = subtitleNode.addComponent(Label);
        subtitleLabel.string = '金铲铲之战 × 植物大战僵尸';
        subtitleLabel.fontSize = 24;
        subtitleLabel.color = Color.WHITE;
        subtitleNode.setPosition(0, 120, 0);
        subtitleNode.setParent(this.node);

        const startButtonNode = new Node('StartButton');
        const startButton = startButtonNode.addComponent(Button);
        const startLabel = startButtonNode.addComponent(Label);
        startLabel.string = '🎮 开始游戏';
        startLabel.fontSize = 32;
        startLabel.color = Color.GREEN;
        startButtonNode.setPosition(0, 0, 0);
        startButtonNode.setParent(this.node);

        startButton.node.on(Button.EventType.CLICK, this.onStartGame, this);

        const instructionsNode = new Node('Instructions');
        const instructionsLabel = instructionsNode.addComponent(Label);
        instructionsLabel.string = `
操作说明:
• 点击商店购买植物
• 点击备战区选中植物，再点击战场部署
• 点击战场植物可收回至备战区
• 3个相同植物自动合成为更高星级
• 激活羁绊获得强力加成
• 存活20回合即可通关!
        `.trim();
        instructionsLabel.fontSize = 16;
        instructionsLabel.color = Color.WHITE;
        instructionsNode.setPosition(0, -150, 0);
        instructionsNode.setParent(this.node);

        const versionNode = new Node('Version');
        const versionLabel = versionNode.addComponent(Label);
        versionLabel.string = 'v1.0.0 | Cocos Creator 3.8.8';
        versionLabel.fontSize = 14;
        versionLabel.color = Color.GRAY;
        versionNode.setPosition(0, -350, 0);
        versionNode.setParent(this.node);
    }

    private onStartGame() {
        director.loadScene('GameScene');
    }
}
