/**
 * 配置模块 —— 统一导出入口
 *
 * 使用方式:
 *   import { getEnvConfig, APP_NAME } from '@/config'
 */

export { loadEnvConfig, getEnvConfig } from './env'
export type { EnvConfig } from './env'

export { getSupabaseUrl, getSupabasePublishableKey } from './supabase'

export {
  APP_NAME,
  DEFAULT_AVATAR,
  PAGE_SIZE,
  REQUEST_TIMEOUT,
  TOKEN_REFRESH_MARGIN,
  STORAGE_PREFIX,
} from './app'
