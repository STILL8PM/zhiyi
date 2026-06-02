-- ============================================
-- Supabase 完整初始化脚本
-- 描述: 数据库、存储桶、RLS 策略、触发器、用户清理 —— 一键全部搞定
-- 运行: 打开 Supabase Dashboard → SQL Editor → 粘贴执行整个文件
-- ============================================

-- ================================================================
-- 第一部分：数据库 (Database)
-- 创建 profiles 用户资料表 + RLS 策略 + 自动触发器
-- ================================================================

-- 1.1 创建用户扩展资料表
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.2 启用 Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1.3 RLS 策略：所有人可查看公开资料
DROP POLICY IF EXISTS "公开资料所有人可查看" ON public.profiles;
CREATE POLICY "公开资料所有人可查看"
  ON public.profiles FOR SELECT
  USING (true);

-- 1.4 RLS 策略：用户只能修改自己的资料
DROP POLICY IF EXISTS "用户可修改自己的资料" ON public.profiles;
CREATE POLICY "用户可修改自己的资料"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 1.5 RLS 策略：用户只能插入自己的资料
DROP POLICY IF EXISTS "用户可创建自己的资料" ON public.profiles;
CREATE POLICY "用户可创建自己的资料"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 1.6 触发器函数：新用户注册时自动创建 profiles 记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1.7 绑定触发器到 auth.users 表
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 1.8 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1.9 绑定 updated_at 触发器
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ================================================================
-- 第二部分：存储桶 (Storage Buckets)
-- 创建 avatars / public / private 三个桶 + 文件级 RLS 策略
-- ================================================================

-- 2.1 头像桶（公开，限 5MB，仅图片格式，按用户 ID 目录隔离）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2.2 公共文件桶（公开，限 10MB，图片 + PDF）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public', 'public',
  true,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2.3 私密文件桶（非公开，限 10MB，仅所有者可访问）
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('private', 'private', false, 10485760)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit;

-- 2.4 启用 storage.objects 的 RLS
-- 注意：storage.objects 表归 supabase_storage_admin 所有，postgres 角色无权限直接创建策略。
--       因此 storage RLS 策略需要在 Dashboard → Storage → Policies 中手动配置。
--       以下列出每条策略的中文对照说明，方便按图索骥。

/*
 * ===== 存储桶 RLS 策略配置指南 =====
 * 在 Supabase Dashboard → Storage → Policies 中，为每个桶创建以下策略：
 *
 * --- avatars 桶 ---
 * 1. 允许所有人查看头像
 *    操作: SELECT  |  目标角色: 所有用户  |  条件: bucket_id = 'avatars'
 *
 * 2. 允许登录用户上传头像（仅限自己目录）
 *    操作: INSERT  |  目标角色: 已认证  |  条件: bucket_id = 'avatars'
 *                                          AND (storage.foldername(name))[1] = auth.uid()::text
 *
 * 3. 允许用户更新自己的头像
 *    操作: UPDATE  |  目标角色: 已认证  |  条件: bucket_id = 'avatars' AND owner = auth.uid()
 *
 * 4. 允许用户删除自己的头像
 *    操作: DELETE  |  目标角色: 已认证  |  条件: bucket_id = 'avatars' AND owner = auth.uid()
 *
 * --- public 桶 ---
 * 5. 允许所有人查看公共文件
 *    操作: SELECT  |  目标角色: 所有用户  |  条件: bucket_id = 'public'
 *
 * 6. 允许登录用户上传公共文件
 *    操作: INSERT  |  目标角色: 已认证  |  条件: bucket_id = 'public'
 *
 * 7. 允许用户删除自己上传的公共文件
 *    操作: DELETE  |  目标角色: 已认证  |  条件: bucket_id = 'public' AND owner = auth.uid()
 *
 * --- private 桶 ---
 * 8. 仅允许所有者查看自己的私密文件
 *    操作: SELECT  |  目标角色: 已认证  |  条件: bucket_id = 'private' AND owner = auth.uid()
 *
 * 9. 允许登录用户上传私密文件
 *    操作: INSERT  |  目标角色: 已认证  |  条件: bucket_id = 'private' AND owner = auth.uid()
 *
 * 10. 仅允许所有者更新自己的私密文件
 *     操作: UPDATE  |  目标角色: 已认证  |  条件: bucket_id = 'private' AND owner = auth.uid()
 *
 * 11. 仅允许所有者删除自己的私密文件
 *     操作: DELETE  |  目标角色: 已认证  |  条件: bucket_id = 'private' AND owner = auth.uid()
 *
 * 快捷操作：也可以直接复制下方 SQL，在 SQL Editor 中逐条执行试试看
 * （若仍报权限错误，请走 Dashboard GUI 配置）：
*/

-- 以下 SQL 供复制到 Dashboard → Storage → Policies 界面的自定义策略中使用
-- 如果 SQL Editor 执行报 "must be owner of table objects"，改用 Dashboard GUI 配置即可

