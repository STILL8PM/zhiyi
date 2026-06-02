/**
 * Supabase 客户端单例 —— 全平台适配
 *
 * 职责：
 * 1. 创建并管理 Supabase 客户端单例
 * 2. 注入 uni 存储适配器（替代浏览器 localStorage）
 * 3. 微信小程序端注入 fetch polyfill
 * 4. 配置自动 token 刷新和会话持久化
 *
 * 核心设计：
 * - 单例模式确保全局只有一份 Supabase 连接
 * - 条件编译处理不同平台的底层 API 差异
 * - auth 配置适配 uni-app 跨端特性
 *
 * 参考:
 * - https://supabase.com/docs/reference/javascript/initializing
 * - https://uniapp.dcloud.net.cn/tutorial/platform.html
 */

import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { uniStorageAdapter } from './storage'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/config/supabase'

// 条件编译：小程序端引入 fetch polyfill
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import fetchPolyfill from './fetch-polyfill'

/** Supabase 客户端单例引用 */
let supabaseInstance: SupabaseClient | null = null

/**
 * 获取 Supabase 客户端实例（单例模式）
 *
 * 首次调用时创建客户端并配置：
 * - 使用 uni 存储适配器替代 localStorage
 * - 启用自动 token 刷新
 * - 持久化会话到本地存储
 * - 小程序端注入 fetch polyfill
 *
 * @returns SupabaseClient 实例
 */
export function getSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = getSupabaseUrl()
  const supabasePublishableKey = getSupabasePublishableKey()

  // auth 配置选项
  const authOptions: {
    storage: typeof uniStorageAdapter
    autoRefreshToken: boolean
    persistSession: boolean
    detectSessionInUrl: boolean
  } = {
    // 使用 uni 存储适配器替代浏览器 localStorage
    storage: uniStorageAdapter,
    // 自动刷新即将过期的 token
    autoRefreshToken: true,
    // 持久化会话到本地存储（跨页面/重启保持登录）
    persistSession: true,
    // 不使用 URL 中的 session 参数（小程序不支持，且存在安全风险）
    detectSessionInUrl: false,
  }

  // 微信小程序端：注入 fetch polyfill
  // #ifdef MP-WEIXIN
  if (typeof fetchPolyfill === 'function') {
    // Supabase JS SDK 内部通过 global.fetch 发起请求
    // 小程序端需要替换为我们基于 uni.request 的 polyfill
    (globalThis as AnyObject).fetch = fetchPolyfill
  }
  // #endif

  supabaseInstance = createClient(supabaseUrl, supabasePublishableKey, {
    auth: authOptions,
  })

  console.log('[Supabase] 客户端初始化完成')

  return supabaseInstance
}

/**
 * 重置 Supabase 客户端（用于测试或切换项目）
 * 通常不需要调用此方法
 */
export function resetSupabase(): void {
  supabaseInstance = null
}
