# Cocos Creator 项目设置指南

## 第一步：创建游戏场景

1. 在 **资源管理器** 中右键 `assets` 文件夹
2. 选择 **创建 → 场景**
3. 命名为 `GameScene`
4. 双击打开场景

## 第二步：创建画布和相机

1. 在 **层级管理器** 中右键空白处
2. 选择 **创建 → UI 组件 → Canvas**（画布）
3. 在 Canvas 下创建 **创建 → 2D 对象 → Sprite**（作为背景）

### 设置 Canvas

- **设计分辨率**: 1200 × 800
- **适配屏幕宽度**: 勾选

## 第三步：创建战场网格

在 Canvas 下创建空节点，命名为 `BattleField`：

1. 右键 Canvas → **创建空节点**
2. 命名为 `BattleField`
3. 添加 `BattleManager` 组件（拖入 `BattleManager.ts` 脚本）
4. 在该节点下创建以下子节点：
   - `GridContainer`（空节点，用于显示网格）
   - `PlantsContainer`（空节点，存放植物）
   - `ZombiesContainer`（空节点，存放僵尸）
   - `ProjectilesContainer`（空节点，存放子弹）

## 第四步：创建预制体

### 创建 Plant 预制体

1. 在 **资源管理器** 中进入 `assets/resources/prefabs`
2. 右键 → **创建 → 预制体**，命名为 `Plant`
3. 双击打开预制体
4. 在预制体根节点上：
   - 添加 **Sprite** 组件（白色方块作为背景）
   - 添加 **Label** 子节点（显示 emoji）
     - 位置: (0, 0)
     - 字体大小: 48
   - 添加 **Label** 子节点（显示星级）
     - 名称: `StarLabel`
     - 位置: (20, -25)
     - 字体大小: 14
   - 添加 **Sprite** 子节点（血条背景）
     - 名称: `HealthBar`
     - 位置: (0, -25)
     - 大小: (50, 6)
     - 颜色: 红色
   - 添加 `Plant` 脚本组件（拖入 `Plant.ts`）
   - 在脚本组件中绑定属性：
     - `EmojiLabel` → 拖入 emoji Label 节点
     - `StarLabel` → 拖入星级 Label 节点
     - `HealthBar` → 拖入血条 Sprite 节点

### 创建 Zombie 预制体

类似 Plant 预制体：

1. 创建 `Zombie` 预制体
2. 添加 Sprite、Label（emoji）、Sprite（血条）
3. 添加 `Zombie` 脚本组件
4. 绑定对应属性

### 创建 Projectile 预制体

1. 创建 `Projectile` 预制体
2. 添加 Sprite（小圆点）
3. 添加 `Projectile` 脚本组件

## 第五步：创建 UI 界面

在 Canvas 下创建以下节点：

### 顶部状态栏

```
StatusBar (空节点)
├── SunLabel (Label) - 显示 ☀️ 100
├── HealthLabel (Label) - 显示 ❤️ 20
└── RoundLabel (Label) - 显示 🎯 回合 1
```

### 右侧商店

```
ShopPanel (Sprite - 紫色背景)
├── ShopTitle (Label) - "🛒 商店"
├── SlotsContainer (空节点) - 商店格子
└── RefreshButton (Button) - "🔄 刷新 (2☀️)"
```

### 底部备战区

```
BenchPanel (Sprite - 灰色背景)
├── BenchTitle (Label) - "备战区"
└── BenchContainer (空节点) - 8个格子
```

### 开始战斗按钮

```
StartBattleButton (Button - 红色)
└── Label - "⚔️ 开始战斗"
```

## 第六步：绑定 GameScene 脚本

1. 在 Canvas 节点上添加 `GameScene` 脚本组件
2. 绑定以下属性：
   - `SunLabel` → 拖入 SunLabel 节点
   - `HealthLabel` → 拖入 HealthLabel 节点
   - `RoundLabel` → 拖入 RoundLabel 节点
   - `StartBattleButton` → 拖入开始战斗按钮
   - `RefreshShopButton` → 拖入刷新按钮
   - `BattleManager` → 拖入 BattleField 节点
   - `ShopManager` → 需要创建并绑定
   - `MergeManager` → 需要创建并绑定
   - `WaveManager` → 需要创建并绑定

## 第七步：创建 Manager 节点

在 Canvas 下创建空节点 `Managers`，添加以下子节点：

### ShopManager 节点

1. 创建空节点 `ShopManager`
2. 添加 `ShopManager` 脚本
3. 绑定：
   - `ShopSlotPrefab` → 拖入 Plant 预制体
   - `SlotsContainer` → 拖入 SlotsContainer 节点
   - `RefreshButton` → 拖入刷新按钮

### MergeManager 节点

1. 创建空节点 `MergeManager`
2. 添加 `MergeManager` 脚本
3. 绑定：
   - `PlantPrefab` → 拖入 Plant 预制体
   - `BenchContainer` → 拖入 BenchContainer 节点

### WaveManager 节点

1. 创建空节点 `WaveManager`
2. 添加 `WaveManager` 脚本

### DragDropManager 节点

1. 创建空节点 `DragDropManager`
2. 添加 `DragDropManager` 脚本
3. 绑定 `MainCamera` → 拖入场景中的相机

## 第八步：保存并运行

1. **保存场景**（Ctrl + S）
2. 点击编辑器上方的 **预览** 按钮（▶️）
3. 如果配置正确，你应该能看到游戏界面了

## 常见问题

### 场景是黑的

- 检查 Canvas 下是否有节点
- 检查相机是否设置为 2D 模式

### 脚本报错

- 检查所有脚本属性是否已绑定
- 检查预制体是否正确创建

### 看不到网格

- 需要在 BattleField 下添加网格视觉（可以用多个 Sprite 拼成网格）

## 快捷操作

- **F12**: 打开浏览器开发者工具（预览时）
- **Ctrl + S**: 保存场景
- **Ctrl + D**: 复制节点
- **Delete**: 删除节点
- **Alt + 鼠标左键**: 旋转视角（3D 模式）

## 下一步

完成以上步骤后，你应该能看到：

- 战场网格
- 商店界面
- 备战区
- 状态栏（阳光、血量、回合）

然后可以测试拖拽功能是否正常！