-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
--
-- -- avatars
-- DROP POLICY IF EXISTS "avatars_public_select" ON storage.objects;
-- CREATE POLICY "avatars_public_select" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- DROP POLICY IF EXISTS "avatars_auth_insert" ON storage.objects;
-- CREATE POLICY "avatars_auth_insert" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated'
--     AND (storage.foldername(name))[1] = auth.uid()::text);
-- DROP POLICY IF EXISTS "avatars_auth_update" ON storage.objects;
-- CREATE POLICY "avatars_auth_update" ON storage.objects FOR UPDATE
--   USING (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND owner = auth.uid());
-- DROP POLICY IF EXISTS "avatars_auth_delete" ON storage.objects;
-- CREATE POLICY "avatars_auth_delete" ON storage.objects FOR DELETE
--   USING (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND owner = auth.uid());
--
-- -- public
-- DROP POLICY IF EXISTS "public_public_select" ON storage.objects;
-- CREATE POLICY "public_public_select" ON storage.objects FOR SELECT USING (bucket_id = 'public');
-- DROP POLICY IF EXISTS "public_auth_insert" ON storage.objects;
-- CREATE POLICY "public_auth_insert" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'public' AND auth.role() = 'authenticated');
-- DROP POLICY IF EXISTS "public_auth_delete" ON storage.objects;
-- CREATE POLICY "public_auth_delete" ON storage.objects FOR DELETE
--   USING (bucket_id = 'public' AND auth.role() = 'authenticated' AND owner = auth.uid());
--
-- -- private
-- DROP POLICY IF EXISTS "private_owner_select" ON storage.objects;
-- CREATE POLICY "private_owner_select" ON storage.objects FOR SELECT
--   USING (bucket_id = 'private' AND auth.role() = 'authenticated' AND owner = auth.uid());
-- DROP POLICY IF EXISTS "private_auth_insert" ON storage.objects;
-- CREATE POLICY "private_auth_insert" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'private' AND auth.role() = 'authenticated' AND owner = auth.uid());
-- DROP POLICY IF EXISTS "private_owner_update" ON storage.objects;
-- CREATE POLICY "private_owner_update" ON storage.objects FOR UPDATE
--   USING (bucket_id = 'private' AND auth.role() = 'authenticated' AND owner = auth.uid());
-- DROP POLICY IF EXISTS "private_owner_delete" ON storage.objects;
-- CREATE POLICY "private_owner_delete" ON storage.objects FOR DELETE
--   USING (bucket_id = 'private' AND auth.role() = 'authenticated' AND owner = auth.uid());

-- ================================================================
-- 第三部分：用户生命周期 (User Lifecycle)
-- 用户注销后自动清理存储文件 + 孤儿文件清理 + 僵尸用户清理
-- ================================================================

-- 3.1 触发器函数：用户注销时清理所有关联数据
CREATE OR REPLACE FUNCTION public.on_auth_user_deleted()
RETURNS TRIGGER AS $$
BEGIN
  -- 清理该用户在 storage.objects 中的所有记录（Supabase 存储后端自动清理实体文件）
  DELETE FROM storage.objects WHERE owner = OLD.id;
  -- 清理 profiles 表（ON DELETE CASCADE 兜底）
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.2 绑定触发器到 auth.users 表
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.on_auth_user_deleted();

-- 3.3 手动清理孤儿存储文件（运维用）
CREATE OR REPLACE FUNCTION public.cleanup_orphan_storage_files()
RETURNS TABLE(bucket_id TEXT, object_name TEXT, orphaned_owner UUID) AS $$
BEGIN
  RETURN QUERY
  DELETE FROM storage.objects
  WHERE owner IS NOT NULL
    AND owner NOT IN (SELECT id FROM auth.users)
  RETURNING storage.objects.bucket_id, storage.objects.name, storage.objects.owner;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.4 清理未确认邮箱的僵尸用户（可选配合 pg_cron 定时执行）
CREATE OR REPLACE FUNCTION public.cleanup_unconfirmed_users(hours_ago INTEGER DEFAULT 24)
RETURNS SETOF UUID AS $$
DECLARE
  deleted_user_id UUID;
BEGIN
  FOR deleted_user_id IN
    SELECT id FROM auth.users
    WHERE confirmed_at IS NULL
      AND created_at < now() - (hours_ago || ' hours')::INTERVAL
      AND last_sign_in_at IS NULL
  LOOP
    DELETE FROM auth.users WHERE id = deleted_user_id;
    RETURN NEXT deleted_user_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 执行完毕
-- ================================================================
-- 验收检查（在 Supabase Dashboard 中确认）：
--   Table Editor    → profiles 表存在，RLS 已启用
--   Storage         → avatars、public、private 三个桶
--   Authentication  → Policies：profiles 3 条、storage.objects 9 条
--   Database        → Triggers：on_auth_user_created、on_profile_updated、on_auth_user_deleted
--
-- 后续维护命令：
--   SELECT * FROM public.cleanup_orphan_storage_files();      -- 清理孤儿文件
--   SELECT * FROM public.cleanup_unconfirmed_users(72);       -- 清理 72h 未确认用户
