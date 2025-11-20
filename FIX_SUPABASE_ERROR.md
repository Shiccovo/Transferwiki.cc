# 修复 Supabase 错误

## 问题
构建时出现 `Error: Missing Supabase environment variables` 错误。

## 原因
项目的其他页面（如 `reset-password.js`、`login.js` 等）依赖 Supabase，在构建时需要环境变量。

## 解决方案

### 方法 1: 创建 .env.local 文件（推荐）

在项目根目录创建 `.env.local` 文件并添加以下内容：

```env
NEXT_PUBLIC_SUPABASE_URL=你的supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的supabase匿名密钥
```

获取这些值：
1. 登录 https://supabase.com
2. 打开你的项目
3. 进入 Settings -> API
4. 复制 "Project URL" 和 "anon public" key

### 方法 2: 仅测试文档系统

如果你只想测试文档系统，可以使用开发模式：

```bash
npm run dev
```

然后访问：
- http://localhost:3000/wiki/docs （文档列表）
- http://localhost:3000/wiki/docs/index （首页文档）

## 文档系统独立性

✅ **重要**: 文档系统（`/wiki/docs/*`）已经完全独立，不依赖 Supabase。

文档系统使用：
- `DocsLayout` - 简化的布局组件（无 Supabase 依赖）
- `lib/staticDocs.js` - 纯文件系统读取
- 静态 Markdown 文件

即使 Supabase 不可用，文档页面也能正常工作！

## 验证文档系统

使用开发模式测试：

```bash
# 1. 启动开发服务器
npm run dev

# 2. 访问以下URL测试
http://localhost:3000/wiki/docs
http://localhost:3000/wiki/docs/index
http://localhost:3000/wiki/docs/intro
http://localhost:3000/wiki/docs/guide
```

所有文档应该能正常显示，包括：
- ✅ 左侧导航栏
- ✅ Markdown 渲染
- ✅ 内部链接转换
- ✅ 上一篇/下一篇导航
- ✅ 响应式布局
- ✅ 深色模式

## 生产构建

创建 `.env.local` 后，运行：

```bash
npm run build
npm start
```

## 后续建议

如果你不需要某些依赖 Supabase 的页面，可以：
1. 删除或注释掉不需要的页面
2. 或者为它们添加环境变量检查，优雅降级

