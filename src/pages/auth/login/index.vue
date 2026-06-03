<!--
  登录页
  支持：邮箱登录、记住密码、跳转注册、跳转找回密码、微信小程序登录

  动画：品牌 Logo → 标题 → 表单（stagger 入场）
  深色模式：通过 CSS 自定义属性适配
  国际化：所有文案通过 $t() 引用
-->
<template>
  <view class="page-container" :class="[appStore.pageClass, { 'theme-dark': isDark }]">
    <!-- ===== 品牌 Logo 区 ===== -->
    <view class="brand-area">
      <view class="logo-wrapper">
        <image class="logo-img" src="/static/images/my-icon.png" mode="aspectFit" />
      </view>
    </view>

    <!-- ===== 标题区 ===== -->
    <view class="header-area">
      <text class="title">{{ $t('login.title') }}</text>
      <text class="subtitle">{{ $t('login.subtitle') }}</text>
    </view>

    <!-- ===== 表单区 ===== -->
    <view class="form-area">
      <!-- 邮箱输入框 -->
      <view class="input-wrapper" :class="{ 'is-focused': focusedField === 'email' }">
        <u-input
          v-model="form.email"
          :placeholder="$t('login.emailPlaceholder')"
          prefixIcon="email"
          clearable
          :customStyle="inputCustomStyle"
          @focus="focusedField = 'email'"
          @blur="focusedField = ''"
        />
      </view>

      <!-- 密码输入框 -->
      <view class="input-wrapper" :class="{ 'is-focused': focusedField === 'password' }">
        <u-input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="$t('login.passwordPlaceholder')"
          prefixIcon="lock"
          :customStyle="inputCustomStyle"
          @focus="focusedField = 'password'"
          @blur="focusedField = ''"
        />
        <!-- 密码可见切换 -->
        <view class="pwd-toggle" @click="showPassword = !showPassword">
          <text class="toggle-icon">{{ showPassword ? '🙈' : '👁️' }}</text>
        </view>
      </view>

      <!-- 记住密码 -->
      <view class="remember-row" @click="rememberPwd = !rememberPwd">
        <view class="remember-checkbox" :class="{ 'is-checked': rememberPwd }">
          <text v-if="rememberPwd" class="check-icon">✓</text>
        </view>
        <text class="remember-label">{{ $t('login.rememberPwd') }}</text>
      </view>

      <!-- 表单错误信息（带抖动动画） -->
      <view v-if="formError" class="form-error animate__animated animate__shakeX">
        <text class="error-text">{{ formError }}</text>
      </view>

      <!-- 链接区 -->
      <view class="links-area">
        <text class="link" @click="goRegister">{{ $t('login.registerLink') }}</text>
        <text class="link" @click="goForgotPassword">{{ $t('login.forgotPwdLink') }}</text>
      </view>

      <!-- 登录按钮 -->
      <view class="btn-wrapper">
        <u-button
          type="primary"
          :text="$t('login.loginBtn')"
          shape="circle"
          :loading="auth.loading.value"
          :customStyle="btnCustomStyle"
          @click="handleLogin"
        />
      </view>
    </view>

    <!-- ===== 微信小程序登录（仅 MP-WEIXIN 平台） ===== -->
    <!-- #ifdef MP-WEIXIN -->
    <view class="oauth-area">
      <view class="divider-row">
        <view class="divider-line" />
        <text class="divider-text">{{ $t('login.oauthDivider') }}</text>
        <view class="divider-line" />
      </view>
      <view class="oauth-buttons">
        <view class="oauth-btn oauth-btn--wechat" hover-class="oauth-btn--hover" @click="handleWechatLogin">
          <text class="oauth-icon-text">微</text>
          <text class="oauth-label">{{ $t('login.wechat') }}</text>
        </view>
      </view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/hooks/useAuth'
import { useAppStore } from '@/store/useAppStore'
import { isEmail, isStrongPassword } from '@/utils/validate'

/** ===== 认证 Hook ===== */
const auth = useAuth()
const appStore = useAppStore()

/** ===== i18n ===== */
const { t } = useI18n()

/** 当前页面是否处于深色模式（用于根元素 class 绑定，适配小程序端） */
const isDark = computed(() => appStore.theme === 'dark')

/** ===== 表单数据 ===== */
const form = reactive({ email: '', password: '' })

