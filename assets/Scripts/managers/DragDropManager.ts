import {
  _decorator,
  Component,
  Node,
  Vec3,
  EventTouch,
  Camera,
  geometry,
  PhysicsSystem,
} from "cc";

const { ccclass, property } = _decorator;

export interface DragCallback {
  onDragStart?: (node: Node) => void;
  onDragMove?: (node: Node, position: Vec3) => void;
  onDragEnd?: (node: Node, startPos: Vec3, endPos: Vec3) => void;
}

@ccclass("DragDropManager")
export class DragDropManager extends Component {
  @property(Camera)
  mainCamera: Camera = null;

  private draggedNode: Node | null = null;
  private dragOffset: Vec3 = new Vec3();
  private startPosition: Vec3 = new Vec3();
  private callbacks: DragCallback = {};
  private isDragging: boolean = false;

  onLoad() {
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  onDestroy() {
    this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  registerCallbacks(callbacks: DragCallback) {
    this.callbacks = callbacks;
  }

  private onTouchStart(event: EventTouch) {
    const touchPos = event.getLocation();
    const worldPos = this.screenToWorld(touchPos);

    const target = this.getDraggableNodeAt(worldPos);
    if (target) {
      this.draggedNode = target;
      this.startPosition = target.position.clone();
      Vec3.subtract(this.dragOffset, target.position, worldPos);
      this.isDragging = true;

      target.setScale(1.1, 1.1, 1);

      if (this.callbacks.onDragStart) {
        this.callbacks.onDragStart(target);
      }
    }
  }

  private onTouchMove(event: EventTouch) {
    if (!this.isDragging || !this.draggedNode) return;

    const touchPos = event.getLocation();
    const worldPos = this.screenToWorld(touchPos);

    const newPos = new Vec3();
    Vec3.add(newPos, worldPos, this.dragOffset);

    this.draggedNode.setPosition(newPos);

    if (this.callbacks.onDragMove) {
      this.callbacks.onDragMove(this.draggedNode, newPos);
    }
  }

  private onTouchEnd(event: EventTouch) {
    if (!this.isDragging || !this.draggedNode) return;

    const touchPos = event.getLocation();
    const worldPos = this.screenToWorld(touchPos);

    this.draggedNode.setScale(1, 1, 1);

    if (this.callbacks.onDragEnd) {
      this.callbacks.onDragEnd(this.draggedNode, this.startPosition, worldPos);
    }

    this.draggedNode = null;
    this.isDragging = false;
  }

  private screenToWorld(screenPos: Vec3): Vec3 {
    if (!this.mainCamera) return new Vec3(screenPos.x, screenPos.y, 0);

    const worldPos = new Vec3();
    this.mainCamera.screenToWorld(screenPos, worldPos);
    return worldPos;
  }

  private getDraggableNodeAt(worldPos: Vec3): Node | null {
    return null;
  }

  forceEndDrag() {
    if (this.draggedNode) {
      this.draggedNode.setPosition(this.startPosition);
      this.draggedNode.setScale(1, 1, 1);
      this.draggedNode = null;
      this.isDragging = false;
    }
  }
}
