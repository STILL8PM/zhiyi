/**
 * uni-app 本地存储适配器
 *
 * 用途：
 * 1. uniStorageAdapter —— 实现 Supabase Auth SDK 要求的 SupportedStorage 接口
 *    { getItem, setItem, removeItem }，getItem 返回 MaybePromisify<string|null>
 * 2. uniPiniaStorage —— 满足 Pinia persist 插件的 StorageLike 接口
 *    { getItem, setItem }，getItem 返回 string|null（必须是同步）
 *    Supabase adapter 因返回类型含 Promise 联合，不能直接用于 Pinia
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
 * 使用方式：
 * - Supabase: getSupabase() 内部自动使用 uniStorageAdapter
 * - Pinia persist: import { uniPiniaStorage } from '@/libs/storage'
 *                   在 store 的 persist.storage 中引用
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

/**
 * Pinia persist 插件专用存储适配器
 *
 * Pinia 的 StorageLike 接口要求 getItem 同步返回 string|null，
 * 而 Supabase 的 SupportedStorage 允许返回 Promise。
 * 因此需要单独导出这份类型兼容的版本，实现逻辑完全一致。
 */
export const uniPiniaStorage = {
  getItem(key: string): string | null {
    try {
      const value = uni.getStorageSync(key)
      return value !== '' ? value : null
    } catch (error) {
      console.warn('[uniPiniaStorage] getItem 失败:', key, error)
      return null
    }
  },

  setItem(key: string, value: string): void {
    try {
      uni.setStorageSync(key, value)
    } catch (error) {
      console.error('[uniPiniaStorage] setItem 失败:', key, error)
    }
  },
}
