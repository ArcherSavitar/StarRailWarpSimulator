// 命途类型
export type Path = '毁灭' | '巡猎' | '智识' | '同谐' | '虚无' | '丰饶' | '存护';

// 元素类型
export type Element = '物理' | '火' | '冰' | '雷' | '风' | '量子' | '虚数';

// 星级类型
export type Rarity = 5 | 4 | 3;

// 卡池类型
export type BannerType = 'character' | 'weapon';

// 卡池类别
export type BannerCategory = 'event' | 'standard' | 'newcomer';

// 角色数据
export interface Character {
  id: string;
  name: string;
  rarity: Rarity;
  path: Path;
  element: Element;
  isLimited: boolean;
  image?: string;
}

// 武器/光锥数据
export interface Weapon {
  id: string;
  name: string;
  rarity: Rarity;
  type: Path;
  isLimited: boolean;
  image?: string;
}

// 卡池配置
export interface Banner {
  id: string;
  name: string;
  type: BannerType;
  category: BannerCategory;
  rateUp5Star: string[];
  rateUp4Star: string[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

// 抽卡记录
export interface PullRecord {
  id: string;
  bannerId: string;
  bannerName: string;
  itemId: string;
  itemName: string;
  rarity: Rarity;
  type: BannerType;
  isRateUp: boolean;
  timestamp: number;
  pityCount: number;
}

// 保底状态
export interface PityState {
  fiveStarPity: number;
  fourStarPity: number;
  isGuaranteedUP: boolean;
  isFourStarGuaranteedUP: boolean;
}

// 单个卡池统计数据
export interface BannerStats {
  pulls: number;
  fiveStars: number;
  fourStars: number;
  obtainedItems: string[];
}

// 统计数据
export interface Stats {
  totalPulls: number;
  totalFiveStars: number;
  totalFourStars: number;
  pullsInCurrentBanner: number;
  currency: number;
  bannerStats: Record<string, BannerStats>;
}
