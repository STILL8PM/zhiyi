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
   CSS 自定义属性（浅色主题 —— 默认）
   通过 page.theme-dark 覆盖深色主题值
   所有页面组件使用 var(--xxx) 引用，实现运行时主题切换
   ================================================================ */

page {
  /* ---- 背景 ---- */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f6f8;
  --bg-card: #ffffff;
  --bg-input: #f8f9fc;
  --bg-error: #fff2f0;

  /* ---- 文字 ---- */
  --text-primary: #1a1a1a;
  --text-secondary: #999999;
  --text-inverse: #ffffff;

  /* ---- 品牌色 ---- */
  --color-primary: #2979FF;
  --color-primary-gradient: linear-gradient(135deg, #2979FF 0%, #4A90D9 100%);
  --color-success: #18BC37;
  --color-warning: #F3A73F;
  --color-error: #E43D33;
  --color-link: #2979FF;

  /* ---- 边框 & 分割线 ---- */
  --border-color: #f0f0f0;
  --border-focus: rgba(41, 121, 255, 0.4);
  --border-error: #FFCCC7;
  --divider: #eeeeee;

  /* ---- 阴影 ---- */
  --shadow-light: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  --shadow-card: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  --shadow-button: 0 8rpx 24rpx rgba(41, 121, 255, 0.35);
  --shadow-oauth: 0 12rpx 28rpx rgba(0, 0, 0, 0.08);

  /* ---- OAuth 按钮 ---- */
  --oauth-button-bg: #f8f9fc;
  --wechat-bg: #f0faf0;
  --wechat-border: #d4edda;

  /* ---- 滚动条（H5 端） ---- */
  --scrollbar-thumb: #c0c0c0;
  --scrollbar-track: #f0f0f0;

  /* ---- 全局基础样式 ---- */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: $uni-font-size-base;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ================================================================
   深色主题覆盖
   H5 端通过 document.documentElement.classList.add('theme-dark') 激活
   小程序端通过 uni.$emit('themeChanged') 通知各页面绑定 :class
   ================================================================ */

page.theme-dark {
  /* ---- 背景 ---- */
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-card: #1e2a45;
  --bg-input: #2a3a5c;
  --bg-error: #3d2020;

  /* ---- 文字 ---- */
  --text-primary: #e8e8e8;
  --text-secondary: #8899aa;

  /* ---- 品牌色 ---- */
  --color-primary: #3d8aff;
  --color-primary-gradient: linear-gradient(135deg, #3d8aff 0%, #5a9fe6 100%);
  --color-link: #3d8aff;

  /* ---- 边框 & 分割线 ---- */
  --border-color: #2a3a5c;
  --border-focus: rgba(65, 140, 255, 0.4);
  --border-error: #5a3030;
  --divider: #2a3a5c;

  /* ---- 阴影 ---- */
  --shadow-light: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
  --shadow-card: 0 4rpx 20rpx rgba(0, 0, 0, 0.25);
  --shadow-button: 0 8rpx 24rpx rgba(41, 121, 255, 0.2);
  --shadow-oauth: 0 12rpx 28rpx rgba(0, 0, 0, 0.35);

  /* ---- OAuth 按钮 ---- */
  --oauth-button-bg: #2a3a5c;
  --wechat-bg: #1a3a2a;
  --wechat-border: #2a5a3a;

  /* ---- 滚动条 ---- */
  --scrollbar-thumb: #3a3a5a;
  --scrollbar-track: #1a1a2e;
}
</style>
