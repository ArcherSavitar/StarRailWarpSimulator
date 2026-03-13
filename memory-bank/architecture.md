# 架构文档 - StarRailWarpSimulator

## 1. 系统架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│  (React Components: Banner, PullButton, ResultModal, etc.)  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Hooks Layer                             │
│           (useWarp, usePity, useLocalStorage)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   State Layer (Zustand)                     │
│                   warpStore.ts                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│      (characters.ts, weapons.ts, banners.ts, gacha.ts)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Persistence Layer                           │
│                   localStorage                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 数据模型

### 2.1 角色 (Character)

```typescript
interface Character {
  id: string;           // 唯一标识符
  name: string;         // 角色名称
  rarity: 5 | 4 | 3;   // 星级
  path: Path;          // 命途
  element: Element;    // 元素
  isLimited: boolean;  // 是否限定
  image?: string;      // 立绘路径（可选）
}

type Path = '毁灭' | '巡猎' | '智识' | '同谐' | '虚无' | '丰饶' | '存护';
type Element = '物理' | '火' | '冰' | '雷' | '风' | '量子' | '虚数';
```

### 2.2 武器/光锥 (Weapon)

```typescript
interface Weapon {
  id: string;           // 唯一标识符
  name: string;         // 武器名称
  rarity: 5 | 4 | 3;   // 星级
  type: Path;           // 类型（命途）
  isLimited: boolean;  // 是否限定
  image?: string;      // 图片路径（可选）
}
```

### 2.3 卡池 (Banner)

```typescript
type BannerType = 'character' | 'weapon';
type BannerCategory = 'event' | 'standard' | 'newcomer';

interface Banner {
  id: string;                    // 卡池ID
  name: string;                 // 卡池名称
  type: BannerType;             // 角色/武器池
  category: BannerCategory;     // 活动/常驻/新手
  rateUp5Star: string[];        // UP的5星ID列表
  rateUp4Star: string[];        // UP的4星ID列表
  startDate?: string;           // 开始日期
  endDate?: string;             // 结束日期
  // 运行时属性（非持久化）
  isActive?: boolean;
}
```

### 2.4 抽卡记录 (PullRecord)

```typescript
interface PullRecord {
  id: string;                    // 记录ID (UUID)
  bannerId: string;               // 卡池ID
  bannerName: string;            // 卡池名称（快照）
  itemId: string;                // 角色/武器ID
  itemName: string;              // 角色/武器名称（快照）
  rarity: 5 | 4 | 3;             // 星级
  type: 'character' | 'weapon';  // 类型
  isRateUp: boolean;             // 是否为UP
  timestamp: number;             // 时间戳
  pityCount: number;             // 抽卡时的保底计数
}
```

### 2.5 保底状态 (PityState)

```typescript
interface PityState {
  fiveStarPity: number;            // 5星保底计数 (0-90/80)
  fourStarPity: number;           // 4星保底计数 (0-10)
  isGuaranteedUP: boolean;        // 是否进入大保底（歪过后）
  isFourStarGuaranteedUP: boolean; // 4星UP保底
}
```

### 2.6 统计数据 (Stats)

```typescript
interface Stats {
  totalPulls: number;              // 总抽卡数
  totalFiveStars: number;          // 总5星数
  totalFourStars: number;          // 总4星数
  pullsInCurrentBanner: number;    // 当前卡池抽数
  currency: number;                // 抽卡券数量
  // 按卡池统计
  bannerStats: Record<string, BannerStats>;
}

interface BannerStats {
  pulls: number;
  fiveStars: number;
  fourStars: number;
  obtainedItems: string[];         // 获得的角色/武器ID列表
}
```

---

## 3. 状态管理

### 3.1 WarpStore (Zustand)

```typescript
interface WarpStore {
  // === 状态 ===
  currentBannerId: string;
  pityState: PityState;
  stats: Stats;
  pullHistory: PullRecord[];
  customBanners: Banner[];
  isPulling: boolean;
  showResult: boolean;
  currentResult: PullRecord[];

  // === Actions ===
  pull: (count: 1 | 10) => PullRecord[];
  switchBanner: (bannerId: string) => void;
  clearHistory: () => void;
  exportHistory: () => string;
  importHistory: (data: string) => boolean;
  addCustomBanner: (banner: Banner) => void;
  deleteCustomBanner: (bannerId: string) => void;
}
```

