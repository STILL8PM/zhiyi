<!--
  编辑资料页 —— 独立的个人资料编辑页面
  从头像、用户名、简介、手机号均可在此修改

  动画：分组卡片淡入上滑
  深色模式：通过 CSS 自定义属性适配
  国际化：所有文案通过 $t() 引用
-->
<template>
  <view class="page" :class="[appStore.pageClass, { 'theme-dark': isDark }]">
    <!-- ===== 背景装饰层 ===== -->
    <view class="bg-decor">
      <view class="bg-circle bg-circle--1" />
      <view class="bg-circle bg-circle--2" />
    </view>

    <!-- ===== 个人资料编辑 ===== -->
    <view class="group-card animate__animated animate__fadeInUp">
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
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/useAppStore'
import { useUserStore } from '@/store/useUserStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useUpload } from '@/hooks/useUpload'

const { t } = useI18n()
const appStore = useAppStore()
const userStore = useUserStore()
const { uploading: avatarUploading, chooseAndUploadImage } = useUpload()

/** 当前页面是否处于深色模式（用于根元素 class 绑定，适配小程序端） */
const isDark = computed(() => appStore.theme === 'dark')

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

/** ===== 页面显示 ===== */
onShow(() => {
  // 使用原生导航栏，动态设置 i18n 标题
  uni.setNavigationBarTitle({ title: t('profile.pageTitle') })

  // 若 store 中尚无资料，主动拉取
  if (!userStore.isFetched) {
    userStore.fetchProfile()
  }
})
</script>

<style lang="scss" scoped>

/* ===== 页面容器 & 背景装饰 ===== */
.page {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 0 56rpx;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 背景浮动圆 */
.bg-decor {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 500rpx;
  pointer-events: none;
  z-index: 0;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary-light), transparent);

  &--1 {
    width: 520rpx; height: 520rpx;
    top: -260rpx; right: -160rpx;
    animation: bgFloat1 8s ease-in-out infinite;
  }
  &--2 {
    width: 360rpx; height: 360rpx;
    top: -80rpx; left: -120rpx;
    animation: bgFloat2 10s ease-in-out infinite;
  }
}

@keyframes bgFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30rpx, 20rpx) scale(1.05); }
}
@keyframes bgFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20rpx, -16rpx) scale(1.08); }
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

/* ===== 头像编辑行 ===== */
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
  box-shadow: 0 2rpx 8rpx var(--color-primary-shadow);
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

/* ===== 输入字段 ===== */
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

</style>
