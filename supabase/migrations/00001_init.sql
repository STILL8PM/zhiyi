-- ============================================
-- Supabase 初始数据库迁移
-- 描述: 创建 profiles 表并配置 RLS 策略
-- 运行: 在 Supabase SQL Editor 中执行此文件
-- ============================================

-- 1. 创建用户扩展资料表
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 启用 Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS 策略: 用户可查看所有公开资料
CREATE POLICY "公开资料所有人可查看"
  ON public.profiles FOR SELECT
  USING (true);

-- 4. RLS 策略: 用户只能修改自己的资料
CREATE POLICY "用户可修改自己的资料"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. RLS 策略: 用户只能插入自己的资料
CREATE POLICY "用户可创建自己的资料"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 6. 创建触发器函数: 新用户注册时自动创建 profiles 记录
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

-- 7. 绑定触发器到 auth.users 表
-- 注意: 如果触发器已存在则先删除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. 绑定 updated_at 触发器
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. 创建存储桶（需在 Supabase Dashboard > Storage 中手动创建）
-- avatars  - 公开，用户头像
-- public   - 公开，文章配图等
-- private  - 私密，用户私有文件
