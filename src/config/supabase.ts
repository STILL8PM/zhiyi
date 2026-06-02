/**
 * Supabase 连接参数配置
 *
 * 职责：从环境变量中提取 Supabase 连接所需参数
 * 注意：此模块仅导出配置常量，不创建客户端实例
 * 客户端实例由 src/libs/supabase.ts 创建和管理
 */

import { getEnvConfig } from './env'

/** 获取 Supabase 项目 URL */
export function getSupabaseUrl(): string {
  return getEnvConfig().supabaseUrl
}

/** 获取 Supabase 可发布密钥（前端安全，受 RLS 保护） */
export function getSupabasePublishableKey(): string {
  return getEnvConfig().supabasePublishableKey
}
