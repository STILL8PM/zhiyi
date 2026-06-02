<!--
  个人中心（TabBar 页面）—— 需登录
  展示用户信息、功能菜单、退出登录

  动画：用户卡片淡入 + 菜单项依次滑入 + 退出按钮延迟淡入
  深色模式：通过 CSS 自定义属性适配
  国际化：所有文案通过 $t() 引用
-->
<template>
  <view class="page">
    <!-- ===== 用户信息卡片 ===== -->
    <view class="user-card" :class="{ 'anim-in': animStep >= 1 }">
      <view class="avatar-wrapper">
        <u-avatar :src="avatarUrl" size="80" />
        <view class="avatar-glow" />
      </view>
      <view class="user-info">
        <text class="username">{{ displayName }}</text>
        <text class="email">{{ authStore.email }}</text>
      </view>
      <u-icon name="edit-pen" size="22" color="#999" @click="goSettings" />
    </view>

    <!-- ===== 功能菜单 ===== -->
    <view class="menu-section">
      <view
        v-for="(item, index) in menuItems"
        :key="item.title"
        class="menu-item-wrapper"
        :class="{ 'anim-in': animStep >= 2 + index }"
      >
        <u-cell :title="item.title" :icon="item.icon" :isLink="item.link" @click="item.action" />
      </view>
    </view>

    <!-- ===== 退出登录 ===== -->
    <view class="logout-section" :class="{ 'anim-in': animStep >= 6 }">
      <u-button
        :text="$t('user.logout')"
        type="error"
        plain
        shape="circle"
        :customStyle="logoutBtnStyle"
        @click="handleLogout"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserStore } from '@/store/useUserStore'
import { useAuth } from '@/hooks/useAuth'
import { DEFAULT_AVATAR } from '@/config/app'

const authStore = useAuthStore()
const userStore = useUserStore()
const { logout } = useAuth()
const { t } = useI18n()

/** ===== 响应式数据 ===== */
const avatarUrl = computed(() => userStore.getAvatarUrl() || DEFAULT_AVATAR)
const displayName = computed(() => userStore.getDisplayName())

/** 入场动画步数 */
const animStep = ref(0)

/** 菜单项配置（跟随语言） */
const menuItems = computed(() => [
  { title: t('user.menu.profile'), icon: 'account', link: true, action: () => showToast(t('settings.toast.notImplemented')) },
  { title: t('user.menu.security'), icon: 'lock', link: true, action: goSettings },
  { title: t('user.menu.notification'), icon: 'bell', link: true, action: () => showToast(t('settings.toast.notImplemented')) },
  { title: t('user.menu.about'), icon: 'info-circle', link: true, action: () => showToast('v1.0.0') },
])

/** 退出按钮样式 */
const logoutBtnStyle = {
  height: '88rpx',
  fontSize: '30rpx',
}

/** ===== 入场动画序列 ===== */
onMounted(() => {
  const steps: [number, number][] = [[1, 60], [2, 180], [3, 260], [4, 340], [5, 420], [6, 540]]
  steps.forEach(([step, delay]) => {
    setTimeout(() => { animStep.value = step }, delay)
  })
})

/** ===== 动态标题 ===== */
onShow(() => {
  uni.setNavigationBarTitle({ title: t('user.pageTitle') })
})

/** ===== 退出登录 ===== */
async function handleLogout(): Promise<void> {
  const confirmed = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: t('user.logoutConfirmTitle'),
      content: t('user.logoutConfirmContent'),
      success: (r) => resolve(r.confirm),
    })
  })
  if (confirmed) await logout()
}

/** ===== 跳转 ===== */
function goSettings(): void {
  uni.navigateTo({ url: '/pages/settings/index' })
}
function showToast(msg: string): void {
  uni.showToast({ title: msg, icon: 'none' })
}
</script>

<style lang="scss" scoped>

/* ===== 页面容器 ===== */
.page {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding-top: 20rpx;
}

/* ===== 用户卡片 ===== */
.user-card {
  background: var(--bg-card);
  padding: 44rpx 32rpx;
  margin: 20rpx 24rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: var(--shadow-card);
  position: relative;
  opacity: 0;
  transform: translateY(-20rpx);

  &.anim-in { animation: fadeInUp 0.5s ease forwards; }
}

.avatar-wrapper { position: relative; }
.avatar-glow {
  position: absolute;
  inset: -8rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(41, 121, 255, 0.2);
  animation: glowPulse 2.5s ease-in-out infinite;
}
@keyframes glowPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.12); opacity: 1; }
}

.user-info {
  flex: 1;
  .username { font-size: 36rpx; font-weight: 700; display: block; color: var(--text-primary); }
  .email { font-size: 26rpx; color: var(--text-secondary); margin-top: 6rpx; }
}

/* ===== 菜单区 ===== */
.menu-section {
  margin: 20rpx 24rpx;
  background: var(--bg-card);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.menu-item-wrapper {
  opacity: 0;
  transform: translateX(-20rpx);

  &.anim-in { animation: slideInLeft 0.4s ease forwards; }

  :deep(.u-cell) {
    transition: background 0.2s ease;
    &:active { background: var(--bg-input); }
  }
}

/* ===== 退出登录区 ===== */
.logout-section {
  padding: 48rpx 48rpx;
  opacity: 0;
  transform: translateY(16rpx);

  &.anim-in { animation: fadeInUp 0.45s ease forwards; }

  :deep(.u-button) {
    transition: transform 0.15s ease;
    &:active { transform: scale(0.97); }
  }
}

/* ===== 自定义 keyframes ===== */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20rpx); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
