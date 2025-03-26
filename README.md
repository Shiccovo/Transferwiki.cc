# TransferWiki.cc

转学生资源网站 - 为中国留学生提供全面的转学资源与指南

## 本地开发

### 环境变量设置

创建一个 `.env.local` 文件，添加以下环境变量：

```
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_anon_key

DATABASE_URL=

DIRECT_URL=



### 启动开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 部署

网站使用 Vercel 自动部署。每当有提交推送到 main 分支时，将自动触发构建和部署流程。

## 项目结构

- `/pages` - 网站的页面内容
  - `/pages/api` - API 路由
  - `/pages/admin` - 管理后台
  - `/pages/wiki` - Wiki 页面
  - `/pages/schools` - 各大学校的信息
- `/components` - React 组件
- `/lib` - 共享函数和库
  - `/lib/db.js` - 数据库操作
  - `/lib/supabase.js` - Supabase 客户端
- `/scripts` - 脚本文件
  - `/scripts/supabase-schema.sql` - 数据库架构
  
## 贡献指南

欢迎通过 Pull Request 贡献更多学校和转学信息。

## 数据库架构

系统使用 Supabase PostgreSQL 数据库，主要表包括：

- `Profile` - 用户数据
- `Page` - Wiki 页面内容
- `PageEdit` - 编辑历史
- `Comment` - 评论
- `ForumCategory` - 论坛分类
- `ForumTopic` - 论坛主题
- `ForumReply` - 论坛回复