<!-- 空状态占位组件 -->
<template>
  <view class="empty-state">
    <u-empty :text="text" :mode="mode" />
    <slot />
  </view>
</template>
<script setup lang="ts">
defineProps<{ text?: string; mode?: string }>()
</script>
<style lang="scss" scoped>
.empty-state { padding: 200rpx 0; }
</style>
