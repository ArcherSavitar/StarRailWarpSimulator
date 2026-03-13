/**
 * 抽卡算法核心
 * 基于《崩坏：星穹铁道》官方公示的概率和保底机制
 */

import type { Banner, BannerType, PityState, PullRecord, Rarity } from '../types';
import type { Character, Weapon } from '../types';
import { getBannerConfig } from './constants';
import { characters } from '../data/characters';
import { weapons } from '../data/weapons';
import { generateId } from './uuid';

// 3星物品池 (角色和武器共享)
const THREE_STAR_ITEMS = [
  { id: 't3_1', name: '流浪乐章', type: 'weapon' as BannerType },
  { id: 't3_2', name: '轮齿', type: 'weapon' as BannerType },
  { id: 't3_3', name: '终点存储器', type: 'weapon' as BannerType },
  { id: 't3_4', name: '齐响神座', type: 'weapon' as BannerType },
  { id: 't3_5', name: '物穰数', type: 'weapon' as BannerType },
  { id: 't3_6', name: '与行星轨道', type: 'weapon' as BannerType },
  { id: 't3_7', name: '空授予的时代', type: 'weapon' as BannerType },
];

/**
 * 从数组中随机选择一个元素
 */
function getRandomItem<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

/**
 * 获取指定星级的所有物品
 */
function getItemsByRarity(rarity: Rarity, banner: Banner): {
  upItems: (Character | Weapon)[];
  standardItems: (Character | Weapon)[];
} {
  const isCharacterBanner = banner.type === 'character';

  if (rarity === 3) {
    // 3星只返回空数组，因为3星是固定的光锥
    return { upItems: [], standardItems: [] };
  }

  if (rarity === 4) {
    // 获取4星UP角色/武器
    const upItems = banner.rateUp4Star
      .map(id => isCharacterBanner
        ? characters.find(c => c.id === id)
        : weapons.find(w => w.id === id)
      )
      .filter((item): item is Character | Weapon => item !== undefined);

    // 获取常驻4星角色/武器
    const standardItems = isCharacterBanner
      ? characters.filter(c => c.rarity === 4 && !banner.rateUp4Star.includes(c.id))
      : weapons.filter(w => w.rarity === 4 && !banner.rateUp4Star.includes(w.id));

    return { upItems, standardItems };
  }

  if (rarity === 5) {
    // 获取5星UP角色/武器
    const upItems = banner.rateUp5Star
      .map(id => isCharacterBanner
        ? characters.find(c => c.id === id)
        : weapons.find(w => w.id === id)
      )
      .filter((item): item is Character | Weapon => item !== undefined);

    // 获取常驻5星角色/武器
    const standardItems = isCharacterBanner
      ? characters.filter(c => c.rarity === 5 && !c.isLimited && !banner.rateUp5Star.includes(c.id))
      : weapons.filter(w => w.rarity === 5 && !w.isLimited && !banner.rateUp5Star.includes(w.id));

    return { upItems, standardItems };
  }

  return { upItems: [], standardItems: [] };
}

/**
 * 处理3星物品
 */
function getThreeStar(): PullRecord {
  const item = getRandomItem(THREE_STAR_ITEMS);
  return {
    id: generateId(),
    bannerId: '',
    bannerName: '',
    itemId: item.id,
    itemName: item.name,
    rarity: 3,
    type: item.type,
    isRateUp: false,
    timestamp: Date.now(),
    pityCount: 0,
  };
}

/**
 * 处理4星物品
 * @param banner 卡池配置
 * @param pityState 保底状态
 * @param isGuaranteed 是否保底触发
 */
function getFourStar(banner: Banner, pityState: PityState, isGuaranteed: boolean): PullRecord {
  const config = getBannerConfig(banner.type, banner.category);
  const isCharacterBanner = banner.type === 'character';

  // 判断是否触发4星UP
  let isRateUp = false;
  let selectedItem: { id: string; name: string } | null = null;

  // 歪后必出UP，或者根据概率
  if (pityState.isFourStarGuaranteedUP) {
    isRateUp = true;
  } else if (!isGuaranteed && config.fourStarUPRate > 0) {
    isRateUp = Math.random() * 100 < config.fourStarUPRate;
  }

  const { upItems, standardItems } = getItemsByRarity(4, banner);

  if (isRateUp && upItems.length > 0) {
    selectedItem = getRandomItem(upItems);
  } else if (standardItems.length > 0) {
    selectedItem = getRandomItem(standardItems);
  } else if (upItems.length > 0) {
    selectedItem = getRandomItem(upItems);
    isRateUp = true;
  }

  if (!selectedItem) {
    // 兜底：使用UP列表
    const fallbackItem = isCharacterBanner
      ? characters.find(c => c.id === banner.rateUp4Star[0])
      : weapons.find(w => w.id === banner.rateUp4Star[0]);

    if (fallbackItem) {
      selectedItem = fallbackItem;
    } else {
      // 兜底：随机4星
      const allFourStar = isCharacterBanner
        ? characters.filter(c => c.rarity === 4)
        : weapons.filter(w => w.rarity === 4);
      selectedItem = getRandomItem(allFourStar as (Character | Weapon)[]);
    }
  }

  return {
    id: generateId(),
    bannerId: banner.id,
    bannerName: banner.name,
    itemId: selectedItem!.id,
    itemName: selectedItem!.name,
    rarity: 4,
    type: banner.type,
    isRateUp,
    timestamp: Date.now(),
    pityCount: pityState.fourStarPity,
  };
}

