import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

/**
 * Vite 构建配置文件
 * 集成 uni-app 插件、路径别名、SCSS 全局注入等
 * 参考: https://uniapp.dcloud.net.cn/quickstart-cli.html
 */
export default defineConfig({
  plugins: [uni()],

  resolve: {
    alias: {
      // @ 别名指向 src 目录，方便模块导入
      '@': resolve(__dirname, 'src'),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        // 全局注入 uView Plus 主题变量和 mixin
        // uView Plus 组件内部使用 $u-primary、@include flex 等，
        // 必须通过 additionalData 全局提供，否则编译报错
        // 注意：只注入 uview-plus/theme.scss（变量+mixin），不注入 index.scss（实际CSS规则）
        // 避免循环引用——不再注入我们的 @/uni.scss（后者内部 import uview-plus 主题）
        additionalData: `@import "uview-plus/theme.scss";`,
      },
    },
  },

  // 开发服务器配置
  server: {
    port: 5173,
    host: '0.0.0.0', // 允许局域网访问，方便真机调试
    // H5 端代理配置示例：
    // proxy: {
    //   '/api': {
    //     target: 'https://your-api-server.com',
    //     changeOrigin: true,
    //   },
    // },
  },
})
