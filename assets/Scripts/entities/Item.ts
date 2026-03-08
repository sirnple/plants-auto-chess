import { _decorator, Component, Node, Label, tween, Vec3 } from "cc";
import { ItemConfig } from "../types/GameTypes";

const { ccclass, property } = _decorator;

@ccclass("Item")
export class Item extends Component {
  @property(Label)
  emojiLabel: Label = null;

  config: ItemConfig | null = null;
  equipped: boolean = false;

  init(config: ItemConfig) {
    this.config = config;
    this.equipped = false;

    if (this.emojiLabel) {
      this.emojiLabel.string = config.emoji;
    }

    this.node.setScale(0, 0, 1);
    this.node.setOpacity(0);

    tween(this.node)
      .to(0.3, { scale: new Vec3(1, 1, 1), opacity: 255 })
      .start();
  }

  equip(target: any): boolean {
    if (!this.config || this.equipped) return false;

    this.equipped = true;
    return true;
  }

  setSelected(selected: boolean) {
    tween(this.node)
      .to(0.1, { scale: selected ? new Vec3(1.2, 1.2, 1) : new Vec3(1, 1, 1) })
      .start();
  }
}