/**
 * 处理5星物品
 * @param banner 卡池配置
 * @param pityState 保底状态
 * @param isGuaranteed 是否保底触发
 */
function getFiveStar(banner: Banner, pityState: PityState, isGuaranteed: boolean): PullRecord {
  const config = getBannerConfig(banner.type, banner.category);
  const isCharacterBanner = banner.type === 'character';

  // 判断是否触发5星UP
  let isRateUp = false;

  // 大保底：必出UP
  if (pityState.isGuaranteedUP) {
    isRateUp = true;
  } else if (!isGuaranteed && config.fiveStarUPRate > 0) {
    // 小保底：根据概率判断
    isRateUp = Math.random() * 100 < config.fiveStarUPRate;
  }

  const { upItems, standardItems } = getItemsByRarity(5, banner);

  let selectedItem: { id: string; name: string } | null = null;

  if (isRateUp && upItems.length > 0) {
    selectedItem = getRandomItem(upItems);
  } else if (standardItems.length > 0) {
    selectedItem = getRandomItem(standardItems);
  } else if (upItems.length > 0) {
    selectedItem = getRandomItem(upItems);
    isRateUp = true;
  }

  if (!selectedItem) {
    // 兜底：使用UP列表
    const fallbackItem = isCharacterBanner
      ? characters.find(c => c.id === banner.rateUp5Star[0])
      : weapons.find(w => w.id === banner.rateUp5Star[0]);

    if (fallbackItem) {
      selectedItem = fallbackItem;
    } else {
      // 兜底：随机5星
      const allFiveStar = isCharacterBanner
        ? characters.filter(c => c.rarity === 5)
        : weapons.filter(w => w.rarity === 5);
      selectedItem = getRandomItem(allFiveStar as (Character | Weapon)[]);
    }
  }

  return {
    id: generateId(),
    bannerId: banner.id,
    bannerName: banner.name,
    itemId: selectedItem!.id,
    itemName: selectedItem!.name,
    rarity: 5,
    type: banner.type,
    isRateUp,
    timestamp: Date.now(),
    pityCount: pityState.fiveStarPity,
  };
}

/**
 * 核心抽卡函数
 * @param banner 卡池配置
 * @param pityState 当前保底状态
 * @param count 抽卡数量 (1 或 10)
 * @returns 抽卡结果数组和更新后的保底状态
 */
export function pull(
  banner: Banner,
  pityState: PityState,
  count: number
): { results: PullRecord[]; newPityState: PityState } {
  const config = getBannerConfig(banner.type, banner.category);
  const results: PullRecord[] = [];
  let newPityState: PityState = { ...pityState };

  // 十连保底：保证至少一个4星或5星
  let guaranteedPullIndex = -1;
  if (count === 10) {
    // 在第8-10抽之间随机一个位置触发保底
    guaranteedPullIndex = 7 + Math.floor(Math.random() * 3);
  }

  for (let i = 0; i < count; i++) {
    // 更新保底计数
    newPityState.fiveStarPity++;
    newPityState.fourStarPity++;

    let result: PullRecord;
    const isThisPullGuaranteed = i === guaranteedPullIndex;

    // 优先检查4星保底 (每10抽必出4星或5星)
    if (newPityState.fourStarPity >= config.fourStarPity || isThisPullGuaranteed) {
      // 4星保底触发
      result = getFourStar(banner, newPityState, true);
      newPityState.fourStarPity = 0;
      // 如果4星保底触发了5星，保底计数也重置
      if (result.rarity === 5) {
        newPityState.fiveStarPity = 0;
      }
    }
    // 检查5星保底
    else if (newPityState.fiveStarPity >= config.fiveStarPity) {
      // 5星保底触发
      result = getFiveStar(banner, newPityState, true);
      newPityState.fiveStarPity = 0;
      newPityState.fourStarPity = 0;
    }
    // 基础概率计算
    else {
      const rand = Math.random() * 10000;
      const fiveStarRate100 = config.fiveStarRate * 100; // 0.6% -> 60
      const fourStarRate100 = config.fourStarRate * 100; // 5.1% -> 510

      if (rand < fiveStarRate100 * 100) { // 5星: 0.6%
        result = getFiveStar(banner, newPityState, false);
        newPityState.fiveStarPity = 0;
        newPityState.fourStarPity = 0;
      } else if (rand < (fiveStarRate100 + fourStarRate100) * 100) { // 4星: 5.1%
        result = getFourStar(banner, newPityState, false);
        newPityState.fourStarPity = 0;
        if (result.rarity === 5) {
          newPityState.fiveStarPity = 0;
        }
      } else {
        // 3星
        result = getThreeStar();
      }
    }

    // 处理歪卡逻辑 (5星)
    if (result.rarity === 5 && !result.isRateUp) {
      // 歪了，进入大保底
      newPityState.isGuaranteedUP = true;
    } else if (result.rarity === 5 && result.isRateUp) {
      // 出了UP，重置大保底
      newPityState.isGuaranteedUP = false;
    }

    // 处理4星歪卡逻辑
    if (result.rarity === 4 && !result.isRateUp && config.fourStarUPRate > 0) {
      // 歪了，下次4星必为UP
      newPityState.isFourStarGuaranteedUP = true;
    } else if (result.rarity === 4 && result.isRateUp) {
      // 出了UP4星，重置
      newPityState.isFourStarGuaranteedUP = false;
    }

    results.push(result);
  }

  return { results, newPityState };
}

/**
 * 获取保底配置信息
 */
export function getPityInfo(banner: Banner) {
  return getBannerConfig(banner.type, banner.category);
}
