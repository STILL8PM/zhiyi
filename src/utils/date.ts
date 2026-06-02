/**
 * 日期时间工具（基于 dayjs）
 *
 * 支持中/英文 locale 切换，通过 setDayjsLocale() 统一控制
 */
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/** 同步 dayjs locale（由 useLang 调用） */
export function setDayjsLocale(locale: string): void {
  const dayjsLocale = locale === 'zh-CN' ? 'zh-cn' : 'en'
  dayjs.locale(dayjsLocale)
}

/** 格式化日期: YYYY-MM-DD HH:mm:ss */
export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

/** 格式化日期: YYYY-MM-DD */
export function formatDate(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD')
}

/** 相对时间: 3分钟前 / 2小时前 / 3天前 */
export function fromNow(date: string | Date): string {
  return dayjs(date).fromNow()
}

/** 获取当前时间戳（秒） */
export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}
