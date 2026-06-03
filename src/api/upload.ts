/**
 * 文件存储 API
 *
 * 封装 Supabase Storage 的文件上传/下载/删除操作
 * 规划 3 个 Bucket: avatars(public), public(public), private(private)
 *
 * 跨端文件读取策略：
 * - H5：uni.chooseImage 返回的 tempFiles[0] 是原生 File 对象，直接传给 Supabase
 * - 小程序/App：通过 uni.getFileSystemManager().readFileSync() 读取为 ArrayBuffer
 *
 * 头像上传策略：
 * - avatars 桶通过 Edge Function（service_role）上传，绕过 storage.objects RLS 限制
 * - 原因：storage.objects 表属 supabase_storage_admin，postgres 角色无法创建 RLS 策略
 */

import { getSupabase } from '@/libs/supabase'
import type { ApiResponse } from '@/types/api'

/** 存储桶名称 */
export type BucketName = 'avatars' | 'public' | 'private'

/**
 * 上传文件
 *
 * @param bucket - 存储桶名称
 * @param path - 文件存储路径（含文件名），如 'avatars/user_123/avatar.jpg'
 * @param file - 文件数据：H5 传 File/Blob，小程序传 ArrayBuffer 或 { path } 对象
 * @param upsert - 是否覆盖同名文件（默认 true）
 */
export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File | Blob | ArrayBuffer | { path: string },
  upsert = true,
): Promise<ApiResponse<{ path: string }>> {
  try {
    const supabase = getSupabase()

    // 解析文件数据，兼容不同平台的文件输入
    let fileBody: File | Blob | ArrayBuffer

    // H5 端：uni.chooseImage 返回的 tempFiles[0] 是原生 File 对象，直接使用
    if (file instanceof File || file instanceof Blob) {
      fileBody = file
    } else if (file instanceof ArrayBuffer) {
      fileBody = file
    } else if (typeof (file as { path: string }).path === 'string') {
      // 小程序/App 端：从文件路径读取 ArrayBuffer
      // #ifdef MP-WEIXIN || APP-PLUS
      const fs = uni.getFileSystemManager()
      fileBody = fs.readFileSync((file as { path: string }).path)
      // #endif
      // #ifdef H5
      // H5 端如果只拿到 path 字符串，尝试 fetch 转为 Blob
      const response = await fetch((file as { path: string }).path)
      fileBody = await response.blob()
      // #endif
    } else {
      return { data: null, error: { message: '不支持的文件格式' }, status: 400 }
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, fileBody, {
        upsert,
        contentType: guessContentType(path),
      })

    if (error) return { data: null, error, status: 400 }
    return { data, error: null, status: 200 }
  } catch (err) {
    return { data: null, error: { message: (err as Error).message }, status: 500 }
  }
}

/** 根据文件扩展名推测 MIME 类型 */
function guessContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase()
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
  }
  return mimeMap[ext || ''] || 'application/octet-stream'
}

/**
 * 获取文件的公开访问 URL
 */
export function getPublicUrl(bucket: BucketName, path: string): string {
  const supabase = getSupabase()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * 删除文件
 */
export async function deleteFile(
  bucket: BucketName,
  paths: string[],
): Promise<ApiResponse<null>> {
  try {
    const supabase = getSupabase()
    const { error } = await supabase.storage.from(bucket).remove(paths)
    if (error) return { data: null, error, status: 400 }
    return { data: null, error: null, status: 200 }
  } catch (err) {
    return { data: null, error: { message: (err as Error).message }, status: 500 }
  }
}

/**
 * 通过 Edge Function 上传头像（使用 service_role 绕过 storage RLS）
 *
 * 背景：storage.objects 的 RLS 策略因权限问题无法创建，
 *       改用 Supabase Edge Function 在服务端以 service_role 执行上传。
 *
 * @param file - 文件对象（File/Blob）或 { path } 路径对象
 * @param fileName - 文件名（不含目录前缀，Function 端会自动加 userId 目录）
 * @returns 上传成功后的公开 URL
 */
export async function uploadAvatarViaEdgeFunction(
  file: File | Blob | { path: string },
  fileName?: string,
): Promise<ApiResponse<{ url: string; path: string }>> {
  try {
    const supabase = getSupabase()

    // 构建 FormData
    const formData = new FormData()

    // H5 端：File/Blob 对象直接 append
    if (file instanceof File || file instanceof Blob) {
      const name = fileName || (file instanceof File ? file.name : 'avatar.jpg')
      formData.append('file', file, name)
    } else if (typeof file.path === 'string') {
      // 小程序/App 端：从路径读取后构造 File
      // #ifdef MP-WEIXIN || APP-PLUS
      const fs = uni.getFileSystemManager()
      const buffer = fs.readFileSync(file.path)
      const blob = new Blob([buffer])
      formData.append('file', blob, fileName || 'avatar.jpg')
      // #endif
      // #ifdef H5
      const response = await fetch(file.path)
      const blob = await response.blob()
      formData.append('file', blob, fileName || 'avatar.jpg')
      // #endif
    }

    // 调用 Edge Function，supabase-js 会自动附带当前用户的 JWT
    const { data, error } = await supabase.functions.invoke('upload-avatar', {
      body: formData,
    })

    if (error) {
      return { data: null, error: { message: error.message || '上传失败' }, status: 400 }
    }

    return {
      data: { url: (data as { url: string }).url, path: (data as { path: string }).path },
      error: null,
      status: 200,
    }
  } catch (err) {
    return { data: null, error: { message: (err as Error).message }, status: 500 }
  }
}
