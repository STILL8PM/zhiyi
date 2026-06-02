/**
 * uni-app 本地存储适配器
 *
 * 用途：实现 Supabase Auth SDK 要求的 storage 接口
 * { getItem, setItem, removeItem }
 *
 * 背景：@supabase/supabase-js 默认使用浏览器的 localStorage 持久化会话，
 * 但微信小程序没有 localStorage，uni-app 提供了统一的 uni.getStorageSync 等 API。
 * 此适配器将所有平台的存储操作统一代理到 uni 存储 API。
 *
 * 平台差异：
 * - H5: uni.setStorageSync 底层调用 localStorage.setItem
 * - 小程序: uni.setStorageSync 底层调用 wx.setStorageSync
 * - App: uni.setStorageSync 底层调用原生存储
 *
 * 参考: https://supabase.com/docs/reference/javascript/auth-localsorage
 */

import type { SupportedStorage } from '@supabase/supabase-js'

/**
 * uni-app 存储适配器
 *
 * 实现 Supabase Auth 的 SupportedStorage 接口，
 * 将浏览器的 localStorage 操作映射到 uni-app 的同步存储 API。
 */
export const uniStorageAdapter: SupportedStorage = {
  /**
   * 读取存储值
   *
   * @param key - 存储键名
   * @returns 存储的字符串值，不存在则返回 null
   */
  getItem(key: string): string | null {
    try {
      const value = uni.getStorageSync(key)
      // uni.getStorageSync 在 key 不存在时返回空字符串 ''，
      // 但 Supabase Auth 期望返回 null
      return value !== '' ? value : null
    } catch (error) {
      console.warn('[uniStorageAdapter] getItem 失败:', key, error)
      return null
    }
  },

  /**
   * 写入存储值
   *
   * @param key - 存储键名
   * @param value - 要存储的字符串值
   */
  setItem(key: string, value: string): void {
    try {
      uni.setStorageSync(key, value)
    } catch (error) {
      console.error('[uniStorageAdapter] setItem 失败:', key, error)
    }
  },

  /**
   * 删除存储值
   *
   * @param key - 要删除的存储键名
   */
  removeItem(key: string): void {
    try {
      uni.removeStorageSync(key)
    } catch (error) {
      console.warn('[uniStorageAdapter] removeItem 失败:', key, error)
    }
  },
}
