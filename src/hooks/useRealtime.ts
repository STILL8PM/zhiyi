/**
 * 实时订阅组合式函数
 *
 * 平台差异：
 * - H5/App: 使用 Supabase Realtime（WebSocket），完整支持
 * - 微信小程序: WebSocket API 不兼容，降级为轮询方案
 *
 * 使用条件编译在不同平台使用不同实现
 * 参考: https://supabase.com/docs/guides/realtime
 */

import { ref, onUnmounted } from 'vue'
import { getSupabase } from '@/libs/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// #ifndef MP-WEIXIN
/**
 * H5/App 端：使用 Supabase Realtime 订阅数据库变更
 *
 * @param table - 表名
 * @param event - 事件类型（INSERT/UPDATE/DELETE/*）
 * @param callback - 变更回调
 */
export function useRealtime(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
  callback?: (payload: Record<string, unknown>) => void,
) {
  const channel = ref<RealtimeChannel | null>(null)
  const isSubscribed = ref(false)
  const lastPayload = ref<Record<string, unknown> | null>(null)

  function subscribe(filter?: string): void {
    const supabase = getSupabase()
    channel.value = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes' as never,
        { event, schema: 'public', table, filter },
        (payload: Record<string, unknown>) => {
          lastPayload.value = payload
          callback?.(payload)
        },
      )
      .subscribe((status: string) => {
        isSubscribed.value = status === 'SUBSCRIBED'
      })
  }

  function unsubscribe(): void {
    if (channel.value) {
      supabase().removeChannel(channel.value)
      isSubscribed.value = false
    }
  }

  onUnmounted(unsubscribe)

  return { channel, isSubscribed, lastPayload, subscribe, unsubscribe }
}

function supabase() {
  return getSupabase()
}
// #endif

// #ifdef MP-WEIXIN
/**
 * 微信小程序端：轮询替代方案
 *
 * 因为小程序 WebSocket API 与 Supabase Realtime 不兼容，
 * 使用定时轮询代替实时推送
 */
export function usePolling(
  table: string,
  intervalMs = 5000,
  callback?: (data: unknown[]) => void,
) {
  const polling = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null

  function startPolling(filter?: Record<string, unknown>): void {
    if (timer) return
    polling.value = true

    const fetch = async () => {
      const supabase = getSupabase()
      let query = supabase.from(table).select('*').order('created_at', { ascending: false }).limit(50)
      if (filter) query = query.match(filter)
      const { data } = await query
      if (data) callback?.(data)
    }

    fetch() // 立即执行一次
    timer = setInterval(fetch, intervalMs)
  }

  function stopPolling(): void {
    if (timer) { clearInterval(timer); timer = null }
    polling.value = false
  }

  onUnmounted(stopPolling)

  return { polling, startPolling, stopPolling }
}

// 微信小程序端导出 usePolling 作为 useRealtime 的别名
export { usePolling as useRealtime }
// #endif
