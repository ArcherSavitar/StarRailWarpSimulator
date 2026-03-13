/**
 * localStorage 封装工具
 * 用于数据的持久化存储
 */

import { STORAGE_KEYS } from './constants';

/**
 * 保存数据到 localStorage
 * @param key 存储键名
 * @param data 要存储的数据
 */
export function saveData<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Error saving data to localStorage:`, error);
  }
}

/**
 * 从 localStorage 读取数据
 * @param key 存储键名
 * @returns 解析后的数据，如果不存在则返回 null
 */
export function loadData<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error loading data from localStorage:`, error);
    return null;
  }
}

/**
 * 从 localStorage 删除数据
 * @param key 存储键名
 */
export function removeData(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data from localStorage:`, error);
  }
}

/**
 * 清空所有应用相关数据
 */
export function clearAllData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error(`Error clearing all data:`, error);
  }
}

/**
 * 检查 localStorage 是否可用
 * @returns 是否可用
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}
