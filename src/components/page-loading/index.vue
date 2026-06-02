<!-- 全局页面加载动画组件 -->
<template>
  <view class="page-loading">
    <u-loading-icon mode="circle" size="40" text="加载中..." />
  </view>
</template>
<style lang="scss" scoped>
.page-loading {
  display: flex; align-items: center; justify-content: center;
  min-height: 400rpx;
}
</style>
