/**
 * UUID 生成工具
 * 用于生成唯一的抽卡记录 ID
 */

/**
 * 生成唯一 ID
 * @returns 唯一字符串
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}
