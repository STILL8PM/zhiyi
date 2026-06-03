<!--
  找回密码页
  输入注册邮箱，发送密码重置邮件

  动画：图标 → 标题 → 表单 → 提示（stagger）
  深色模式：通过 CSS 自定义属性适配
  国际化：所有文案通过 $t() 引用
-->
<template>
  <view
    class="page-container"
    :class="[appStore.pageClass, { 'theme-dark': isDark }]"
  >
    <!-- ===== 表单区 ===== -->
    <view class="form-area">
      <!-- 邮箱输入框 -->
      <view
        class="input-wrapper"
        :class="{ 'is-focused': focusedField === 'email' }"
      >
        <u-input
          v-model="form.email"
          :placeholder="$t('forgotPwd.emailPlaceholder')"
          prefixIcon="email"
          clearable
          :customStyle="inputCustomStyle"
          @focus="focusedField = 'email'"
          @blur="focusedField = ''"
        />
      </view>

      <!-- 表单错误 -->
      <view
        v-if="formError"
        class="form-error animate__animated animate__shakeX"
      >
        <text class="error-text">{{ formError }}</text>
      </view>

      <!-- 发送按钮 -->
      <view class="btn-wrapper">
        <u-button
          type="primary"
          :text="$t('forgotPwd.sendBtn')"
          shape="circle"
          :loading="loading"
          :customStyle="btnCustomStyle"
          @click="handleReset"
        />
      </view>

      <!-- 提示信息 -->
      <view class="tip-area">
        <text class="tip-text">{{ $t("forgotPwd.tip") }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { useI18n } from "vue-i18n";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/useAppStore";
import { isEmail } from "@/utils/validate";

/** ===== 认证 Hook ===== */
const auth = useAuth();
const appStore = useAppStore();

/** ===== i18n ===== */
const { t } = useI18n();

/** 当前页面是否处于深色模式（用于根元素 class 绑定，适配小程序端） */
const isDark = computed(() => appStore.theme === "dark");

/** ===== 表单数据 ===== */
const form = reactive({ email: "" });

/** ===== UI 状态 ===== */
const loading = ref(false);
const focusedField = ref("");
const formError = ref("");

/** ===== 页面显示 ===== */
onShow(() => {
  // 使用原生导航栏，动态设置 i18n 标题
  uni.setNavigationBarTitle({ title: t("forgotPwd.pageTitle") });
});

/** ===== 输入框样式（颜色由 CSS 变量控制，适配深色模式） ===== */
const inputCustomStyle = {
  fontSize: "30rpx",
  height: "96rpx",
};

/** ===== 按钮样式（渐变用 CSS 变量，适配深色模式） ===== */
const btnCustomStyle = {
  height: "96rpx",
  fontSize: "34rpx",
  fontWeight: "bold",
  letterSpacing: "4rpx",
  background: "var(--color-primary-gradient)",
  border: "none",
  boxShadow: "0 8rpx 24rpx var(--color-primary-shadow)",
  marginTop: "48rpx",
};

/** ===== 发送重置邮件 ===== */
async function handleReset(): Promise<void> {
  formError.value = "";

  if (!isEmail(form.email)) {
    formError.value = t("forgotPwd.validation.invalidEmail");
    return;
  }

  loading.value = true;
  await auth.forgotPassword(form.email);
  loading.value = false;
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
  width: 140rpx;
  height: 140rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.logo-img {
  width: 150rpx;
  height: 150rpx;
}

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
  line-height: 1.6;
}

/* ===== 表单 ===== */
.form-area {
  width: 100%;
  margin-top: 64rpx;
  position: relative;
  z-index: 1;
}

.input-wrapper {
  position: relative;
  margin-bottom: 24rpx;
  border-radius: 20rpx;
  background: var(--bg-input);
  padding: 0 8rpx;
  border: 2rpx solid transparent;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    background 0.3s ease;

  &.is-focused {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 8rpx var(--color-primary-light);
    background: var(--bg-primary);
  }

  :deep(.u-input) {
    border: none !important;
  }
  :deep(.u-input__content) {
    border: none !important;
    background: transparent !important;
  }
}

.form-error {
  padding: 16rpx 24rpx;
  margin-bottom: 8rpx;
  background: var(--bg-error);
  border-radius: 12rpx;
  border: 1rpx solid var(--border-error);
}
.error-text {
  font-size: 26rpx;
  color: var(--color-error);
  line-height: 1.5;
}

.btn-wrapper {
  :deep(.u-button) {
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
    &:active {
      transform: scale(0.97);
    }
  }
}

/* ===== 提示区 ===== */
.tip-area {
  text-align: center;
  margin-top: 36rpx;
}

.tip-text {
  font-size: 24rpx;
  color: var(--text-secondary);
}
</style>
