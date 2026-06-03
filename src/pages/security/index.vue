<!--
  账号安全页 —— 独立的账号安全管理页面
  修改密码、绑定手机、注销账户等安全相关操作

  动画：分组卡片依次淡入上滑
  深色模式：通过 CSS 自定义属性适配
  国际化：所有文案通过 $t() 引用
-->
<template>
  <view class="page" :class="[appStore.pageClass, { 'theme-dark': isDark }]">
    <!-- ===== 密码管理 ===== -->
    <view class="group-card">
      <view class="group-title">{{ $t('security.sections.password') }}</view>
      <u-cell :title="$t('settings.items.changePassword')" icon="lock" :isLink="true" @click="showChangePassword" />
    </view>

    <!-- ===== 手机绑定 ===== -->
    <view class="group-card">
      <view class="group-title">{{ $t('security.sections.phone') }}</view>
      <u-cell :title="$t('settings.items.bindPhone')" icon="phone" :isLink="true" @click="showNotImplemented" />
    </view>

    <!-- ===== 高级安全 ===== -->
    <view class="group-card">
      <view class="group-title">{{ $t('security.sections.advanced') }}</view>
      <u-cell :title="$t('security.items.logoutAll')" icon="error-circle" :isLink="true" @click="showNotImplemented" />
      <u-cell :title="$t('security.items.deleteAccount')" icon="trash" :isLink="true" @click="showNotImplemented" />
    </view>

    <!-- ===== 修改密码弹窗 ===== -->
    <view v-if="pwdModalVisible" class="modal-overlay animate__animated animate__fadeIn" @click="closePwdModal">
      <view class="modal-card animate__animated animate__bounceIn" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ $t('settings.changePassword.title') }}</text>
          <view class="modal-close" @click="closePwdModal">
            <text class="close-icon">✕</text>
          </view>
        </view>

        <view class="modal-body">
          <!-- 新密码 -->
          <view class="pwd-field">
            <view class="field-label">
              <text class="label-icon">🔒</text>
              <text>{{ $t('settings.changePassword.newPassword') }}</text>
            </view>
            <u-input
              v-model="pwdForm.newPassword"
              :type="showPwd ? 'text' : 'password'"
              :placeholder="$t('settings.changePassword.newPasswordPlaceholder')"
              border="bottom"
              clearable
              :customStyle="{ padding: '12rpx 0' }"
            />
          </view>

          <!-- 确认新密码 -->
          <view class="pwd-field">
            <view class="field-label">
              <text class="label-icon">🔒</text>
              <text>{{ $t('settings.changePassword.confirmPassword') }}</text>
            </view>
            <u-input
              v-model="pwdForm.confirmPassword"
              :type="showPwd ? 'text' : 'password'"
              :placeholder="$t('settings.changePassword.confirmPasswordPlaceholder')"
              border="bottom"
              clearable
              :customStyle="{ padding: '12rpx 0' }"
            />
          </view>

          <!-- 密码可见切换 -->
          <view class="pwd-toggle-row" @click="showPwd = !showPwd">
            <text class="toggle-icon">{{ showPwd ? '🙈' : '👁️' }}</text>
            <text class="toggle-text">{{ showPwd ? '隐藏密码' : '显示密码' }}</text>
          </view>

          <!-- 错误提示 -->
          <view v-if="pwdError" class="pwd-error animate__animated animate__shakeX">
            <text class="error-text">{{ pwdError }}</text>
          </view>
        </view>

        <view class="modal-footer">
          <u-button
            :text="$t('common.cancel')"
            shape="circle"
            :customStyle="cancelBtnStyle"
            @click="closePwdModal"
          />
          <u-button
            type="primary"
            :text="$t('common.save')"
            shape="circle"
            :loading="pwdSaving"
            :customStyle="confirmBtnStyle"
            @click="handleChangePassword"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/useAppStore'