/** ===== UI 状态 ===== */

/** 当前聚焦的输入框字段名，空字符串表示无聚焦 */
const focusedField = ref('')

/** 是否显示密码明文 */
const showPassword = ref(false)

/** 是否记住密码（勾选后密码会 Base64 编码存入本地存储） */
const rememberPwd = ref(false)

/** 表单错误信息，空字符串表示无错误 */
const formError = ref('')

/** 已保存邮箱的存储键名 */
const SAVED_EMAIL_KEY = 'uni_supabase_saved_email'

/** 已保存密码的存储键名（Base64 编码存储） */
const SAVED_PASSWORD_KEY = 'uni_supabase_saved_password'

/** 是否记住密码的标记键名 */
const REMEMBER_PWD_KEY = 'uni_supabase_remember_pwd'

/** ===== 恢复已保存邮箱和密码 ===== */
onMounted(() => {
  // 恢复上次登录成功的邮箱，避免每次手动输入
  try {
    const savedEmail = uni.getStorageSync(SAVED_EMAIL_KEY)
    if (savedEmail && typeof savedEmail === 'string') {
      form.email = savedEmail
    }
  } catch {
    // 读取失败静默忽略，用户手动输入即可
  }

  // 恢复记住的密码：仅在用户之前勾选"记住密码"时才恢复
  try {
    const rememberFlag = uni.getStorageSync(REMEMBER_PWD_KEY)
    if (rememberFlag === true || rememberFlag === 'true') {
      const savedPassword = uni.getStorageSync(SAVED_PASSWORD_KEY)
      if (savedPassword && typeof savedPassword === 'string') {
        form.password = decodeURIComponent(savedPassword)
        rememberPwd.value = true
      }
    }
  } catch {
    // 读取失败静默忽略
  }
})

/** ===== 页面显示 ===== */
onShow(() => {
  // 使用原生导航栏，动态设置 i18n 标题
  // uni.setNavigationBarTitle({ title: t('login.pageTitle') })
})

/** ===== u-input 自定义样式（颜色由 CSS 变量控制，适配深色模式） ===== */
const inputCustomStyle = {
  fontSize: '30rpx',
  height: '96rpx',
}

/** ===== 登录按钮自定义样式（渐变用 CSS 变量，适配深色模式） ===== */
const btnCustomStyle = {
  height: '96rpx',
  fontSize: '34rpx',
  fontWeight: 'bold',
  letterSpacing: '8rpx',
  background: 'var(--color-primary-gradient)',
  border: 'none',
  boxShadow: '0 8rpx 24rpx var(--color-primary-shadow)',
}

/** ===== 邮箱登录 =====
 * 前端校验失败显示在表单内；服务端错误由 useAuth 内部 Toast 处理
 * 点击登录即持久化邮箱，避免下次重输（不论登录成功与否）
 */
async function handleLogin(): Promise<void> {
  formError.value = ''

  if (!isEmail(form.email)) {
    formError.value = t('login.validation.invalidEmail')
    return
  }
  if (!isStrongPassword(form.password)) {
    formError.value = t('login.validation.weakPassword')
    return
  }

  // 点击登录即保存邮箱，确保即使登录失败也记住（用户不用重新输入）
  try {
    uni.setStorageSync(SAVED_EMAIL_KEY, form.email)
  } catch {
    // 写入失败静默忽略
  }

  // 记住密码：勾选时编码存储密码和标记，未勾选时清除已存密码
  try {
    if (rememberPwd.value) {
      uni.setStorageSync(REMEMBER_PWD_KEY, true)
      uni.setStorageSync(SAVED_PASSWORD_KEY, encodeURIComponent(form.password))
    } else {
      uni.removeStorageSync(SAVED_PASSWORD_KEY)
      uni.setStorageSync(REMEMBER_PWD_KEY, false)
    }
  } catch {
    // 写入失败静默忽略
  }

  await auth.login(form.email, form.password)
}

/** ===== 微信登录（占位） ===== */
function handleWechatLogin(): void {
  uni.showToast({ title: '微信登录（待配置 Edge Function）', icon: 'none' })
}

/** ===== 页面跳转 ===== */
function goRegister(): void {
  uni.navigateTo({ url: '/pages/auth/register/index' })
}
function goForgotPassword(): void {
  uni.navigateTo({ url: '/pages/auth/forgot-password/index' })
}
</script>

