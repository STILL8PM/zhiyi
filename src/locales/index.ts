/**
 * vue-i18n 实例化
 *
 * 设计：
 * - Composition API 模式（legacy: false），支持 useI18n() 和全局 $t()
 * - 默认语言 zh-CN，从本地存储恢复用户偏好
 * - fallback 到 zh-CN，缺失键静默回退
 */
import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import en from './en'

/** 从本地存储恢复语言偏好，默认中文 */
const savedLang: string = uni.getStorageSync('uni_supabase_lang') || 'zh-CN'

const i18n = createI18n({
  legacy: false, // Composition API 模式
  locale: savedLang,
  fallbackLocale: 'zh-CN',
  globalInjection: true, // 全局注入 $t() 到所有组件模板
  messages: {
    'zh-CN': zhCN,
    en,
  },
  silentFallbackWarn: true,
  missingWarn: false,
})

export default i18n
