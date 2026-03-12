# 崩坏：星穹铁道抽卡模拟器 - 游戏设计文档

## 1. 项目概述

### 1.1 项目背景
- **项目名称**: StarRailWarpSimulator (星穹铁道抽卡模拟器)
- **项目类型**: Web 应用 (SPA)
- **核心功能**: 模拟《崩坏：星穹铁道》的抽卡系统，完整复刻角色池、武器池、限定池、保底机制
- **目标用户**: 想要体验抽卡乐趣或规划抽卡资源的玩家

### 1.2 技术栈
| 类别 | 技术选择 |
|-----|---------|
| 框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 样式 | CSS Modules / Tailwind CSS |
| 状态管理 | Zustand |
| 路由 | React Router v6 |
| 数据存储 | localStorage |

### 1.3 项目结构
```
src/
├── components/       # UI组件
│   ├── Banner/       # 卡池选择组件
│   ├── PullButton/  # 抽卡按钮
│   ├── ResultModal/ # 抽卡结果弹窗
│   ├── History/     # 历史记录
│   └── Stats/       # 统计数据面板
├── hooks/           # 自定义Hooks
│   ├── useWarp.ts   # 抽卡逻辑Hook
│   └── usePity.ts   # 保底计算Hook
├── store/           # 状态管理
│   └── warpStore.ts # 抽卡状态
├── data/            # 数据文件
│   ├── characters.ts
│   ├── weapons.ts
│   └── banners.ts
├── utils/           # 工具函数
│   ├── probability.ts
│   └── storage.ts
└── types/           # TypeScript类型
    └── index.ts
```

---

## 2. 抽卡核心机制

> ⚠️ **重要**: 以下为《崩坏：星穹铁道》实际卡池机制（基于官方公示）

### 2.1 卡池类型详解

#### 2.1.1 角色活动跃迁 (角色UP池)
- **抽卡道具**: 星轨专票
- **UP角色**: 1个限定5星角色 + 3个4星角色
- **5星概率分布**:
  - 50%概率为本期限定UP角色
  - 50%概率为常驻7个角色之一（歪）
  - 歪了后下次必出UP（进入大保底）
- **4星概率分布**:
  - 50%概率为3个UP角色（均分）
  - 50%概率为常驻4星角色（均分）
  - 歪了后下次必出UP4星
- **小保底**: 90抽内必出5星
- **大保底**: 歪后下一个90抽必出UP（总计最多180抽）
- **星缘相邀**: 可更换非UP的5星角色

#### 2.1.2 光锥活动跃迁 (群星跃迁/武器UP池)
- **抽卡道具**: 星轨专票
- **UP武器**: 1把限定5星武器 + 3把限定4星武器
- **5星概率分布**:
  - 75%概率为本期限定UP武器
  - 25%概率为常驻7武器之一（歪）
  - 歪了后下次必出UP（进入大保底）
  - 常驻5星武器：银河铁道之夜、无可取代的东西、但战斗还未结束、以世界之名、制胜的瞬间、如泥酣眠、时节不居
- **4星概率分布**:
  - 75%概率为3个UP4星光锥（均分）
  - 25%概率为常驻4星角色/光锥（均分）
  - 歪了后下次必出UP4星
- **小保底**: 80抽内必出5星光锥
- **大保底**: 歪后下一个80抽必出UP（总计最多160抽）

#### 2.1.3 常驻跃迁 (始发跃迁/混合池)
- **抽卡道具**: 星轨通票
- **包含**:
  - 7个常驻5星角色：姬子、瓦尔特、布洛妮娅、杰帕德、克拉拉、彦卿、白露
  - 5把常驻5星武器
  - 24个常驻4星角色：三月七、丹恒、阿兰、艾丝妲，黑塔、娜塔莎、希露瓦、佩拉、桑博、虎克、素裳、青雀、停云、驭空、卢卡、玲可、桂乃芬、寒鸦、雪衣、米沙、加拉赫、貊泽
  - 22个常驻4星光锥
- **保底**: 最多50抽必出5星
- **保底与其他跃迁独立计算**

#### 2.1.4 新手跃迁
- **抽卡道具**: 星轨通票（8折优惠）
- **包含**: 与常驻跃迁相同
- **特点**: 限定50抽，50抽内必出5星
- **十连优惠**: 8折（消耗8张抽10次）

