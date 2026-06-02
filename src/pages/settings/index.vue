<!--
  设置页
  修改密码、通知偏好、深色模式、语言切换、关于信息

  动画：分组卡片依次淡入上滑
  深色模式：通过 CSS 自定义属性适配，开关接入 useAppStore
  国际化：所有文案通过 $t() 引用
-->
<template>
  <view class="page">
    <!-- ===== 账号安全 ===== -->
    <view class="group-card" :class="{ 'anim-in': animStep >= 1 }">
      <view class="group-title">{{ $t('settings.sections.security') }}</view>
      <u-cell :title="$t('settings.items.changePassword')" icon="lock" :isLink="true" @click="showChangePassword" />
      <u-cell :title="$t('settings.items.bindPhone')" icon="phone" :isLink="true" @click="showNotImplemented" />
    </view>

    <!-- ===== 偏好设置 ===== -->
    <view class="group-card" :class="{ 'anim-in': animStep >= 2 }">
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
    <view class="group-card" :class="{ 'anim-in': animStep >= 3 }">
      <view class="group-title">{{ $t('settings.sections.about') }}</view>
      <u-cell :title="$t('settings.items.version')" icon="info-circle" :value="version" />
      <u-cell :title="$t('settings.items.terms')" icon="file-text" :isLink="true" @click="showNoTerms" />
      <u-cell :title="$t('settings.items.privacy')" icon="shield" :isLink="true" @click="showNoTerms" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/useAppStore'
import { useLang } from '@/hooks/useLang'

const { t } = useI18n()
const appStore = useAppStore()
const { currentLang, setLang } = useLang()

const version = 'v1.0.0'
const notifyEnabled = ref(true)

/** 入场动画步数 */
const animStep = ref(0)

/** ===== 入场动画序列 ===== */
onMounted(() => {
  const steps: [number, number][] = [[1, 80], [2, 220], [3, 380]]
  steps.forEach(([step, delay]) => {
    setTimeout(() => { animStep.value = step }, delay)
  })
})

/** ===== 动态标题 ===== */
onShow(() => {
  uni.setNavigationBarTitle({ title: t('settings.pageTitle') })
})

/** 深色模式开关 —— 双向绑定到 store */
const darkMode = computed({
  get: () => appStore.theme === 'dark',
  set: (val: boolean) => appStore.setTheme(val ? 'dark' : 'light'),
})

/** ===== 事件处理 ===== */
const onNotifyChange = (v: boolean): void => {
  uni.showToast({ title: t(v ? 'settings.toast.notifyOn' : 'settings.toast.notifyOff'), icon: 'none' })
}
const onDarkChange = (_v: boolean): void => {
  // darkMode computed 已自动同步到 store，只需提示
  uni.showToast({ title: appStore.theme === 'dark' ? '深色模式' : '浅色模式', icon: 'none' })
}
const showChangePassword = (): void => {
  uni.showToast({ title: t('settings.toast.changePassword'), icon: 'none' })
}
const showNotImplemented = (): void => {
  uni.showToast({ title: t('settings.toast.notImplemented'), icon: 'none' })
}
const showNoTerms = (): void => {
  uni.showToast({ title: t('settings.toast.noTerms'), icon: 'none' })
}
</script>

<style lang="scss" scoped>
@import 'animate.css';

/* ===== 页面容器 ===== */
.page {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding-top: 28rpx;
}

/* ===== 分组卡片 ===== */
.group-card {
  background: var(--bg-card);
  margin: 0 24rpx 24rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: var(--shadow-light);
  opacity: 0;
  transform: translateY(20rpx);

  &.anim-in { animation: fadeInUp 0.45s ease forwards; }

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

/* ===== 自定义 keyframes ===== */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
