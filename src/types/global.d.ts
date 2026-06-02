/**
 * 全局类型声明文件
 *
 * 职责：
 * 1. 声明 import.meta.env 环境变量类型
 * 2. 声明 Vue 单文件组件模块类型
 * 3. 扩展 uni-app 全局类型
 */

/// <reference types="@dcloudio/types" />

// ===== Vite 环境变量类型声明 =====
interface ImportMetaEnv {
  /** Supabase 项目 URL */
  readonly VITE_SUPABASE_URL: string
  /** Supabase 可发布密钥（新版命名，等同于旧版 anon key） */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  /** 运行环境 */
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production'
  /** 应用名称 */
  readonly VITE_APP_NAME: string
  /** API 基础路径 */
  readonly VITE_APP_API_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// ===== Vue 单文件组件类型声明 =====
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}

// ===== SCSS 模块声明 =====
declare module '*.scss' {
  const content: Record<string, string>
  export default content
}

// ===== 静态资源声明 =====
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.svg'
declare module '*.webp'
