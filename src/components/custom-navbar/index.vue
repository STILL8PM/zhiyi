<!--
  自定义导航栏组件 —— 仅二级页面使用（TabBar 和启动页不需要）

  Props:
    title    - 标题文字，不传自动读取页面配置
    showBack - 是否显示返回按钮，默认非 TabBar 页自动显示
    bgColor  - 背景色，默认 var(--bg-primary)

  Slots:
    right    - 右侧自定义内容
-->
<template>
  <view class="c-navbar" :style="{ backgroundColor: bgColor || 'var(--bg-primary)' }">
    <!-- 状态栏占位 -->
    <view :style="{ height: statusBarHeight + 'px' }" />

    <!-- 导航栏主体 -->
    <view class="c-navbar__body">
      <!-- 左侧：返回按钮（圆形底托 + 纯箭头，无文字） -->
      <view class="c-navbar__side c-navbar__left">
        <view
          v-if="showBack"
          class="c-navbar__back"
          hover-class="c-navbar__back--pressed"
          @click="handleBack"
        >
          <u-icon name="arrow-left" size="20" color="var(--text-primary)" />
        </view>
      </view>

      <!-- 标题：居中加粗 -->
      <text class="c-navbar__title">{{ displayTitle }}</text>

      <!-- 右侧：自定义插槽 -->
      <view class="c-navbar__side c-navbar__right">
        <slot name="right" />
      </view>
    </view>

    <!-- 底部渐变阴影（比 1px 分隔线更有层次感） -->
    <view class="c-navbar__shadow" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const TAB_BAR_PAGES = ['/pages/index/index', '/pages/user/index']

const props = withDefaults(
  defineProps<{ title?: string; showBack?: boolean; bgColor?: string }>(),
  { title: '', bgColor: '' },
)

const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = systemInfo.statusBarHeight || 20

/** 非 TabBar 页自动显示返回 */
const showBack = computed(() => {
  if (props.showBack !== undefined) return props.showBack
  const pages = getCurrentPages()
  const route = pages.length > 0 ? `/${pages[pages.length - 1].route}` : ''
  return !TAB_BAR_PAGES.includes(route)
})

/** 标题：优先 prop → 页面配置 */
const displayTitle = computed(() => {
  if (props.title) return props.title
  const pages = getCurrentPages()
  const page = pages.length > 0 ? pages[pages.length - 1] : null
  // @ts-expect-error uni-app 内部属性
  return page?.$page?.style?.navigationBarTitleText || ''
})

function handleBack(): void {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.c-navbar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 900;
  transition: background-color 0.3s ease;
  /* iOS 毛玻璃效果，与页面内精美卡片风格统一 */
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
}

/* ---- 导航栏主体 ---- */
.c-navbar__body {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 16rpx;
  position: relative;
}

/* ---- 左右留白区（各占 120rpx，保证标题居中） ---- */
.c-navbar__side {
  width: 120rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
.c-navbar__left {
  justify-content: flex-start;
  padding-left: 8rpx;
}
.c-navbar__right {
  justify-content: flex-end;
  padding-right: 16rpx;
}

/* ---- 返回按钮（圆形底托 + 纯箭头，现代极简风格） ---- */
.c-navbar__back {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-input);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

/* 按下态：缩小 + 背景加深 */
.c-navbar__back--pressed {
  transform: scale(0.92);
  background: var(--border-color);
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.04);
}

/* ---- 标题 ---- */
.c-navbar__title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  color: var(--text-primary);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
  /* 标题轻微字间距，更精致 */
  letter-spacing: 1rpx;
}

/* ---- 底部渐变阴影（替代生硬 1px 分隔线，更有层次感） ---- */
.c-navbar__shadow {
  height: 12rpx;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.04) 0%,
    rgba(0, 0, 0, 0.01) 40%,
    transparent 100%
  );
  pointer-events: none;
}

/* 深色模式下渐变稍微调亮 */
.theme-dark .c-navbar__shadow {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(255, 255, 255, 0.01) 40%,
    transparent 100%
  );
}
</style>
