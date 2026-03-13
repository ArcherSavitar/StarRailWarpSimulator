/**
 * 抽卡状态管理 (Zustand Store)
 * 管理抽卡状态、保底计数、统计数据等
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Banner, PityState, PullRecord, Stats, BannerStats } from '../types';
import { banners } from '../data/banners';
import { pull } from '../utils/gacha';
import { STORAGE_KEYS } from '../utils/constants';

// 初始保底状态
const initialPityState: PityState = {
  fiveStarPity: 0,
  fourStarPity: 0,
  isGuaranteedUP: false,
  isFourStarGuaranteedUP: false,
};

// 初始统计数据
const initialStats: Stats = {
  totalPulls: 0,
  totalFiveStars: 0,
  totalFourStars: 0,
  pullsInCurrentBanner: 0,
  currency: 0,
  bannerStats: {},
};

// Store 状态接口
interface WarpState {
  // 当前状态
  currentBannerId: string;
  pityState: PityState;
  stats: Stats;
  pullHistory: PullRecord[];
  isPulling: boolean;
  showResult: boolean;
  currentResults: PullRecord[];

  // Actions
  pull: (count: number) => void;
  switchBanner: (bannerId: string) => void;
  setPulling: (isPulling: boolean) => void;
  setShowResult: (show: boolean) => void;
  clearHistory: () => void;
  reset: () => void;
}

// 获取当前卡池
function getCurrentBanner(bannerId: string): Banner {
  return banners.find(b => b.id === bannerId) || banners[0];
}

// Store 实现
export const useWarpStore = create<WarpState>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentBannerId: banners[0]?.id || 'character-event-feixiao',
      pityState: { ...initialPityState },
      stats: { ...initialStats },
      pullHistory: [],
      isPulling: false,
      showResult: false,
      currentResults: [],

      // 抽卡 action
      pull: (count: number) => {
        const state = get();
        const banner = getCurrentBanner(state.currentBannerId);

        // 设置抽卡中状态
        set({ isPulling: true });

        // 执行抽卡
        const { results, newPityState } = pull(banner, state.pityState, count);

        // 更新统计数据
        const newStats = { ...state.stats };
        newStats.totalPulls += count;
        newStats.pullsInCurrentBanner += count;

        // 统计各星级数量
        results.forEach(result => {
          if (result.rarity === 5) {
            newStats.totalFiveStars++;
            // 更新卡池统计
            if (!newStats.bannerStats[banner.id]) {
              newStats.bannerStats[banner.id] = {
                pulls: 0,
                fiveStars: 0,
                fourStars: 0,
                obtainedItems: [],
              };
            }
            newStats.bannerStats[banner.id].fiveStars++;
            newStats.bannerStats[banner.id].obtainedItems.push(result.itemId);
          } else if (result.rarity === 4) {
            newStats.totalFourStars++;
            if (!newStats.bannerStats[banner.id]) {
              newStats.bannerStats[banner.id] = {
                pulls: 0,
                fiveStars: 0,
                fourStars: 0,
                obtainedItems: [],
              };
            }
            newStats.bannerStats[banner.id].fourStars++;
            newStats.bannerStats[banner.id].obtainedItems.push(result.itemId);
          }
        });
        if (newStats.bannerStats[banner.id]) {
          newStats.bannerStats[banner.id].pulls += count;
        }

        // 更新状态
        set({
          pityState: newPityState,
          stats: newStats,
          pullHistory: [...results, ...state.pullHistory],
          isPulling: false,
          showResult: true,
          currentResults: results,
        });
      },

      // 切换卡池 action
      switchBanner: (bannerId: string) => {
        set({ currentBannerId: bannerId });
      },

      // 设置抽卡中状态
      setPulling: (isPulling: boolean) => {
        set({ isPulling });
      },

      // 设置结果显示
      setShowResult: (show: boolean) => {
        set({ showResult: show, currentResults: [] });
      },

      // 清空历史记录
      clearHistory: () => {
        set({
          pullHistory: [],
          stats: { ...initialStats },
          pityState: { ...initialPityState },
        });
      },

      // 重置所有数据
      reset: () => {
        set({
          currentBannerId: banners[0]?.id || 'character-event-feixiao',
          pityState: { ...initialPityState },
          stats: { ...initialStats },
          pullHistory: [],
          isPulling: false,
          showResult: false,
          currentResults: [],
        });
      },
    }),
    {
      name: STORAGE_KEYS.WARP_DATA,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentBannerId: state.currentBannerId,
        pityState: state.pityState,
        stats: state.stats,
        pullHistory: state.pullHistory,
      }),
    }
  )
);

// 导出所有卡池供外部使用
export { banners };
