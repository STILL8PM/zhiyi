/**
 * 认证状态管理 —— Pinia Store
 *
 * 职责：
 * 1. 管理 Supabase 会话（Session）和用户（User）状态
 * 2. 提供 isAuthenticated / accessToken / userId 等计算属性
 * 3. 应用启动时从本地存储恢复会话（init）
 * 4. 持久化关键字段到 uni 本地存储
 *
 * 数据流：
 * App.vue onLaunch → authStore.init() → supabase.auth.getSession()
 * → setSession(session) → store 更新 → 所有组件响应
 *
 * 参考: https://supabase.com/docs/reference/javascript/auth-getsession
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabase } from '@/libs/supabase'
import { uniPiniaStorage } from '@/libs/storage'

/**
 * 认证 Store
 *
 * 持久化说明：
 * session 和 user 会被 pinia-plugin-persistedstate 自动持久化到本地存储，
 * 应用重新打开时能快速恢复登录状态（无需等待网络请求）。
 */
export const useAuthStore = defineStore(
  'auth',
  () => {
    // ===== 状态 =====

    /** Supabase 会话对象，包含 access_token / refresh_token */
    const session = ref<Session | null>(null)

    /** Supabase 用户对象，包含 id / email / phone 等 */
    const user = ref<User | null>(null)

    /** 认证初始化是否完成（恢复会话、监听注册） */
    const isReady = ref(false)

    /** 是否正在进行认证操作（登录/注册/刷新） */
    const loading = ref(false)

    // ===== 计算属性 =====

    /** 是否已登录 */
    const isAuthenticated = computed<boolean>(() => !!user.value)

    /** 当前用户的 access_token（已登录时有效） */
    const accessToken = computed<string | null>(
      () => session.value?.access_token || null,
    )

    /** 当前用户的 ID */
    const userId = computed<string | null>(() => user.value?.id || null)

    /** 当前用户的邮箱 */
    const email = computed<string | null>(() => user.value?.email || null)

    // ===== 操作方法 =====

    /**
     * 初始化认证状态
     *
     * 在 App.vue onLaunch 中调用，执行顺序：
     * 1. 从本地存储恢复会话（persistSession 自动持久化的）
     * 2. 若 access_token 过期，自动尝试 refresh
     * 3. 更新 store 状态
     */
    async function init(): Promise<void> {
      try {
        loading.value = true
        const supabase = getSupabase()
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.warn('[AuthStore] 恢复会话失败:', error.message)
          return
        }

        if (data.session) {
          setSession(data.session)
          console.log('[AuthStore] 会话已恢复, userId:', data.session.user.id)
        } else {
          console.log('[AuthStore] 无已保存的会话，需要登录')
        }
      } catch (err) {
        console.error('[AuthStore] init 异常:', err)
      } finally {
        isReady.value = true
        loading.value = false
      }
    }

    /**
     * 设置会话和用户信息
     *
     * 登录成功 / token 刷新 / 用户更新时调用
     */
    function setSession(newSession: Session | null): void {
      session.value = newSession
      user.value = newSession?.user || null
    }

    /**
     * 清除会话和用户信息
     *
     * 登出 / 会话过期时调用
     */
    function clearSession(): void {
      session.value = null
      user.value = null
    }

    /**
     * 手动刷新 access_token
     *
     * 通常在 token 即将过期时被动触发（autoRefreshToken: true），
     * 也可在关键操作前主动调用
     */
    async function refreshSession(): Promise<void> {
      try {
        const supabase = getSupabase()
        const { data, error } = await supabase.auth.refreshSession()

        if (error) {
          console.error('[AuthStore] 刷新会话失败:', error.message)
          clearSession()
          return
        }

        if (data.session) {
          setSession(data.session)
        }
      } catch (err) {
        console.error('[AuthStore] refreshSession 异常:', err)
        clearSession()
      }
    }

    return {
      // 状态
      session,
      user,
      isReady,
      loading,
      // 计算属性
      isAuthenticated,
      accessToken,
      userId,
      email,
      // 方法
      init,
      setSession,
      clearSession,
      refreshSession,
    }
  },
  {
    // 持久化配置：session 和 user 存入本地存储
    persist: {
      key: 'uni_supabase_auth',
      // 使用 uni 存储适配器（复用 libs/storage.ts）
      storage: uniPiniaStorage,
      // 仅持久化这两个字段（不持久化 loading/isReady 等临时状态）
      pick: ['session', 'user'],
    },
  },
)
