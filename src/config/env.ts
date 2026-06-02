/**
 * 多环境配置 —— 环境变量读取与校验
 *
 * 职责：
 * 1. 读取 import.meta.env 中的 VITE_* 环境变量
 * 2. 启动时校验必需变量是否存在
 * 3. 导出类型安全的配置对象
 *
 * 安全红线：前端只用 VITE_SUPABASE_PUBLISHABLE_KEY，绝不暴露 service_role key
 *
 * 参考: https://vitejs.dev/guide/env-and-mode.html
 */

/** 环境配置的类型定义 */
export interface EnvConfig {
  /** Supabase 项目 URL，格式: https://xxxxxx.supabase.co */
  supabaseUrl: string
  /** Supabase 可发布密钥（前端安全，受 RLS 保护），新版命名，等同旧版 anon key */
  supabasePublishableKey: string
  /** 当前运行环境 */
  appEnv: 'development' | 'staging' | 'production'
  /** 应用名称 */
  appName: string
  /** Supabase REST API 基础路径 */
  apiBase: string
  /** 是否为开发环境 */
  isDev: boolean
  /** 是否为生产环境 */
  isProd: boolean
}

/**
 * 加载并校验环境变量配置
 *
 * @returns 类型安全的环境配置对象
 * @throws 缺少必需变量时抛出错误
 */
export function loadEnvConfig(): EnvConfig {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  // 必需变量检查
  if (!url) {
    throw new Error(
      '[EnvConfig] 缺少必需环境变量: VITE_SUPABASE_URL\n' +
        '请在 .env.development 文件中配置 Supabase 项目 URL',
    )
  }
  if (!key) {
    throw new Error(
      '[EnvConfig] 缺少必需环境变量: VITE_SUPABASE_PUBLISHABLE_KEY\n' +
        '请在 .env.development 文件中配置 Supabase Publishable Key',
    )
  }

  const appEnv = (import.meta.env.VITE_APP_ENV as string) || 'development'

  return {
    supabaseUrl: url,
    supabasePublishableKey: key,
    appEnv: appEnv as EnvConfig['appEnv'],
    appName: import.meta.env.VITE_APP_NAME || 'uni-supabase-app',
    apiBase: import.meta.env.VITE_APP_API_BASE || `${url}/rest/v1`,
    isDev: appEnv === 'development',
    isProd: appEnv === 'production',
  }
}

/** 全局单例配置实例 */
let _config: EnvConfig | null = null

/**
 * 获取环境配置（单例模式）
 * 首次调用时加载并校验，后续直接返回缓存
 */
export function getEnvConfig(): EnvConfig {
  if (!_config) {
    _config = loadEnvConfig()
  }
  return _config
}
