<!--
  App.vue — uni-app 根组件

  职责：
  1. 应用生命周期管理（onLaunch/onShow/onHide）
  2. 全局初始化（认证恢复、路由守卫、Supabase 客户端、主题恢复）
  3. 注册 onAuthStateChange 全局监听
  4. 定义 CSS 自定义属性（浅色/深色主题）

  参考: https://uniapp.dcloud.net.cn/collocation/App.html
-->
<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'
import { getSupabase } from '@/libs/supabase'

/**
 * 应用启动时触发，全局只触发一次
 *
 * 执行顺序：
 * 1. 初始化 AppStore（系统信息、主题恢复）
 * 2. 初始化 Supabase 客户端（触发单例创建）
 * 3. 恢复认证会话（从本地存储恢复 token）
 * 4. 注册 onAuthStateChange 全局监听
 */
onLaunch(async (options?: App.LaunchShowOption) => {
  console.log('[App] onLaunch —— 应用启动', options?.path)

  // 1. 初始化应用状态（含主题恢复）
  const appStore = useAppStore()
  appStore.init()

  // 2. 初始化 Supabase 客户端（触发单例创建和 token 恢复）
  const supabase = getSupabase()

  // 3. 恢复认证会话
  const authStore = useAuthStore()
  await authStore.init()

  // 4. 认证恢复成功后，拉取用户资料（profiles 表）
  const userStore = useUserStore()
  if (authStore.isAuthenticated) {
    userStore.fetchProfile()
  }

  // 5. 注册全局认证状态变化监听
  // 当用户在任意标签页登录/登出/刷新 token 时，自动同步 store 和资料
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('[App] onAuthStateChange:', event)

    switch (event) {
      case 'SIGNED_IN':
      case 'TOKEN_REFRESHED':
      case 'USER_UPDATED':
        authStore.setSession(session)
        // 登录/刷新后拉取最新用户资料
        if (session) userStore.fetchProfile()
        break
      case 'SIGNED_OUT':
        authStore.clearSession()
        userStore.clearProfile()
        break
      case 'INITIAL_SESSION':
        // getSession() 恢复的初始会话，已在 authStore.init() 中处理
        break
    }
  })
})

/**
 * 应用从后台进入前台时触发
 * 用于：刷新 token 检查、路由权限校验
 */
onShow((options?: App.LaunchShowOption) => {
  console.log('[App] onShow —— 应用显示', options?.path)
  // 后续步骤将在此执行路由守卫 authGuard()
})

/**
 * 应用进入后台时触发
 * 用于：保存草稿、暂停音视频
 */
onHide(() => {
  console.log('[App] onHide —— 应用隐藏')
})
</script>

<style lang="scss">
/* ===== uView Plus 全局样式 ===== */
@import 'uview-plus/index.scss';

/* ===== animate.css 动画库（H5 + 小程序通用） ===== */
@import 'animate.css';

/* ================================================================
   浅色主题（默认）
   两层变量：
     --bg-* / --text-* / --color-*  → 自定义组件用
     --up-*                          → uview-plus 组件用（upThemeVar 运行时读取）
   ================================================================ */
