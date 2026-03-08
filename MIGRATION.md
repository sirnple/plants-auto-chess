# 植物自走棋 - Cocos Creator 版本

从 Phaser 迁移到 Cocos Creator，以获得更好的拖拽体验和微信小游戏支持。

## 迁移完成度

### ✅ 已迁移模块

- [x] 类型定义 (`types/`)
- [x] 游戏常量配置 (`config/`)
- [x] 实体类
  - [x] Plant (植物)
  - [x] Zombie (僵尸)
  - [x] Projectile (子弹)
  - [x] Item (装备)
- [x] 管理器
  - [x] DragDropManager (拖拽系统) - 原生触摸支持
  - [x] BattleManager (战斗系统)
  - [x] ShopManager (商店系统)
  - [x] MergeManager (合成系统)
  - [x] WaveManager (波次系统)
- [x] 游戏主场景 (`GameScene.ts`)

## Cocos Creator 的优势

### 拖拽体验改进

- 原生触摸事件支持 (`TOUCH_START`, `TOUCH_MOVE`, `TOUCH_END`)
- 流畅的拖拽跟随
- 多点触控支持
- 精确的碰撞检测

### 性能优化

- DrawCall 自动合批
- 对象池支持
- 更小的包体 (适合微信小游戏 4MB 限制)
- 更低的内存占用

## 项目结构

```
assets/
├── Scripts/
│   ├── config/
│   │   ├── GameConstants.ts    # 游戏常量
│   │   └── GameConfig.ts       # 植物/僵尸配置
│   ├── entities/
│   │   ├── Plant.ts            # 植物实体
│   │   ├── Zombie.ts           # 僵尸实体
│   │   ├── Projectile.ts       # 子弹
│   │   └── Item.ts             # 装备
│   ├── managers/
│   │   ├── DragDropManager.ts  # 拖拽管理
│   │   ├── BattleManager.ts    # 战斗管理
│   │   ├── ShopManager.ts      # 商店管理
│   │   ├── MergeManager.ts     # 合成管理
│   │   └── WaveManager.ts      # 波次管理
│   ├── scenes/
│   │   └── GameScene.ts        # 游戏主场景
│   └── types/
│       └── GameTypes.ts        # 类型定义
└── resources/
    └── prefabs/                # 预制体资源
```

## 下一步操作

1. **安装 Cocos Creator 3.8+**
   - 下载地址: https://www.cocos.com/creator

2. **打开项目**
   - 在 Cocos Dashboard 中导入此项目

3. **创建预制体**
   - 在编辑器中创建 Plant、Zombie、Projectile 的预制体
   - 配置 Sprite、Label 组件

4. **配置场景**
   - 创建 GameScene
   - 绑定所有 Manager 组件
   - 配置 UI 节点

5. **发布微信小游戏**
   - 菜单 -> 项目 -> 构建发布
   - 选择"微信小游戏"平台
   - 配置 AppID

## 核心改进

### 拖拽系统

```typescript
// Cocos 原生拖拽支持
this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
```

### 动画系统

```typescript
// Cocos Tween 动画
tween(this.node)
  .to(0.1, { scale: new Vec3(1.2, 1.2, 1) })
  .to(0.1, { scale: new Vec3(1, 1, 1) })
  .start();
```

### 组件系统

```typescript
@ccclass("Plant")
export class Plant extends Component {
  @property(Label)
  emojiLabel: Label = null;

  @property(Node)
  healthBar: Node = null;
}
```

## 与原 Phaser 版本的差异

| 特性 | Phaser       | Cocos Creator   |
| ---- | ------------ | --------------- |
| 拖拽 | Pointer 事件 | 原生 Touch 事件 |
| 动画 | Tweens       | Tween 系统      |
| UI   | Canvas API   | UI 组件系统     |
| 发布 | Web          | 微信/抖音/原生  |
| 性能 | 良好         | 更优            |

## License

MIT
