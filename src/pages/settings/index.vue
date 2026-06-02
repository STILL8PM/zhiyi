<!--
  设置页
  个人资料编辑、修改密码、通知偏好、深色模式、语言切换、关于信息

  动画：分组卡片依次淡入上滑
  深色模式：通过 CSS 自定义属性适配，开关接入 useAppStore
  国际化：所有文案通过 $t() 引用
-->
<template>
  <view class="page">
    <!-- ===== 个人资料 ===== -->
    <view class="group-card" :class="{ 'anim-in': animStep >= 1 }">
      <view class="group-title">{{ $t('settings.sections.profile') }}</view>

      <!-- 头像 -->
      <view class="avatar-edit-row" @click="handleChangeAvatar">
        <view class="avatar-preview">
          <image
            class="avatar-img"
            :src="avatarPreviewUrl"
            mode="aspectFill"
          />
          <view v-if="avatarUploading" class="avatar-uploading-mask">
            <u-loading-icon mode="circle" size="24" />
          </view>
          <view v-else class="avatar-edit-badge">
            <text class="badge-icon">📷</text>
          </view>
        </view>
        <view class="avatar-hint">
          <text class="avatar-label">{{ $t('settings.items.avatar') }}</text>
          <text class="avatar-tip">点击更换头像</text>
        </view>
      </view>

      <!-- 用户名 -->
      <view class="profile-field">
        <view class="field-label">
          <text class="label-icon">👤</text>
          <text>{{ $t('settings.items.username') }}</text>
        </view>
        <u-input
          v-model="profileForm.username"
          :placeholder="$t('settings.placeholder.username')"
          border="bottom"
          clearable
          :customStyle="{ padding: '12rpx 0' }"
        />
      </view>

      <!-- 个人简介 -->
      <view class="profile-field">
        <view class="field-label">
          <text class="label-icon">📝</text>
          <text>{{ $t('settings.items.bio') }}</text>
        </view>
        <u-input
          v-model="profileForm.bio"
          :placeholder="$t('settings.placeholder.bio')"
          border="bottom"
          clearable
          :customStyle="{ padding: '12rpx 0' }"
        />
      </view>

      <!-- 手机号 -->
      <view class="profile-field">
        <view class="field-label">
          <text class="label-icon">📱</text>
          <text>{{ $t('settings.items.phone') }}</text>
        </view>
        <u-input
          v-model="profileForm.phone"
          :placeholder="$t('settings.placeholder.phone')"
          border="bottom"
          clearable
          type="number"
          maxlength="11"
          :customStyle="{ padding: '12rpx 0' }"
        />
      </view>

      <!-- 保存按钮 -->
      <view class="save-btn-wrapper">
        <u-button
          type="primary"
          :text="$t('common.save')"
          shape="circle"
          :loading="userStore.loading"
          :customStyle="saveBtnStyle"
          @click="handleSaveProfile"
        />
      </view>
    </view>

    <!-- ===== 账号安全 ===== -->
    <view class="group-card" :class="{ 'anim-in': animStep >= 2 }">
      <view class="group-title">{{ $t('settings.sections.security') }}</view>
      <u-cell :title="$t('settings.items.changePassword')" icon="lock" :isLink="true" @click="showChangePassword" />
      <u-cell :title="$t('settings.items.bindPhone')" icon="phone" :isLink="true" @click="showNotImplemented" />
    </view>

    <!-- ===== 偏好设置 ===== -->
    <view class="group-card" :class="{ 'anim-in': animStep >= 3 }">
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
    <view class="group-card" :class="{ 'anim-in': animStep >= 4 }">
      <view class="group-title">{{ $t('settings.sections.about') }}</view>
      <u-cell :title="$t('settings.items.version')" icon="info-circle" :value="version" />
      <u-cell :title="$t('settings.items.terms')" icon="file-text" :isLink="true" @click="showNoTerms" />
      <u-cell :title="$t('settings.items.privacy')" icon="shield" :isLink="true" @click="showNoTerms" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useLang } from '@/hooks/useLang'
