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
        // Sass 1.100+ 已将 @import 标记为废弃，但 uView Plus 仍基于 @import 体系
        // 不能换 @use（变量作用域隔离会导致组件拿不到主题变量），先静默此警告
        silenceDeprecations: ['import', 'legacy-js-api'],
      },
    },
  },

  // 开发服务器配置
  server: {
    port: 5173,
    host: '0.0.0.0', // 允许局域网访问，方便真机调试

    // 热重载配置
    hmr: {
      // 客户端通过 localhost 连接 HMR WebSocket
      // host: '0.0.0.0' 时，明确指定 HMR 客户端连接地址，避免 WebSocket 连不上
      host: 'localhost',
      protocol: 'ws',
    },

    // Windows 下文件监听优化：避免频繁触发导致 CPU 飙高
    watch: {
      // 忽略这些目录的变化，减少监听开销
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/unpackage/**'],
    },

    // H5 端代理配置示例：
    // proxy: {
    //   '/api': {
    //     target: 'https://your-api-server.com',
    //     changeOrigin: true,
    //   },
    // },
  },
})
