/**
 * Vitest 全局 Setup 文件
 *
 * 职责：Mock uni-app 运行时 API（uni 全局对象、getCurrentPages 等），
 * 使测试在 jsdom 环境中能正常运行 src/ 下的模块。
 *
 * 注意：此文件在 vitest.config.ts 的 setupFiles 中配置
 */

import { vi } from 'vitest'

// ===== 1. Mock uni 全局对象 =====
// uni-app 的 uni 对象在浏览器环境中不存在，需要用 vi.fn() 模拟

const mockStorage: Record<string, string> = {}

;(globalThis as Record<string, unknown>).uni = {
  // 存储 API
  getStorageSync: vi.fn((key: string) => mockStorage[key] ?? ''),
  setStorageSync: vi.fn((key: string, value: string) => { mockStorage[key] = value }),
  removeStorageSync: vi.fn((key: string) => { delete mockStorage[key] }),
  clearStorageSync: vi.fn(() => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) }),

  // 系统信息
  getSystemInfoSync: vi.fn(() => ({
    platform: 'ios',
    statusBarHeight: 44,
    theme: 'light',
  })),

  // UI 交互（stub：静默成功）
  showToast: vi.fn(),
  showLoading: vi.fn(),
  hideLoading: vi.fn(),
  showModal: vi.fn(),
  setNavigationBarTitle: vi.fn(),
  setNavigationBarColor: vi.fn(),
  setTabBarStyle: vi.fn(),
  setTabBarItem: vi.fn(),

  // 路由跳转（stub）
  navigateTo: vi.fn(),
  redirectTo: vi.fn(),
  switchTab: vi.fn(),
  reLaunch: vi.fn(),
  navigateBack: vi.fn(),

  // 网络
  getNetworkType: vi.fn(),
  onNetworkStatusChange: vi.fn(),

  // 事件总线
  $emit: vi.fn(),
  $on: vi.fn(),
  $off: vi.fn(),
}

// ===== 2. Mock getCurrentPages =====
;(globalThis as Record<string, unknown>).getCurrentPages = vi.fn(() => [
  { options: {} },
])
