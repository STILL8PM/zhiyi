/**
 * URL 参数处理工具
 */

/** 解析 URL 查询参数为对象 */
export function parseQuery(url: string): Record<string, string> {
  const result: Record<string, string> = {}
  const queryStr = url.split('?')[1]
  if (!queryStr) return result
  queryStr.split('&').forEach((pair) => {
    const [k, v] = pair.split('=')
    if (k) result[decodeURIComponent(k)] = decodeURIComponent(v || '')
  })
  return result
}

/** 将对象序列化为查询字符串 */
export function stringifyQuery(params: Record<string, string | number | boolean>): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
}
