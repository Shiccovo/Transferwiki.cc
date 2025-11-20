# 静态文档系统实现总结

## 完成时间
2025-11-20

## 实现概述

成功为 Transferwiki.cc 项目实现了一个完全独立于 Supabase 数据库的静态 Markdown 文档系统。

## 技术栈

- **Next.js SSG**: 静态站点生成
- **gray-matter**: Markdown frontmatter 解析
- **remark/rehype**: Markdown 处理和转换
- **Tailwind CSS + Typography**: 样式美化

## 文件结构

### 新增文件

```
content/docs/                    # 文档内容目录
├── list.txt                     # 文档配置（顺序和标题）
├── README.md                    # 使用说明
├── index.md                     # 首页
├── intro.md                     # 前言
├── guide.md                     # 内容导航
├── think.md                     # 转学的利与弊
├── school.md                    # 定位择校
├── material.md                  # 材料准备
├── apply.md                     # 申请流程
├── admit.md                     # 录取后
├── faq.md                       # 常见问题
├── future.md                    # 未来规划
├── school_list.md               # 学校列表
├── bgs.md                       # 附录：学生案例
└── schools/                     # 学校子目录
    ├── osu.md
    ├── purdue.md
    ├── stanford.md
    ├── uiuc.md
    ├── umich.md
    ├── umn.md
    └── wisc.md

lib/
└── staticDocs.js                # 文档读取和处理工具

pages/wiki/docs/
├── index.js                     # 文档列表页
└── [slug].js                    # 文档详情页（动态路由）
```

### 修改的文件

1. **package.json**
   - 添加 `gray-matter` 依赖
   - 添加 `@tailwindcss/typography` 依赖

2. **tailwind.config.js**
   - 启用 Typography 插件

3. **styles/globals.css**
   - 添加自定义 prose 样式
   - 支持深色模式

4. **pages/wiki/index.js**
   - 添加"文档中心"入口按钮

## 核心功能

### 1. 文档配置 (list.txt)

格式：
```
filename.md - 显示标题
```

示例：
```
index.md - 首页
intro.md - 前言
guide.md - 内容导航
```

### 2. 自动链接转换

文档中的内部链接自动转换：
- 输入：`[链接](/page)`
- 输出：`/wiki/docs/page`

### 3. 侧边栏导航

- 左侧显示文档列表
- 按 list.txt 中的顺序排列
- 当前文档高亮显示
- 响应式设计（移动端可折叠）

### 4. 文档页面功能

- 面包屑导航
- Markdown 完整支持
- 上一篇/下一篇导航
- 深色模式支持
- 代码高亮
- 表格样式
- 响应式布局

## 访问路径

| 路径 | 说明 |
|------|------|
| `/wiki` | Wiki 首页（包含文档中心入口） |
| `/wiki/docs` | 文档列表页 |
| `/wiki/docs/index` | 首页文档 |
| `/wiki/docs/intro` | 前言文档 |
| `/wiki/docs/[slug]` | 其他文档页面 |

## 特点

✅ **完全静态**: 使用 Next.js SSG，构建时生成所有页面
✅ **独立运行**: 不依赖 Supabase 或任何数据库
✅ **易于维护**: 直接编辑 Markdown 文件
✅ **灵活配置**: 通过 list.txt 控制顺序和标题
✅ **美观设计**: Tailwind Typography + 自定义样式
✅ **响应式**: 完美适配桌面和移动端
✅ **深色模式**: 自动支持深色主题

## 使用方法

### 添加新文档

1. 在 `content/docs/` 创建 `.md` 文件
2. 在 `list.txt` 添加配置行
3. 重新构建项目

### 修改文档顺序

1. 编辑 `content/docs/list.txt`
2. 调整行的位置
3. 重新构建项目

### 修改文档标题

1. 编辑 `content/docs/list.txt`
2. 修改 `-` 后面的标题文字
3. 重新构建项目

## 构建命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start
```

## 下一步建议

1. **搜索功能**: 可以添加文档搜索功能
2. **目录生成**: 自动生成文档内的目录（TOC）
3. **编辑历史**: 如需要，可集成 Git 显示编辑历史
4. **评论功能**: 为文档添加评论区
5. **多级导航**: 支持子目录和嵌套导航

## 注意事项

- 文档文件必须是 UTF-8 编码
- list.txt 中的文件名必须与实际文件对应
- 内部链接使用 `/page` 格式会自动转换
- 修改文档后需要重新构建才能生效

## 维护者

如有问题，请查看：
- `content/docs/README.md` - 详细使用说明
- `lib/staticDocs.js` - 核心实现代码
- GitHub Issues - 报告问题或建议

