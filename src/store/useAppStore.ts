/**
 * 应用全局状态管理 —— Pinia Store
 *
 * 职责：
 * 1. 系统信息（设备类型、屏幕尺寸、平台）
 * 2. 网络状态监听
 * 3. 首次启动标记
 * 4. 全局加载状态
 * 5. 主题模式（light/dark）—— 持久化 + 系统偏好检测
 * 6. 主题色方案（black/blue/red/green）—— 持久化，默认黑色
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { uniPiniaStorage } from '@/libs/storage'

/** 平台类型 */
export type Platform = 'h5' | 'mp-weixin' | 'app-android' | 'app-ios' | 'unknown'

/** 主题色方案标识 */
export type ColorScheme = 'black' | 'blue' | 'red' | 'green'

/** 主题色方案定义 */
export interface ColorSchemeDef {
  name: string           // 中文名
  nameEn: string         // 英文名
  /** 浅色模式下 tabBar 选中色 */
  tabBarSelected: string
  /** 深色模式下 tabBar 选中色 */
  tabBarSelectedDark: string
  /** 浅色导航栏背景色 */
  navBarBg: string
}

/** 所有可选主题色方案 */
export const COLOR_SCHEMES: Record<ColorScheme, ColorSchemeDef> = {
  black: {
    name: '极致黑',
    nameEn: 'Black',
    tabBarSelected: '#1a1a1a',
    tabBarSelectedDark: '#cccccc',
    navBarBg: '#1a1a1a',
  },
  blue: {
    name: '知忆蓝',
    nameEn: 'Blue',
    tabBarSelected: '#2979FF',
    tabBarSelectedDark: '#4d95ff',
    navBarBg: '#2979FF',
  },
  red: {
    name: '赤霞红',
    nameEn: 'Red',
    tabBarSelected: '#E43D33',
    tabBarSelectedDark: '#f05555',
    navBarBg: '#E43D33',
  },
  green: {
    name: '翡翠绿',
    nameEn: 'Green',
    tabBarSelected: '#18BC37',
    tabBarSelectedDark: '#22d944',
    navBarBg: '#18BC37',
  },
}

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

    /** 主题色方案（持久化到本地存储，默认黑色） */
    const colorScheme = ref<ColorScheme>('black')

    /** 当前页面的 CSS class 组合（供各页面根元素绑定） */
    const pageClass = computed(() => `color-${colorScheme.value}`)

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

    /** 应用主题到 DOM 和平台 UI，并触发 uview-plus 运行时主题更新 */
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

      // 触发 uview-plus 运行时主题刷新（upThemeVar 重新读取 CSS 变量）
      // uview-plus 内部监听 uni.$on('uThemeChange') 来刷新组件颜色
      try {
        uni.$emit('uThemeChange', { version: Date.now() })
      } catch {
        // 静默忽略
      }

      // 更新导航栏颜色
      applyNavBarTheme(newTheme)

      // 更新 TabBar 颜色
      applyTabBarTheme(newTheme)
    }

    /** 设置导航栏颜色（与 App.vue 深色 CSS 变量保持一致） */
    function applyNavBarTheme(newTheme: 'light' | 'dark'): void {
      const isDark = newTheme === 'dark'
      uni.setNavigationBarColor({
        frontColor: isDark ? '#ffffff' : '#000000',
        backgroundColor: isDark ? '#0f0f1a' : '#ffffff',
        animation: { duration: 300, timingFunc: 'easeInOut' },
      })
    }

    /** 设置 TabBar 颜色（跟随深色模式 + 主题色方案） */
    function applyTabBarTheme(newTheme: 'light' | 'dark'): void {
      const isDark = newTheme === 'dark'
      const scheme = COLOR_SCHEMES[colorScheme.value]
      uni.setTabBarStyle({
        color: isDark ? '#7888a0' : '#999999',
        selectedColor: isDark ? scheme.tabBarSelectedDark : scheme.tabBarSelected,
        backgroundColor: isDark ? '#0f0f1a' : '#ffffff',
        borderStyle: 'black',
      })
    }

    /** 切换主题色方案，持久化并触发 UI 更新 */
    function setColorScheme(scheme: ColorScheme): void {
      colorScheme.value = scheme
      uni.setStorageSync('uni_supabase_color_scheme', scheme)
      // 重新应用 TabBar（主题色变了）
      applyTabBarTheme(theme.value)
      // 触发 uview-plus 刷新
      try {
        uni.$emit('uThemeChange', { version: Date.now() })
      } catch { /* 静默忽略 */ }
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
      colorScheme,
      pageClass,
      init,
      setTheme,
      setColorScheme,
      showLoading,
      hideLoading,
    }
  },
  {
    /** Pinia 持久化配置（复用 libs/storage.ts 适配器） */
    persist: {
      key: 'uni_supabase_app',
      storage: uniPiniaStorage,
      pick: ['theme', 'colorScheme'],
    },
  },
)
