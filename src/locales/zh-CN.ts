/**
 * 中文语言包
 *
 * 结构：按页面/模块分组，common 为公共文案
 * 键名使用 camelCase，方便在模板中通过 $t() 引用
 */
export default {
  /** 公共文案 */
  common: {
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    loading: '加载中...',
  },

  /** TabBar */
  tabBar: {
    home: '首页',
    user: '我的',
  },

  /** 启动页 */
  splash: {
    appName: 'uni-supabase-app',
    subtitle: 'uni-app + Supabase 全端应用',
  },

  /** 登录页 */
  login: {
    pageTitle: '登录',
    title: '欢迎回来',
    subtitle: '登录你的账号',
    emailPlaceholder: '请输入邮箱',
    passwordPlaceholder: '请输入密码',
    loginBtn: '登 录',
    registerLink: '注册账号',
    forgotPwdLink: '忘记密码？',
    oauthDivider: '其他登录方式',
    google: 'Google',
    wechat: '微信',
    validation: {
      invalidEmail: '请输入正确的邮箱地址',
      weakPassword: '密码至少 8 位，含字母和数字',
    },
  },

  /** 注册页 */
  register: {
    pageTitle: '注册',
    title: '创建账号',
    subtitle: '注册后可使用全部功能',
    usernamePlaceholder: '用户名（选填）',
    emailPlaceholder: '邮箱',
    passwordPlaceholder: '密码（≥8位，含字母和数字）',
    confirmPwdPlaceholder: '确认密码',
    registerBtn: '注 册',
    footerHasAccount: '已有账号？',
    footerLogin: '去登录',
    validation: {
      invalidEmail: '请输入正确的邮箱地址',
      weakPassword: '密码至少 8 位，含字母和数字',
      passwordMismatch: '两次输入密码不一致',
    },
  },

  /** 找回密码页 */
  forgotPwd: {
    pageTitle: '找回密码',
    title: '找回密码',
    subtitle: '输入注册邮箱，我们将发送重置链接',
    emailPlaceholder: '请输入注册邮箱',
    sendBtn: '发送重置邮件',
    tip: '📬 未收到邮件？请检查垃圾邮件箱',
    validation: {
      invalidEmail: '请输入正确的邮箱地址',
    },
  },

  /** 首页 */
  home: {
    pageTitle: '首页',
    greeting: '欢迎使用',
    description: 'uni-app + Supabase 全端通用脚手架',
    features: {
      auth: { title: 'Supabase 认证', desc: '邮箱注册登录，安全可靠' },
      db: { title: 'PostgreSQL 数据库', desc: '强大的关系型数据库' },
      storage: { title: '文件存储', desc: '大文件上传与管理' },
      realtime: { title: '实时订阅', desc: '数据变更实时推送' },
    },
  },

  /** 个人中心 */
  user: {
    pageTitle: '个人中心',
    logout: '退出登录',
    logoutConfirmTitle: '提示',
    logoutConfirmContent: '确定要退出登录吗？',
    menu: {
      profile: '个人资料',
      security: '账号安全',
      notification: '消息通知',
      about: '关于应用',
    },
    placeholder: {
      notLoggedIn: '请先登录',
      goLogin: '去登录',
    },
  },

  /** 设置页 */
  settings: {
    pageTitle: '设置',
    sections: {
      profile: '个人资料',
      security: '账号安全',
      preferences: '偏好设置',
      about: '关于',
    },
    items: {
      username: '用户名',
      bio: '个人简介',
      phone: '手机号',
      avatar: '头像',
      changePassword: '修改密码',
      bindPhone: '绑定手机',
      notification: '通知开关',
      darkMode: '深色模式',
      language: '语言 / Language',
      version: '应用版本',
      terms: '用户协议',
      privacy: '隐私政策',
    },
    placeholder: {
      username: '请输入用户名',
      bio: '介绍一下自己吧',
      phone: '请输入手机号',
    },
    toast: {
      notifyOn: '已开启通知',
      notifyOff: '已关闭通知',
      notImplemented: '功能待开发',
      changePassword: '修改密码功能（待开发）',
      noTerms: '待添加',
      profileSaved: '资料已保存',
      profileSaveFailed: '保存失败，请重试',
      profileLoading: '加载中...',
    },
  },

  /** useAuth Hook 中的 Toast 文案 */
  auth: {
    loginFailed: '登录失败，请重试',
    loginSuccess: '登录成功',
    registerFailed: '注册失败，请重试',
    registerSuccess: '注册成功',
    registerEmailSent: '注册成功！请查收确认邮件',
    resetFailed: '发送失败，请重试',
    resetSent: '重置邮件已发送，请查收',
    logoutFailed: '登出失败',
  },
}
