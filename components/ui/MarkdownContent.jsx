import { useEffect } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypePrism from 'rehype-prism-plus';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// 渲染Markdown内容
export default function MarkdownContent({ content }) {
  const htmlContent = renderMarkdown(content);
  
  // 处理代码高亮和其他交互
  useEffect(() => {
    // 如果需要添加额外的客户端交互可以在这里实现
  }, []);
  
  return (
    <div 
      className="markdown-content" 
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

// Markdown转换函数
function renderMarkdown(content) {
  if (!content) return '';
  
  try {
    // 使用unified处理Markdown
    const result = unified()
      .use(remarkParse) // 解析Markdown
      .use(remarkRehype) // 转换为HTML
      .use(rehypeSlug) // 给标题添加ID
      .use(rehypeAutolinkHeadings) // 自动添加标题链接
      .use(rehypePrism, { ignoreMissing: true }) // 代码高亮
      .use(rehypeStringify) // 输出HTML字符串
      .processSync(content);
      
    return result.toString();
  } catch (error) {
    console.error('Error rendering markdown:', error);
    return `<p class="text-red-500">Error rendering content</p>`;
  }
}