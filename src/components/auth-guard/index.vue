<!--
  认证守卫组件 —— 包裹需要登录才能访问的内容

  用法: <auth-guard><view>需要登录的内容</view></auth-guard>

  国际化：文案通过 $t() 引用
-->
<template>
  <view v-if="authStore.isReady && authStore.isAuthenticated">
    <slot />
  </view>
  <c-page-loading v-else-if="!authStore.isReady" />
  <view v-else class="guard-placeholder">
    <u-empty :text="$t('user.placeholder.notLoggedIn')" mode="permission" />
    <u-button type="primary" :text="$t('user.placeholder.goLogin')" shape="circle" @click="goLogin" />
  </view>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/useAuthStore'

const authStore = useAuthStore()

function goLogin(): void {
  uni.redirectTo({ url: '/pages/auth/login/index' })
}
</script>

<style lang="scss" scoped>
.guard-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 48rpx 0;
}
</style>
