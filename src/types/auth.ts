/**
 * 认证相关类型定义
 */

import type { Session, User } from '@supabase/supabase-js'

/** 邮箱登录参数 */
export interface LoginParams {
  /** 邮箱地址 */
  email: string
  /** 密码 */
  password: string
}

/** 邮箱注册参数 */
export interface RegisterParams {
  /** 邮箱地址 */
  email: string
  /** 密码（至少 8 位，含字母和数字） */
  password: string
  /** 确认密码（必须与 password 一致） */
  confirmPassword: string
  /** 用户名（可选） */
  username?: string
}

/** 重置密码参数 */
export interface ResetPasswordParams {
  /** 注册邮箱 */
  email: string
}

/** 更新密码参数 */
export interface UpdatePasswordParams {
  /** 新密码 */
  newPassword: string
}

/** 认证状态（Pinia store 使用） */
export interface AuthState {
  /** Supabase 会话对象（含 access_token/refresh_token） */
  session: Session | null
  /** Supabase 用户对象 */
  user: User | null
  /** 认证初始化是否完成 */
  isReady: boolean
  /** 是否正在进行认证操作 */
  loading: boolean
}

/** 页面跳转重定向参数 */
export interface AuthRedirect {
  /** 登录成功后跳转的目标路径 */
  redirect?: string
}

// 重新导出 Supabase 类型，方便外部使用
export type { Session, User }
