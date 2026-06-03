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

## 4. 配置存储桶 RLS 策略（Dashboard 操作）⚠️ 必须手动配置

> **重要**：`storage.objects` 表属于 `supabase_storage_admin` 角色，普通 SQL Editor 无权创建策略。
> 迁移 SQL 只能创建桶本身，**RLS 策略必须在 Dashboard 中手动配置**，否则上传文件会报 403：
> `"new row violates row-level security policy"`

### 4.1 进入策略管理

打开 Supabase Dashboard → **Storage** → 点击目标桶（如 avatars）→ **Policies** 标签

### 4.2 为 avatars 桶创建 4 条策略

| 操作 | 策略名 | 目标角色 | 条件表达式（USING / WITH CHECK） |
|------|--------|----------|----------------------------------|
| **SELECT** | `avatars_public_select` | 所有用户 | `(bucket_id = 'avatars'::text)` |
| **INSERT** | `avatars_auth_insert` | 已认证 | `(bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)` |
| **UPDATE** | `avatars_auth_update` | 已认证 | `(bucket_id = 'avatars'::text) AND (owner = auth.uid())` |
| **DELETE** | `avatars_auth_delete` | 已认证 | `(bucket_id = 'avatars'::text) AND (owner = auth.uid())` |

> **INSERT 策略说明**：`(storage.foldername(name))[1] = auth.uid()` 确保用户只能上传到自己 ID 目录下（如 `{userId}/avatar.jpg`），防止越权写入。

### 4.3 为 public 桶创建 3 条策略

| 操作 | 策略名 | 目标角色 | 条件表达式 |
|------|--------|----------|-----------|
| **SELECT** | `public_public_select` | 所有用户 | `(bucket_id = 'public'::text)` |
| **INSERT** | `public_auth_insert` | 已认证 | `(bucket_id = 'public'::text)` |
| **DELETE** | `public_auth_delete` | 已认证 | `(bucket_id = 'public'::text) AND (owner = auth.uid())` |

### 4.4 为 private 桶创建 4 条策略

| 操作 | 策略名 | 目标角色 | 条件表达式 |
|------|--------|----------|-----------|
| **SELECT** | `private_owner_select` | 已认证 | `(bucket_id = 'private'::text) AND (owner = auth.uid())` |
| **INSERT** | `private_auth_insert` | 已认证 | `(bucket_id = 'private'::text)` |
| **UPDATE** | `private_owner_update` | 已认证 | `(bucket_id = 'private'::text) AND (owner = auth.uid())` |
| **DELETE** | `private_owner_delete` | 已认证 | `(bucket_id = 'private'::text) AND (owner = auth.uid())` |

### 4.5 创建策略操作步骤

1. 点击 **Create Policy** → 选择操作类型（SELECT/INSERT/UPDATE/DELETE）
2. 策略名称填入上表对应的策略名
3. 目标角色按上表选择（`all` = 所有用户，`authenticated` = 已认证）
4. 条件表达式填入上表对应的 USING/WITH CHECK 表达式
5. 点击 **Save Policy** 保存

### 4.6 验收

配置完成后，Dashboard → **Authentication → Policies** 中应看到 `storage.objects` 下共 **11 条策略**（avatars 4 + public 3 + private 4）。

---

## 5. 配置认证提供方（Dashboard 操作）

以下操作只能在 Supabase Dashboard 中进行，无法通过 SQL 完成：

1. **Dashboard → Authentication → Providers**
   - 启用 **Email** 提供商
   - （可选）关闭 "Confirm email" 以跳过邮箱验证（开发阶段）
   - （可选）配置 Google / GitHub / Apple 等第三方登录

2. **Dashboard → Authentication → URL Configuration**
   - Site URL：开发阶段设为 `http://localhost:5173`
   - Redirect URLs：添加 `http://localhost:5173/**` 和 `http://localhost:5173/pages/auth/login/*`

## 6. 域名白名单（微信小程序）

微信小程序后台 → 开发管理 → 服务器域名：

- request 合法域名: `https://your-project.supabase.co`
- uploadFile 合法域名: `https://your-project.supabase.co`
- downloadFile 合法域名: `https://your-project.supabase.co`

## 7. 验证安装

执行完成后，在 Supabase Dashboard 中确认：

| 位置 | 应看到的内容 |
|------|-------------|
| **Table Editor** | `public.profiles` 表及其 RLS 策略已启用（3 条） |
| **Storage** | `avatars` / `public` / `private` 三个桶，每个桶下 RLS 策略已配置 |
| **Authentication → Policies** | profiles 表 3 条 + storage.objects 11 条（avatars 4 + public 3 + private 4） |
| **Database → Triggers** | `on_auth_user_created`、`on_profile_updated`、`on_auth_user_deleted` |

> ⚠️ 如果 storage.objects 下策略数不足 11 条，说明 **[步骤 4](#4-配置存储桶-rls-策略dashboard-操作️-必须手动配置) 未完成**，上传文件会报 403。

## 8. 后续维护

```sql
-- 手动清理孤儿存储文件
SELECT * FROM public.cleanup_orphan_storage_files();

-- 清理 72 小时未确认邮箱的僵尸用户
SELECT * FROM public.cleanup_unconfirmed_users(72);
```