import { useUpload } from '@/hooks/useUpload'

const { t } = useI18n()
const appStore = useAppStore()
const userStore = useUserStore()
const { currentLang, setLang } = useLang()
const { uploading: avatarUploading, chooseAndUploadImage } = useUpload()

const version = 'v1.0.0'
const notifyEnabled = ref(true)

/** 入场动画步数：1=资料 2=安全 3=偏好 4=关于 */
const animStep = ref(0)

// ===== 个人资料表单 =====
// 用 watch 监听 userStore.profile 变化，自动回填表单
const profileForm = reactive({
  username: '',
  bio: '',
  phone: '',
})

/** 已选择但尚未保存的头像 URL（临时预览用） */
const pendingAvatarUrl = ref<string | null>(null)

/** 头像预览地址：优先用已选未保存的，其次用 store 中的，最后兜底 */
const avatarPreviewUrl = computed(() =>
  pendingAvatarUrl.value || userStore.getAvatarUrl(),
)

/** 资料加载完成后回填表单 */
watch(
  () => userStore.profile,
  (p) => {
    if (p) {
      profileForm.username = p.username || ''
      profileForm.bio = p.bio || ''
      profileForm.phone = p.phone || ''
    }
  },
  { immediate: true },
)

/** 更换头像：选择图片 → 上传到 avatars 桶 → 暂存 URL（等点保存才写入 profiles） */
async function handleChangeAvatar(): Promise<void> {
  if (avatarUploading.value) return

  // 如果没有拉取过资料，先拉取（需要 userId）
  if (!userStore.isFetched) {
    await userStore.fetchProfile()
  }

  const authStore = useAuthStore()
  const userId = authStore.userId
  if (!userId) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  const url = await chooseAndUploadImage('avatars', userId)
  if (url) {
    pendingAvatarUrl.value = url
    uni.showToast({ title: '头像已选择，点击保存生效', icon: 'success' })
  }
}

/** 保存个人资料 */
async function handleSaveProfile(): Promise<void> {
  // 先确保资料已拉取
  if (!userStore.isFetched) {
    await userStore.fetchProfile()
  }
  await userStore.saveProfile({
    username: profileForm.username || null,
    bio: profileForm.bio || null,
    phone: profileForm.phone || null,
    avatar_url: pendingAvatarUrl.value || undefined,
  })
  // 保存成功后清除临时头像
  pendingAvatarUrl.value = null
}

/** 保存按钮样式 */
const saveBtnStyle = {
  height: '72rpx',
  fontSize: '28rpx',
  marginTop: '16rpx',
}

/** ===== 入场动画序列（4 组） ===== */
onMounted(() => {
  const steps: [number, number][] = [[1, 80], [2, 200], [3, 340], [4, 480]]
  steps.forEach(([step, delay]) => {
    setTimeout(() => { animStep.value = step }, delay)
  })
  // 若 store 中尚无资料，主动拉取
  if (!userStore.isFetched) {
    userStore.fetchProfile()
  }
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

/* ===== 个人资料编辑区 ===== */

/* 头像编辑行 */
.avatar-edit-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 16rpx 28rpx;
  transition: background 0.2s;
  &:active { background: var(--bg-input); }
}

.avatar-preview {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  flex-shrink: 0;
}

.avatar-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: var(--bg-input);
}

.avatar-uploading-mask {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-edit-badge {
  position: absolute;
  right: -4rpx;
  bottom: -4rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(41, 121, 255, 0.35);
}

.badge-icon { font-size: 24rpx; }

.avatar-hint {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.avatar-label {
  font-size: 28rpx;
  color: var(--text-primary);
  font-weight: 500;
}

.avatar-tip {
  font-size: 22rpx;
  color: var(--text-secondary);
}

/* 输入字段 */
.profile-field {
  padding: 8rpx 28rpx;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 16rpx;
  font-size: 26rpx;
  color: var(--text-primary);
}

.label-icon { font-size: 28rpx; }

.save-btn-wrapper {
  padding: 12rpx 28rpx 24rpx;

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

/* ===== 自定义 keyframes ===== */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
