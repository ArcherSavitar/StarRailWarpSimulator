/**
 * 保底配置常量
 * 基于《崩坏：星穹铁道》官方公示的概率和保底机制
 */

import { BannerCategory, BannerType } from '../types';

/** 卡池配置 */
export const BANNER_CONFIG = {
  /** 角色活动跃迁 (UP池) */
  CHARACTER_EVENT: {
    fiveStarPity: 90,
    maxFiveStarPity: 180,
    fourStarPity: 10,
    fiveStarRate: 0.6,
    fourStarRate: 5.1,
    fiveStarUPRate: 50,      // 5星UP概率 50%
    fourStarUPRate: 50,      // 4星UP概率 50%
    softPityThreshold: 73,   // 软保底触发抽数
  },
  /** 光锥活动跃迁 (武器UP池) */
  WEAPON_EVENT: {
    fiveStarPity: 80,
    maxFiveStarPity: 160,
    fourStarPity: 10,
    fiveStarRate: 0.8,
    fourStarRate: 6.6,
    fiveStarUPRate: 75,     // 5星UP概率 75%
    fourStarUPRate: 75,     // 4星UP概率 75%
    softPityThreshold: 65,   // 软保底触发抽数
  },
  /** 常驻跃迁 (始发跃迁) */
  STANDARD: {
    fiveStarPity: 50,
    maxFiveStarPity: 50,
    fourStarPity: 10,
    fiveStarRate: 0.6,
    fourStarRate: 5.1,
    fiveStarUPRate: 0,      // 常驻池无UP
    fourStarUPRate: 0,      // 常驻池无UP
    softPityThreshold: 0,    // 常驻池无软保底
  },
  /** 新手跃迁 */
  NEWCOMER: {
    fiveStarPity: 50,
    maxFiveStarPity: 50,
    fourStarPity: 10,
    fiveStarRate: 0.6,
    fourStarRate: 5.1,
    fiveStarUPRate: 0,      // 新手池无UP
    fourStarUPRate: 0,      // 新手池无UP
    softPityThreshold: 0,
  },
} as const;

/** 卡池配置类型 */
export interface BannerConfigType {
  fiveStarPity: number;
  maxFiveStarPity: number;
  fourStarPity: number;
  fiveStarRate: number;
  fourStarRate: number;
  fiveStarUPRate: number;
  fourStarUPRate: number;
  softPityThreshold: number;
}

/**
 * 根据卡池类型和类别获取配置
 * @param type 卡池类型 (character | weapon)
 * @param category 卡池类别 (event | standard | newcomer)
 * @returns 卡池配置
 */
export function getBannerConfig(type: BannerType, category: BannerCategory): BannerConfigType {
  if (category === 'event') {
    return type === 'weapon' ? BANNER_CONFIG.WEAPON_EVENT : BANNER_CONFIG.CHARACTER_EVENT;
  }
  if (category === 'newcomer') {
    return BANNER_CONFIG.NEWCOMER;
  }
  return BANNER_CONFIG.STANDARD;
}

/** 存储键名 */
export const STORAGE_KEYS = {
  WARP_DATA: 'starrail_warp_data',
  CUSTOM_BANNERS: 'starrail_custom_banners',
} as const;