### 3.2 状态流程图

```
用户点击抽卡
     │
     ▼
┌─────────────┐
│ isPulling?  │──是──▶ 显示动画，等待
└─────────────┘
     │否
     ▼
┌─────────────────────┐
│ 调用 pull(count)    │
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│ 遍历 count 次        │
│ 逐次计算抽卡结果     │
└─────────────────────┘
     │
     ├─▶ 更新 pityState
     ├─▶ 更新 stats
     ├─▶ 添加到 pullHistory
     └─▶ 显示结果弹窗
```

---

## 4. 抽卡算法

### 4.1 核心逻辑

```typescript
// 伪代码流程
function pull(banner: Banner, pity: PityState): PullRecord {
  // 1. 检查4星保底
  if (pity.fourStarPity >= 9) {
    return getFourStar(banner, pity.isFourStarGuaranteedUP);
  }

  // 2. 检查5星保底
  const fiveStarLimit = banner.type === 'weapon' ? 79 : 89;
  if (pity.fiveStarPity >= fiveStarLimit) {
    // 大保底：必出UP
    if (pity.isGuaranteedUP) {
      return getRateUpFiveStar(banner);
    }
    // 小保底：根据概率判断
    const upRate = banner.type === 'weapon' ? 0.75 : 0.5;
    return Math.random() < upRate
      ? getRateUpFiveStar(banner)
      : getStandardFiveStar(banner);
  }

  // 3. 基础概率计算
  const rand = Math.random() * 10000;
  if (rand < baseFiveStarRate) {
    return handleFiveStarBase(banner, pity);
  } else if (rand < baseFourStarRate) {
    return getFourStar(banner, pity.isFourStarGuaranteedUP);
  }

  // 4. 3星
  return getThreeStar();
}
```

### 4.2 概率表

| 卡池类型 | 5星基础概率 | 4星基础概率 | 5星UP概率 | 4星UP概率 | 5星保底 | 4星保底 |
|---------|------------|------------|----------|----------|---------|---------|
| 角色活动 | 0.6% | 5.1% | 50% | 50% | 90 | 10 |
| 光锥活动 | 0.8% | 6.6% | 75% | 75% | 80 | 10 |
| 常驻跃迁 | 0.6% | 5.1% | N/A | N/A | 50 | 10 |
| 新手跃迁 | 0.6% | 5.1% | N/A | N/A | 50 (max) | 10 |

---

## 5. 持久化存储

### 5.1 localStorage 结构

```typescript
const STORAGE_KEYS = {
  VERSION: 'warp_version',
  CURRENT_BANNER: 'warp_current_banner',
  PITY_STATE: 'warp_pity_state',
  STATS: 'warp_stats',
  PULL_HISTORY: 'warp_pull_history',
  CUSTOM_BANNERS: 'warp_custom_banners',
  CURRENCY: 'warp_currency',
} as const;

// 存储格式
interface LocalStorageData {
  version: string;              // 版本号
  currentBannerId: string;       // 当前卡池ID
  pityState: PityState;         // 保底状态
  stats: Stats;                 // 统计数据
  pullHistory: PullRecord[];    // 抽卡历史（最多1000条）
  customBanners: Banner[];      // 自定义卡池
  currency: number;             // 抽卡券数量
}
```

### 5.2 存储策略

- **自动保存**: 每次抽卡后自动保存到 localStorage
- **历史限制**: 最多保存最近 1000 条抽卡记录
- **版本迁移**: 读取数据时检查版本，做兼容处理

### 5.3 保底继承规则

```
卡池切换时的继承规则：
• 角色活动跃迁 ↔ 光锥活动跃迁：保底数可继承
  - 例如：角色池抽了20抽，切换到武器池
  - 最多再抽60抽必出5星 (80-20=60)
  - 歪不歪取决于当前状态：
    - 小保底状态 → 可能歪
    - 大保底状态 → 必不歪

• 切换到常驻跃迁 → 独立计算，重置保底
• 切换到新手跃迁 → 独立计算，重置保底

• 常驻跃迁 ↔ 新手跃迁 → 独立计算
```