### 2.2 概率机制

#### 2.2.1 基础概率

**角色活动跃迁**
| 星级 | 基础概率 | 综合保底概率 |
|-----|---------|-------------|
| 5星角色 | 0.600% | 1.600% |
| 4星角色 | 2.550% | 13.000% |
| 4星光锥 | 2.550% | |
| 3星 | 94.300% | 85.400% |

> 注：90抽必出5星，10抽必出4星或以上

**光锥活动跃迁 (群星跃迁)**
| 星级 | 基础概率 | 综合保底概率 |
|-----|---------|-------------|
| 5星光锥 | 0.800% | 1.870% |
| 4星角色 | 3.300% | 14.800% |
| 4星光锥 | 3.300% | |
| 3星 | 92.600% | 83.330% |

> 注：80抽必出5星，10抽必出4星或以上

**活动限定光锥跃迁 (流光定影示例)**
> 活动期间可能有特殊概率调整
| 星级 | 基础概率 | 综合保底概率 |
|-----|---------|-------------|
| 5星光锥 | 0.800% | 1.870% |
| 4星角色 | 3.300% | 14.800% |
| 4星光锥 | 3.300% | |

**常驻跃迁 (始发跃迁)**
| 星级 | 基础概率 | 综合保底概率 | 说明 |
|-----|---------|-------------|------|
| 5星角色 | 0.300% | 2.080% | 最多50抽必出 |
| 5星光锥 | 0.300% | | |
| 4星角色 | 2.550% | 12.160% | 均分 |
| 4星光锥 | 2.550% | | 均分 |
| 3星 | 94.300% | 85.760% | - |

> 注：常驻跃迁与其他跃迁的保底相互独立，互不影响

#### 2.2.2 保底机制详解
```
┌─────────────────────────────────────────────────────┐
│ 角色活动跃迁 (90抽小保底 / 180抽大保底)              │
├─────────────────────────────────────────────────────┤
│ 小保底: 90抽内必出5星                               │
│   • 50%概率为本期UP角色                             │
│   • 50%概率为常驻7角色之一 (歪了)                    │
│   • 没歪 → 重置保底计数，重新计算                     │
│   • 歪了 → 进入大保底，下次必UP                      │
├─────────────────────────────────────────────────────┤
│ 大保底: 歪了后下一个90抽必出UP                      │
│   • 歪了 → 进入大保底，第180抽必定出UP               │
│   • 最多180抽必出本期UP角色                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 光锥活动跃迁 (80抽小保底 / 160抽大保底)              │
├─────────────────────────────────────────────────────┤
│ 小保底: 80抽内必出5星光锥                            │
│   • 75%概率为本期UP武器                             │
│   • 25%概率为常驻7武器之一 (歪了)                    │
│   • 没歪 → 重置保底计数                             │
│   • 歪了 → 进入大保底，下次必UP                      │
├─────────────────────────────────────────────────────┤
│ 大保底: 歪了后下一个80抽必出UP                       │
│   • 歪了 → 进入大保底，第160抽必定出UP               │
│   • 最多160抽必出本期UP武器                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 4星保底 (所有卡池通用)                               │
├─────────────────────────────────────────────────────┤
│ • 连续9抽未获得4星或5星                             │
│ • 第10抽必定获得4星或5星                             │
└─────────────────────────────────────────────────────┘
```

#### 2.2.3 保底继承机制
```
卡池更换时的继承规则:
• 角色活动跃迁 ↔ 光锥活动跃迁: 抽数可继承
• 继承后计算方式:
  - 例如: 本期抽了20抽，卡池更换
  - 最多再抽70抽必出5星 (90-20=70)
  - 歪不歪取决于当前状态:
    - 小保底状态 → 可能歪
    - 大保底状态 → 必不歪
```