page {
  /* ==== 自定义变量 ==== */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f6f8;
  --bg-card: #ffffff;
  --bg-input: #f8f9fc;
  --bg-error: #fff2f0;
  --bg-mask: rgba(0, 0, 0, 0.4);
  --text-primary: #1a1a1a;
  --text-secondary: #999999;
  --text-placeholder: #c0c0c0;
  --text-inverse: #ffffff;
  --color-primary: #2979FF;
  --color-primary-light: rgba(41, 121, 255, 0.08);
  --color-primary-gradient: linear-gradient(135deg, #2979FF 0%, #4A90D9 100%);
  --color-success: #18BC37;
  --color-warning: #F3A73F;
  --color-error: #E43D33;
  --color-link: #2979FF;
  --splash-bg: linear-gradient(135deg, #2979FF 0%, #4A90D9 50%, #63B4FF 100%);
  --border-color: #f0f0f0;
  --border-focus: var(--color-primary-glow);
  --border-error: #FFCCC7;
  --divider: #eeeeee;
  --shadow-light: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  --shadow-card: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  --shadow-button: 0 8rpx 24rpx var(--color-primary-shadow);
  --shadow-oauth: 0 12rpx 28rpx rgba(0, 0, 0, 0.08);
  --oauth-button-bg: #f8f9fc;
  --wechat-bg: #f0faf0;
  --wechat-border: #d4edda;
  --scrollbar-thumb: #c0c0c0;
  --scrollbar-track: #f0f0f0;

  /* ==== uview-plus 组件变量（浅色）==== */
  /* uview-plus 的 upThemeVar() 运行时读取这些变量控制组件颜色 */
  --up-main-color: #303133;           /* 主要文字 */
  --up-tips-color: #909399;           /* 提示/placeholder */
  --up-content-color: #303133;        /* 内容文字 */
  --up-light-color: #c0c4cc;          /* 浅色文字 */
  --up-bg-color: #f3f4f6;             /* 通用背景 */
  --up-page-bg-color: #f5f6f8;        /* 页面背景 */
  --up-navbar-bg-color: #ffffff;      /* 导航栏背景 */
  --up-card-bg-color: #ffffff;        /* 卡片背景 */
  --up-hover-bg-color: #f0f0f0;       /* 悬停背景 */
  --up-border-color: #dadbde;         /* 边框 */
  --up-light-bg-color: #f8f9fc;       /* 浅色背景 */
  --up-light-border-color: #e4e7ed;   /* 浅色边框 */
  --up-disabled-color: #c0c4cc;       /* 禁用文字 */
  --up-skeleton-bg-color: #f2f3f5;    /* 骨架屏背景 */
  --up-skeleton-shimmer-color: #e8e8e8;
  /* 语义色 */
  --up-primary: #2979FF;
  --up-primary-dark: #1a5fd9;
  --up-primary-light: #ecf5ff;
  --up-primary-disabled: #a0cfff;
  --up-success: #18BC37;
  --up-success-dark: #12992c;
  --up-success-light: #e8f8eb;
  --up-success-disabled: #8ce09b;
  --up-warning: #F3A73F;
  --up-warning-dark: #c7861f;
  --up-warning-light: #fdf3e5;
  --up-warning-disabled: #f9d39f;
  --up-error: #E43D33;
  --up-error-dark: #b82e26;
  --up-error-light: #fde8e7;
  --up-error-disabled: #f19e9a;
  --up-info: #909399;
  --up-info-dark: #6b6e75;
  --up-info-light: #f2f3f5;
  --up-info-disabled: #c8c9cb;

  /* ---- 全局基础 ---- */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: $uni-font-size-base;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* ================================================================
   深色主题
   同时覆盖自定义变量 + uview-plus --up-* 变量
   选择器：.theme-dark（小程序根元素）/ :root.theme-dark page（H5）
   触发 uview-plus 运行时更新：uni.$emit('uThemeChange')
   ================================================================ */
.theme-dark,
:root.theme-dark page {
  /* ==== 自定义变量 ==== */
  --bg-primary: #0f0f1a;
  --bg-secondary: #141428;
  --bg-card: #1a1a30;
  --bg-input: #222240;
  --bg-error: #2d1518;
  --bg-mask: rgba(0, 0, 0, 0.65);
  --text-primary: #eaeaea;
  --text-secondary: #7888a0;
  --text-placeholder: #556070;
  --color-primary: #4d95ff;
  --color-primary-light: rgba(77, 149, 255, 0.12);
  --color-primary-gradient: linear-gradient(135deg, #4d95ff 0%, #6aa8e8 100%);
  --color-link: #4d95ff;
  --splash-bg: linear-gradient(135deg, #0d1a40 0%, #142850 50%, #0a1230 100%);
  --border-color: #2a2a48;
  --border-focus: var(--color-primary-glow);
  --border-error: #4a2025;
  --divider: #2a2a48;
  --shadow-light: 0 4rpx 20rpx rgba(0, 0, 0, 0.4);
  --shadow-card: 0 4rpx 20rpx rgba(0, 0, 0, 0.35);
  --shadow-button: 0 8rpx 24rpx var(--color-primary-shadow);
  --shadow-oauth: 0 12rpx 28rpx rgba(0, 0, 0, 0.45);
  --oauth-button-bg: #222240;
  --wechat-bg: #0f2818;
  --wechat-border: #1a3a28;
  --scrollbar-thumb: #2a2a48;
  --scrollbar-track: #0f0f1a;

  /* ==== uview-plus 组件变量（深色）==== */
  --up-main-color: #eaeaea;
  --up-tips-color: #7888a0;
  --up-content-color: #eaeaea;
  --up-light-color: #556070;
  --up-bg-color: #222240;
  --up-page-bg-color: #141428;
  --up-navbar-bg-color: #0f0f1a;
  --up-card-bg-color: #1a1a30;
  --up-hover-bg-color: #2a2a48;
  --up-border-color: #2a2a48;
  --up-light-bg-color: #222240;
  --up-light-border-color: #2a2a48;
  --up-disabled-color: #556070;
  --up-skeleton-bg-color: #1a1a30;
  --up-skeleton-shimmer-color: #2a2a48;
  /* 语义色 */
  --up-primary: #4d95ff;
  --up-primary-dark: #3a7ce0;
  --up-primary-light: #1a2a48;
  --up-primary-disabled: #3a5a80;
  --up-success: #18BC37;
  --up-success-dark: #12992c;
  --up-success-light: #0f2818;
  --up-success-disabled: #1a5a28;
  --up-warning: #F3A73F;
  --up-warning-dark: #c7861f;
  --up-warning-light: #2a1a0a;
  --up-warning-disabled: #5a3a1a;
  --up-error: #E43D33;
  --up-error-dark: #b82e26;
  --up-error-light: #2d1518;
  --up-error-disabled: #5a2020;
  --up-info: #7888a0;
  --up-info-dark: #556070;
  --up-info-light: #1a1a30;
  --up-info-disabled: #3a3a50;
}

/* ================================================================
   主题色方案（独立于深色模式，只控制品牌强调色）
   每个方案定义浅色 + 深色两套变量
   页面根元素绑定 class 如 color-black、color-blue 等
   ================================================================ */

/* ==== 黑色主题（默认）==== */
.color-black {
  --color-primary: #1a1a1a;
  --color-primary-gradient: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
  --color-primary-light: rgba(26, 26, 26, 0.08);
  --color-primary-glow: rgba(26, 26, 26, 0.20);
  --color-primary-shadow: rgba(26, 26, 26, 0.35);
  --color-link: #1a1a1a;
  --up-primary: #1a1a1a;
  --up-primary-dark: #0d0d0d;
  --up-primary-light: rgba(26, 26, 26, 0.06);
  --up-primary-disabled: #aaaaaa;
}
.color-black.theme-dark,
:root.theme-dark .color-black {
  --color-primary: #cccccc;
  --color-primary-gradient: linear-gradient(135deg, #cccccc 0%, #999999 100%);
  --color-primary-light: rgba(200, 200, 200, 0.12);
  --color-primary-glow: rgba(200, 200, 200, 0.25);
  --color-primary-shadow: rgba(200, 200, 200, 0.2);
  --color-link: #cccccc;
  --up-primary: #cccccc;
  --up-primary-dark: #aaaaaa;
  --up-primary-light: rgba(200, 200, 200, 0.08);
  --up-primary-disabled: #555555;
}

/* ==== 蓝色主题 ==== */
.color-blue {
  --color-primary: #2979FF;
  --color-primary-gradient: linear-gradient(135deg, #2979FF 0%, #4A90D9 100%);
  --color-primary-light: rgba(41, 121, 255, 0.08);
  --color-primary-glow: rgba(41, 121, 255, 0.20);
  --color-primary-shadow: rgba(41, 121, 255, 0.35);
  --color-link: #2979FF;
  --up-primary: #2979FF;
  --up-primary-dark: #1a5fd9;
  --up-primary-light: #ecf5ff;
  --up-primary-disabled: #a0cfff;
}
.color-blue.theme-dark,
:root.theme-dark .color-blue {
  --color-primary: #4d95ff;
  --color-primary-gradient: linear-gradient(135deg, #4d95ff 0%, #6aa8e8 100%);
  --color-primary-light: rgba(77, 149, 255, 0.12);
  --color-primary-glow: rgba(77, 149, 255, 0.25);
  --color-primary-shadow: rgba(77, 149, 255, 0.25);
  --color-link: #4d95ff;
  --up-primary: #4d95ff;
  --up-primary-dark: #3a7ce0;
  --up-primary-light: #1a2a48;
  --up-primary-disabled: #3a5a80;
}

/* ==== 红色主题 ==== */
.color-red {
  --color-primary: #E43D33;
  --color-primary-gradient: linear-gradient(135deg, #E43D33 0%, #f06050 100%);
  --color-primary-light: rgba(228, 61, 51, 0.08);
  --color-primary-glow: rgba(228, 61, 51, 0.20);
  --color-primary-shadow: rgba(228, 61, 51, 0.35);
  --color-link: #E43D33;
  --up-primary: #E43D33;
  --up-primary-dark: #b82e26;
  --up-primary-light: #fde8e7;
  --up-primary-disabled: #f19e9a;
}
.color-red.theme-dark,
:root.theme-dark .color-red {
  --color-primary: #f05555;
  --color-primary-gradient: linear-gradient(135deg, #f05555 0%, #f57070 100%);
  --color-primary-light: rgba(240, 85, 85, 0.12);
  --color-primary-glow: rgba(240, 85, 85, 0.25);
  --color-primary-shadow: rgba(240, 85, 85, 0.25);
  --color-link: #f05555;
  --up-primary: #f05555;
  --up-primary-dark: #d04040;
  --up-primary-light: #2d1518;
  --up-primary-disabled: #5a3030;
}

/* ==== 绿色主题 ==== */
.color-green {
  --color-primary: #18BC37;
  --color-primary-gradient: linear-gradient(135deg, #18BC37 0%, #2cd050 100%);
  --color-primary-light: rgba(24, 188, 55, 0.08);
  --color-primary-glow: rgba(24, 188, 55, 0.20);
  --color-primary-shadow: rgba(24, 188, 55, 0.35);
  --color-link: #18BC37;
  --up-primary: #18BC37;
  --up-primary-dark: #12992c;
  --up-primary-light: #e8f8eb;
  --up-primary-disabled: #8ce09b;
}
.color-green.theme-dark,
:root.theme-dark .color-green {
  --color-primary: #22d944;
  --color-primary-gradient: linear-gradient(135deg, #22d944 0%, #40e860 100%);
  --color-primary-light: rgba(34, 217, 68, 0.12);
  --color-primary-glow: rgba(34, 217, 68, 0.25);
  --color-primary-shadow: rgba(34, 217, 68, 0.25);
  --color-link: #22d944;
  --up-primary: #22d944;
  --up-primary-dark: #19b033;
  --up-primary-light: #0f2818;
  --up-primary-disabled: #1a5a28;
}

/* ================================================================
   深色模式 H5 辅助覆盖
   ================================================================ */
.theme-dark {
  /* 平滑过渡 */
  &, page, view, text, input {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }

  /* H5 滚动条 */
  ::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); }
  ::-webkit-scrollbar-track { background: var(--scrollbar-track); }
}
</style>
