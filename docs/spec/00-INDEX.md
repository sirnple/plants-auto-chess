# 植物自走棋 - 设计规格文档 (Design Specification)

**版本**: v1.0  
**最后更新**: 2026-03-08  
**类型**: 融合游戏（金铲铲之战 x 植物大战僵尸）

---

## 📑 文档索引

### 核心文档
| 文档 | 说明 | 路径 |
|------|------|------|
| [00-INDEX.md](./00-INDEX.md) | 本文档，总索引 | `spec/00-INDEX.md` |
| [01-OVERVIEW.md](./01-OVERVIEW.md) | 产品概述与核心体验 | `spec/01-OVERVIEW.md` |
| [02-ARCHITECTURE.md](./02-ARCHITECTURE.md) | 系统架构设计 | `spec/02-ARCHITECTURE.md` |
| [03-GAMEPLAY.md](./03-GAMEPLAY.md) | 核心玩法与游戏循环 | `spec/03-GAMEPLAY.md` |

### 系统设计
| 文档 | 说明 | 路径 |
|------|------|------|
| [10-BATTLE.md](./10-BATTLE.md) | 战斗系统设计 | `spec/10-BATTLE.md` |
| [11-SHOP.md](./11-SHOP.md) | 商店与合成系统 | `spec/11-SHOP.md` |
| [12-SYNERGY.md](./12-SYNERGY.md) | 羁绊系统设计 | `spec/12-SYNERGY.md` |
| [13-ITEM.md](./13-ITEM.md) | 装备系统设计 | `spec/13-ITEM.md` |
| [14-UI.md](./14-UI.md) | UI/UX设计规范 | `spec/14-UI.md` |

### 数据与配置
| 文档 | 说明 | 路径 |
|------|------|------|
| [20-DATA.md](./20-DATA.md) | 植物/僵尸数据规格 | `spec/20-DATA.md` |
| [21-WAVES.md](./21-WAVES.md) | 波次配置规格 | `spec/21-WAVES.md` |
| [22-BALANCE.md](./22-BALANCE.md) | 数值平衡文档 | `spec/22-BALANCE.md` |

### 设计与维护
| 文档 | 说明 | 路径 |
|------|------|------|
| [31-LESSONS.md](./31-LESSONS.md) | 设计经验教训 | `spec/31-LESSONS.md` |
| [40-TODO.md](./40-TODO.md) | 待办事项与迭代计划 | `spec/40-TODO.md` |

---

## 🎯 快速导航

### 如果你是游戏设计师
推荐阅读顺序：
1. [01-OVERVIEW.md](./01-OVERVIEW.md) - 了解游戏是什么
2. [03-GAMEPLAY.md](./03-GAMEPLAY.md) - 了解核心玩法
3. [02-ARCHITECTURE.md](./02-ARCHITECTURE.md) - 了解系统架构
4. [31-LESSONS.md](./31-LESSONS.md) - 了解设计决策

### 如果你要修改数值
推荐阅读：
1. [20-DATA.md](./20-DATA.md) - 植物/僵尸数据
2. [22-BALANCE.md](./22-BALANCE.md) - 平衡性调整
3. [21-WAVES.md](./21-WAVES.md) - 波次配置

### 如果你要修复Bug
推荐阅读：
1. [31-LESSONS.md](./31-LESSONS.md) - 已知问题和解决方案
2. 相关系统的详细文档（10-14）

---

## 📝 文档规范

### 文档格式
- 使用 Markdown 格式
- 中文为主，英文术语保留
- 代码块仅用于展示逻辑，不绑定具体语言

### 更新记录
每个文档底部应有更新日志：
```markdown
## 更新日志
- 2026-03-08: 初始版本
```

### 关联标记
使用 `[LINK: xxx]` 标记关联文档，例如：
```markdown
详见 [LINK: 战斗系统](./10-BATTLE.md) 的说明
```

---

## 🎮 游戏核心参数

### 画布尺寸
- 宽度: 1200px
- 高度: 800px

### 战场网格
- 行数: 5
- 列数: 8
- 格子大小: 70px
- 起始位置: (50, 100)

### 经济系统
- 初始阳光: 100
- 初始生命: 20
- 商店刷新: 2阳光
- 回合奖励: 20 + 回合数 × 2

### 合成规则
- 3个1星 → 1个2星
- 3个2星 → 1个3星
- 3个3星 → 1个4星
- 最大星级: 4星
- 备战席大小: 8格（固定）

---

## 🔗 外部链接

- [项目 README](../README.md)
- [平衡性文档](../BALANCE.md)
- [源代码](../src/)
