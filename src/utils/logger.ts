/**
 * 分级日志工具
 * - 开发环境: 输出所有级别日志
 * - 生产环境: 仅输出 error 和 warn
 */
import { getEnvConfig } from '@/config/env'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const config = (() => { try { return getEnvConfig() } catch { return null } })()

function shouldLog(level: LogLevel): boolean {
  if (!config) return false
  if (config.isProd) return level === 'error' || level === 'warn'
  return true
}

export const logger = {
  debug(msg: string, ...args: unknown[]): void {
    if (shouldLog('debug')) console.debug(`[DEBUG] ${msg}`, ...args)
  },
  info(msg: string, ...args: unknown[]): void {
    if (shouldLog('info')) console.log(`[INFO] ${msg}`, ...args)
  },
  warn(msg: string, ...args: unknown[]): void {
    if (shouldLog('warn')) console.warn(`[WARN] ${msg}`, ...args)
  },
  error(msg: string, ...args: unknown[]): void {
    console.error(`[ERROR] ${msg}`, ...args)
  },
}
