<!--
  自定义底部导航栏组件
  替代原生 TabBar，统一毛玻璃圆角风格

  特性：
  - 毛玻璃模糊底 + 顶部圆角
  - 选中态渐变主题色 + 微缩放动画
  - 深色模式适配（CSS 变量）
  - 安全区域适配（safe-area-inset-bottom）
  - 国际化文案

  使用：在 TabBar 页面模板底部引入 <c-custom-tabbar />
-->
<template>
  <view class="c-tabbar" :class="{ 'theme-dark': isDark }">
    <!-- 毛玻璃背景 -->
    <view class="c-tabbar__bg" />

    <!-- Tab 项列表 -->
    <view class="c-tabbar__list">
      <view
        v-for="tab in tabs"
        :key="tab.path"
        class="c-tabbar__item"
        :class="{ 'is-active': currentPath === tab.path }"
        hover-class="c-tabbar__item--pressed"
        @click="handleSwitch(tab.path)"
      >
        <!-- 图标 -->
        <text class="c-tabbar__icon">{{ tab.icon }}</text>
        <!-- 文字 -->
        <text class="c-tabbar__text">{{ tab.text }}</text>
      </view>
    </view>

    <!-- 安全区域占位 -->
    <view class="c-tabbar__safe" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/useAppStore'

const { t } = useI18n()
const appStore = useAppStore()

/** 当前页面是否处于深色模式 */
const isDark = computed(() => appStore.theme === 'dark')

/** Tab 项配置：path 对应 pages.json 中 tabBar.list 的 pagePath */
const tabs = computed(() => [
  { path: '/pages/index/index', icon: '🛖', text: t('tabBar.home') },
  { path: '/pages/user/index', icon: '👤', text: t('tabBar.user') },
])

/** 当前页面路径（用于判断选中态） */
const currentPath = ref('')

// 初始化时获取当前路径
try {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    currentPath.value = `/${pages[pages.length - 1].route}`
  }
} catch {
  // 读取失败兜底
}

/** 切换 Tab */
function handleSwitch(path: string): void {
  if (currentPath.value === path) return
  uni.switchTab({ url: path })
}
</script>

<style lang="scss" scoped>
/* ===== 根容器 ===== */
.c-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

/* ===== 毛玻璃背景 ===== */
.c-tabbar__bg {
  position: absolute;
  inset: 0;
  background: var(--tabbar-bg, rgba(255, 255, 255, 0.85));
  border-radius: 32rpx 32rpx 0 0;
  /* 毛玻璃效果 */
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
  /* 顶部分隔线（细渐变，比 1px 实线更精致） */
  border-top: 1rpx solid var(--tabbar-border, rgba(0, 0, 0, 0.06));
  box-shadow: 0 -4rpx 20rpx var(--tabbar-shadow, rgba(0, 0, 0, 0.04));
  transition: background 0.3s ease, border-color 0.3s ease;
}

/* 深色模式 */
.theme-dark .c-tabbar__bg {
  background: var(--tabbar-bg-dark, rgba(30, 30, 30, 0.9));
  border-top-color: var(--tabbar-border-dark, rgba(255, 255, 255, 0.08));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.2);
}

/* ===== Tab 列表 ===== */
.c-tabbar__list {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 100rpx;
  padding: 0 32rpx;
}

/* ===== 单个 Tab 项 ===== */
.c-tabbar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rpx;
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

/* 按下态 */
.c-tabbar__item--pressed {
  transform: scale(0.92);
}

/* 未选中态 */
.c-tabbar__item:not(.is-active) {
  opacity: 0.5;
}

/* 选中态 */
.c-tabbar__item.is-active {
  .c-tabbar__text {
    color: var(--color-primary, #2979FF);
    font-weight: 700;
  }
  .c-tabbar__icon {
    /* 选中图标微放大 */
    transform: scale(1.1);
  }
}

/* ===== 图标 ===== */
.c-tabbar__icon {
  font-size: 40rpx;
  transition: transform 0.2s ease;
  /* 图标底部留白，让 emoji 看起来居中 */
  line-height: 1;
}

/* ===== 文字 ===== */
.c-tabbar__text {
  font-size: 20rpx;
  color: var(--text-primary, #333);
  transition: color 0.2s ease, font-weight 0.2s ease;
}

/* ===== 底部安全区域 ===== */
.c-tabbar__safe {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
  border-radius: 0 0 0 0;
  /* 安全区域背景跟随毛玻璃层 */
  background: inherit;
}
</style>
