<!--
  首页（TabBar 页面）
  展示欢迎内容和功能特性卡片

  动画：欢迎区淡入 + 功能卡片依次弹入
  深色模式：通过 CSS 自定义属性适配
  国际化：所有文案通过 $t() 引用
-->
<template>
  <view class="page-container" :class="[appStore.pageClass, { 'theme-dark': isDark }]">
    <!-- ===== 欢迎区 ===== -->
    <view class="welcome-section">
      <text class="welcome-title">{{ $t('home.greeting') }}</text>
    </view>

    <!-- ===== 功能卡片列表 ===== -->
    <view class="feature-list">
      <view
        v-for="item in features"
        :key="item.icon"
        class="feature-card"
      >
        <text class="feature-icon">{{ item.icon }}</text>
        <text class="feature-title">{{ item.title }}</text>
        <text class="feature-desc">{{ item.desc }}</text>
      </view>
    </view>

    <!-- 自定义底部导航栏 -->
    <c-custom-tabbar />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppStore } from '@/store/useAppStore'
import CCustomTabbar from '@/components/custom-tabbar/index.vue'

const authStore = useAuthStore()
const appStore = useAppStore()
const { t } = useI18n()

/** 当前页面是否处于深色模式（用于根元素 class 绑定，适配小程序端） */
const isDark = computed(() => appStore.theme === 'dark')

/** 功能卡片数据（跟随语言） */
const features = computed(() => [
  { icon: '🔐', title: t('home.features.auth.title'), desc: t('home.features.auth.desc') },
  { icon: '🗄️', title: t('home.features.db.title'), desc: t('home.features.db.desc') },
  { icon: '📦', title: t('home.features.storage.title'), desc: t('home.features.storage.desc') },
  { icon: '⚡', title: t('home.features.realtime.title'), desc: t('home.features.realtime.desc') },
])

onShow(() => {
  uni.setNavigationBarTitle({ title: t('home.pageTitle') })
})
</script>

<style lang="scss" scoped>

/* ===== 容器 ===== */
.page-container {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 56rpx;
  /* 给自定义 TabBar 留空间 */
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

/* ===== 欢迎区 ===== */
.welcome-section {
  text-align: center;
  margin-top: 200rpx;
  margin-bottom: 64rpx;
  position: relative;
  z-index: 1;

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

  &:active { transform: scale(0.96); }

  .feature-icon { font-size: 52rpx; margin-bottom: 16rpx; }

  .feature-title { font-size: 28rpx; font-weight: 600; color: var(--text-primary); margin-bottom: 8rpx; }

  .feature-desc { font-size: 22rpx; color: var(--text-secondary); text-align: center; line-height: 1.5; }
}

</style>
