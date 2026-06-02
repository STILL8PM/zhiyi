<!--
  自定义导航栏组件
  适配各平台状态栏高度，支持自定义标题和返回按钮
-->
<template>
  <view class="custom-navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="navbar-content" :style="{ height: navbarHeight + 'px' }">
      <view class="navbar-left" @click="handleBack" v-if="showBack">
        <u-icon name="arrow-left" size="22" />
      </view>
      <view class="navbar-title">
        <text>{{ title }}</text>
      </view>
      <view class="navbar-right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{ title?: string; showBack?: boolean }>()

const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = systemInfo.statusBarHeight || 20
const navbarHeight = 44

function handleBack(): void { uni.navigateBack() }
</script>

<style lang="scss" scoped>
.custom-navbar { background: var(--bg-card); }
.navbar-content { display: flex; align-items: center; justify-content: center; position: relative; padding: 0 24rpx; }
.navbar-left { position: absolute; left: 24rpx; }
.navbar-title { font-size: 32rpx; font-weight: 600; color: var(--text-primary); }
.navbar-right { position: absolute; right: 24rpx; }
</style>
