# 技术栈选择

## 推荐技术栈

| 类别 | 技术 | 版本 | 说明 |
|-----|------|------|------|
| 框架 | React | 18.x | 主流前端框架，生态丰富 |
| 语言 | TypeScript | 5.x | 类型安全，减少运行时错误 |
| 构建工具 | Vite | 5.x | 快速启动，热更新快 |
| 状态管理 | Zustand | 4.x | 轻量级，比 Redux 简单 |
| 路由 | React Router | 6.x | 官方推荐路由方案 |
| 样式 | Tailwind CSS | 3.x | 原子化 CSS，开发效率高 |
| 数据存储 | localStorage | - | 浏览器原生，无需额外依赖 |
| 动画 | framer-motion | 11.x | React 动画库首选 |

## 为什么选择这套技术栈

### 1. 简单
- Zustand 只有 1KB，没有 context  Provider 嵌套问题
- Tailwind CSS 无需编写 CSS 文件，配置即用
- Vite 开箱即用，无需复杂配置

### 2. 合适
- 项目是单页应用，不需要复杂的后端
- 抽卡模拟器交互密集，framer-motion 完美契合
- TypeScript 确保数据模型（角色、武器、卡池）类型安全

### 3. 健壮
- 全部是业界最成熟稳定的方案
- Vite + TypeScript 确保开发体验和代码质量
- localStorage 有完善的生命周期管理

## 项目初始化命令

```bash
# 创建 Vite 项目
npm create vite@latest . -- --template react-ts

# 安装依赖
npm install

# 安装额外依赖
npm install zustand react-router-dom framer-motion clsx tailwind-merge

# 安装 Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 目录结构

```
src/
├── components/       # UI 组件
│   ├── Banner/       # 卡池选择
│   ├── PullButton/  # 抽卡按钮
│   ├── ResultModal/ # 结果弹窗
│   ├── History/     # 历史记录
│   └── Stats/       # 统计面板
├── hooks/           # 自定义 Hooks
│   ├── useWarp.ts   # 抽卡逻辑
│   └── useLocalStorage.ts # 持久化
├── store/           # Zustand 状态管理
│   └── warpStore.ts
├── data/            # 静态数据
│   ├── characters.ts
│   ├── weapons.ts
│   └── banners.ts
├── utils/           # 工具函数
│   ├── gacha.ts     # 抽卡算法
│   └── storage.ts   # localStorage 封装
├── types/           # TypeScript 类型
│   └── index.ts
├── App.tsx          # 主组件
└── main.tsx        # 入口文件
```

## 替代方案对比

| 场景 | 推荐方案 | 备选方案 |
|-----|---------|---------|
| 状态管理 | Zustand | React Context (内置) |
| 样式 | Tailwind CSS | CSS Modules |
| 动画 | framer-motion | CSS Animation |
| 路由 | React Router | 不使用 (单页面) |
| 打包 | Vite | webpack / CRA |
