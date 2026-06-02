/**
 * English language pack
 *
 * Mirrors zh-CN.ts structure — all keys must be identical
 */
export default {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    loading: 'Loading...',
  },

  tabBar: {
    home: 'Home',
    user: 'Me',
  },

  splash: {
    appName: 'uni-supabase-app',
    subtitle: 'uni-app + Supabase Full-Stack App',
  },

  login: {
    pageTitle: 'Sign In',
    title: 'Welcome Back',
    subtitle: 'Sign in to your account',
    emailPlaceholder: 'Enter your email',
    passwordPlaceholder: 'Enter your password',
    loginBtn: 'Sign In',
    registerLink: 'Create Account',
    forgotPwdLink: 'Forgot Password?',
    oauthDivider: 'Other Sign-in Methods',
    google: 'Google',
    wechat: 'WeChat',
    validation: {
      invalidEmail: 'Please enter a valid email address',
      weakPassword: 'Password must be at least 8 characters with letters and numbers',
    },
  },

  register: {
    pageTitle: 'Sign Up',
    title: 'Create Account',
    subtitle: 'Register to access all features',
    usernamePlaceholder: 'Username (optional)',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password (8+ chars, letters & numbers)',
    confirmPwdPlaceholder: 'Confirm Password',
    registerBtn: 'Sign Up',
    footerHasAccount: 'Already have an account?',
    footerLogin: 'Log in',
    validation: {
      invalidEmail: 'Please enter a valid email address',
      weakPassword: 'Password must be at least 8 characters with letters and numbers',
      passwordMismatch: 'Passwords do not match',
    },
  },

  forgotPwd: {
    pageTitle: 'Reset Password',
    title: 'Reset Password',
    subtitle: 'Enter your email and we will send you a reset link',
    emailPlaceholder: 'Enter your registered email',
    sendBtn: 'Send Reset Email',
    tip: '📬 Did not receive the email? Check your spam folder',
    validation: {
      invalidEmail: 'Please enter a valid email address',
    },
  },

  home: {
    pageTitle: 'Home',
    greeting: 'Welcome to',
    description: 'uni-app + Supabase Universal Scaffold',
    features: {
      auth: { title: 'Supabase Auth', desc: 'Email sign-up and login, safe and reliable' },
      db: { title: 'PostgreSQL Database', desc: 'Powerful relational database' },
      storage: { title: 'File Storage', desc: 'Large file upload and management' },
      realtime: { title: 'Realtime Subscriptions', desc: 'Real-time data change push' },
    },
  },

  user: {
    pageTitle: 'Profile',
    logout: 'Sign Out',
    logoutConfirmTitle: 'Notice',
    logoutConfirmContent: 'Are you sure you want to sign out?',
    menu: {
      profile: 'Profile',
      security: 'Account Security',
      notification: 'Notifications',
      about: 'About',
    },
    placeholder: {
      notLoggedIn: 'Please log in first',
      goLogin: 'Log In',
    },
  },

  settings: {
    pageTitle: 'Settings',
    sections: {
      security: 'Account Security',
      preferences: 'Preferences',
      about: 'About',
    },
    items: {
      changePassword: 'Change Password',
      bindPhone: 'Bind Phone',
      notification: 'Notifications',
      darkMode: 'Dark Mode',
      language: 'Language',
      version: 'App Version',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
    },
    toast: {
      notifyOn: 'Notifications enabled',
      notifyOff: 'Notifications disabled',
      notImplemented: 'Coming soon',
      changePassword: 'Change password (coming soon)',
      noTerms: 'Coming soon',
    },
  },

  auth: {
    loginFailed: 'Login failed, please try again',
    loginSuccess: 'Login successful',
    registerFailed: 'Registration failed, please try again',
    registerSuccess: 'Registration successful',
    registerEmailSent: 'Registration successful! Please check your confirmation email',
    resetFailed: 'Failed to send, please try again',
    resetSent: 'Reset email sent, please check your inbox',
    logoutFailed: 'Sign out failed',
  },
}
