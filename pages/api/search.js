import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const DOCS_DIR = path.join(process.cwd(), 'content/docs');
const LIST_PATH = path.join(DOCS_DIR, 'list.txt');

// 构建搜索索引（包含主文档 + schools 子目录）
function buildIndex() {
  const items = [];

  // 读取 list.txt 获取主文档列表和标题
  try {
    const listContent = fs.readFileSync(LIST_PATH, 'utf8');
    const lines = listContent.split('\n').filter(l => l.trim());

    for (const line of lines) {
      const match = line.trim().match(/^(.+?)\.md\s*-\s*(.+)$/);
      if (!match) continue;
      const slug = match[1].trim();
      const title = match[2].trim();

      try {
        const filePath = path.join(DOCS_DIR, `${slug}.md`);
        const raw = fs.readFileSync(filePath, 'utf8');
        const { content } = matter(raw);
        items.push({ slug, title, content, type: 'wiki', href: `/wiki/${slug}` });
      } catch {}
    }
  } catch {}

  // 读取 schools 子目录
  const schoolsDir = path.join(DOCS_DIR, 'schools');
  try {
    const schoolFiles = fs.readdirSync(schoolsDir).filter(f => f.endsWith('.md'));
    for (const file of schoolFiles) {
      const slug = file.replace('.md', '');
      try {
        const raw = fs.readFileSync(path.join(schoolsDir, file), 'utf8');
        const { data, content } = matter(raw);
        // 从第一个 # 标题提取学校名
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = data.title || titleMatch?.[1] || slug.toUpperCase();
        items.push({ slug, title, content, type: 'school', href: `/schools/${slug}` });
      } catch {}
    }
  } catch {}

  return items;
}

// 从内容中提取包含关键词的摘录（前后各取约 40 字）
function getExcerpt(content, query) {
  const plain = content.replace(/[#*`\[\]>]/g, '').replace(/\n+/g, ' ').trim();
  const idx = plain.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return plain.substring(0, 100) + '...';
  const start = Math.max(0, idx - 40);
  const end = Math.min(plain.length, idx + query.length + 60);
  return (start > 0 ? '...' : '') + plain.substring(start, end) + (end < plain.length ? '...' : '');
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  const { q } = req.query;
  if (!q || q.trim().length < 1) {
    return res.status(200).json({ results: [] });
  }

  const query = q.trim();
  const index = buildIndex();

  const results = [];
  for (const item of index) {
    const inTitle = item.title.toLowerCase().includes(query.toLowerCase());
    const inContent = item.content.toLowerCase().includes(query.toLowerCase());

    if (!inTitle && !inContent) continue;

    results.push({
      slug: item.slug,
      title: item.title,
      excerpt: getExcerpt(item.content, query),
      type: item.type,
      href: item.href,
      // 标题匹配排前面
      score: inTitle ? 2 : 1,
    });
  }

  // 按 score 降序
  results.sort((a, b) => b.score - a.score);

  return res.status(200).json({ results: results.slice(0, 10) });
}
