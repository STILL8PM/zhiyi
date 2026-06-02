import { createSSRApp } from 'vue'
import App from './App.vue'
import uviewPlus from 'uview-plus'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { uniPiniaStorage } from '@/libs/storage'
import i18n from '@/locales'

/**
 * uni-app 应用入口文件
 *
 * 职责：
 * 1. 创建 Vue 3 SSR 应用实例（跨端兼容要求）
 * 2. 注册 Pinia 状态管理（带持久化）
 * 3. 注册 vue-i18n 国际化
 * 4. 注册 uView Plus UI 组件库
 *
 * 注意：使用 createSSRApp 而非 createApp，
 * 这是 uni-app 跨端要求（小程序需要 SSR 兼容模式）
 *
 * 参考: https://uniapp.dcloud.net.cn/collocation/main.html
 */

export function createApp() {
  const app = createSSRApp(App)

  // ===== 1. Pinia 状态管理 =====
  const pinia = createPinia()
  // 持久化插件：使用 uni 本地存储适配器
  pinia.use(
    createPersistedState({
      // 底层存储适配为 uni 的 Storage API（复用 libs/storage.ts 中的适配器）
      storage: uniPiniaStorage,
    }),
  )
  app.use(pinia)

  // ===== 2. vue-i18n 国际化 =====
  app.use(i18n)

  // ===== 3. uView Plus UI 组件库 =====
  // 全量引入（脚手架阶段），后续可优化为按需引入
  app.use(uviewPlus)

  return {
    app,
    pinia, // 导出 pinia 实例供 useAuthStore 等使用
  }
}