#### 2.2.4 概率计算伪代码
```typescript
interface WarpState {
  fiveStarPity: number;      // 5星保底计数
  fourStarPity: number;      // 4星保底计数
  isGuaranteedUP: boolean;  // 是否已歪（大保底状态）
}

function calculatePullResult(
  state: WarpState,
  banner: BannerConfig
): PullResult {
  // 获取当前卡池的保底阈值
  const pityLimit = banner.type === 'weapon' ? 79 : 89; // 武器80/角色90

  // 4星保底判定 (10抽)
  if (state.fourStarPity >= 9) {
    return getFourStarResult(banner);
  }

  // 5星保底判定
  if (state.fiveStarPity >= pityLimit) {
    // 大保底: 必定出UP
    if (state.isGuaranteedUP) {
      return getRateUpFiveStar(banner);
    }
    // 小保底: 根据卡池类型判断歪的概率
    if (banner.type === 'weapon') {
      // 武器池: 75% UP, 25% 歪
      return Math.random() < 0.75
        ? getRateUpFiveStar(banner)
        : getStandardFiveStar(banner);
    } else {
      // 角色池: 50% UP, 50% 歪
      return Math.random() < 0.5
        ? getRateUpFiveStar(banner)
        : getStandardFiveStar(banner);
    }
  }

  // 基础概率计算
  const rand = Math.random() * 10000;
  if (rand < 60) {  // 5星: 0.6%
    return handleFiveStarBase(state, banner);
  } else if (rand < 570) {  // 4星: 5.1%
    return getFourStarResult(banner);
  } else {
    return { rarity: 3, ... };  // 3星: 94.3%
  }
}
```

### 2.3 兑换系统 (未熄的余烬 / 未熄的星芒)

#### 2.3.1 获取资源
- **获取5星光锥**: 获得「未熄的星芒」×40
- **获取4星光锥**: 获得「未熄的星芒」×8
- **获取3星光锥**: 获得「未熄的余烬」×20

#### 2.3.2 未熄的余烬 (每月刷新)
- **可兑换物品**:
  | 物品 | 数量 |
  |-----|------|
  | 星轨通票 | 5张 |
  | 星轨专票 | 5张 |
- **建议**: 两种票都建议兑换

#### 2.3.3 未熄的星芒
- **用途**: 兑换星轨专票
- **建议**: 只建议兑换**星轨专票**
  - 因为星轨专票用于抽取角色/光锥活动跃迁
  - 如果小保底歪了，歪的角色/光锥可以用星轨通票抽到

---

## 3. 数据定义

### 3.1 角色数据示例

#### 3.1.1 5星限定角色
| ID | 名称 | 命途 | 元素 | UP池 |
|----|------|------|------|------|
| kafka | 桂乃芬 | 毁灭 | 雷 | v3.2 |
| feixiao | 飞霄 | 智识 | 风 | v3.1 |
| jiaoqiu | 藿藿 | 丰饶 | 量子 | v3.0 |

#### 3.1.2 5星常驻角色
| ID | 名称 | 命途 | 元素 |
|----|------|------|------|
| bronya | 布洛妮娅 | 同谐 | 虚数 |
| seele | 希儿 | 巡猎 | 量子 |
| kafka_std | 桂乃芬(常) | 毁灭 | 雷 |
| blade | 刃 | 毁灭 | 风 |
| Luocha | 罗刹 | 丰饶 | 虚数 |
| Yanqing | 彦卿 | 巡猎 | 冰 |
| Gepard | 杰帕德 | 存护 | 冰 |

#### 3.1.3 4星角色 (示例)
| ID | 名称 | 命途 | 元素 |
|----|------|------|------|
| tingyun | 停云 | 同谐 | 雷 |
| Yukina | 驭空 | 同谐 | 风 |
| March7th | 三月七 | 存护 | 冰 |
| DanHeng | 丹恒 | 巡猎 | 风 |
| Asta | 艾丝妲 | 同谐 | 火 |
| Pela | 佩拉 | 虚无 | 冰 |
| Herta | 希露瓦 | 智识 | 雷 |

### 3.2 武器数据示例

#### 3.2.1 5星限定武器
| ID | 名称 | 类型 | 所属角色 |
|----|------|------|---------|
| br1 | 记一位持明的手艺 | 量子 | 希儿 |
| br2 | 秘密武器 | 毁灭 | 刃 |
| br3 | 鸣雷的法则 | 雷 | 桂乃芬 |

#### 3.2.2 5星常驻武器
| ID | 名称 | 类型 |
|----|------|------|
| wr1 | 星际漫游者 | 虚无 |
| wr2 | 宇宙市场趋势 | 毁灭 |
| wr3 | 记一位星神的笔迹 | 智识 |
| wr4 | 汪！散步时间 | 存护 |
| wr5 | 无主星矢的瑰剑 | 巡猎 |

