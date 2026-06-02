<!--
  注册页 —— 邮箱注册
  包含密码强度校验和确认密码验证

  动画：品牌图标 → 标题 → 表单 → 底部链接（stagger）
  深色模式：通过 CSS 自定义属性适配
  国际化：所有文案通过 $t() 引用
-->
<template>
  <view class="page-container">
    <!-- ===== 背景装饰 ===== -->
    <view class="bg-decor">
      <view class="bg-circle bg-circle--1" />
      <view class="bg-circle bg-circle--2" />
    </view>

    <!-- ===== 品牌图标区 ===== -->
    <view class="brand-area" :class="{ 'anim-in': animStep >= 1 }">
      <view class="icon-wrapper">
        <text class="brand-icon">✨</text>
      </view>
    </view>

    <!-- ===== 标题区 ===== -->
    <view class="header-area" :class="{ 'anim-in': animStep >= 2 }">
      <text class="title">{{ $t('register.title') }}</text>
      <text class="subtitle">{{ $t('register.subtitle') }}</text>
    </view>

    <!-- ===== 表单区 ===== -->
    <view class="form-area" :class="{ 'anim-in': animStep >= 3 }">
      <!-- 用户名 -->
      <view class="input-wrapper" :class="{ 'is-focused': focusedField === 'username' }">
        <u-input
          v-model="form.username"
          :placeholder="$t('register.usernamePlaceholder')"
          prefixIcon="account"
          clearable
          :customStyle="inputCustomStyle"
          @focus="focusedField = 'username'"
          @blur="focusedField = ''"
        />
      </view>

      <!-- 邮箱 -->
      <view class="input-wrapper" :class="{ 'is-focused': focusedField === 'email' }">
        <u-input
          v-model="form.email"
          :placeholder="$t('register.emailPlaceholder')"
          prefixIcon="email"
          clearable
          :customStyle="inputCustomStyle"
          @focus="focusedField = 'email'"
          @blur="focusedField = ''"
        />
      </view>

      <!-- 密码 -->
      <view class="input-wrapper" :class="{ 'is-focused': focusedField === 'password' }">
        <u-input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="$t('register.passwordPlaceholder')"
          prefixIcon="lock"
          :customStyle="inputCustomStyle"
          @focus="focusedField = 'password'"
          @blur="focusedField = ''"
        />
        <view class="pwd-toggle" @click="showPassword = !showPassword">
          <text class="toggle-icon">{{ showPassword ? '🙈' : '👁️' }}</text>
        </view>
      </view>

      <!-- 确认密码 -->
      <view class="input-wrapper" :class="{ 'is-focused': focusedField === 'confirmPassword' }">
        <u-input
          v-model="form.confirmPassword"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="$t('register.confirmPwdPlaceholder')"
          prefixIcon="lock"
          :customStyle="inputCustomStyle"
          @focus="focusedField = 'confirmPassword'"
          @blur="focusedField = ''"
        />
      </view>

      <!-- 表单错误 -->
      <view v-if="formError" class="form-error">
        <text class="error-text">{{ formError }}</text>
      </view>

      <!-- 注册按钮 -->
      <view class="btn-wrapper">
        <u-button
          type="primary"
          :text="$t('register.registerBtn')"
          shape="circle"
          :loading="auth.loading.value"
          :customStyle="btnCustomStyle"
          @click="handleRegister"
        />
      </view>
    </view>

    <!-- ===== 底部跳转 ===== -->
    <view class="footer-link" :class="{ 'anim-in': animStep >= 4 }">
      <text>{{ $t('register.footerHasAccount') }}</text>
      <text class="link" @click="goLogin">{{ $t('register.footerLogin') }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/hooks/useAuth'
import { isEmail, isStrongPassword, isPasswordMatch } from '@/utils/validate'

/** ===== 认证 Hook ===== */
const auth = useAuth()

/** ===== i18n ===== */
const { t } = useI18n()

/** ===== 表单数据 ===== */
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

/** ===== UI 状态 ===== */
const animStep = ref(0)
const focusedField = ref('')
const showPassword = ref(false)
const formError = ref('')

/** ===== 入场动画序列 ===== */
onMounted(() => {
  const steps: [number, number][] = [[1, 80], [2, 200], [3, 380], [4, 560]]
  steps.forEach(([step, delay]) => {
    setTimeout(() => { animStep.value = step }, delay)
  })
})

/** ===== 动态设置导航栏标题 ===== */
onShow(() => {
  uni.setNavigationBarTitle({ title: t('register.pageTitle') })
})

/** ===== u-input 自定义样式 ===== */
const inputCustomStyle = {
  fontSize: '30rpx',
  color: '#333',
  height: '96rpx',
}

/** ===== 注册按钮样式 ===== */
const btnCustomStyle = {
  height: '96rpx',
  fontSize: '34rpx',
  fontWeight: 'bold',
  letterSpacing: '8rpx',
  background: 'linear-gradient(135deg, #2979FF 0%, #4A90D9 100%)',
  border: 'none',
  boxShadow: '0 8rpx 24rpx rgba(41, 121, 255, 0.35)',
  marginTop: '48rpx',
}

/** ===== 邮箱注册 ===== */
async function handleRegister(): Promise<void> {
  formError.value = ''

  if (!isEmail(form.email)) {
    formError.value = t('register.validation.invalidEmail')
    return
  }
  if (!isStrongPassword(form.password)) {
    formError.value = t('register.validation.weakPassword')
    return
  }
  if (!isPasswordMatch(form.password, form.confirmPassword)) {
    formError.value = t('register.validation.passwordMismatch')
    return
  }

  await auth.register(form.email, form.password, form.username || undefined)
}

/** 返回登录页 */
function goLogin(): void {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>

/* ===== 页面容器 & 背景 ===== */
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
  background: linear-gradient(135deg, rgba(41, 121, 255, 0.06) 0%, rgba(74, 144, 217, 0.03) 100%);

  &--1 {
    width: 480rpx; height: 480rpx;
    top: -240rpx; right: -140rpx;
    animation: bgFloat1 8s ease-in-out infinite;
  }
  &--2 {
    width: 320rpx; height: 320rpx;
    top: -60rpx; left: -100rpx;
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

/* ===== 品牌图标 ===== */
.brand-area {
  margin-top: 120rpx;
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateY(-30rpx);

  &.anim-in { animation: fadeInDown 0.6s ease forwards; }
}

.icon-wrapper {
  width: 120rpx; height: 120rpx;
  border-radius: 32rpx;
  background: var(--color-primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 32rpx rgba(41, 121, 255, 0.25);
}

.brand-icon { font-size: 56rpx; }

/* ===== 标题 ===== */
.header-area {
  margin-top: 40rpx;
  text-align: center;
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateY(20rpx);

  &.anim-in { animation: fadeInUp 0.55s ease forwards; }
}

.title { font-size: 48rpx; font-weight: 700; color: var(--text-primary); display: block; }
.subtitle { font-size: 28rpx; color: var(--text-secondary); display: block; margin-top: 12rpx; }

/* ===== 表单 ===== */
.form-area {
  width: 100%;
  margin-top: 56rpx;
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateY(24rpx);

  &.anim-in { animation: fadeInUp 0.5s ease forwards; }
}

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
    box-shadow: 0 0 0 8rpx rgba(41, 121, 255, 0.06);
    background: var(--bg-primary);
  }

  :deep(.u-input) { border: none !important; }
  :deep(.u-input__content) { border: none !important; background: transparent !important; }
}

.pwd-toggle { position: absolute; right: 20rpx; top: 50%; transform: translateY(-50%); z-index: 3; padding: 8rpx; }
.toggle-icon { font-size: 36rpx; opacity: 0.5; }

.form-error {
  padding: 16rpx 24rpx;
  margin-bottom: 8rpx;
  background: var(--bg-error);
  border-radius: 12rpx;
  border: 1rpx solid var(--border-error);
  animation: shakeX 0.5s ease;
}
.error-text { font-size: 26rpx; color: var(--color-error); line-height: 1.5; }

.btn-wrapper {
  :deep(.u-button) {
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    &:active { transform: scale(0.97); }
  }
}

/* ===== 底部跳转 ===== */
.footer-link {
  text-align: center;
  margin-top: 48rpx;
  font-size: 28rpx;
  color: var(--text-secondary);
  position: relative;
  z-index: 1;
  padding-bottom: 60rpx;
  opacity: 0;
  transform: translateY(16rpx);

  &.anim-in { animation: fadeInUp 0.4s ease forwards; }

  .link {
    color: var(--color-link);
    margin-left: 8rpx;
    transition: opacity 0.2s;
    &:active { opacity: 0.6; }
  }
}

/* ===== 自定义 keyframes ===== */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24rpx); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-30rpx); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shakeX {
  0%, 100% { transform: translateX(0); }
  10%, 50%, 90% { transform: translateX(-8rpx); }
  30%, 70% { transform: translateX(8rpx); }
}
</style>
