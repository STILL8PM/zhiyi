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
  <view class="splash-container">
    <!-- 背景装饰粒子 -->
    <view class="particles">
      <view v-for="i in 6" :key="i" class="particle" :class="`particle--${i}`" />
    </view>

    <!-- 品牌内容区 -->
    <view class="splash-content">
      <!-- Logo -->
      <view class="logo-area" :class="{ 'anim-in': animStep >= 1 }">
        <text class="logo-text">🚀</text>
        <!-- 呼吸光环 -->
        <view class="logo-glow" />
      </view>

      <!-- 应用名称 -->
      <text class="app-name" :class="{ 'anim-in': animStep >= 2 }">{{ $t('splash.appName') }}</text>

      <!-- 应用描述 -->
      <text class="app-desc" :class="{ 'anim-in': animStep >= 3 }">{{ $t('splash.subtitle') }}</text>
    </view>

    <!-- 底部版本 -->
    <view class="splash-footer" :class="{ 'anim-in': animStep >= 4 }">
      <text class="version-text">v1.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/useAuthStore'

/** 入场动画步数：1=Logo 2=名称 3=描述 4=版本 */
const animStep = ref(0)

onMounted(async () => {
  // 依次触发入场动画
  const steps: [number, number][] = [[1, 0], [2, 120], [3, 260], [4, 420]]
  steps.forEach(([step, delay]) => {
    setTimeout(() => { animStep.value = step }, delay)
  })

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
  background: linear-gradient(135deg, #2979FF 0%, #4A90D9 50%, #63B4FF 100%);
  position: relative;
  overflow: hidden;
}

/* ===== 背景装饰粒子 ===== */
.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);

  &--1 { width: 120rpx; height: 120rpx; top: 15%; left: 10%; animation: float 7s ease-in-out infinite; }
  &--2 { width: 80rpx; height: 80rpx; top: 25%; right: 15%; animation: float 9s ease-in-out 1s infinite; }
  &--3 { width: 60rpx; height: 60rpx; top: 60%; left: 20%; animation: float 8s ease-in-out 2s infinite; }
  &--4 { width: 100rpx; height: 100rpx; bottom: 20%; right: 10%; animation: float 10s ease-in-out 0.5s infinite; }
  &--5 { width: 50rpx; height: 50rpx; top: 40%; left: 60%; animation: float 6s ease-in-out 1.5s infinite; }
  &--6 { width: 70rpx; height: 70rpx; bottom: 30%; left: 40%; animation: float 8.5s ease-in-out 3s infinite; }
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
  50% { transform: translateY(-30rpx) scale(1.15); opacity: 1; }
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
  background: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
  position: relative;
  opacity: 0;
  transform: scale(0.3);

  &.anim-in {
    animation: logoBounceIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .logo-text {
    font-size: 72rpx;
    position: relative;
    z-index: 2;
  }
}

/* Logo 呼吸光环 */
.logo-glow {
  position: absolute;
  inset: -12rpx;
  border-radius: 52rpx;
  background: transparent;
  border: 3rpx dashed rgba(255, 255, 255, 0.35);
  animation: glowRotate 5s linear infinite;
}

@keyframes glowRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes logoBounceIn {
  0% { opacity: 0; transform: scale(0.3); }
  60% { opacity: 1; transform: scale(1.08); }
  100% { opacity: 1; transform: scale(1); }
}

/* ---- 名称 ---- */
.app-name {
  font-size: 44rpx;
  color: #FFFFFF;
  font-weight: bold;
  margin-bottom: 16rpx;
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateY(16rpx);

  &.anim-in {
    animation: fadeInUp 0.5s ease forwards;
  }
}

/* ---- 描述 ---- */
.app-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.75);
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateY(16rpx);

  &.anim-in {
    animation: fadeInUp 0.45s ease forwards;
  }
}

/* ===== 底部版本 ===== */
.splash-footer {
  position: absolute;
  bottom: 80rpx;
  opacity: 0;

  &.anim-in {
    animation: fadeIn 0.5s ease forwards;
  }

  .version-text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.5);
  }
}

/* ===== 自定义 keyframes ===== */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
