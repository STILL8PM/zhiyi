<!--
  个人中心（TabBar 页面）—— 需登录
  展示用户信息、功能菜单、退出登录

  动画：用户卡片淡入 + 菜单项依次滑入 + 退出按钮延迟淡入
  深色模式：通过 CSS 自定义属性适配
  国际化：所有文案通过 $t() 引用
-->
<template>
  <view class="page" :class="[appStore.pageClass, { 'theme-dark': isDark }]">
    <!-- ===== 用户信息卡片 ===== -->
    <view class="user-card">
      <view class="avatar-wrapper" @click="goProfileEdit">
        <u-avatar :src="avatarUrl" size="80" />
      </view>
      <view class="user-info" @click="goProfileEdit">
        <text class="username">{{ displayName }}</text>
        <text class="email">{{ authStore.email }}</text>
      </view>
      <view class="card-actions">
        <!-- 深色模式快捷开关 -->
        <view class="dark-toggle-inline" @click.stop="toggleDarkMode">
          <text class="dark-emoji">{{ isDark ? '🌙' : '☀️' }}</text>
        </view>
        <u-icon name="setting" size="22" color="#999" @click="goSettings()" />
      </view>
    </view>

    <!-- ===== 功能菜单 ===== -->
    <view class="menu-section">
      <!-- 编辑资料 -->
      <view class="menu-item-wrapper">
        <u-cell :title="$t('user.menu.editProfile')" icon="account" :isLink="true" @click="goProfileEdit" />
      </view>
      <!-- 账号安全 -->
      <view class="menu-item-wrapper">
        <u-cell :title="$t('user.menu.security')" icon="lock" :isLink="true" @click="goSecurity" />
      </view>
      <!-- 深色模式 -->
      <view class="menu-item-wrapper">
        <u-cell :title="$t('settings.items.darkMode')" icon="eye">
          <template #value>
            <u-switch :value="isDark" @change="toggleDarkMode" />
          </template>
        </u-cell>
      </view>
      <!-- 语言切换 -->
      <view class="menu-item-wrapper">
        <u-cell :title="$t('settings.items.language')" icon="map">
          <template #value>
            <view class="lang-switcher">
              <text
                class="lang-option"
                :class="{ active: currentLang === 'zh-CN' }"
                @click="setLang('zh-CN')"
              >中文</text>
              <text class="lang-sep">|</text>
              <text
                class="lang-option"
                :class="{ active: currentLang === 'en' }"
                @click="setLang('en')"
              >EN</text>
            </view>
          </template>
        </u-cell>
      </view>
      <!-- 关于 -->
      <view class="menu-item-wrapper">
        <u-cell :title="$t('user.menu.about')" icon="info-circle" :isLink="true" @click="showAbout" />
      </view>
    </view>

    <!-- ===== 退出登录 ===== -->
    <view class="logout-section">
      <u-button
        :text="$t('user.logout')"
        type="error"
        plain
        shape="circle"
        :customStyle="logoutBtnStyle"
        @click="handleLogout"
      />
    </view>

    <!-- ===== 关于弹窗 ===== -->
    <u-modal
      :show="aboutModalVisible"
      :title="'知忆'"
      :content="'uni-app + Supabase 全端应用脚手架\\n\\n版本：v1.0.0\\n\\n基于 Supabase 提供认证、数据库、文件存储和实时订阅能力。'"
      :showCancelButton="false"
      confirmText="知道了"
      @confirm="aboutModalVisible = false"
    />

    <!-- ===== 退出确认弹窗 ===== -->
    <u-modal
      :show="logoutModalVisible"
      :title="$t('user.logoutConfirmTitle')"
      :content="$t('user.logoutConfirmContent')"
      :showCancelButton="true"
      :confirmText="$t('common.confirm')"
      :cancelText="$t('common.cancel')"
      @confirm="confirmLogout"
      @cancel="logoutModalVisible = false"
    />
  </view>

  <!-- 自定义底部导航栏 -->
  <c-custom-tabbar />
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserStore } from '@/store/useUserStore'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import { DEFAULT_AVATAR } from '@/config/app'
import CCustomTabbar from '@/components/custom-tabbar/index.vue'

