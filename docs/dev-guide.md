# 开发指南

本文档包含技术实现相关的信息，补充设计规格文档。

## 技术栈

- **引擎**: Phaser 3 (v3.70+)
- **语言**: TypeScript (v5.3.3)
- **构建**: Vite (v5.0.10)

## 项目结构

```
plants-auto-chess/
├── docs/
│   ├── spec/                   # 设计规格文档（纯设计）
│   └── dev-guide.md            # 本文档（技术实现）
├── src/
│   ├── main.ts                 # 入口
│   ├── config/                 # 配置
│   ├── scenes/                 # 场景
│   ├── systems/                # 系统
│   ├── entities/               # 实体
│   └── types/                  # 类型
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 快速开始

```bash
npm install
npm run dev
```

## 开发注意事项

### 导入路径
使用相对路径导入：
```typescript
import { Plant } from '../entities/index.js'
import { GAME_CONFIG } from '../config/index.js'
```

### 类型定义
所有类型定义在 `src/types/index.ts`

### 配置修改
游戏数值修改 `src/config/` 下的文件

## 与设计文档的关系

- **设计文档** (`docs/spec/`): 描述游戏应该做什么
- **开发指南** (本文档): 描述技术如何实现

修改代码前，请先阅读相关设计文档。
