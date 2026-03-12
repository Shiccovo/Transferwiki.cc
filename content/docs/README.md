# 静态文档系统使用说明

## 概述

这个目录包含了所有静态文档内容，这些文档将在 `/wiki/docs/*` 路径下显示。

## 文件结构

```
content/docs/
├── list.txt          # 文档配置文件（控制显示顺序和标题）
├── *.md             # 各个文档文件
└── schools/         # 学校相关文档子目录
```

## 如何添加新文档

### 1. 创建 Markdown 文件

在 `content/docs/` 目录下创建新的 `.md` 文件，例如 `new-doc.md`

### 2. 编写内容

使用标准的 Markdown 语法编写内容：

```markdown
# 文档标题

这是文档内容...

## 二级标题

- 列表项1
- 列表项2

[链接到其他文档](/other-doc)
```

### 3. 更新 list.txt

在 `list.txt` 文件中添加新文档的配置：

```
new-doc.md - 新文档的标题
```

格式说明：
- `new-doc.md` 是文件名（可以省略 `.md` 后缀）
- `-` 是分隔符
- `新文档的标题` 是在侧边栏显示的标题

### 4. 顺序控制

文档在侧边栏的显示顺序由 `list.txt` 中的行顺序决定。
调整行的位置即可改变文档的显示顺序。

## 内部链接

文档中的内部链接会自动转换：
- 原始链接：`[链接文字](/page)`
- 自动转换为：`/wiki/docs/page`

## 支持的 Markdown 特性

- 标题（# ## ###）
- 列表（有序和无序）
- 链接和图片
- 代码块和行内代码
- 表格
- 引用块
- 粗体和斜体
- 水平线

## 访问路径

- 文档列表页：`/wiki/docs`
- 具体文档：`/wiki/docs/{slug}`
  - 例如：`/wiki/docs/index` 对应 `index.md`
  - 例如：`/wiki/docs/guide` 对应 `guide.md`

## 技术细节

- 使用 Next.js 静态生成（SSG）
- Markdown 处理：gray-matter + remark
- 样式：Tailwind CSS + Typography 插件
- 完全独立于 Supabase 数据库

