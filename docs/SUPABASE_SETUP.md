# Supabase 快速配置指南

## 1. 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com) 并注册/登录
2. 点击 "New Project" 创建项目
3. 设置数据库密码（请妥善保存）

## 2. 配置环境变量

将 `.env.development` 中的占位符替换为你的 Supabase 项目信息：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

> 在 Supabase Dashboard → Settings → API 中获取 URL 和 anon key

## 3. 初始化数据库（一次执行搞定）

打开 Supabase Dashboard → SQL Editor，粘贴并执行 [`supabase/migrations/00001_init.sql`](../supabase/migrations/00001_init.sql)，一次搞定三件事：

| 模块 | 内容 |
|------|------|
| **数据库** | `profiles` 表 + 3 条 RLS 策略 + 注册自动建资料触发器 + 自动更新时间戳触发器 |
| **存储桶** | `avatars` / `public` / `private` 三个桶 + 各桶 MIME/大小限制 + 9 条 RLS 策略 |
| **清理机制** | 用户注销自动删存储文件触发器 + 孤儿文件清理函数 + 未确认邮箱僵尸清理函数

## 4. 配置认证（Dashboard 操作）

以下操作只能在 Supabase Dashboard 中进行，无法通过 SQL 完成：

1. **Dashboard → Authentication → Providers**
   - 启用 **Email** 提供商
   - （可选）关闭 "Confirm email" 以跳过邮箱验证（开发阶段）
   - （可选）配置 Google / GitHub / Apple 等第三方登录

2. **Dashboard → Authentication → URL Configuration**
   - Site URL：开发阶段设为 `http://localhost:5173`
   - Redirect URLs：添加 `http://localhost:5173/**` 和 `http://localhost:5173/pages/auth/login/*`

## 5. 域名白名单（微信小程序）

微信小程序后台 → 开发管理 → 服务器域名：

- request 合法域名: `https://your-project.supabase.co`
- uploadFile 合法域名: `https://your-project.supabase.co`
- downloadFile 合法域名: `https://your-project.supabase.co`

## 6. 验证安装

执行完成后，在 Supabase Dashboard 中确认：

| 位置 | 应看到的内容 |
|------|-------------|
| **Table Editor** | `public.profiles` 表及其 RLS 策略已启用 |
| **Storage** | `avatars` / `public` / `private` 三个桶 |
| **Authentication → Policies** | profiles 表有 3 条 RLS 策略，storage.objects 有 9 条策略 |
| **Database → Triggers** | `on_auth_user_created`、`on_profile_updated`、`on_auth_user_deleted` |

## 7. 后续维护

```sql
-- 手动清理孤儿存储文件
SELECT * FROM public.cleanup_orphan_storage_files();

-- 清理 72 小时未确认邮箱的僵尸用户
SELECT * FROM public.cleanup_unconfirmed_users(72);
```
