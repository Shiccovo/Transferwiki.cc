import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const docsDirectory = path.join(process.cwd(), 'content/docs');
const listPath = path.join(docsDirectory, 'list.txt');

// 配置 marked：开启 GFM（表格、删除线等）
marked.setOptions({ gfm: true, breaks: false });

/**
 * 读取文档配置文件 (list.txt)
 * 格式: filename.md - 标题
 */
export function getDocsConfig() {
  try {
    const fileContents = fs.readFileSync(listPath, 'utf8');
    const lines = fileContents.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const match = line.trim().match(/^(.+?)\.md\s*-\s*(.+)$/);
      if (!match) return null;
      return {
        slug: match[1].trim(),
        title: match[2].trim(),
        order: index,
      };
    }).filter(Boolean);
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

  docs.sort((a, b) => a.order - b.order);
  return docs;
}

/**
 * 处理markdown中的内部链接
 * 将简单的文档slug链接 /page 转换为 /wiki/page
 */
function processInternalLinks(content) {
  return content.replace(/\[([^\]]+)\]\(\/([^)]+)\)/g, (match, text, link) => {
    if (
      link.startsWith('wiki/') ||
      link.startsWith('schools/') ||
      link.startsWith('forum') ||
      link.startsWith('about') ||
      link.startsWith('datapoints') ||
      link.startsWith('login') ||
      link.startsWith('profile')
    ) {
      return match;
    }
    return `[${text}](/wiki/${link})`;
  });
}

/**
 * 将 markdown 字符串转换为 HTML
 */
function markdownToHtml(content) {
  return marked.parse(content);
}

/**
 * 获取单个文档的完整内容
 */
export async function getDocBySlug(slug) {
  try {
    const fullPath = path.join(docsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const processedMarkdown = processInternalLinks(content);
    const contentHtml = markdownToHtml(processedMarkdown);

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

/**
 * 获取所有学校的slugs（用于静态路径生成）
 */
export function getAllSchoolSlugs() {
  const schoolsDir = path.join(docsDirectory, 'schools');
  try {
    return fs.readdirSync(schoolsDir)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''));
  } catch {
    return [];
  }
}

/**
 * 获取单个学校页面的完整内容
 */
export async function getSchoolBySlug(slug) {
  const schoolsDir = path.join(docsDirectory, 'schools');
  try {
    const fullPath = path.join(schoolsDir, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const contentHtml = markdownToHtml(content);
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = data.title || titleMatch?.[1] || slug.toUpperCase();

    return { slug, title, description: data.description || '', content: contentHtml };
  } catch (error) {
    console.error(`Error getting school ${slug}:`, error);
    return null;
  }
}
