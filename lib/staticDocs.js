import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

const docsDirectory = path.join(process.cwd(), 'content/docs');
const configPath = path.join(docsDirectory, '_config.json');

/**
 * 读取文档配置文件 (_config.json)
 */
export function getDocsConfig() {
  try {
    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(fileContents);
    return config.docs || [];
  } catch (error) {
    console.error('Error reading docs config:', error);
    return [];
  }
}

/**
 * 获取所有文档，按配置文件中的顺序排序
 */
export function getAllDocs() {
  const config = getDocsConfig();
  
  const docs = config.map((docConfig) => {
    try {
      const fullPath = path.join(docsDirectory, `${docConfig.slug}.md`);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      
      return {
        slug: docConfig.slug,
        title: docConfig.title || data.title || docConfig.slug,
        description: data.description || '',
        order: docConfig.order || 0,
      };
    } catch (error) {
      console.error(`Error reading doc ${docConfig.slug}:`, error);
      return null;
    }
  }).filter(Boolean);
  
  // 按order字段排序
  docs.sort((a, b) => a.order - b.order);
  
  return docs;
}

/**
 * 处理markdown中的内部链接
 * 将 /page 转换为 /wiki/docs/page
 */
function processInternalLinks(content) {
  // 匹配markdown链接 [text](/link) 和 [text](link)
  // 只处理以 / 开头但不是完整URL的链接
  return content.replace(/\[([^\]]+)\]\(\/([^)]+)\)/g, (match, text, link) => {
    // 如果链接已经是 wiki/docs 开头，不处理
    if (link.startsWith('wiki/docs/')) {
      return match;
    }
    // 转换为 wiki/docs 路径
    return `[${text}](/wiki/docs/${link})`;
  });
}

/**
 * 获取单个文档的完整内容
 */
export async function getDocBySlug(slug) {
  try {
    const fullPath = path.join(docsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // 处理内部链接
    const processedMarkdown = processInternalLinks(content);
    
    // 处理markdown为HTML
    const processedContent = await remark()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeSlug)
      // 移除自动标题链接，保留 slug 用于目录导航
      .use(rehypeStringify)
      .process(processedMarkdown);
    
    const contentHtml = processedContent.toString();
    
    // 从配置中获取order和title
    const config = getDocsConfig();
    const docConfig = config.find(d => d.slug === slug);
    
    return {
      slug,
      title: docConfig?.title || data.title || slug,
      description: data.description || '',
      content: contentHtml,
      order: docConfig?.order || 0,
    };
  } catch (error) {
    console.error(`Error getting doc ${slug}:`, error);
    return null;
  }
}

/**
 * 获取文档导航数据（用于侧边栏）
 */
export function getDocsNavigation() {
  return getAllDocs();
}

/**
 * 检查文档是否存在
 */
export function docExists(slug) {
  const fullPath = path.join(docsDirectory, `${slug}.md`);
  return fs.existsSync(fullPath);
}

/**
 * 获取所有文档的slugs（用于静态路径生成）
 */
export function getAllDocSlugs() {
  const config = getDocsConfig();
  return config.map(doc => doc.slug);
}