### 3.3 卡池配置示例
```typescript
const banners: BannerConfig[] = [
  {
    id: 'character-limited-v32',
    name: '桂乃芬',
    type: 'character',
    isLimited: true,
    rateUp5Star: ['kafka'],
    rateUp4Star: ['tingyun', 'yukina', 'march7th'],
    startDate: '2024-10-23',
    endDate: '2024-11-12',
  },
  {
    id: 'character-standard',
    name: '角色常驻',
    type: 'character',
    isLimited: false,
    rateUp5Star: [],
    rateUp4Star: [],
  },
  {
    id: 'weapon-limited-v32',
    name: '武器活动',
    type: 'weapon',
    isLimited: true,
    rateUp5Star: ['br3'],
    rateUp4Star: ['wr_4star_1'],
  },
];
```

---

## 4. 功能需求

### 4.1 抽卡功能
- [x] 单抽 (消耗1抽)
- [x] 十连抽 (消耗10抽)
- [x] 十连保底机制 (每10连必出1个4星或5星)
- [x] 抽卡冷却动画 (防止过快点击)

### 4.2 卡池系统
- [x] 卡池列表展示
- [x] 当前卡池信息 (UP角色/武器、持续时间)
- [x] 卡池切换

### 4.3 保底系统
- [x] 5星保底计数器 (0-90)
- [x] 4星保底计数器 (0-10)
- [x] 小保底触发提示
- [x] 保底状态可视化

### 4.4 数据统计
- [x] 总抽取次数
- [x] 5星获取次数
- [x] 4星获取次数
- [x] 限定角色/武器获取记录
- [x] 当前卡池抽取数

### 4.5 历史记录
- [x] 抽卡历史列表
- [x] 历史筛选 (按卡池、按星级)
- [x] 单次抽卡详情
- [x] 导出为JSON文件
- [x] 从JSON文件导入

### 4.6 抽卡动画
```
抽卡动画序列:
1. 点击抽卡按钮 (0ms)
2. 加载动画开始 (100ms)
3. 角色/武器逐个展示 (每个300ms间隔)
4. 5星角色播放专属动画 (800ms)
5. 结果确认按钮出现
```

---

## 5. UI/UX 设计规范

### 5.1 配色方案
| 用途 | 颜色 | Hex |
|-----|------|-----|
| 主背景 | 深空蓝 | #0D1117 |
| 次背景 | 星空紫 | #161B22 |
| 主色调 | 星穹金 | #FFD700 |
| 5星品质 | 流光金 | #F2C94C |
| 4星品质 | 雷电紫 | #BB6BD9 |
| 3星品质 | 基础银 | #6B7280 |
| 命途-毁灭 | 烈焰红 | #FF6B6B |
| 命途-巡猎 | 疾风绿 | #4CAF50 |
| 命途-智识 | 星光蓝 | #2196F3 |
| 命途-同谐 | 温柔黄 | #FFC107 |
| 命途-虚无 | 暗影紫 | #9C27B0 |
| 命途-丰饶 | 生命绿 | #8BC34A |
| 命途-存护 | 守护蓝 | #00BCD4 |

### 5.2 字体
- **主标题**: "MiSans", "Noto Sans SC", sans-serif
- **数字**: "DIN Alternate", monospace
- **角色名**: "Noto Sans SC", sans-serif

### 5.3 组件设计

#### 5.3.1 卡池选择卡
```
┌─────────────────────────┐
│  [角色] 桂乃芬           │
│  ┌─────────────────┐    │
│  │    桂乃芬立绘    │    │
│  │    (5星 毁灭 雷) │    │
│  └─────────────────┘    │
│  限定角色 | 2024/10/23  │
│  [选择此卡池]            │
└─────────────────────────┘
```

#### 5.3.2 保底计数器
```
┌──────────────────────────┐
│ 5星保底: ████████████░░  │
│ 第 85 抽 / 90 抽          │
│ ⚠ 小保底已触发!          │
├──────────────────────────┤
│ 4星保底: █████████░░░░░  │
│ 第 9 抽 / 10 抽           │
└──────────────────────────┘
```

