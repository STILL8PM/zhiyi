/**
 * 应用全局状态管理 —— Pinia Store
 *
 * 职责：
 * 1. 系统信息（设备类型、屏幕尺寸、平台）
 * 2. 网络状态监听
 * 3. 首次启动标记
 * 4. 全局加载状态
 * 5. 主题模式（light/dark）—— 持久化 + 系统偏好检测
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

/** 平台类型 */
export type Platform = 'h5' | 'mp-weixin' | 'app-android' | 'app-ios' | 'unknown'

export const useAppStore = defineStore(
  'app',
  () => {
    // ===== 状态 =====

    /** 是否为首次启动（用于决定是否显示引导页） */
    const isFirstLaunch = ref(true)

    /** 当前平台 */
    const platform = ref<Platform>('unknown')

    /** 系统信息（uni.getSystemInfoSync 返回） */
    const systemInfo = ref<UniApp.GetSystemInfoResult | null>(null)

    /** 网络类型 */
    const networkType = ref<string>('unknown')

    /** 是否已联网 */
    const isOnline = ref(true)

    /** 全局加载遮罩 */
    const globalLoading = ref(false)

    /** 主题模式（持久化到本地存储） */
    const theme = ref<'light' | 'dark'>('light')

    // ===== 操作方法 =====

    /**
     * 初始化应用状态
     *
     * 在 App.vue onLaunch 中调用。
     * 恢复主题偏好（优先已保存的，其次系统偏好，最后默认 light）
     */
    function init(): void {
      // 获取系统信息
      try {
        systemInfo.value = uni.getSystemInfoSync()

        // 识别平台
        // #ifdef H5
        platform.value = 'h5'
        // #endif
        // #ifdef MP-WEIXIN
        platform.value = 'mp-weixin'
        // #endif
        // #ifdef APP-PLUS
        platform.value = systemInfo.value?.platform === 'ios' ? 'app-ios' : 'app-android'
        // #endif
      } catch (err) {
        console.warn('[AppStore] 获取系统信息失败:', err)
      }

      // 获取网络状态
      uni.getNetworkType({
        success: (res) => {
          networkType.value = res.networkType || 'unknown'
          isOnline.value = res.networkType !== 'none'
        },
      })

      // 监听网络状态变化
      uni.onNetworkStatusChange((res) => {
        isOnline.value = res.isConnected
        networkType.value = res.networkType
      })

      // 检查是否首次启动
      const launched = uni.getStorageSync('uni_supabase_app_launched')
      if (launched === 'true') {
        isFirstLaunch.value = false
      } else {
        uni.setStorageSync('uni_supabase_app_launched', 'true')
      }

      // ===== 恢复主题 =====
      restoreTheme()

      console.log('[AppStore] 初始化完成, 平台:', platform.value, '主题:', theme.value)
    }

    /**
     * 恢复主题偏好
     *
     * 优先级：已保存的主题 > 系统偏好 > 默认 light
     */
    function restoreTheme(): void {
      const saved = uni.getStorageSync('uni_supabase_theme')
      if (saved === 'dark' || saved === 'light') {
        applyTheme(saved)
        return
      }

      // 检测系统偏好
      try {
        const sysInfo = uni.getSystemInfoSync() as { theme?: string }
        if (sysInfo?.theme === 'dark') {
          applyTheme('dark')
        }
      } catch {
        // 忽略检测失败，保持默认 light
      }
    }

    /**
     * 切换主题
     *
     * 副作用：持久化 + 应用 CSS class + 更新导航栏 + 更新 TabBar
     */
    function setTheme(newTheme: 'light' | 'dark'): void {
      applyTheme(newTheme)
      uni.setStorageSync('uni_supabase_theme', newTheme)
    }

    /** 应用主题到 DOM 和平台 UI */
    function applyTheme(newTheme: 'light' | 'dark'): void {
      theme.value = newTheme

      // H5 端：操作 document 根元素 class
      // #ifdef H5
      if (newTheme === 'dark') {
        document.documentElement.classList.add('theme-dark')
      } else {
        document.documentElement.classList.remove('theme-dark')
      }
      // #endif

      // 小程序端：通过事件通知各页面
      // #ifdef MP-WEIXIN
      uni.$emit('themeChanged', newTheme)
      // #endif

      // 更新导航栏颜色
      applyNavBarTheme(newTheme)

      // 更新 TabBar 颜色
      applyTabBarTheme(newTheme)
    }

    /** 设置导航栏颜色 */
    function applyNavBarTheme(newTheme: 'light' | 'dark'): void {
      const isDark = newTheme === 'dark'
      uni.setNavigationBarColor({
        frontColor: isDark ? '#ffffff' : '#000000',
        backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
        animation: { duration: 300, timingFunc: 'easeInOut' },
      })
    }

    /** 设置 TabBar 颜色 */
    function applyTabBarTheme(newTheme: 'light' | 'dark'): void {
      const isDark = newTheme === 'dark'
      uni.setTabBarStyle({
        color: isDark ? '#8899aa' : '#999999',
        selectedColor: isDark ? '#3d8aff' : '#2979FF',
        backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
        borderStyle: 'black',
      })
    }

    /** 显示全局加载 */
    function showLoading(title = '加载中...'): void {
      globalLoading.value = true
      uni.showLoading({ title, mask: true })
    }

    /** 隐藏全局加载 */
    function hideLoading(): void {
      globalLoading.value = false
      uni.hideLoading()
    }

    return {
      isFirstLaunch,
      platform,
      systemInfo,
      networkType,
      isOnline,
      globalLoading,
      theme,
      init,
      setTheme,
      showLoading,
      hideLoading,
    }
  },
  {
    /** Pinia 持久化配置（只持久化 theme 字段） */
    persist: {
      key: 'uni_supabase_app',
      storage: {
        getItem(key: string): string | null {
          return uni.getStorageSync(key) || null
        },
        setItem(key: string, value: string): void {
          uni.setStorageSync(key, value)
        },
      },
      pick: ['theme'],
    },
  },
)
