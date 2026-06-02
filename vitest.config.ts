/**
 * Vitest 测试框架配置文件
 *
 * 复用 Vite 的路径别名和构建配置，
 * 确保测试环境与开发/生产环境一致。
 *
 * 参考: https://vitest.dev/config/
 */
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      // @ 别名指向 src 目录，与 vite.config.ts 保持一致
      '@': resolve(__dirname, 'src'),
    },
  },

  test: {
    // 测试文件匹配模式（存放于 src/__tests__/ 目录下）
    include: ['src/__tests__/**/*.test.ts'],

    // 测试环境：jsdom 模拟浏览器 DOM 环境
    // 注意：uni-app 的 uni 全局对象需在测试 setup 中 mock
    environment: 'jsdom',

    // 全局变量 mock（uni 等 uni-app 运行时 API）
    globals: true,

    // setup 文件：在每个测试文件运行前执行，mock uni 等 uni-app 运行时 API
    setupFiles: ['./src/__tests__/setup.ts'],
  },
})