#### 5.3.3 抽卡结果展示
```
┌─────────────────────────────┐
│     ★★★★☆                   │
│    [角色立绘区域]            │
│     桂乃芬                   │
│    限定5星 | 毁灭 | 雷      │
│                             │
│    [单抽] [十连] [再来十连] │
└─────────────────────────────┘
```

### 5.4 响应式布局
| 断点 | 宽度 | 布局 |
|-----|------|-----|
| Mobile | < 640px | 单列布局 |
| Tablet | 640-1024px | 双列布局 |
| Desktop | > 1024px | 三列布局 |

---

## 6. 数据流设计

### 6.1 状态管理 (Zustand)
```typescript
interface WarpState {
  // 当前卡池
  currentBanner: string;

  // 保底计数
  fiveStarPity: number;
  fourStarPity: number;
  softPityTriggered: boolean;

  // 抽卡历史
  pullHistory: PullRecord[];

  // 统计数据
  stats: {
    totalPulls: number;
    totalFiveStars: number;
    totalFourStars: number;
    pullsInCurrentBanner: number;
  };

  // Actions
  pull: (count: number) => PullResult[];
  switchBanner: (bannerId: string) => void;
  setFateWeapon: (weaponId: string) => void;
  exportHistory: () => void;
  importHistory: (data: PullRecord[]) => void;
}
```

### 6.2 本地存储结构
```typescript
interface LocalStorageData {
  version: string;
  currentBanner: string;
  fiveStarPity: number;
  fourStarPity: number;
  softPityTriggered: boolean;
  fateWeapon: string | null;
  pullHistory: PullRecord[];
  stats: WarpStats;
}
```

---

## 7. 开发里程碑

### Phase 1: 项目初始化 (预计1天)
- [ ] 初始化 Vite + React + TypeScript 项目
- [ ] 配置 ESLint + Prettier
- [ ] 搭建项目目录结构
- [ ] 安装依赖 (zustand, react-router, tailwindcss)

### Phase 2: 数据系统 (预计1天)
- [ ] 定义 TypeScript 类型
- [ ] 创建角色数据文件
- [ ] 创建武器数据文件
- [ ] 创建卡池配置文件
- [ ] 实现概率计算工具函数

### Phase 3: 抽卡核心 (预计2天)
- [ ] 实现抽卡算法
- [ ] 实现保底逻辑
- [ ] 创建 Zustand store
- [ ] 实现抽卡 Hook

### Phase 4: 基础UI (预计2天)
- [ ] 布局框架
- [ ] 卡池选择组件
- [ ] 抽卡按钮组件
- [ ] 保底计数器组件
- [ ] 抽卡结果弹窗

### Phase 5: 动画与交互 (预计1天)
- [ ] 抽卡动画实现
- [ ] 5星特写动画
- [ ] 按钮交互反馈
- [ ] 页面转场动画

### Phase 6: 历史与统计 (预计1天)
- [ ] 历史记录页面
- [ ] 统计数据面板
- [ ] 数据导出功能
- [ ] 数据导入功能

### Phase 7: 优化与测试 (预计1天)
- [ ] 响应式适配
- [ ] 性能优化
- [ ] Bug修复
- [ ] 打包部署

**总计预计: 9天**

---

## 8. 验收标准

### 8.1 功能验收
- [ ] 可完成单抽，每次消耗1抽
- [ ] 可完成十连抽，每次消耗10抽
- [ ] 90抽必出5星 (硬保底)
- [ ] 73抽50%概率出5星 (软保底)
- [ ] 10抽必出4星或5星 (十连保底)
- [ ] 切换卡池后保底重置
- [ ] 抽卡历史正确记录

### 8.2 数据验收
- [ ] 5星概率为0.6%
- [ ] 4星概率为6%
- [ ] UP角色在UP池中概率正确

### 8.3 UI验收
- [ ] 抽卡动画流畅播放
- [ ] 5星有特殊动画效果
- [ ] 保底计数器实时更新
- [ ] 响应式布局正常

### 8.4 数据持久化验收
- [ ] 刷新页面后历史记录保留
- [ ] 可导出为JSON文件
- [ ] 可从JSON文件导入

---

## 9. 附录

### 9.1 参考资源
- 官方抽卡概率公示
- 已知角色命途/元素数据
- 游戏UI配色参考

