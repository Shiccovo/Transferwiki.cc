# TransferWiki.cc 用户认证和内容管理系统

本文档提供了关于 TransferWiki.cc 网站新增功能的安装和使用说明。

## 新增功能

- 用户认证系统（支持 Google 和 QQ 登录）
- 评论功能
- 页面编辑建议功能
- 管理员审核内容的管理中心

## 技术栈

- Next.js
- NextAuth.js
- 开发环境：SQLite 数据库
- 生产环境：Supabase (PostgreSQL 数据库)
- Prisma ORM

## 安装说明

### 1. 设置 Supabase

1. 在 [Supabase](https://supabase.com/) 创建一个新项目
2. 记下项目 URL 和匿名密钥（anon key）
3. 将这些信息添加到 `.env.local` 文件中：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL="postgresql://postgres:password@db.your-project-id.supabase.co:5432/postgres"
```

### 2. 设置 OAuth 提供商

#### Google OAuth 设置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建一个新项目
3. 在 API 和服务 > 凭据中创建 OAuth 客户端 ID
4. 设置授权重定向 URI 为 `https://your-domain.com/api/auth/callback/google`（开发环境使用 `http://localhost:3000/api/auth/callback/google`）
5. 记下客户端 ID 和客户端密钥
6. 将这些信息添加到 `.env.local` 文件中：

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### QQ OAuth 设置

1. 访问 [QQ 互联](https://connect.qq.com/)
2. 创建一个新应用
3. 设置回调域名为 `your-domain.com`（开发环境使用 `localhost:3000`）
4. 记下 APP ID 和 APP Key
5. 将这些信息添加到 `.env.local` 文件中：

```
QQ_CLIENT_ID=your-qq-client-id
QQ_CLIENT_SECRET=your-qq-client-secret
```

### 3. 设置管理员

在 `.env.local` 文件中添加管理员邮箱地址列表：

```
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

注意：第一个注册的用户将自动成为管理员。您也可以使用以下命令直接创建管理员用户：

```bash
npm run db:create-admin "管理员名称" "admin@example.com"
```

### 4. 设置数据库

#### 开发环境（SQLite）

项目默认配置使用SQLite数据库进行开发，这样可以快速开始而无需配置远程数据库。

```bash
# 设置开发环境数据库配置
npm run db:setup-dev

# 生成Prisma客户端并创建数据库
npx prisma generate && npx prisma db push
```

#### 生产环境（Supabase PostgreSQL）

对于生产环境，您需要更新Prisma配置以使用PostgreSQL：

1. 设置生产环境的数据库URL（在 `.env` 或 `.env.local` 中）：

```
DATABASE_URL="postgresql://postgres:password@db.your-project-id.supabase.co:5432/postgres"
```

2. 运行脚本更新Prisma配置：

```bash
# 设置生产环境数据库配置
npm run db:setup-prod

# 生成Prisma客户端并创建数据库
npx prisma generate && npx prisma db push
```

### 5. 启动应用

```bash
# 开发环境
npm run dev

# 生产环境
npm run build
npm run start
```

## 使用说明

### 用户认证

- 用户可以通过点击导航栏右上角的「登录」按钮登录
- 支持 Google 和 QQ 账号登录

### 评论功能

- 登录用户可以在每个页面底部看到评论区
- 可以发表、查看评论

### 页面编辑

- 登录用户可以点击页面右上角的「编辑页面」按钮提交编辑请求
- 编辑请求需要管理员审核

### 管理中心

- 管理员可以通过右上角用户菜单进入管理中心
- 管理中心可以：
  - 审核页面编辑请求
  - 管理用户角色

## 用户角色

系统有三种用户角色：

1. **USER**: 普通用户，可以评论和提交编辑请求
2. **EDITOR**: 编辑用户，功能同普通用户
3. **ADMIN**: 管理员，可以审核编辑请求和管理用户角色

## 开发者说明

### 目录结构

```
/components        - 组件
  /CommentSection.jsx  - 评论区组件
  /EditPageButton.jsx  - 编辑页面按钮组件
/pages             - 页面
  /api             - API 端点
    /auth          - 认证相关 API
    /comments      - 评论相关 API
    /pages         - 页面编辑相关 API
    /admin         - 管理中心相关 API
  /auth            - 认证页面
  /admin           - 管理中心页面
/prisma            - Prisma ORM 相关文件
  /schema.prisma   - 数据库模型定义
```

### 数据库模型

主要模型包括：

- **User**: 用户信息
- **Account**: OAuth 账号关联
- **Session**: 用户会话
- **Comment**: 页面评论
- **PageEdit**: 页面编辑请求