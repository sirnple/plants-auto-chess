import { _decorator, Component, director } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('BootScene')
export class BootScene extends Component {
    onLoad() {
        this.loadGame();
    }

    private loadGame() {
        director.loadScene('MenuScene');
    }
}
