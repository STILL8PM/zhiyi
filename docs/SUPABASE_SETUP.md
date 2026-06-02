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

## 3. 初始化数据库

在 Supabase SQL Editor 中执行 `supabase/migrations/00001_init.sql`

## 4. 配置认证

- Dashboard → Authentication → Providers
- 启用 Email 提供商
- （可选）配置第三方登录：Google、GitHub、微信等

## 5. 创建存储桶

Dashboard → Storage → New Bucket：
- `avatars` — 公开桶
- `public` — 公开桶
- `private` — 私密桶

## 6. 域名白名单（微信小程序）

微信小程序后台 → 开发管理 → 服务器域名：
- request 合法域名: `https://your-project.supabase.co`
- uploadFile 合法域名: `https://your-project.supabase.co`
- downloadFile 合法域名: `https://your-project.supabase.co`
