/**
 * API 通用类型定义
 *
 * 统一所有 API 调用的请求/响应格式
 */

/** API 调用成功时的响应结构 */
export interface ApiResponse<T = unknown> {
  /** 响应数据 */
  data: T | null
  /** 错误信息（成功时为 null） */
  error: ApiError | null
  /** HTTP 状态码 */
  status: number
}

/** API 错误信息结构 */
export interface ApiError {
  /** 错误消息 */
  message: string
  /** 错误码（业务层或 HTTP 层） */
  code?: string
  /** 详细错误描述 */
  details?: string
  /** 原始错误提示（可展示给用户） */
  hint?: string
}

/** 分页查询参数 */
export interface PaginationParams {
  /** 页码（从 1 开始） */
  page: number
  /** 每页数量 */
  pageSize: number
}

/** 分页查询结果 */
export interface PaginatedResult<T> {
  /** 数据列表 */
  items: T[]
  /** 总条数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页数量 */
  pageSize: number
  /** 是否有下一页 */
  hasMore: boolean
}
