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
├── components/
│   ├── Banner/
│   │   ├── BannerSelector.tsx
│   │   ├── BannerCard.tsx
│   │   └── BannerDisplay.tsx
│   ├── PullButton/
│   │   └── PullButton.tsx
│   ├── ResultModal/
│   │   ├── ResultModal.tsx
│   │   ├── PullAnimation.tsx
│   │   └── ResultCard.tsx
│   ├── PityCounter/
│   │   └── PityCounter.tsx
│   ├── Stats/
│   │   └── StatsPanel.tsx
│   └── History/
│       ├── HistoryList.tsx
│       └── HistoryFilters.tsx
├── hooks/
│   ├── useWarp.ts
│   ├── usePity.ts
│   └── useLocalStorage.ts
├── store/
│   └── warpStore.ts
├── data/
│   ├── characters.ts
│   ├── weapons.ts
│   └── banners.ts
├── utils/
│   ├── gacha.ts          # 抽卡算法
│   ├── storage.ts        # localStorage 封装
│   ├── probability.ts    # 概率计算
│   └── uuid.ts           # ID 生成
├── types/
│   └── index.ts
├── styles/
│   └── globals.css       # Tailwind 入口
├── App.tsx
└── main.tsx
```

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

## 9. 验收检查点

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
