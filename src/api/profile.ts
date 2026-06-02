/**
 * 用户资料 API
 *
 * 操作 public.profiles 表，管理用户扩展信息
 * profiles.id 与 auth.users.id 关联
 */

import { getSupabase } from '@/libs/supabase'
import type { ApiResponse } from '@/types/api'
import type { Profile } from '@/types/database'

/** 获取用户资料 */
export async function getProfile(userId: string): Promise<ApiResponse<Profile>> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) return { data: null, error, status: error.code ? 400 : 500 }
    return { data, error: null, status: 200 }
  } catch (err) {
    return { data: null, error: { message: (err as Error).message }, status: 500 }
  }
}

/** 更新用户资料（不存在则自动创建，upsert 语义） */
export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at'>>,
): Promise<ApiResponse<Profile>> {
  try {
    const supabase = getSupabase()
    // 使用 upsert：记录存在则更新，不存在则插入
    // onConflict: 'id' 指定冲突列为 profiles 表主键
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        { id: userId, ...updates, updated_at: new Date().toISOString() },
        { onConflict: 'id' },
      )
      .select()
      .single()
    if (error) return { data: null, error, status: error.code ? 400 : 500 }
    return { data, error: null, status: 200 }
  } catch (err) {
    return { data: null, error: { message: (err as Error).message }, status: 500 }
  }
}
