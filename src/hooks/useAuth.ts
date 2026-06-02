/**
 * 认证组合式函数 —— useAuth
 *
 * 职责：
 * 1. 封装登录/注册/登出/重置密码的完整流程
 * 2. 调用 API 层 → 更新 Store → 显示 Toast → 执行跳转
 * 3. 提供响应式的 isAuthenticated / user 供组件使用
 *
 * Toast 文案通过 vue-i18n 国际化
 *
 * 使用方式：
 *   const { login, register, logout, isAuthenticated, user } = useAuth()
 */

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/store/useAuthStore'
import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  resetPassword,
} from '@/api/auth'
import { getRedirectPath } from '@/middleware/auth'

export function useAuth() {
  const authStore = useAuthStore()
  const { t } = useI18n()

  // ===== 响应式状态（从 store 派生） =====

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)
  const loading = computed(() => authStore.loading)
  const email = computed(() => authStore.email)

  // ===== 操作方法 =====

  /**
   * 邮箱登录
   *
   * 成功后自动更新 store → 跳转目标页面
   */
  async function login(
    emailAddr: string,
    password: string,
    redirect?: string,
  ): Promise<boolean> {
    const { data, error } = await signInWithEmail(emailAddr, password)

    if (error) {
      uni.showToast({
        title: error.message || t('auth.loginFailed'),
        icon: 'none',
        duration: 2000,
      })
      return false
    }

    if (data?.session) {
      authStore.setSession(data.session)
      uni.showToast({ title: t('auth.loginSuccess'), icon: 'success' })

      // 跳转目标页面
      const targetPath = redirect || getRedirectPath()
      setTimeout(() => {
        if (targetPath.startsWith('/pages/index') || targetPath.startsWith('/pages/user')) {
          uni.switchTab({ url: targetPath })
        } else {
          uni.redirectTo({ url: targetPath })
        }
      }, 500)

      return true
    }

    return false
  }

  /**
   * 邮箱注册
   *
   * 成功后自动登录并跳转首页
   */
  async function register(
    emailAddr: string,
    password: string,
    username?: string,
  ): Promise<boolean> {
    const { data, error } = await signUpWithEmail(emailAddr, password, username)

    if (error) {
      uni.showToast({
        title: error.message || t('auth.registerFailed'),
        icon: 'none',
        duration: 2000,
      })
      return false
    }

    // 注意：如果 Supabase 开启了邮箱确认，
    // 注册后 data.session 为 null，用户需先确认邮箱
    if (data?.session) {
      authStore.setSession(data.session)
      uni.showToast({ title: t('auth.registerSuccess'), icon: 'success' })
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 500)
      return true
    }

    // 需要确认邮箱
    uni.showToast({
      title: t('auth.registerEmailSent'),
      icon: 'none',
      duration: 3000,
    })
    return true
  }

  /**
   * 登出
   *
   * 清除本地会话 → 跳转登录页
   * 注意：不清除已保存邮箱，方便同一用户再次登录
   */
  async function logout(): Promise<void> {
    const { error } = await signOut()

    if (error) {
      console.warn('[useAuth] 登出 API 调用失败，仍清除本地状态:', error.message)
    }

    authStore.clearSession()

    // 跳转登录页
    uni.reLaunch({ url: '/pages/auth/login/index' })
  }

  /**
   * 发送密码重置邮件
   */
  async function forgotPassword(emailAddr: string): Promise<boolean> {
    const { error } = await resetPassword(emailAddr)

    if (error) {
      uni.showToast({
        title: error.message || t('auth.resetFailed'),
        icon: 'none',
      })
      return false
    }

    uni.showToast({
      title: t('auth.resetSent'),
      icon: 'success',
      duration: 3000,
    })
    return true
  }

  return {
    // 响应式状态
    isAuthenticated,
    user,
    loading,
    email,
    // 方法
    login,
    register,
    logout,
    forgotPassword,
  }
}
