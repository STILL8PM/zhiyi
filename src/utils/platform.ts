/**
 * 平台检测工具
 * 用于判断当前运行环境，配合条件逻辑使用
 */
export function isH5(): boolean { return uni.getSystemInfoSync().uniPlatform === 'web' }
export function isWechat(): boolean { return !!uni.getSystemInfoSync().hostName?.includes('WeChat') }
export function isApp(): boolean { return uni.getSystemInfoSync().uniPlatform === 'app' }
export function isIOS(): boolean { return uni.getSystemInfoSync().osName === 'ios' }
export function isAndroid(): boolean { return uni.getSystemInfoSync().osName === 'android' }

export function getPlatform(): string {
  const info = uni.getSystemInfoSync()
  if (info.uniPlatform === 'web') return 'h5'
  return info.uniPlatform || 'unknown'
}
