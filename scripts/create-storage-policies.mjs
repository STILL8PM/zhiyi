/**
 * Storage RLS 策略创建脚本 —— 通过 Supabase Management API 执行
 *
 * 用法：
 *   node scripts/create-storage-policies.mjs <你的个人访问令牌>
 *
 * 令牌获取方式：
 *   Supabase Dashboard → Access Tokens → Generate New Token → 复制
 *
 * 为什么需要这个脚本：
 *   storage.objects 表属于 supabase_storage_admin，SQL Editor（postgres 角色）无权创建策略
 *   Management API 拥有项目级最高权限，能直接写入 DDL
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')

// ===== 1. 读取项目 ref =====
function getProjectRef() {
  // 从 .env.development 中提取 SUPABASE_URL
  const envPath = resolve(PROJECT_ROOT, '.env.development')
  const envContent = readFileSync(envPath, 'utf-8')
  const match = envContent.match(/VITE_SUPABASE_URL=https?:\/\/([^.]+)\.supabase\.co/)
  if (!match) {
    console.error('❌ 无法从 .env.development 中解析项目 ref，请检查 VITE_SUPABASE_URL 配置')
    process.exit(1)
  }
  return match[1]
}

// ===== 2. 获取访问令牌 =====
function getAccessToken() {
  const token = process.argv[2] || process.env.SUPABASE_ACCESS_TOKEN
  if (!token) {
    console.error('❌ 请提供 Supabase 个人访问令牌')
    console.error('   用法: node scripts/create-storage-policies.mjs <令牌>')
    console.error('   获取: Supabase Dashboard → Access Tokens → Generate New Token')
    process.exit(1)
  }
  return token
}

// ===== 3. 构建策略 SQL =====
function buildPolicySQL() {
  return `
-- 启用 storage.objects 的 RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ===== avatars 桶 =====
DROP POLICY IF EXISTS "avatars_public_select" ON storage.objects;
CREATE POLICY "avatars_public_select" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_auth_insert" ON storage.objects;
CREATE POLICY "avatars_auth_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_auth_update" ON storage.objects;
CREATE POLICY "avatars_auth_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND owner = auth.uid());

DROP POLICY IF EXISTS "avatars_auth_delete" ON storage.objects;
CREATE POLICY "avatars_auth_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND owner = auth.uid());

-- ===== public 桶 =====
DROP POLICY IF EXISTS "public_public_select" ON storage.objects;
CREATE POLICY "public_public_select" ON storage.objects FOR SELECT USING (bucket_id = 'public');

DROP POLICY IF EXISTS "public_auth_insert" ON storage.objects;
CREATE POLICY "public_auth_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'public' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "public_auth_delete" ON storage.objects;
CREATE POLICY "public_auth_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'public' AND auth.role() = 'authenticated' AND owner = auth.uid());

-- ===== private 桶 =====
DROP POLICY IF EXISTS "private_owner_select" ON storage.objects;
CREATE POLICY "private_owner_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'private' AND auth.role() = 'authenticated' AND owner = auth.uid());

DROP POLICY IF EXISTS "private_auth_insert" ON storage.objects;
CREATE POLICY "private_auth_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'private' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "private_owner_update" ON storage.objects;
CREATE POLICY "private_owner_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'private' AND auth.role() = 'authenticated' AND owner = auth.uid());

DROP POLICY IF EXISTS "private_owner_delete" ON storage.objects;
CREATE POLICY "private_owner_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'private' AND auth.role() = 'authenticated' AND owner = auth.uid());
`.trim()
}

// ===== 4. 调用 Management API =====
async function runSQL(projectRef, token, query) {
  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  const result = await response.json()

  if (!response.ok) {
    console.error(`❌ SQL 执行失败 (${response.status}):`, result.error || result.message)
    return false
  }
  return true
}

// ===== 5. 主流程 =====
async function main() {
  const projectRef = getProjectRef()
  const accessToken = getAccessToken()
  const sql = buildPolicySQL()

  console.log(`📦 项目 ref: ${projectRef}`)
  console.log(`🔑 令牌前缀: ${accessToken.slice(0, 8)}...`)
  console.log('🚀 正在通过 Management API 创建 storage RLS 策略...\n')

  const success = await runSQL(projectRef, accessToken, sql)

  if (success) {
    console.log('✅ 全部 11 条 storage RLS 策略创建成功！')
    console.log('   验证: Dashboard → Authentication → Policies → storage.objects')
  } else {
    console.log('\n💡 如果报错，请检查：')
    console.log('   1. 令牌是否有效（Dashboard → Access Tokens）')
    console.log('   2. 令牌是否有项目访问权限')
    console.log('   3. 项目 ref 是否正确:', projectRef)
  }
}

main().catch((err) => {
  console.error('❌ 脚本异常:', err.message)
  process.exit(1)
})
