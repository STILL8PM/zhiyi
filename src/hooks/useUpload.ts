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

  /** 选择并上传图片（含压缩） */
  async function chooseAndUploadImage(bucket: BucketName, folder: string): Promise<string | null> {
    return new Promise((resolve) => {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        success: async (res) => {
          const filePath = res.tempFilePaths[0]
          const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`
          const storagePath = `${folder}/${fileName}`

          uploading.value = true
          progress.value = 0

          const { data, error } = await uploadFile(bucket, storagePath, { path: filePath })

          uploading.value = false
          progress.value = 100

          if (error) {
            uni.showToast({ title: '上传失败', icon: 'none' })
            resolve(null)
          } else {
            resolve(getPublicUrl(bucket, storagePath))
          }
        },
        fail: () => resolve(null),
      })
    })
  }

  return { uploading, progress, chooseAndUploadImage }
}
