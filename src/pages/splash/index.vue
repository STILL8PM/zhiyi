<!--
  启动页 —— 应用入口页面

  职责：
  1. 展示品牌 Logo 和名称
  2. 等待认证初始化完成
  3. 根据登录状态跳转首页或登录页
  4. 首次启动可跳转引导页

  动画：
  - 入场序列：Logo 弹入 → 名称淡入 → 描述淡入 → 版本号淡入（stagger）
  - Logo 呼吸缩放循环
  - 装饰粒子浮动
-->
<template>
  <view class="splash-container" :class="[appStore.pageClass, { 'theme-dark': isDark }]">
    <!-- 品牌内容区 -->
    <view class="splash-content">
      <!-- Logo -->
      <view class="logo-area">
        <image class="logo-img" src="/static/images/my-icon.png" mode="aspectFit" />
      </view>

      <!-- 应用名称 -->
      <text class="app-name">{{ $t('splash.appName') }}</text>

      <!-- 应用描述 -->
      <text class="app-desc">{{ $t('splash.subtitle') }}</text>
    </view>

    <!-- 底部版本 -->
    <view class="splash-footer">
      <text class="version-text">v1.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'

const appStore = useAppStore()

/** 当前页面是否处于深色模式（用于根元素 class 绑定，适配小程序端） */
const isDark = computed(() => appStore.theme === 'dark')

onMounted(async () => {
  const authStore = useAuthStore()
  // 注意：appStore.init() 已在 App.vue onLaunch 中调用，此处无需重复

  // 等待认证初始化（最多等 3 秒）
  const startTime = Date.now()
  while (!authStore.isReady && Date.now() - startTime < 3000) {
    await new Promise((r) => setTimeout(r, 100))
  }

  // 延迟展示启动画面
  await new Promise((r) => setTimeout(r, 1500))

  // 判断跳转目标
  if (authStore.isAuthenticated) {
    uni.switchTab({ url: '/pages/index/index' })
  } else {
    uni.redirectTo({ url: '/pages/auth/login/index' })
  }
})
</script>

<style lang="scss" scoped>
/* ===== 容器 ===== */
.splash-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--splash-bg);
  position: relative;
  overflow: hidden;
}

/* ===== 品牌内容 ===== */
.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

/* ---- Logo ---- */
.logo-area {
  width: 160rpx;
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
  position: relative;

  .logo-img {
    width: 120rpx;
    height: 120rpx;
    position: relative;
    z-index: 2;
  }
}

/* ---- 名称 ---- */
.app-name {
  font-size: 44rpx;
  color: #FFFFFF;
  font-weight: bold;
  margin-bottom: 16rpx;
  position: relative;
  z-index: 1;
}

/* ---- 描述 ---- */
.app-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.75);
  position: relative;
  z-index: 1;
}

/* ===== 底部版本 ===== */
.splash-footer {
  position: absolute;
  bottom: 80rpx;

  .version-text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.5);
  }
}
</style>
