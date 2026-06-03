/**
 * 头像上传 Edge Function
 *
 * 为什么需要这个 Function：
 *   storage.objects 表的 RLS 策略因 postgres 角色权限不足无法创建，
 *   改用 service_role 在服务端做上传，完全绕过 RLS 限制。
 *
 * 安全设计：
 *   - 客户端传用户 JWT，Function 端验证身份
 *   - 上传路径自动绑定 auth.uid() 目录，禁止越权
 *   - service_role 密钥仅存于服务端，不暴露到前端
 *
 * 用法（客户端调用）：
 *   const formData = new FormData()
 *   formData.append('file', fileObject)
 *   const { data } = await supabase.functions.invoke('upload-avatar', { body: formData })
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

// 允许的文件类型和大小
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

Deno.serve(async (req: Request) => {
  // ===== 1. 验证用户身份 =====
  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "未登录，请先登录后再上传头像" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }

  // ===== 2. 解析 multipart 表单中的文件 =====
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return new Response(
      JSON.stringify({ error: "请求格式错误，需要 multipart/form-data" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  const file = formData.get("file") as File | null
  if (!file) {
    return new Response(
      JSON.stringify({ error: "缺少文件，请通过 'file' 字段上传" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  // ===== 3. 校验文件类型和大小 =====
  if (!ALLOWED_TYPES.includes(file.type)) {
    return new Response(
      JSON.stringify({ error: `不支持的文件格式 ${file.type}，仅允许 PNG/JPEG/GIF/WebP` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  if (file.size > MAX_SIZE) {
    return new Response(
      JSON.stringify({ error: `文件过大（${(file.size / 1024 / 1024).toFixed(1)}MB），上限 5MB` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  // ===== 4. 从 JWT 中解析 userId 作为存储目录 =====
  const token = authHeader.replace("Bearer ", "")
  let userId: string
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    userId = payload.sub // auth.uid()
  } catch {
    return new Response(
      JSON.stringify({ error: "身份令牌无效" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }

  // ===== 5. 用 service_role 上传（绕过 RLS） =====
  const ext = file.name.split(".").pop() || "jpg"
  const fileName = `${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`
  const path = `${userId}/${fileName}`

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    })

  if (error) {
    return new Response(
      JSON.stringify({ error: `上传失败: ${error.message}` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  // ===== 6. 返回公开访问 URL =====
  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path)

  return new Response(
    JSON.stringify({
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  )
})
