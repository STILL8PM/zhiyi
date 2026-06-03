<!--
  设置页
  个人资料编辑、修改密码、通知偏好、深色模式、语言切换、关于信息

  动画：分组卡片依次淡入上滑
  深色模式：通过 CSS 自定义属性适配，开关接入 useAppStore
  国际化：所有文案通过 $t() 引用
-->
<template>
  <view class="page" :class="[appStore.pageClass, { 'theme-dark': isDark }]">
    <!-- ===== 个人资料入口 ===== -->
    <view id="section-profile" class="group-card">
      <view class="group-title">{{ $t('settings.sections.profile') }}</view>
      <u-cell :title="$t('user.menu.editProfile')" icon="account" :isLink="true" @click="goProfileEdit" />
    </view>

    <!-- ===== 账号安全入口 ===== -->
    <view id="section-security" class="group-card">
      <view class="group-title">{{ $t('settings.sections.security') }}</view>
      <u-cell :title="$t('user.menu.security')" icon="lock" :isLink="true" @click="goSecurity" />
    </view>

    <!-- ===== 偏好设置 ===== -->
    <view class="group-card">
      <view class="group-title">{{ $t('settings.sections.preferences') }}</view>
      <u-cell :title="$t('settings.items.notification')" icon="bell">
        <template #value>
          <u-switch v-model="notifyEnabled" @change="onNotifyChange" />
        </template>
      </u-cell>
      <u-cell :title="$t('settings.items.darkMode')" icon="eye">
        <template #value>
          <u-switch v-model="darkMode" @change="onDarkChange" />
        </template>
      </u-cell>
      <!-- 主题色选择 -->
      <u-cell :title="$t('settings.items.colorScheme')" icon="color">
        <template #value>
          <view class="color-scheme-row">
            <view
              v-for="(def, key) in COLOR_SCHEMES"
              :key="key"
              class="color-dot"
              :class="{ active: appStore.colorScheme === key }"
              :style="{ backgroundColor: def.tabBarSelected }"
              @click="appStore.setColorScheme(key as ColorScheme)"
            />
          </view>
        </template>
      </u-cell>
      <!-- 语言切换 -->
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

    <!-- ===== 关于 ===== -->
    <view class="group-card">
      <view class="group-title">{{ $t('settings.sections.about') }}</view>
      <u-cell :title="$t('settings.items.version')" icon="info-circle" :value="version" />
      <u-cell :title="$t('settings.items.terms')" icon="file-text" :isLink="true" @click="showNoTerms" />
      <u-cell :title="$t('settings.items.privacy')" icon="shield" :isLink="true" @click="showNoTerms" />
    </view>

  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAppStore, COLOR_SCHEMES, type ColorScheme } from '@/store/useAppStore'
import { useLang } from '@/hooks/useLang'

const { t } = useI18n()
const appStore = useAppStore()
const { currentLang, setLang } = useLang()

const version = 'v1.0.0'
const notifyEnabled = ref(true)

/** ===== 页面显示 ===== */
onShow(() => {
  // 使用原生导航栏，动态设置 i18n 标题
  uni.setNavigationBarTitle({ title: t('settings.pageTitle') })
})

/** 当前页面是否处于深色模式（用于根元素 class 绑定，适配小程序端） */
const isDark = computed(() => appStore.theme === 'dark')

/** 深色模式开关 —— 双向绑定到 store */
const darkMode = computed({
  get: () => appStore.theme === 'dark',
  set: (val: boolean) => appStore.setTheme(val ? 'dark' : 'light'),
})

/** ===== 跳转 ===== */
function goProfileEdit(): void {
  uni.navigateTo({ url: '/pages/profile/edit/index' })
}
function goSecurity(): void {
  uni.navigateTo({ url: '/pages/security/index' })
}

/** ===== 事件处理 ===== */
const onNotifyChange = (v: boolean): void => {
  uni.showToast({ title: t(v ? 'settings.toast.notifyOn' : 'settings.toast.notifyOff'), icon: 'none' })
}
const onDarkChange = (_v: boolean): void => {
  uni.showToast({ title: appStore.theme === 'dark' ? '深色模式' : '浅色模式', icon: 'none' })
}
const showNoTerms = (): void => {
  uni.showToast({ title: t('settings.toast.noTerms'), icon: 'none' })
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
}

/* ===== 分组卡片 ===== */
.group-card {
  background: var(--bg-card);
  margin-top: 24rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: var(--shadow-light);
  position: relative;
  z-index: 1;

  :deep(.u-cell) {
    transition: background 0.2s ease;
    &:active { background: var(--bg-input); }
  }
}

.group-title {
  font-size: 26rpx;
  color: var(--text-secondary);
  padding: 24rpx 28rpx 8rpx;
  font-weight: 500;
}

/* ===== 主题色选择器 ===== */
.color-scheme-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.color-dot {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 4rpx solid transparent;
  transition: transform 0.2s, border-color 0.2s;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);

  &.active {
    border-color: var(--text-primary);
    transform: scale(1.2);
  }

  &:active { transform: scale(0.9); }
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
