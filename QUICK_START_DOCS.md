# 文档系统快速启动指南

## 立即开始

### 1. 安装依赖（如果还没有安装）

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问文档

打开浏览器访问：
- 文档列表：http://localhost:3000/wiki/docs
- 首页文档：http://localhost:3000/wiki/docs/index

## 文档已就绪

以下文档已经配置并可以访问：

1. **首页** - `/wiki/docs/index`
2. **前言** - `/wiki/docs/intro`
3. **内容导航** - `/wiki/docs/guide`
4. **转学的利与弊** - `/wiki/docs/think`
5. **定位择校** - `/wiki/docs/school`
6. **材料准备** - `/wiki/docs/material`
7. **申请流程** - `/wiki/docs/apply`
8. **录取后** - `/wiki/docs/admit`
9. **常见问题** - `/wiki/docs/faq`
10. **未来规划** - `/wiki/docs/future`
11. **学校列表** - `/wiki/docs/school_list`
12. **附录：学生案例** - `/wiki/docs/bgs`

## 如何修改

### 修改文档内容

直接编辑 `content/docs/` 目录下的 `.md` 文件，保存后刷新页面即可看到变化（开发模式）。

### 修改显示顺序

编辑 `content/docs/list.txt` 文件，调整行的顺序。

### 添加新文档

1. 在 `content/docs/` 创建新的 `.md` 文件
2. 在 `content/docs/list.txt` 底部添加一行：
   ```
   new-file.md - 新文档标题
   ```
3. 刷新页面

## 部署

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 功能特性

✅ 左侧导航栏（显示所有文档）
✅ 面包屑导航
✅ 上一篇/下一篇导航
✅ 响应式设计（支持移动端）
✅ 深色模式支持
✅ Markdown 完整支持
✅ 代码高亮
✅ 表格样式
✅ 自动内部链接转换

## 需要帮助？

查看详细文档：
- `content/docs/README.md` - 使用说明
- `DOCS_IMPLEMENTATION.md` - 实现细节

## 注意事项

⚠️ 文档内容修改后，在生产环境需要重新构建（`npm run build`）
⚠️ `list.txt` 中的文件名必须与实际文件匹配
⚠️ 确保所有 `.md` 文件都是 UTF-8 编码

