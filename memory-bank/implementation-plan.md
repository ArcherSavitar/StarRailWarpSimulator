# 实施计划 - StarRailWarpSimulator

> **原则**：小步迭代，每步可验证，先基础后完整功能

---

## 阶段一：项目初始化

### Step 1.1: 创建 Vite 项目
- [ ] 移动 memory-bank 和 CLAUDE.md 到临时目录
- [ ] 运行 `npm create vite@latest . -- --template react-ts`
- [ ] 恢复 memory-bank 和 CLAUDE.md
- [ ] 安装基础依赖：`npm install`
- [ ] 安装额外依赖：`npm install zustand react-router-dom framer-motion clsx tailwind-merge`
- [ ] 安装 Tailwind CSS：`npm install -D tailwindcss postcss autoprefixer`
- [ ] 初始化 Tailwind：`npx tailwindcss init -p`

**验证**：
- 运行 `npm run dev`，浏览器打开 `http://localhost:5173`
- 确认显示 Vite 默认页面，无报错

---

### Step 1.2: 配置 Tailwind CSS
- [ ] 编辑 `tailwind.config.js`，添加 content 路径：`content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`
- [ ] 编辑 `src/index.css`，添加：
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```
- [ ] 编辑 `index.html`，添加中文字体支持（可选）

**验证**：
- 重启开发服务器
- 创建测试 div，添加 `bg-red-500` class，确认红色背景生效

---

### Step 1.3: 创建目录结构
- [ ] 创建 `src/components/` 目录
- [ ] 创建 `src/hooks/` 目录
- [ ] 创建 `src/store/` 目录
- [ ] 创建 `src/data/` 目录
- [ ] 创建 `src/utils/` 目录
- [ ] 创建 `src/types/` 目录

**验证**：
- 执行 `ls -R src/` 确认目录结构正确

---

## 阶段二：数据系统（无 UI）

### Step 2.1: 定义 TypeScript 类型
- [ ] 创建 `src/types/index.ts`
- [ ] 定义 `Path` 类型（7种命途）
- [ ] 定义 `Element` 类型（7种元素）
- [ ] 定义 `Rarity` 类型（3/4/5星）
- [ ] 定义 `Character` 接口
- [ ] 定义 `Weapon` 接口
- [ ] 定义 `Banner` 接口
- [ ] 定义 `PullRecord` 接口
- [ ] 定义 `PityState` 接口
- [ ] 定义 `Stats` 接口

**验证**：
- 运行 `npx tsc --noEmit`，无类型错误

---

### Step 2.2: 创建角色数据
- [ ] 创建 `src/data/characters.ts`
- [ ] 导出 `characters` 数组，包含至少：
  - 2个5星限定角色（示例：飞霄、藿藿）
  - 2个5星常驻角色（示例：布洛妮娅、彦卿）
  - 5个4星角色（示例：停云、三月七、丹恒、佩拉、艾丝妲）
- [ ] 每个角色包含：id, name, rarity, path, element, isLimited

**验证**：
- 在 `src/App.tsx` 临时导入 characters，确认数组长度 >= 9

---

### Step 2.3: 创建武器数据
- [ ] 创建 `src/data/weapons.ts`
- [ ] 导出 `weapons` 数组，包含至少：
  - 2把5星限定武器
  - 2把5星常驻武器
  - 5把4星武器
- [ ] 每个武器包含：id, name, rarity, type, isLimited

**验证**：
- 临时导入 weapons，确认数组长度 >= 9

---

### Step 2.4: 创建卡池配置
- [ ] 创建 `src/data/banners.ts`
- [ ] 导出 `banners` 数组，包含：
  - 1个角色活动UP池（示例：飞霄）
  - 1个武器活动UP池（示例：武器A）
  - 1个常驻池（始发跃迁）
  - 1个新手池
- [ ] 每个卡池包含：id, name, type, category, rateUp5Star, rateUp4Star

**验证**：
- 临时导入 banners，确认数组长度 = 4

---

## 阶段三：抽卡核心逻辑

### Step 3.1: 实现 UUID 生成工具
- [ ] 创建 `src/utils/uuid.ts`
- [ ] 导出 `generateId()` 函数，返回唯一字符串

**验证**：
- 调用两次 `generateId()`，确认返回值不同

---

### Step 3.2: 实现保底配置常量
- [ ] 创建 `src/utils/constants.ts`
- [ ] 定义各卡池的保底配置：
  - 角色活动：5星保底90，4星保底10，5星概率0.6%，4星概率5.1%，UP概率50%
  - 光锥活动：5星保底80，4星保底10，5星概率0.8%，4星概率6.6%，UP概率75%
  - 常驻跃迁：5星保底50，4星保底10，5星概率0.6%，4星概率5.1%
  - 新手跃迁：5星保底50（最多），4星保底10，5星概率0.6%，4星概率5.1%
- [ ] 导出常量对象

**验证**：
- 检查导出常量值是否与设计文档一致

---

### Step 3.3: 实现抽卡算法
- [ ] 创建 `src/utils/gacha.ts`
- [ ] 实现 `getRandomItem<T>(array: T[]): T` 辅助函数
- [ ] 实现 `getThreeStar(): PullRecord` - 返回随机3星
- [ ] 实现 `getFourStar(banner, pityState): PullRecord` - 处理4星逻辑（含保底，含4星UP歪后必出UP）
- [ ] 实现 `getFiveStar(banner, pityState): PullRecord` - 处理5星逻辑（含保底，含歪后大保底）
- [ ] 实现核心函数 `pull(banner, pityState, count): PullRecord[]`
  - **内部处理十连保底**：每10抽必须触发一次4星或5星
  - **内部处理4星UP保底**：歪后下次4星必为UP
  - **内部处理5星歪卡**：歪后设置 isGuaranteedUP = true

**验证**：
- 编写测试脚本，模拟1000次抽卡，统计5星、4星、3星比例
- 5星比例应接近 0.6%（角色池）或 0.8%（武器池）
- 4星比例应接近 5.1%（角色池）或 6.6%（武器池）

---

### Step 3.4: 实现 localStorage 封装
- [ ] 创建 `src/utils/storage.ts`
- [ ] 实现 `saveData<T>(key: string, data: T): void`
- [ ] 实现 `loadData<T>(key: string): T | null`
- [ ] 实现 `removeData(key: string): void`

**验证**：
- 保存数据，刷新页面，读取数据，确认一致

---

## 阶段四：状态管理

### Step 4.1: 创建 Zustand Store
- [ ] 创建 `src/store/warpStore.ts`
- [ ] 定义初始状态：currentBannerId, pityState, stats, pullHistory, customBanners, isPulling, showResult, currentResult
- [ ] 实现 `pull(count: number)` action
- [ ] 实现 `switchBanner(bannerId: string)` action
- [ ] 实现 `setPulling(isPulling: boolean)` action
- [ ] 实现 `setShowResult(show: boolean)` action
- [ ] 实现 `clearHistory()` action

**验证**：
- 在 App.tsx 临时使用 store，确认状态更新正常

---

### Step 4.2: 实现持久化中间件
- [ ] 在 warpStore 中添加 persistence 配置
- [ ] 每次状态变化自动保存到 localStorage
- [ ] 页面加载时自动恢复状态

**验证**：
- 抽卡几次，刷新页面，确认保底计数、统计数据、抽卡历史保留

---

## 阶段五：基础 UI 组件

### Step 5.1: 创建布局组件
- [ ] 创建 `src/components/Layout.tsx`
- [ ] 添加 Header、MainContent、Footer 结构
- [ ] 设置深色主题背景（#0D1117）

**验证**：
- 浏览器查看布局，深色背景生效

---

### Step 5.2: 创建卡池选择器
- [ ] 创建 `src/components/BannerSelector.tsx`
- [ ] 从 store 获取 banners 列表
- [ ] 渲染卡池列表，点击切换当前卡池
- [ ] 显示当前选中的卡池

**验证**：
- 点击不同卡池，currentBannerId 正确更新

---

### Step 5.3: 创建保底计数器
- [ ] 创建 `src/components/PityCounter.tsx`
- [ ] 从 store 获取 pityState
- [ ] 显示5星保底进度条（0-90/80）
- [ ] 显示4星保底进度条（0-10）
- [ ] 高亮接近保底时的进度

**验证**：
- 抽卡后，进度条正确更新

---

### Step 5.4: 创建抽卡按钮
- [ ] 创建 `src/components/PullButtons.tsx`
- [ ] 创建"单抽"按钮（消耗1抽）
- [ ] 创建"十连"按钮（消耗10抽）
- [ ] 添加点击事件，调用 store.pull()
- [ ] 添加 loading 状态防止重复点击

**验证**：
- 点击单抽，弹出结果
- 点击十连，弹出10个结果
- 快速点击不会触发多次

---

### Step 5.5: 创建抽卡结果弹窗
- [ ] 创建 `src/components/ResultModal.tsx`
- [ ] 显示 PullRecord 列表
- [ ] 按星级排序（5星→4星→3星）
- [ ] 5星使用金色边框，4星紫色，3星灰色
- [ ] 显示"再来十连"和"关闭"按钮

**验证**：
- 抽卡后弹窗正确显示
- 点击关闭按钮隐藏弹窗

---

### Step 5.6: 创建统计面板
- [ ] 创建 `src/components/StatsPanel.tsx`
- [ ] 显示总抽卡数、5星数、4星数
- [ ] 显示当前卡池抽数
- [ ] 计算并显示5星、4星概率

**验证**：
- 抽卡后统计数据正确更新

---

## 阶段六：整合与测试

### Step 6.1: 整合所有组件到 App
- [ ] 在 App.tsx 中组合所有组件
- [ ] 确保数据流正确：store → components → UI

**验证**：
- 完整流程：选择卡池 → 抽卡 → 查看结果 → 查看统计

---

### Step 6.2: 功能测试 - 单抽
- [ ] 点击单抽按钮
- [ ] 确认消耗1抽
- [ ] 确认结果弹窗显示1个物品
- [ ] 确认保底计数更新

**验证**：
- 多次单抽，检查保底逻辑

---

### Step 6.3: 功能测试 - 十连
- [ ] 点击十连按钮
- [ ] 确认消耗10抽
- [ ] 确认结果弹窗显示10个物品
- [ ] 确认至少1个4星或5星（十连保底）
- [ ] 确认保底计数更新

**验证**：
- 多次十连，验证十连保底

---

### Step 6.4: 功能测试 - 保底机制
- [ ] 准备测试账号（或重置状态）
- [ ] 抽到第89抽时，记录状态
- [ ] 继续抽卡，第90抽必出5星
- [ ] 验证5星UP概率（50%角色池，75%武器池）

**验证**：
- 至少测试3次90抽，验证保底触发

---

### Step 6.5: 功能测试 - 歪卡与大保底
- [ ] 记录歪卡时的状态（isGuaranteedUP = true）
- [ ] 下一发5星必为UP
- [ ] 验证大保底机制

**验证**：
- 至少触发1次歪卡，验证大保底

---

### Step 6.6: 功能测试 - 卡池切换
- [ ] 在角色池抽20抽
- [ ] 切换到武器池
- [ ] 验证保底数继承（最多再抽60抽出5星）

**验证**：
- 检查保底计数是否正确继承

---

### Step 6.7: 功能测试 - 数据持久化
- [ ] 抽几次卡
- [ ] 刷新页面
- [ ] 验证保底计数、统计、历史记录保留

**验证**：
- 刷新3次，数据一致

---

## 阶段七：优化与完善

### Step 7.1: 添加抽卡动画
- [ ] 安装 framer-motion（如未安装）
- [ ] 在 ResultModal 中添加动画
- [ ] 5星添加特殊光效动画

**验证**：
- 动画流畅，无卡顿

---

### Step 7.2: 响应式适配
- [ ] 测试移动端布局（< 640px）
- [ ] 测试平板布局（640-1024px）
- [ ] 测试桌面布局（> 1024px）

**验证**：
- 各尺寸下布局正常

---

### Step 7.3: 构建与部署
- [ ] 运行 `npm run build`
- [ ] 确认 build 目录下生成文件
- [ ] 运行 `npm run preview` 预览生产版本

**验证**：
- 生产构建无错误
- preview 正常运行

---

## 验收标准总结

| 功能 | 验收条件 |
|-----|---------|
| 单抽 | 消耗1抽，显示1个结果 |
| 十连 | 消耗10抽，至少1个4星或5星 |
| 5星保底 | 90抽（角色）/80抽（武器）必出5星 |
| 4星保底 | 10抽必出4星或5星 |
| 歪卡机制 | 歪后下次必出UP（大保底） |
| 卡池切换 | 保底计数继承 |
| 数据持久化 | 刷新页面数据保留 |
| 响应式 | 各尺寸布局正常 |
| 构建 | npm run build 成功 |

---

## 后续功能（基础完成后）

- [ ] 历史记录页面
- [ ] 历史筛选功能
- [ ] 导出/导入功能
- [ ] 自定义卡池功能
- [ ] 兑换系统（星芒/余烬）
