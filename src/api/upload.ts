/**
 * 文件存储 API
 *
 * 封装 Supabase Storage 的文件上传/下载/删除操作
 * 规划 3 个 Bucket: avatars(public), public(public), private(private)
 */

import { getSupabase } from '@/libs/supabase'
import type { ApiResponse } from '@/types/api'

/** 存储桶名称 */
export type BucketName = 'avatars' | 'public' | 'private'

/**
 * 上传文件
 *
 * @param bucket - 存储桶名称
 * @param path - 文件存储路径（含文件名），如 'avatars/user_123/avatar.png'
 * @param file - uni-app 选择的文件对象
 * @param upsert - 是否覆盖同名文件（默认 true）
 */
export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: { path: string },
  upsert = true,
): Promise<ApiResponse<{ path: string }>> {
  try {
    const supabase = getSupabase()
    // 读取文件内容为 ArrayBuffer
    const fs = uni.getFileSystemManager()
    const fileData = fs.readFileSync(file.path)

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, fileData, { upsert })

    if (error) return { data: null, error, status: 400 }
    return { data, error: null, status: 200 }
  } catch (err) {
    return { data: null, error: { message: (err as Error).message }, status: 500 }
  }
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
