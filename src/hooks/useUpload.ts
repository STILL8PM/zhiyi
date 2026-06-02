/**
 * 文件上传组合式函数
 *
 * 封装文件选择、压缩、上传、进度追踪的完整流程
 */

import { ref } from 'vue'
import { uploadFile, getPublicUrl } from '@/api/upload'
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
          const { data, error } = await uploadFile(bucket, storagePath, fileBody)

          uploading.value = false
          progress.value = 100

          if (error) {
            uni.showToast({ title: '上传失败，请重试', icon: 'none' })
            resolve(null)
          } else {
            resolve(getPublicUrl(bucket, storagePath))
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