### 9.2 版权声明
> 本项目仅供学习交流使用，不涉及商业盈利。游戏中所有角色、武器、图像等素材的版权归米哈游所有。如有侵权，请联系删除。

---

## 10. 角色与数据替换指南

> ⚠️ **注意**: 本文档中的角色数据为示例数据，可能存在错误。实际项目开发时，请替换为正确的数据。

### 10.1 数据文件位置

项目中的角色和武器数据存储在以下文件中：

```
src/data/
├── characters.ts    # 角色数据
├── weapons.ts       # 武器数据
└── banners.ts      # 卡池配置
```

### 10.2 角色数据结构

在 `src/data/characters.ts` 文件中，角色定义如下：

```typescript
export interface Character {
  id: string;           // 唯一标识符 (如 "kafka", "feixiao")
  name: string;         // 角色名称 (如 "桂乃芬", "飞霄")
  rarity: 5 | 4 | 3;   // 星级 (5星限定/常驻, 4星, 3星)
  path: string;         // 命途 (毁灭/巡猎/智识/同谐/虚无/丰饶/存护)
  element: string;      // 元素 (物理/火/冰/雷/风/量子/虚数)
  isLimited: boolean;  // 是否限定角色
}

export const characters: Character[] = [
  // 在此添加角色数据
];
```

### 10.3 如何添加/修改角色

#### 方式一：直接编辑数据文件

1. 打开 `src/data/characters.ts`
2. 在 `characters` 数组中添加或修改角色数据

```typescript
export const characters: Character[] = [
  // 示例：添加一个5星限定角色
  {
    id: 'character_id',
    name: '角色名称',
    rarity: 5,
    path: '毁灭',  // 命途
    element: '雷', // 元素
    isLimited: true,
  },
  // 示例：添加一个4星常驻角色
  {
    id: 'character_id_4star',
    name: '角色名称',
    rarity: 4,
    path: '同谐',
    element: '火',
    isLimited: false,
  },
];
```

#### 方式二：从外部JSON导入

如果已有完整的角色数据 JSON 文件，可以直接导入：

```typescript
import charactersData from './characters.json';

export const characters: Character[] = charactersData;
```

### 10.4 命途与元素参考

| 命途 (Path) | 英文 | 说明 |
|------------|------|------|
| 毁灭 | Destruction | 攻击型 |
| 巡猎 | Hunt | 单体输出 |
| 智识 | Erudition | 群体输出 |
| 同谐 | Harmony | 辅助增益 |
| 虚无 | Nihility | 减益/辅助 |
| 丰饶 | Abundance | 治疗 |
| 存护 | Preservation | 防护 |

| 元素 (Element) | 英文 | 颜色参考 |
|---------------|------|---------|
| 物理 | Physical | #FFFFFF |
| 火 | Fire | #FF6B35 |
| 冰 | Ice | #00BFFF |
| 雷 | Lightning | #9B59B6 |
| 风 | Wind | #2ECC71 |
| 量子 | Quantum | #3498DB |
| 虚数 | Imaginary | #F1C40F |

### 10.5 卡池配置

在 `src/data/banners.ts` 中配置卡池信息：

```typescript
export interface BannerConfig {
  id: string;                    // 卡池ID
  name: string;                   // 卡池名称
  type: 'character' | 'weapon';  // 卡池类型
  isLimited: boolean;            // 是否限定池
  rateUp5Star: string[];         // UP的5星角色/武器ID列表
  rateUp4Star: string[];         // UP的4星角色/武器ID列表
  startDate?: string;            // 开始日期
  endDate?: string;              // 结束日期
}
```

### 10.6 推荐的正确数据来源

1. **游戏wiki**: https://honkaistarrail.fandom.com/wiki/
2. **官方公告**: 游戏内抽卡界面
3. **社区数据**: NGA星穹铁道论坛、Reddit 等

### 10.7 图片资源

角色立绘等图片资源需要单独配置：

```typescript
export const characterImages: Record<string, string> = {
  kafka: '/images/characters/kafka.png',
  feixiao: '/images/characters/feixiao.png',
  // ...
};
```

或在 `characters.ts` 中直接添加图片路径：

```typescript
{
  id: 'kafka',
  name: '桂乃芬',
  // ...
  image: '/images/characters/kafka.png',
}
```

> 💡 **提示**: 如果没有图片资源，可以使用占位图或纯色方块代替。