<style lang="scss" scoped>

/* ===== 页面容器 ===== */
.page-container {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 0 56rpx;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ===== 品牌 Logo ===== */
.brand-area {
  margin-top: 140rpx;
  position: relative;
  z-index: 1;
}

.logo-wrapper {
  width: 140rpx; height: 140rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.logo-img { width: 150rpx; height: 150rpx; }

/* ===== 标题 ===== */
.header-area {
  margin-top: 48rpx;
  text-align: center;
  position: relative;
  z-index: 1;
}

.title {
  font-size: 52rpx;
  font-weight: 700;
  color: var(--text-primary);
  display: block;
  letter-spacing: 2rpx;
}

.subtitle {
  font-size: 28rpx;
  color: var(--text-secondary);
  display: block;
  margin-top: 12rpx;
}

/* ===== 表单 ===== */
.form-area {
  width: 100%;
  margin-top: 64rpx;
  position: relative;
  z-index: 1;
}

/* 输入框包装 */
.input-wrapper {
  position: relative;
  margin-bottom: 24rpx;
  border-radius: 20rpx;
  background: var(--bg-input);
  padding: 0 8rpx;
  border: 2rpx solid transparent;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;

  &.is-focused {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 8rpx var(--color-primary-light);
    background: var(--bg-primary);
  }

  :deep(.u-input) { border: none !important; }
  :deep(.u-input__content) { border: none !important; background: transparent !important; }
}

/* 密码切换 */
.pwd-toggle { position: absolute; right: 20rpx; top: 50%; transform: translateY(-50%); z-index: 3; padding: 8rpx; }
.toggle-icon { font-size: 36rpx; opacity: 0.5; }

/* 记住密码复选框 */
.remember-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  padding: 12rpx 0;
}

.remember-checkbox {
  width: 36rpx;
  height: 36rpx;
  border-radius: 8rpx;
  border: 2rpx solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
  transition: all 0.2s ease;

  &.is-checked {
    background: var(--color-primary);
    border-color: var(--color-primary);
  }
}

.check-icon {
  font-size: 24rpx;
  color: #fff;
  font-weight: bold;
}

.remember-label {
  font-size: 26rpx;
  color: var(--text-secondary);
}

/* 表单错误 */
.form-error {
  padding: 16rpx 24rpx;
  margin-bottom: 8rpx;
  background: var(--bg-error);
  border-radius: 12rpx;
  border: 1rpx solid var(--border-error);
}
.error-text { font-size: 26rpx; color: var(--color-error); line-height: 1.5; }

/* 链接区 */
.links-area {
  display: flex;
  justify-content: space-between;
  margin: 20rpx 0 40rpx;

  .link {
    font-size: 26rpx;
    color: var(--color-link);
    transition: opacity 0.2s;
    &:active { opacity: 0.6; }
  }
}

/* 按钮 */
.btn-wrapper {
  :deep(.u-button) {
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    &:active { transform: scale(0.97); }
  }
}

/* ===== OAuth 区（仅小程序） ===== */
.oauth-area {
  width: 100%;
  margin-top: 72rpx;
  padding-bottom: 60rpx;
  position: relative;
  z-index: 1;
}

.divider-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
}
.divider-line { flex: 1; height: 2rpx; background: var(--divider); max-width: 80rpx; }
.divider-text { font-size: 24rpx; color: var(--text-secondary); white-space: nowrap; }

.oauth-buttons {
  display: flex;
  justify-content: center;
  gap: 36rpx;
  margin-top: 36rpx;
}

.oauth-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 160rpx; height: 140rpx;
  border-radius: 24rpx;
  background: var(--oauth-button-bg);
  border: 2rpx solid var(--border-color);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;

  &--wechat {
    background: var(--wechat-bg);
    border-color: var(--wechat-border);
  }
}

.oauth-btn--hover {
  transform: translateY(-6rpx);
  box-shadow: var(--shadow-oauth);
  border-color: var(--color-primary);
}

.oauth-icon-text { font-size: 48rpx; font-weight: 700; color: var(--text-primary); margin-bottom: 8rpx; }
.oauth-label { font-size: 24rpx; color: var(--text-secondary); }

</style>
