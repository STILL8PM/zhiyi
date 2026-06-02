/**
 * 全局路由鉴权中间件
 *
 * 职责：在 App.vue onShow 中执行，检查用户是否有权限访问当前页面
 *
 * 规则：
 * - 白名单路径：无需登录即可访问（启动页、认证页、引导页）
 * - 非白名单路径：需登录，未登录则重定向到登录页
 * - 登录页本身：已登录用户访问时直接跳转首页（防重复登录）
 *
 * 重定向参数：登录页收到 redirect 参数，登录成功后回跳目标页面
 */

import { useAuthStore } from '@/store/useAuthStore'

/**
 * 无需登录即可访问的页面路径白名单
 * 支持前缀匹配（如 'pages/auth/' 匹配认证模块下所有页面）
 */
const WHITELIST = [
  'pages/splash/index',
  'pages/auth/',
  'pages/guide/',
]

/** 登录页面路径 */
const LOGIN_PATH = '/pages/auth/login/index'

/** 登录后默认跳转的页面 */
const HOME_PATH = '/pages/index/index'

/**
 * 检查当前页面路径是否在白名单中
 *
 * @param path - 当前页面路径
 */
function isInWhitelist(path: string): boolean {
  return WHITELIST.some((item) => path.startsWith(item))
}

/**
 * 路由守卫主函数
 *
 * 在 App.vue onShow 中调用，根据登录状态决定放行或拦截
 *
 * @param currentPath - 当前页面路径（不含查询参数）
 */
export function authGuard(currentPath: string): void {
  const authStore = useAuthStore()

  // 认证初始化未完成时，放行等待
  if (!authStore.isReady) {
    console.log('[AuthGuard] 认证初始化中，等待...')
    return
  }

  const isLoggedIn = authStore.isAuthenticated

  // 情况 1: 已登录 + 在登录页 → 跳转首页（防重复登录）
  if (isLoggedIn && currentPath.startsWith('pages/auth/login')) {
    console.log('[AuthGuard] 已登录用户访问登录页，跳转首页')
    uni.switchTab({ url: HOME_PATH })
    return
  }

  // 情况 2: 未登录 + 非白名单页面 → 跳转登录页
  if (!isLoggedIn && !isInWhitelist(currentPath)) {
    console.log('[AuthGuard] 未登录用户访问受保护页面:', currentPath)
    uni.redirectTo({
      url: `${LOGIN_PATH}?redirect=/${currentPath}`,
    })
    return
  }

  // 情况 3: 其他情况 → 正常放行
  console.log('[AuthGuard] 放行:', currentPath)
}

/**
 * 获取登录成功后的跳转目标
 *
 * 优先使用 URL 中的 redirect 参数，否则跳首页
 *
 * @returns 目标路径
 */
export function getRedirectPath(): string {
  // 从当前页面栈获取登录页的 redirect 参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const redirect = currentPage?.options?.redirect as string | undefined

  if (redirect) {
    // 解码并验证是合法路径
    const decoded = decodeURIComponent(redirect)
    if (decoded.startsWith('/')) {
      return decoded
    }
  }

  return HOME_PATH
}
