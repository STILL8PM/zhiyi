/**
 * 用户扩展信息管理 —— Pinia Store
 *
 * 职责：
 * 1. 管理 profiles 表中的用户扩展信息（用户名、头像、简介等）
 * 2. 与 auth.users 表解耦，存储业务层的用户资料
 *
 * 数据来源：public.profiles 表
 * 关联方式：profiles.id = auth.users.id
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Profile } from '@/types/database'

export const useUserStore = defineStore('user', () => {
  // ===== 状态 =====

  /** 用户扩展资料（来自 profiles 表） */
  const profile = ref<Profile | null>(null)

  /** 是否正在加载资料 */
  const loading = ref(false)

  // ===== 操作方法 =====

  /**
   * 设置用户资料
   */
  function setProfile(p: Profile): void {
    profile.value = p
  }

  /**
   * 清除用户资料（登出时调用）
   */
  function clearProfile(): void {
    profile.value = null
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
    setProfile,
    clearProfile,
    getAvatarUrl,
    getDisplayName,
  }
})