---

## 6. 组件结构

### 6.1 组件树

```
App
├── Layout
│   ├── Header
│   │   └── BannerSelector
│   ├── MainContent
│   │   ├── BannerDisplay
│   │   ├── PullArea
│   │   │   ├── PullButton (单抽)
│   │   │   ├── PullButton (十连)
│   │   │   └── PityCounter
│   │   └── StatsPanel
│   ├── ResultModal
│   │   ├── PullAnimation
│   │   └── ResultList
│   └── Footer
│       └── HistoryButton
└── Pages
    ├── Home (主页面)
    └── History (历史记录页)
```

### 6.2 组件职责

| 组件 | 职责 |
|-----|------|
| BannerSelector | 切换卡池 |
| BannerDisplay | 显示当前卡池信息 |
| PullButton | 触发抽卡 |
| PityCounter | 显示保底进度 |
| StatsPanel | 显示统计数据 |
| ResultModal | 抽卡结果弹窗 |
| History | 历史记录列表 |

---

## 7. 目录结构

```
src/
├── components/           # UI 组件目录
│   ├── Banner/         # 卡池选择相关组件
│   │   ├── BannerSelector.tsx   # 卡池选择器
│   │   ├── BannerCard.tsx       # 卡池卡片
│   │   └── BannerDisplay.tsx    # 卡池展示
│   ├── PullButton/     # 抽卡按钮组件
│   │   └── PullButton.tsx
│   ├── ResultModal/    # 抽卡结果弹窗
│   │   ├── ResultModal.tsx       # 弹窗主组件
│   │   ├── PullAnimation.tsx    # 抽卡动画
│   │   └── ResultCard.tsx       # 结果卡片
│   ├── PityCounter/    # 保底计数器
│   │   └── PityCounter.tsx
│   ├── Stats/          # 统计面板
│   │   └── StatsPanel.tsx
│   └── History/        # 历史记录
│       ├── HistoryList.tsx
│       └── HistoryFilters.tsx
├── hooks/               # 自定义 Hooks
│   ├── useWarp.ts      # 抽卡逻辑 Hook
│   ├── usePity.ts      # 保底计算 Hook
│   └── useLocalStorage.ts # 持久化 Hook
├── store/               # Zustand 状态管理
│   └── warpStore.ts    # 抽卡状态 store
├── data/                # 静态游戏数据
│   ├── characters.ts   # 角色数据定义
│   ├── weapons.ts      # 武器/光锥数据定义
│   └── banners.ts      # 卡池配置
├── utils/               # 工具函数
│   ├── gacha.ts         # 抽卡算法核心
│   ├── storage.ts       # localStorage 封装
│   ├── probability.ts   # 概率计算工具
│   └── uuid.ts          # UUID 生成
├── types/               # TypeScript 类型定义
│   └── index.ts         # 所有类型导出
├── styles/              # 样式目录
│   └── globals.css      # Tailwind 入口/全局样式
├── App.tsx              # 主应用组件
└── main.tsx             # 入口文件
```

### 目录说明

| 目录 | 作用 | 关键文件 |
|------|------|----------|
| `components/` | 所有 UI 组件，按功能模块划分 | BannerSelector, PullButton, ResultModal, PityCounter, StatsPanel, History |
| `hooks/` | 封装可复用的逻辑 | useWarp (抽卡), usePity (保底), useLocalStorage (持久化) |
| `store/` | 集中管理应用状态 | warpStore.ts - 包含保底计数、抽卡历史、统计数据 |
| `data/` | 静态游戏数据 | characters.ts (角色), weapons.ts (武器), banners.ts (卡池) |
| `utils/` | 工具函数 | gacha.ts (抽卡算法), storage.ts (存储), uuid.ts (ID生成) |
| `types/` | TypeScript 类型 | index.ts - 定义 Character, Weapon, Banner, PullRecord, PityState 等 |
| `styles/` | 全局样式 | globals.css - Tailwind 入口和全局主题样式 |

---

## 8. 常量定义

