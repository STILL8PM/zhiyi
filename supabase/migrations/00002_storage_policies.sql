-- ================================================================
-- Storage RLS 策略 —— 通过 Supabase CLI 推送（绕过 postgres 权限限制）
-- 推送命令: npx supabase db push
-- ================================================================

-- 1. 确保 storage.objects 启用 RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================
-- avatars 桶（4 条）
-- ============================

DROP POLICY IF EXISTS "avatars_public_select" ON storage.objects;
CREATE POLICY "avatars_public_select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_auth_insert" ON storage.objects;
CREATE POLICY "avatars_auth_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_auth_update" ON storage.objects;
CREATE POLICY "avatars_auth_update" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
  );

DROP POLICY IF EXISTS "avatars_auth_delete" ON storage.objects;
CREATE POLICY "avatars_auth_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
  );

-- ============================
-- public 桶（3 条）
-- ============================

DROP POLICY IF EXISTS "public_public_select" ON storage.objects;
CREATE POLICY "public_public_select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'public');

DROP POLICY IF EXISTS "public_auth_insert" ON storage.objects;
CREATE POLICY "public_auth_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'public'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "public_auth_delete" ON storage.objects;
CREATE POLICY "public_auth_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'public'
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
  );

-- ============================
-- private 桶（4 条）
-- ============================

DROP POLICY IF EXISTS "private_owner_select" ON storage.objects;
CREATE POLICY "private_owner_select" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'private'
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
  );

DROP POLICY IF EXISTS "private_auth_insert" ON storage.objects;
CREATE POLICY "private_auth_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'private'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "private_owner_update" ON storage.objects;
CREATE POLICY "private_owner_update" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'private'
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
  );

DROP POLICY IF EXISTS "private_owner_delete" ON storage.objects;
CREATE POLICY "private_owner_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'private'
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
  );
