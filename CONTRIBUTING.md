# 贡献指南

感谢您考虑为Transferwiki.cc做出贡献！这份指南将帮助您了解如何向网站添加新内容。

## 添加新学校

最简单的方法是使用我们提供的模板：

1. 复制 `templates/school-template.mdx` 文件到 `pages/schools/` 目录，并将文件名改为学校名称的英文简称（小写），例如 `ucla.mdx`

2. 编辑文件中的元数据部分：

```
---
title: 加州大学洛杉矶分校转学指南
description: UCLA简短描述
schoolName: University of California, Los Angeles
schoolInitial: U
schoolColor: nx-from-blue-500 nx-to-yellow-500
---
```

注意：
- `title`: 页面标题，通常是"学校名称转学指南"
- `description`: 学校的简短描述，将显示在页面顶部的信息框中
- `schoolName`: 学校的完整英文名称
- `schoolInitial`: 学校名称的首字母，用于显示在页面顶部的圆形图标中
- `schoolColor`: 学校的主题颜色，用于页面顶部的圆形图标和其他装饰元素

3. 按照模板中的格式填写学校信息，包括：
   - 学校简介
   - 学校排名
   - 申请材料
   - 重要日期
   - 录取侧重
   - 转学录取数据

4. 在 `pages/schools/_meta.json` 文件中添加新学校的条目：

```
"ucla": "加州大学洛杉矶分校"
```

5. 在 `pages/school.mdx` 的学校列表中添加新学校：

```js
{ name: '加州大学洛杉矶分校', path: '/schools/ucla', color: 'nx-from-blue-500 nx-to-yellow-500' },
```

重要提示：**只使用纯Markdown语法**。不要添加HTML或Tailwind CSS类。所有样式和布局将由我们的组件自动处理。

## 更新现有内容

1. 找到需要更新的`.mdx`文件
2. 直接编辑文件内容（只使用纯Markdown语法）
3. 提交更改

## 提交PR

1. Fork这个仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-contribution`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-contribution`)
5. 创建新的Pull Request

## Markdown语法指南

请只使用以下Markdown语法：

### 标题

```markdown
# 一级标题
## 二级标题
### 三级标题
```

### 文本格式

```markdown
**粗体**
*斜体*
~~删除线~~
```

### 列表

```markdown
- 无序列表项
- 另一个无序列表项

1. 有序列表项
2. 另一个有序列表项
```

### 链接

```markdown
[链接文本](URL)
```

### 图片

```markdown
![图片替代文本](图片URL)
```

### 表格

```markdown
| 表头 1 | 表头 2 |
| ------ | ------ |
| 单元格 1 | 单元格 2 |
| 单元格 3 | 单元格 4 |
```

### 引用

```markdown
> 这是引用的文本
```

### 代码

```markdown
`行内代码`

​```
代码块
​```
```

所有样式和布局将由我们的组件自动处理，不需要添加HTML或CSS。

感谢您的贡献！