```typescript
// 卡池配置
const BANNER_CONFIG = {
  CHARACTER_EVENT: {
    fiveStarPity: 90,
    fourStarPity: 10,
    fiveStarBaseRate: 60,    // 0.6%
    fourStarBaseRate: 510,   // 5.1%
    upRate: 0.5,
  },
  WEAPON_EVENT: {
    fiveStarPity: 80,
    fourStarPity: 10,
    fiveStarBaseRate: 80,   // 0.8%
    fourStarBaseRate: 660,  // 6.6%
    upRate: 0.75,
  },
  STANDARD: {
    fiveStarPity: 50,
    fourStarPity: 10,
    fiveStarBaseRate: 60,    // 0.6%
    fourStarBaseRate: 510,   // 5.1%
    upRate: 0,
  },
} as const;

// 存储版本
const STORAGE_VERSION = '1.0.0';

// 历史记录上限
const MAX_HISTORY_SIZE = 1000;
```

---

## 9. 工具函数实现详解

### 9.1 UUID 生成 (src/utils/uuid.ts)
```typescript
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}
```
- 用于生成唯一的抽卡记录 ID
- 格式: `{时间戳36进制}-{随机字符串}`

### 9.2 保底配置常量 (src/utils/constants.ts)
定义各卡池的概率和保底配置：
- `CHARACTER_EVENT`: 5星90保底(180大保底)，4星10保底，5星概率0.6%，UP概率50%
- `WEAPON_EVENT`: 5星80保底(160大保底)，4星10保底，5星概率0.8%，UP概率75%
- `STANDARD`: 5星50保底，4星10保底，5星概率0.6%，无UP
- `NEWCOMER`: 5星50保底(封顶)，4星10保底，5星概率0.6%，无UP

导出 `getBannerConfig(type, category)` 根据卡池类型获取配置

### 9.3 抽卡算法 (src/utils/gacha.ts)
核心抽卡逻辑：
1. **3星物品**: 固定的7个3星光锥
2. **4星物品**: 支持UP/常驻，根据 `isFourStarGuaranteedUP` 判断是否必出UP
3. **5星物品**: 支持UP/常驻，根据 `isGuaranteedUP` 判断是否必出UP (大保底)
4. **十连保底**: 每10连保证至少一个4星或5星

主要函数：
- `pull(banner, pityState, count)`: 执行抽卡，返回结果数组和更新后的保底状态
- `getThreeStar()`: 获取随机3星
- `getFourStar(banner, pityState, isGuaranteed)`: 获取4星
- `getFiveStar(banner, pityState, isGuaranteed)`: 获取5星

### 9.4 localStorage 封装 (src/utils/storage.ts)
```typescript
export function saveData<T>(key: string, data: T): void
export function loadData<T>(key: string): T | null
export function removeData(key: string): void
export function clearAllData(): void
export function isStorageAvailable(): boolean
```
- 提供类型安全的 localStorage 操作
- 自动 JSON 序列化/反序列化

### 9.5 Zustand Store (src/store/warpStore.ts)
使用 Zustand + persist 中间件管理抽卡状态：
- **状态**: currentBannerId, pityState, stats, pullHistory, isPulling, showResult, currentResults
- **Actions**: pull(), switchBanner(), setPulling(), setShowResult(), clearHistory(), reset()
- **持久化**: 使用 zustand/middleware persist 自动保存到 localStorage
- **部分持久化**: 仅保存必要字段 (currentBannerId, pityState, stats, pullHistory)

```typescript
// 使用示例
import { useWarpStore } from './store/warpStore';

const { pull, currentBannerId, pityState } = useWarpStore();
pull(1); // 单抽
pull(10); // 十连
```

---

## 10. 验收检查点

### 功能验收
- [ ] 单抽消耗1抽，十连消耗10抽
- [ ] 90/80抽必出5星（角色/武器池）
- [ ] 10抽必出4星或5星
- [ ] 歪卡后进入大保底
- [ ] 卡池切换保底继承

### 数据验收
- [ ] 5星概率 0.6%/0.8%
- [ ] 4星概率 5.1%/6.6%
- [ ] UP概率正确（50%/75%）

### UI验收
- [ ] 抽卡动画流畅
- [ ] 5星有特殊动画
- [ ] 响应式布局正常

### 持久化验收
- [ ] 刷新页面数据保留
- [ ] 导出/导入功能正常
