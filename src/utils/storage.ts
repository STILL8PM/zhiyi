/**
 * 本地存储工具
 * 封装 uni 存储 API，提供类型安全的读写方法
 */
import { STORAGE_PREFIX } from '@/config/app'

/** 带前缀的存储 key */
function key(name: string): string { return STORAGE_PREFIX + name }

export const localStore = {
  get<T = string>(name: string, defaultValue?: T): T | null {
    try { const v = uni.getStorageSync(key(name)); return v !== '' ? (v as T) : (defaultValue ?? null) }
    catch { return defaultValue ?? null }
  },
  set(name: string, value: unknown): void {
    try { uni.setStorageSync(key(name), typeof value === 'object' ? JSON.stringify(value) : String(value)) }
    catch (e) { console.error('[localStore] set 失败:', name, e) }
  },
  remove(name: string): void {
    try { uni.removeStorageSync(key(name)) } catch { /* ignore */ }
  },
  clear(): void {
    try { uni.clearStorageSync() } catch { /* ignore */ }
  },
}
