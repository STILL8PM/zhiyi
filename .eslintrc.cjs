/**
 * ESLint 配置文件
 *
 * 适配：uni-app + Vue 3 + TypeScript
 * 参考：https://eslint.vuejs.org/user-guide/
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },

  // uni-app 全局变量声明
  globals: {
    uni: 'readonly',
    UniApp: 'readonly',
    getCurrentPages: 'readonly',
  },

  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },

  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
  ],

  plugins: ['@typescript-eslint'],

  rules: {
    // Vue
    'vue/multi-word-component-names': 'off', // uni-app 页面名多为单字
    'vue/no-v-html': 'warn',
    'vue/require-default-prop': 'off',
    'vue/html-self-closing': ['warn', { html: { void: 'always' } }],

    // TypeScript
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],

    // 通用
    'no-console': 'off', // uni-app 开发阶段保留 console
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'prefer-const': 'warn',
    'no-var': 'error',
  },

  // uni-app 条件编译注释忽略
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        // uni-app 全局变量/宏在 .vue 文件中自动可用
        'no-undef': 'off',
      },
    },
  ],
}
