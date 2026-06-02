/**
 * Supabase 便捷访问 Hook
 *
 * 提供组件中快速获取 Supabase 客户端实例的方法
 *
 * 使用方式：
 *   const { supabase } = useSupabase()
 *   const { data } = await supabase.from('profiles').select('*')
 */

import { getSupabase } from '@/libs/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * 获取类型安全的 Supabase 客户端实例
 *
 * @returns { supabase } Supabase 客户端
 */
export function useSupabase(): { supabase: SupabaseClient<Database> } {
  return {
    supabase: getSupabase() as SupabaseClient<Database>,
  }
}
