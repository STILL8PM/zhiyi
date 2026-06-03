/**
 * 文件上传组合式函数
 *
 * 封装文件选择、压缩、上传、进度追踪的完整流程
 */

import { ref } from 'vue'
import { uploadFile, getPublicUrl, uploadAvatarViaEdgeFunction } from '@/api/upload'
import type { BucketName } from '@/api/upload'

export function useUpload() {
  const uploading = ref(false)
  const progress = ref(0)

  /** 选择并上传图片（含压缩，跨端兼容） */
  async function chooseAndUploadImage(bucket: BucketName, folder: string): Promise<string | null> {
    return new Promise((resolve) => {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        success: async (res) => {
          const ext = res.tempFilePaths[0]?.split('.').pop() || 'jpg'
          const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
          const storagePath = `${folder}/${fileName}`

          uploading.value = true
          progress.value = 0

          // 跨端文件传递策略：
          // H5：tempFiles[0] 是原生 File 对象 → 直接传给 uploadFile
          // 小程序/App：只有 tempFilePaths → 传 { path } 由 uploadFile 内部读取
          const fileBody = res.tempFiles?.[0] || { path: res.tempFilePaths[0] }

          let data: { url?: string; path?: string } | null = null
          let error: { message?: string } | null = null

          // avatars 桶走 Edge Function（service_role 绕过 RLS），其他桶走直传
          if (bucket === 'avatars') {
            const result = await uploadAvatarViaEdgeFunction(fileBody, fileName)
            data = result.data
            error = result.error
          } else {
            const result = await uploadFile(bucket, storagePath, fileBody)
            if (result.data) {
              data = { url: getPublicUrl(bucket, storagePath), path: result.data.path }
            }
            error = result.error
          }

          uploading.value = false
          progress.value = 100

          if (error) {
            uni.showToast({ title: '上传失败，请重试', icon: 'none' })
            resolve(null)
          } else {
            // Edge Function 返回完整 URL，直接使用；直传模式拼 URL
            resolve(data?.url || null)
          }
        },
        fail: (err) => {
          console.warn('[useUpload] 选择图片取消或失败:', err)
          resolve(null)
        },
      })
    })
  }

  return { uploading, progress, chooseAndUploadImage }
}