---

## 11. 用户自定义卡池功能设计

### 11.1 功能概述

允许用户在应用内自行创建、编辑、删除卡池，满足以下场景：
- 自定义UP角色/武器
- 调整概率设置
- 创建测试用的模拟卡池

### 11.2 功能需求

| 功能 | 描述 | 优先级 |
|-----|------|-------|
| 创建卡池 | 用户可自定义卡池名称、UP角色/武器 | 高 |
| 编辑卡池 | 修改已有卡池的UP内容 | 高 |
| 删除卡池 | 删除自定义卡池 (系统卡池不可删) | 中 |
| 概率调整 | 可自定义5星/4星概率 | 中 |
| 预设模板 | 提供常用卡池模板快速创建 | 低 |
| 导入/导出 | 分享自定义卡池配置 | 低 |

### 11.3 UI设计

#### 11.3.1 卡池管理入口
```
[卡池列表]
├── 角色活动跃迁 (系统)
├── 角色常驻跃迁 (系统)
├── 武器活动跃迁 (系统)
├── 武器常驻跃迁 (系统)
├── ─────────────────
├── 我的卡池 1        [编辑] [删除]
├── 我的卡池 2        [编辑] [删除]
├── ─────────────────
[+ 创建新卡池]
```

#### 11.3.2 创建/编辑卡池表单
```
┌─────────────────────────────────────────┐
│ 创建自定义卡池                           │
├─────────────────────────────────────────┤
│ 卡池名称: [________________]             │
│                                         │
│ 卡池类型: (○) 角色池  ( ) 武器池         │
│                                         │
│ 5星UP角色:                              │
│ ☑ 角色A  ☐ 角色B  ☐ 角色C               │
│                                         │
│ 4星UP角色:                              │
│ ☑ 角色X  ☑ 角色Y  ☐ 角色Z               │
│                                         │
│ 高级选项 (可选):                         │
│ 5星概率: [0.6]% (默认0.6%)              │
│ 4星概率: [6.0]% (默认6.0%)              │
│ 硬保底抽数: [90] (默认90)                │
│                                         │
│ [取消]              [保存卡池]           │
└─────────────────────────────────────────┘
```

### 11.4 数据结构

```typescript
interface CustomBanner {
  id: string;
  name: string;
  type: 'character' | 'weapon';
  isSystem: boolean;           // true = 系统卡池，不可删除
  rateUp5Star: string[];       // UP的5星ID列表
  rateUp4Star: string[];       // UP的4星ID列表
  customProbability?: {
    fiveStarRate: number;      // 自定义5星概率 (默认0.6)
    fourStarRate: number;      // 自定义4星概率 (默认6.0)
    hardPity: number;          // 自定义硬保底 (默认90)
  };
  createdAt: number;
  updatedAt: number;
}
```

### 11.5 实现方案

#### 11.5.1 状态管理
```typescript
interface BannerStore {
  // 系统卡池 + 自定义卡池
  banners: BannerConfig[];
  customBanners: CustomBanner[];

  // Actions
  addCustomBanner: (banner: CustomBanner) => void;
  updateCustomBanner: (id: string, data: Partial<CustomBanner>) => void;
  deleteCustomBanner: (id: string) => void;
  getAllBanners: () => BannerConfig[];
}
```

#### 11.5.2 自定义卡池存储
- 自定义卡池存储在 localStorage 中
- 系统卡池内置，不可修改

```typescript
const STORAGE_KEY = {
  CUSTOM_BANNERS: 'warp_custom_banners',
};
```

### 11.6 预设模板

提供常用模板方便快速创建：

| 模板名称 | 说明 |
|---------|------|
| 单UP角色池 | 1个5星UP + 3个4星UP |
| 双UP角色池 | 2个5星UP + 3个4星UP |
| 单UP武器池 | 1把5星UP + 2把4星UP |
| 测试池 | 高概率池，用于测试 |

### 11.7 导出/导入

```typescript
// 导出自定义卡池
function exportCustomBanners(): void {
  const data = JSON.stringify(customBanners, null, 2);
  downloadAsFile('my-banners.json', data);
}

// 导入自定义卡池
function importCustomBanners(file: File): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target.result);
    validateAndMergeBanners(data);
  };
  reader.readAsText(file);
}
```