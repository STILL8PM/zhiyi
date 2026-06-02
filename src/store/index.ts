/**
 * Pinia 状态管理 —— 实例创建入口
 *
 * 此模块在 src/main.ts 中被 app.use() 注册，
 * 各 store 模块通过 useXxxStore() 使用。
 */

// Pinia 实例在 main.ts 中创建，此处仅作为模块索引
// 具体的 store 定义请参考:
// - useAuthStore.ts  — 认证状态
// - useUserStore.ts  — 用户扩展信息
// - useAppStore.ts   — 应用全局状态

export { useAuthStore } from './useAuthStore'
export { useUserStore } from './useUserStore'
export { useAppStore } from './useAppStore'
