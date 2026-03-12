# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**StarRailWarpSimulator** (星穹铁道抽卡模拟器) - A web-based gacha simulator for the game "Honkai: Star Rail" (崩坏：星穹铁道). It simulates the complete gacha system including character banners, weapon/light cone banners, limited banners, pity system, and history tracking.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5.x
- **State Management**: Zustand 4.x
- **Routing**: React Router 6.x
- **Styling**: Tailwind CSS 3.x
- **Animation**: framer-motion 11.x
- **Data Persistence**: localStorage

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Architecture

### Core Gacha System

The gacha mechanics are based on official Honkai: Star Rail rates:

| Banner Type | 5-Star Pity | 4-Star Pity | 5-Star Rate | UP Rate |
|-------------|-------------|-------------|-------------|---------|
| Character Event | 90 (180 max) | 10 | 0.6% | 50% |
| Light Cone Event | 80 (160 max) | 10 | 0.8% | 75% |
| Standard | 50 | 10 | 0.6% | N/A |
| Newcomer | 50 (max) | 10 | 0.6% | N/A |

Key files for gacha logic:
- `src/utils/gacha.ts` - Core pull algorithm and pity calculation
- `src/store/warpStore.ts` - Zustand store for state management
- `src/hooks/useWarp.ts` - Pull logic hook

### Data Models

All game data is defined in:
- `src/data/characters.ts` - Character definitions
- `src/data/weapons.ts` - Light cone definitions
- `src/data/banners.ts` - Banner configurations

### Key Implementation Details

1. **Pity System**: Tracks `fiveStarPity` (0-90/80) and `fourStarPity` (0-10) counters
2. **Rate-up (UP) Mechanic**: When a 5-star is "off-rate" (歪), next 5-star is guaranteed to be UP
3. **Banner Switching**: Pity counters can transfer between Character and Weapon event banners
4. **10-Pull Guarantee**: Every 10-pull guarantees at least one 4-star or 5-star

### Project Structure

```
src/
├── components/     # UI components (Banner, PullButton, ResultModal, History, Stats)
├── hooks/          # Custom hooks (useWarp, useLocalStorage)
├── store/          # Zustand store
├── data/           # Static game data
├── utils/          # Utilities (gacha algorithm, storage)
├── types/          # TypeScript definitions
├── App.tsx
└── main.tsx
```

## Design Documents (MUST READ before coding)

The following files contain the complete project specification. **You MUST read these files before writing any code:**

1. **`memory-bank/architecture.md`** - Complete architecture, data models, state management, and database structure
2. **`memory-bank/game-design-document.md`** - Full game design document with gacha mechanics
3. **`memory-bank/tech-stack.md`** - Technology stack recommendations

> ⚠️ **Important**: After completing major milestones, you must update `memory-bank/architecture.md` to reflect the actual implementation.

## Implementation Plan

Follow the step-by-step plan in `memory-bank/implementation-plan.md`. Each step includes specific verification tests.

Track progress in `memory-bank/progress.md` - update it as each step is completed.
