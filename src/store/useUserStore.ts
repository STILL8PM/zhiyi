/**
 * 用户扩展信息管理 —— Pinia Store
 *
 * 职责：
 * 1. 管理 profiles 表中的用户扩展信息（用户名、头像、简介等）
 * 2. 与 auth.users 表解耦，存储业务层的用户资料
 * 3. 应用启动时通过 fetchProfile 从 Supabase 拉取最新资料
 *
 * 数据来源：public.profiles 表
 * 关联方式：profiles.id = auth.users.id
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Profile } from '@/types/database'
import { getProfile, updateProfile as updateProfileApi } from '@/api/profile'
import { useAuthStore } from '@/store/useAuthStore'

export const useUserStore = defineStore('user', () => {
  // ===== 状态 =====

  /** 用户扩展资料（来自 profiles 表） */
  const profile = ref<Profile | null>(null)

  /** 是否正在加载资料 */
  const loading = ref(false)

  /** 资料是否已从服务端拉取过 */
  const isFetched = ref(false)

  // ===== 操作方法 =====

  /**
   * 从 Supabase 拉取当前登录用户的 profiles 记录
   *
   * 调用时机：App.vue onLaunch 认证恢复成功后
   *
   * 容错设计（常见场景）：
   * 1. 新用户通过注册流程 → handle_new_user 触发器已自动建好 → 直接读到
   * 2. 老用户（触发器安装前就注册的）→ profiles 表无记录 → 自动补建一条
   * 3. 触发器因数据库重启延迟 → 等 1s 重试一次
   *
   * @returns 是否拉取成功
   */
  async function fetchProfile(): Promise<boolean> {
    const authStore = useAuthStore()
    const userId = authStore.userId
    const userEmail = authStore.email

    if (!userId) {
      console.warn('[UserStore] fetchProfile: 未登录，跳过')
      return false
    }

    loading.value = true

    try {
      const { data, error } = await getProfile(userId)

      // ===== 情况 A：查到记录 → 直接用 =====
      if (data) {
        setProfile(data)
        isFetched.value = true
        console.log('[UserStore] 资料拉取成功, username:', data.username)
        loading.value = false
        return true
      }

      // ===== 情况 B：查不到记录（触发器未建/老用户）→ 自动补建 =====
      if (error) {
        console.warn('[UserStore] 资料记录不存在，自动创建 profiles 记录, userId:', userId)

        // 用 upsert 补建 profiles 记录（username 兜底用邮箱前缀）
        const fallbackName = userEmail ? userEmail.split('@')[0] : null
        const createResult = await updateProfileApi(userId, {
          username: fallbackName,
        })

        if (createResult.error) {
          // 还不行，可能是触发器有延迟，等 1s 再试一次查
          console.warn('[UserStore] 补建也失败了，1s 后最后尝试一次...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          const retry = await getProfile(userId)
          if (retry.data) {
            setProfile(retry.data)
            isFetched.value = true
            loading.value = false
            return true
          }
          console.error('[UserStore] 拉取/创建资料彻底失败:', (createResult.error as { message?: string }).message)
          loading.value = false
          return false
        }

        if (createResult.data) {
          setProfile(createResult.data)
          isFetched.value = true
          console.log('[UserStore] 资料自动补建成功, username:', createResult.data.username)
          loading.value = false
          return true
        }
      }

      loading.value = false
      return false
    } catch (err) {
      console.error('[UserStore] fetchProfile 异常:', err)
      loading.value = false
      return false
    }
  }

  /**
   * 保存用户资料到 Supabase
   *
   * 更新本地 store 并同步到远端 profiles 表
   *
   * @param updates - 要更新的字段
   */
  async function saveProfile(updates: Partial<Omit<Profile, 'id' | 'created_at'>>): Promise<boolean> {
    const authStore = useAuthStore()
    const userId = authStore.userId

    if (!userId) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return false
    }

    loading.value = true

    try {
      const { data, error } = await updateProfileApi(userId, updates)

      if (error) {
        uni.showToast({ title: '保存失败，请重试', icon: 'none' })
        console.error('[UserStore] saveProfile 失败:', (error as { message?: string }).message)
        loading.value = false
        return false
      }

      if (data) {
        setProfile(data)
        uni.showToast({ title: '保存成功', icon: 'success' })
        loading.value = false
        return true
      }

      loading.value = false
      return false
    } catch (err) {
      console.error('[UserStore] saveProfile 异常:', err)
      uni.showToast({ title: '保存失败', icon: 'none' })
      loading.value = false
      return false
    }
  }

  /**
   * 设置用户资料（本地更新，不触发远端同步）
   */
  function setProfile(p: Profile): void {
    profile.value = p
  }

  /**
   * 清除用户资料（登出时调用）
   */
  function clearProfile(): void {
    profile.value = null
    isFetched.value = false
  }

  /**
   * 获取用户头像（带兜底）
   */
  function getAvatarUrl(): string {
    return profile.value?.avatar_url || '/static/images/default-avatar.png'
  }

  /**
   * 获取用户显示名称
   */
  function getDisplayName(): string {
    return profile.value?.username || '未设置用户名'
  }

  return {
    profile,
    loading,
    isFetched,
    fetchProfile,
    saveProfile,
    setProfile,
    clearProfile,
    getAvatarUrl,
    getDisplayName,
  }
})
