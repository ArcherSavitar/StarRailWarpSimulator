import type { Weapon } from '../types';

export const weapons: Weapon[] = [
  // 5星限定武器
  {
    id: 'br1',
    name: '记一位持明的手艺',
    rarity: 5,
    type: '智识',
    isLimited: true,
  },
  {
    id: 'br2',
    name: '秘密武器',
    rarity: 5,
    type: '毁灭',
    isLimited: true,
  },
  {
    id: 'br3',
    name: '鸣雷的法则',
    rarity: 5,
    type: '毁灭',
    isLimited: true,
  },

  // 5星常驻武器
  {
    id: 'wr1',
    name: '星际漫游者',
    rarity: 5,
    type: '虚无',
    isLimited: false,
  },
  {
    id: 'wr2',
    name: '宇宙市场趋势',
    rarity: 5,
    type: '毁灭',
    isLimited: false,
  },
  {
    id: 'wr3',
    name: '记一位星神的笔迹',
    rarity: 5,
    type: '智识',
    isLimited: false,
  },
  {
    id: 'wr4',
    name: '汪！散步时间',
    rarity: 5,
    type: '存护',
    isLimited: false,
  },
  {
    id: 'wr5',
    name: '无主星矢的瑰剑',
    rarity: 5,
    type: '巡猎',
    isLimited: false,
  },

  // 4星武器
  {
    id: 'wr4_1',
    name: '星海巡航',
    rarity: 4,
    type: '巡猎',
    isLimited: false,
  },
  {
    id: 'wr4_2',
    name: '幽静',
    rarity: 4,
    type: '虚无',
    isLimited: false,
  },
  {
    id: 'wr4_3',
    name: '论剑',
    rarity: 4,
    type: '巡猎',
    isLimited: false,
  },
  {
    id: 'wr4_4',
    name: '春水初生',
    rarity: 4,
    type: '同谐',
    isLimited: false,
  },
  {
    id: 'wr4_5',
    name: '等价交换',
    rarity: 4,
    type: '丰饶',
    isLimited: false,
  },
  {
    id: 'wr4_6',
    name: '朗道',
    rarity: 4,
    type: '存护',
    isLimited: false,
  },
  {
    id: 'wr4_7',
    name: '灵箓',
    rarity: 4,
    type: '丰饶',
    isLimited: false,
  },
];