import { updatePassword } from '@/api/auth'
import { isStrongPassword } from '@/utils/validate'

const { t } = useI18n()
const appStore = useAppStore()

/** 当前页面是否处于深色模式（用于根元素 class 绑定，适配小程序端） */
const isDark = computed(() => appStore.theme === 'dark')

// ===== 修改密码弹窗状态 =====

/** 是否显示修改密码弹窗 */
const pwdModalVisible = ref(false)
/** 是否显示密码明文 */
const showPwd = ref(false)
/** 是否正在提交 */
const pwdSaving = ref(false)
/** 表单错误信息 */
const pwdError = ref('')
/** 密码表单 */
const pwdForm = reactive({
  newPassword: '',
  confirmPassword: '',
})

/** 打开修改密码弹窗 */
function showChangePassword(): void {
  pwdForm.newPassword = ''
  pwdForm.confirmPassword = ''
  pwdError.value = ''
  showPwd.value = false
  pwdModalVisible.value = true
}

/** 关闭弹窗 */
function closePwdModal(): void {
  pwdModalVisible.value = false
}

/** 提交修改密码 */
async function handleChangePassword(): Promise<void> {
  pwdError.value = ''

  // 前端校验
  if (!isStrongPassword(pwdForm.newPassword)) {
    pwdError.value = t('settings.changePassword.validation.weakPassword')
    return
  }
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    pwdError.value = t('settings.changePassword.validation.mismatch')
    return
  }

  pwdSaving.value = true
  try {
    const { error } = await updatePassword(pwdForm.newPassword)
    if (error) {
      pwdError.value = (error as { message?: string }).message || t('settings.changePassword.failed')
      pwdSaving.value = false
      return
    }
    uni.showToast({ title: t('settings.changePassword.success'), icon: 'success' })
    closePwdModal()
  } catch {
    pwdError.value = t('settings.changePassword.failed')
  } finally {
    pwdSaving.value = false
  }
}

/** 弹窗按钮样式 */
const cancelBtnStyle = {
  height: '72rpx',
  fontSize: '28rpx',
  width: '45%',
}
const confirmBtnStyle = {
  height: '72rpx',
  fontSize: '28rpx',
  width: '45%',
}

/** 功能待开发占位 */
function showNotImplemented(): void {
  uni.showToast({ title: t('settings.toast.notImplemented'), icon: 'none' })
}

/** ===== 页面显示 ===== */
onShow(() => {
  // 使用原生导航栏，动态设置 i18n 标题
  uni.setNavigationBarTitle({ title: t('security.pageTitle') })
})
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

/* ===== 修改密码弹窗 ===== */

/* 遮罩层 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* 弹窗卡片 */
.modal-card {
  width: 86%;
  max-width: 640rpx;
  background: var(--bg-card);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx 0;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.modal-close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:active { background: var(--border-color); }
}

.close-icon {
  font-size: 28rpx;
  color: var(--text-secondary);
}

.modal-body {
  padding: 24rpx 32rpx 8rpx;
}

.pwd-field {
  margin-bottom: 8rpx;
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

/* 密码可见切换行 */
.pwd-toggle-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 0;
  transition: opacity 0.2s;

  &:active { opacity: 0.6; }
}

.toggle-icon { font-size: 32rpx; }

.toggle-text {
  font-size: 24rpx;
  color: var(--text-secondary);
}

/* 错误提示 */
.pwd-error {
  padding: 16rpx 24rpx;
  margin-top: 8rpx;
  background: var(--bg-error);
  border-radius: 12rpx;
  border: 1rpx solid var(--border-error);
}

.error-text { font-size: 26rpx; color: var(--color-error); line-height: 1.5; }

/* 弹窗底部按钮 */
.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 16rpx 32rpx 28rpx;

  :deep(.u-button) {
    transition: transform 0.15s ease;
    &:active { transform: scale(0.97); }
  }
}

</style>