const authStore = useAuthStore()
const userStore = useUserStore()
const appStore = useAppStore()
const { logout } = useAuth()
const { t } = useI18n()
const { currentLang, setLang } = useLang()

/** 当前页面是否处于深色模式（用于根元素 class 绑定，适配小程序端） */
const isDark = computed(() => appStore.theme === 'dark')

/** 切换深色模式 */
function toggleDarkMode(): void {
  appStore.setTheme(isDark.value ? 'light' : 'dark')
}

/** ===== 响应式数据 ===== */
const avatarUrl = computed(() => userStore.getAvatarUrl() || DEFAULT_AVATAR)
const displayName = computed(() => userStore.getDisplayName())

/** 退出按钮样式 */
const logoutBtnStyle = {
  height: '88rpx',
  fontSize: '30rpx',
}

/** ===== 确保用户资料已加载 ===== */
onMounted(() => {
  if (!userStore.isFetched) {
    userStore.fetchProfile()
  }
})

onShow(() => {
  uni.setNavigationBarTitle({ title: t('user.pageTitle') })
})

/** ===== 弹窗状态 ===== */
const aboutModalVisible = ref(false)
const logoutModalVisible = ref(false)

/** ===== 退出登录 ===== */
function handleLogout(): void {
  logoutModalVisible.value = true
}
async function confirmLogout(): Promise<void> {
  logoutModalVisible.value = false
  await logout()
}

/** ===== 跳转 ===== */
function goProfileEdit(): void {
  uni.navigateTo({ url: '/pages/profile/edit/index' })
}
function goSecurity(): void {
  uni.navigateTo({ url: '/pages/security/index' })
}
function goSettings(): void {
  uni.navigateTo({ url: '/pages/settings/index' })
}

/** 显示关于弹窗 */
function showAbout(): void {
  aboutModalVisible.value = true
}
</script>

<style lang="scss" scoped>

/* ===== 页面容器 ===== */
.page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 0 56rpx;
  display: flex;
  flex-direction: column;
  /* 给自定义 TabBar 留空间 */
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

/* ===== 用户卡片 ===== */
.user-card {
  background: var(--bg-card);
  padding: 44rpx 32rpx;
  margin-top: 40rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: var(--shadow-card);
  position: relative;
  z-index: 1;
}

.user-info {
  flex: 1;
  .username { font-size: 36rpx; font-weight: 700; display: block; color: var(--text-primary); }
  .email { font-size: 26rpx; color: var(--text-secondary); margin-top: 6rpx; }
}

/* 卡片右侧操作区 */
.card-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

/* 深色模式快捷按钮 */
.dark-toggle-inline {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;

  &:active {
    background: var(--border-color);
    transform: scale(0.92);
  }
}

.dark-emoji { font-size: 30rpx; }

/* ===== 菜单区 ===== */
.menu-section {
  margin-top: 20rpx;
  background: var(--bg-card);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  position: relative;
  z-index: 1;
}

.menu-item-wrapper {
  :deep(.u-cell) {
    transition: background 0.2s ease;
    &:active { background: var(--bg-input); }
  }
}

/* ===== 退出登录区 ===== */
.logout-section {
  padding: 48rpx 0;
  position: relative;
  z-index: 1;

  :deep(.u-button) {
    transition: transform 0.15s ease;
    &:active { transform: scale(0.97); }
  }
}

/* ===== 语言切换器 ===== */
.lang-switcher {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 26rpx;
}

.lang-option {
  padding: 4rpx 8rpx;
  color: var(--text-secondary);
  transition: color 0.2s, font-weight 0.2s;

  &.active {
    color: var(--color-primary);
    font-weight: 700;
  }
}

.lang-sep {
  color: var(--text-secondary);
  opacity: 0.4;
}

</style>
