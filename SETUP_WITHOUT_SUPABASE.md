# 无 Supabase 凭证的设置方案

## 问题
你没有 Supabase 环境变量，但想使用文档系统。

## 解决方案

文档系统 (`/wiki/docs/*`) 完全独立，不需要真实的 Supabase 凭证。我们可以使用占位符值来通过构建检查。

### 步骤 1: 创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件，使用以下占位符值：

```env
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder
```

### 步骤 2: 运行开发服务器

```bash
npm run dev
```

### 步骤 3: 访问文档系统

打开浏览器访问：
- http://localhost:3000/wiki/docs

## 工作原理

1. ✅ **文档页面完全独立**：使用 `DocsLayout`，不调用 Supabase
2. ✅ **占位符凭证**：仅用于通过环境变量检查
3. ⚠️ **其他页面不可用**：需要登录的页面（如论坛、个人资料等）将无法工作，但文档页面完全正常

## 可用的功能

使用占位符凭证时，以下功能**完全可用**：

- ✅ `/wiki/docs` - 文档列表
- ✅ `/wiki/docs/index` - 首页
- ✅ `/wiki/docs/intro` - 前言
- ✅ `/wiki/docs/guide` - 内容导航
- ✅ `/wiki/docs/think` - 转学的利与弊
- ✅ `/wiki/docs/school` - 定位择校
- ✅ `/wiki/docs/material` - 材料准备
- ✅ `/wiki/docs/apply` - 申请流程
- ✅ `/wiki/docs/admit` - 录取后
- ✅ `/wiki/docs/faq` - 常见问题
- ✅ 所有其他文档页面

## 不可用的功能

使用占位符凭证时，以下功能**不可用**（因为需要真实的 Supabase 连接）：

- ❌ 用户登录/注册
- ❌ Wiki 编辑功能
- ❌ 论坛功能
- ❌ 数据库驱动的 Wiki 页面

## 生产部署

对于生产环境，你有两个选择：

### 选项 1: 仅部署文档系统

创建一个精简版本，只包含文档功能（需要修改路由配置）。

### 选项 2: 获取真实凭证

联系原作者获取 Supabase 项目凭证，或创建自己的 Supabase 项目。

## 测试确认

运行以下命令测试文档系统是否工作：

```bash
# 1. 确保 .env.local 存在
cat .env.local  # Linux/Mac
type .env.local  # Windows

# 2. 启动开发服务器
npm run dev

# 3. 在浏览器中测试
# http://localhost:3000/wiki/docs
```

## 总结

✅ **文档系统已完全实现**
✅ **不需要真实的 Supabase 凭证**
✅ **使用占位符即可运行**
✅ **原代码保持完整不变**

你现在可以：
1. 创建 `.env.local` 文件（使用占位符）
2. 运行 `npm run dev`
3. 访问文档系统

