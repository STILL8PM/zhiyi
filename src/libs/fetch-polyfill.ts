/**
 * Fetch API Polyfill —— 微信小程序适配
 *
 * 背景：@supabase/supabase-js 内部使用浏览器的 fetch API 发起 HTTP 请求，
 * 但微信小程序运行时没有 fetch，只有 wx.request / uni.request。
 *
 * 此模块仅在微信小程序编译条件下生效，基于 uni.request 模拟标准 fetch 接口。
 * 其他平台（H5/App）原生支持 fetch，此模块导出 undefined。
 *
 * 条件编译说明：
 * - #ifdef MP-WEIXIN: 仅微信小程序平台编译此代码
 * - #ifndef MP-WEIXIN: 其他平台跳过此代码
 *
 * 参考: https://uniapp.dcloud.net.cn/tutorial/platform.html#条件编译
 */

// #ifdef MP-WEIXIN

/**
 * 基于 uni.request 的 fetch 实现
 *
 * 实现 Fetch API 的核心功能：
 * - Request → Response 的转换
 * - Headers 处理
 * - 状态码和状态文本
 * - JSON/文本 body 处理
 *
 * 限制（与标准 fetch 的差异）：
 * - 不支持 ReadableStream
 * - 不支持 AbortController
 * - 不支持 FormData（需额外处理）
 *
 * @param input - 请求 URL 或 Request 对象
 * @param init - 请求配置选项
 * @returns Promise<Response>
 */
function fetchPolyfill(
  input: RequestInfo | string,
  init?: RequestInit,
): Promise<Response> {
  // 解析 URL
  const url = typeof input === 'string' ? input : (input as Request).url

  // 解析请求方法
  const method = init?.method?.toUpperCase() || 'GET'

  // 解析请求头
  const headersMap: Record<string, string> = {}
  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        headersMap[key] = value
      })
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([key, value]) => {
        headersMap[key] = value
      })
    } else {
      Object.assign(headersMap, init.headers)
    }
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: method as AnyObject,
      header: headersMap,
      data: init?.body as AnyObject | undefined,
      timeout: 60000,
      success: (res) => {
        // 构造标准 Response 对象
        const responseHeaders = new Headers(res.header as Record<string, string>)
        resolve(
          new Response(
            typeof res.data === 'string' ? res.data : JSON.stringify(res.data),
            {
              status: res.statusCode,
              statusText: res.statusCode === 200 ? 'OK' : 'Error',
              headers: responseHeaders,
            },
          ),
        )
      },
      fail: (err) => {
        reject(new Error(`[fetchPolyfill] 请求失败: ${err.errMsg}`))
      },
    })
  })
}

export default fetchPolyfill

// #endif

// #ifndef MP-WEIXIN
// 非小程序平台不需要 polyfill，导出 undefined
export default undefined
// #endif
