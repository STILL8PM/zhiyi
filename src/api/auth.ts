/**
 * 认证 API 封装
 *
 * 职责：封装所有 Supabase Auth 操作，统一 { data, error } 返回格式
 *
 * 设计原则：
 * - 每个方法返回 { data, error } 固定结构，调用方自行判断
 * - 不做 UI 交互（Toast/跳转），交给 hooks 层处理
 * - 错误直接透传 Supabase 原始错误对象
 *
 * 参考: https://supabase.com/docs/reference/javascript/auth-signup
 */

import { getSupabase } from '@/libs/supabase'
import type { ApiResponse } from '@/types/api'
import type { AuthError, Session, User } from '@supabase/supabase-js'

/**
 * 邮箱注册
 *
 * 注册成功后 Supabase 会自动发送确认邮件（可在 Supabase Dashboard 配置）
 *
 * @param email - 邮箱地址
 * @param password - 密码（≥8位）
 * @param username - 可选用户名（存入 user_metadata）
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  username?: string,
): Promise<ApiResponse<{ user: User | null; session: Session | null }>> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: username ? { username } : undefined,
        // 注册后自动发送确认邮件
        // emailRedirectTo: '',  // 可配置确认后的跳转地址
      },
    })

    if (error) return { data: null, error, status: error.status || 400 }

    return {
      data: { user: data.user, session: data.session },
      error: null,
      status: 200,
    }
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message, code: 'UNKNOWN' },
      status: 500,
    }
  }
}

/**
 * 邮箱登录
 *
 * @param email - 邮箱地址
 * @param password - 密码
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<ApiResponse<{ user: User; session: Session }>> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) return { data: null, error, status: error.status || 401 }

    return {
      data: { user: data.user, session: data.session },
      error: null,
      status: 200,
    }
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message, code: 'UNKNOWN' },
      status: 500,
    }
  }
}

/**
 * 登出
 *
 * 清除本地会话并通知 Supabase 服务端
 */
export async function signOut(): Promise<ApiResponse<null>> {
  try {
    const supabase = getSupabase()
    const { error } = await supabase.auth.signOut()

    if (error) return { data: null, error, status: error.status || 400 }

    return { data: null, error: null, status: 200 }
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message, code: 'UNKNOWN' },
      status: 500,
    }
  }
}

/**
 * 发送密码重置邮件
 *
 * 用户收到邮件后可点击链接设置新密码
 *
 * @param email - 注册邮箱
 */
export async function resetPassword(
  email: string,
): Promise<ApiResponse<null>> {
  try {
    const supabase = getSupabase()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // 重置密码后的跳转页面（需在 Supabase Dashboard 配置允许的域名）
      redirectTo: '',
    })

    if (error) return { data: null, error, status: error.status || 400 }

    return { data: null, error: null, status: 200 }
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message, code: 'UNKNOWN' },
      status: 500,
    }
  }
}

/**
 * 更新密码（登录后使用）
 *
 * @param newPassword - 新密码
 */
export async function updatePassword(
  newPassword: string,
): Promise<ApiResponse<null>> {
  try {
    const supabase = getSupabase()
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) return { data: null, error, status: error.status || 400 }

    return { data: null, error: null, status: 200 }
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message, code: 'UNKNOWN' },
      status: 500,
    }
  }
}

/**
 * OAuth 第三方登录（Google / GitHub 等）
 *
 * 在 H5 端使用重定向流程，在 App 端使用原生 SDK
 *
 * @param provider - 第三方提供商标识（'google' | 'github' | 'apple' 等）
 */
export async function signInWithOAuth(
  provider: string,
): Promise<ApiResponse<null>> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'google' | 'github' | 'apple',
      options: {
        // 认证完成后的回调地址
        redirectTo: '',
      },
    })

    if (error) return { data: null, error, status: error.status || 400 }

    return { data: null, error: null, status: 200 }
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message, code: 'UNKNOWN' },
      status: 500,
    }
  }
}

/**
 * 微信小程序登录（通过 Edge Function）
 *
 * 流程：
 * 1. uni.login() 获取微信 code
 * 2. 调用 Supabase Edge Function 'wechat-login'
 * 3. Edge Function 换取 openid 并签发 Supabase JWT
 * 4. 前端调用 setSession 设置会话
 *
 * @param code - 微信登录凭证（uni.login 返回的 code）
 */
export async function signInWithWechat(
  code: string,
): Promise<ApiResponse<{ access_token: string; refresh_token: string }>> {
  try {
    const supabase = getSupabase()
    // 调用部署在 Supabase 上的 Edge Function
    const { data, error } = await supabase.functions.invoke('wechat-login', {
      body: { code },
    })

    if (error) return { data: null, error, status: 400 }

    return { data, error: null, status: 200 }
  } catch (err) {
    return {
      data: null,
      error: { message: (err as Error).message, code: 'UNKNOWN' },
      status: 500,
    }
  }
}
