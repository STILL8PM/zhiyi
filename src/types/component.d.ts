/**
 * 全局组件类型声明
 *
 * easycom 自动注册的组件：
 * - u-* : uview-plus 组件（在 pages.json easycom 中配置）
 * - c-* : 自定义组件（@/components/xxx/index.vue）
 */

declare module 'vue' {
  export interface GlobalComponents {
    // uview-plus 组件（通过 easycom 自动注册，无需手动声明）
    // 自定义组件将在创建后逐个声明
  }
}

export {}
