/**
 * 应用业务常量配置
 *
 * 存放不随环境变化的业务常量：
 * - 默认头像、应用名称、分页大小等
 * - 后续可按业务模块拆分
 */

/** 应用名称（从环境变量读取，兜底为默认值） */
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'uni-supabase-app'

/** 默认用户头像 */
export const DEFAULT_AVATAR = '/static/images/default-avatar.png'

/** 默认分页大小 */
export const PAGE_SIZE = 20

/** 请求超时时间（毫秒） */
export const REQUEST_TIMEOUT = 30000

/** Token 过期前多长时间开始刷新（秒） */
export const TOKEN_REFRESH_MARGIN = 60

/** 本地存储键名前缀，避免与其他应用冲突 */
export const STORAGE_PREFIX = 'uni_supabase_'
