<!--
  首页（TabBar 页面）
  展示欢迎内容和功能特性卡片

  动画：欢迎区淡入 + 功能卡片依次弹入
  深色模式：通过 CSS 自定义属性适配
  国际化：所有文案通过 $t() 引用
-->
<template>
  <view class="page-container">
    <!-- ===== 背景装饰 ===== -->
    <view class="bg-decor">
      <view class="bg-circle bg-circle--1" />
      <view class="bg-circle bg-circle--2" />
    </view>

    <!-- ===== 欢迎区 ===== -->
    <view class="welcome-section" :class="{ 'anim-in': animStep >= 1 }">
      <text class="welcome-title">{{ $t('home.greeting') }}</text>
      <text class="welcome-subtitle">{{ $t('splash.appName') }}</text>
      <text class="welcome-desc">{{ $t('home.description') }}</text>
    </view>

    <!-- ===== 功能卡片列表 ===== -->
    <view class="feature-list">
      <view
        v-for="(item, index) in features"
        :key="item.icon"
        class="feature-card"
        :class="{ 'anim-in': animStep >= 2 + index }"
      >
        <text class="feature-icon">{{ item.icon }}</text>
        <text class="feature-title">{{ item.title }}</text>
        <text class="feature-desc">{{ item.desc }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/store/useAuthStore'

const authStore = useAuthStore()
const { t } = useI18n()

/** 功能卡片数据（跟随语言） */
const features = computed(() => [
  { icon: '🔐', title: t('home.features.auth.title'), desc: t('home.features.auth.desc') },
  { icon: '🗄️', title: t('home.features.db.title'), desc: t('home.features.db.desc') },
  { icon: '📦', title: t('home.features.storage.title'), desc: t('home.features.storage.desc') },
  { icon: '⚡', title: t('home.features.realtime.title'), desc: t('home.features.realtime.desc') },
])

/** 入场动画步数：1=欢迎区 2~5=卡片依次 */
const animStep = ref(0)

/** ===== 入场动画序列 ===== */
onMounted(() => {
  const steps: [number, number][] = [[1, 80], [2, 200], [3, 320], [4, 440], [5, 560]]
  steps.forEach(([step, delay]) => {
    setTimeout(() => { animStep.value = step }, delay)
  })
})

/** ===== 动态标题 ===== */
onShow(() => {
  uni.setNavigationBarTitle({ title: t('home.pageTitle') })
})
</script>

<style lang="scss" scoped>

/* ===== 容器 & 背景 ===== */
.page-container {
  min-height: 100vh;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 40rpx;
  position: relative;
  overflow: hidden;
}

.bg-decor {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 400rpx;
  pointer-events: none;
  z-index: 0;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(41, 121, 255, 0.06) 0%, rgba(74, 144, 217, 0.02) 100%);

  &--1 {
    width: 400rpx; height: 400rpx;
    top: -160rpx; right: -100rpx;
    animation: bgFloat1 7s ease-in-out infinite;
  }
  &--2 {
    width: 260rpx; height: 260rpx;
    top: 60rpx; left: -80rpx;
    animation: bgFloat2 9s ease-in-out infinite;
  }
}

@keyframes bgFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-24rpx, 16rpx) scale(1.04); }
}
@keyframes bgFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(18rpx, -12rpx) scale(1.06); }
}

/* ===== 欢迎区 ===== */
.welcome-section {
  text-align: center;
  margin-top: 200rpx;
  margin-bottom: 64rpx;
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateY(-20rpx);

  &.anim-in { animation: fadeInDown 0.55s ease forwards; }

  .welcome-title {
    display: block;
    font-size: 32rpx;
    color: var(--text-primary);
    font-weight: 500;
    margin-bottom: 12rpx;
  }

  .welcome-subtitle {
    display: block;
    font-size: 52rpx;
    color: var(--color-primary);
    font-weight: 700;
    margin-bottom: 16rpx;
    letter-spacing: 2rpx;
  }

  .welcome-desc {
    display: block;
    font-size: 28rpx;
    color: var(--text-secondary);
  }
}

/* ===== 功能卡片区 ===== */
.feature-list {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.feature-card {
  width: 46%;
  background: var(--bg-card);
  border-radius: 24rpx;
  padding: 40rpx 28rpx;
  margin-bottom: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: var(--shadow-light);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  opacity: 0;
  transform: scale(0.85) translateY(20rpx);

  &.anim-in { animation: cardBounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

  &:active { transform: scale(0.96); }

  .feature-icon { font-size: 52rpx; margin-bottom: 16rpx; }

  .feature-title { font-size: 28rpx; font-weight: 600; color: var(--text-primary); margin-bottom: 8rpx; }

  .feature-desc { font-size: 22rpx; color: var(--text-secondary); text-align: center; line-height: 1.5; }
}

/* ===== 自定义 keyframes ===== */
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20rpx); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes cardBounceIn {
  0% { opacity: 0; transform: scale(0.85) translateY(20rpx); }
  60% { opacity: 1; transform: scale(1.03) translateY(-4rpx); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
