/**
 * Supabase 数据库类型定义
 *
 * 注意：
 * - 此文件在连接 Supabase 后，可通过 CLI 自动生成完整类型：
 *   `npx supabase gen types typescript --project-id <project-id> > src/types/database.ts`
 * - 脚手架阶段定义基础表结构作为类型参考
 * - 实际开发时用 CLI 生成的类型覆盖此文件
 *
 * 参考: https://supabase.com/docs/guides/api/rest/generating-types
 */

/**
 * 用户扩展资料表（public.profiles）
 * 与 Supabase auth.users 表关联，存储业务层用户信息
 */
export interface Profile {
  /** 用户 ID，对应 auth.users.id */
  id: string
  /** 用户名（可自定义，非邮箱） */
  username: string | null
  /** 头像 URL */
  avatar_url: string | null
  /** 手机号 */
  phone: string | null
  /** 个人简介 */
  bio: string | null
  /** 创建时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
}

/**
 * 完整数据库类型（脚手架版，仅定义已知表）
 * 连上 Supabase 后用 CLI 生成替换
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
