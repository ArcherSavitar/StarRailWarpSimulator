import { Banner } from '../types';

export const banners: Banner[] = [
  // 角色活动UP池 (飞霄)
  {
    id: 'character-event-feixiao',
    name: '飞霄',
    type: 'character',
    category: 'event',
    rateUp5Star: ['feixiao'],
    rateUp4Star: ['tingyun', 'march7th', 'danheng'],
    startDate: '2024-09-04',
    endDate: '2024-09-25',
    isActive: true,
  },
  // 武器活动UP池
  {
    id: 'weapon-event-v1',
    name: '武器活动',
    type: 'weapon',
    category: 'event',
    rateUp5Star: ['br1'],
    rateUp4Star: ['wr4_1', 'wr4_2', 'wr4_3'],
    startDate: '2024-09-04',
    endDate: '2024-09-25',
    isActive: false,
  },
  // 常驻池 (始发跃迁)
  {
    id: 'character-standard',
    name: '始发跃迁',
    type: 'character',
    category: 'standard',
    rateUp5Star: [],
    rateUp4Star: [],
  },
  // 新手池
  {
    id: 'newcomer',
    name: '新手跃迁',
    type: 'character',
    category: 'newcomer',
    rateUp5Star: [],
    rateUp4Star: [],
  },
];
