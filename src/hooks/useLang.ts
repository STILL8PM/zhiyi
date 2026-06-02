/**
 * 语言切换组合式函数 —— useLang
 *
 * 职责：
 * 1. 切换 vue-i18n 的 locale 并持久化
 * 2. 同步 dayjs 的 locale
 * 3. 更新 TabBar 文字
 *
 * 使用方式：
 *   const { currentLang, setLang } = useLang()
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { setDayjsLocale } from '@/utils/date'

/** 支持的语言 */
export type Locale = 'zh-CN' | 'en'

export function useLang() {
  const { locale, t } = useI18n()

  const currentLang = ref<Locale>(locale.value as Locale)

  /**
   * 切换语言
   *
   * 副作用：持久化 → 同步 dayjs → 更新 TabBar
   */
  function setLang(newLang: Locale): void {
    locale.value = newLang
    currentLang.value = newLang
    uni.setStorageSync('uni_supabase_lang', newLang)

    // 同步 dayjs locale
    setDayjsLocale(newLang)

    // 更新 TabBar 文字
    try {
      uni.setTabBarItem({ index: 0, text: t('tabBar.home') })
      uni.setTabBarItem({ index: 1, text: t('tabBar.user') })
    } catch {
      // 非 TabBar 页面时忽略错误
    }
  }

  return { currentLang, setLang }
}
