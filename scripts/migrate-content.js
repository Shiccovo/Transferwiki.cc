// 将 MDX 文件内容迁移到数据库中
const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 默认管理员ID - 应当是已创建的用户
const DEFAULT_ADMIN_ID = process.env.DEFAULT_ADMIN_ID || '';

if (!DEFAULT_ADMIN_ID) {
  console.error('请设置 DEFAULT_ADMIN_ID 环境变量指向有效的管理员用户ID');
  process.exit(1);
}

// MDX 内容路径映射
const contentMapping = [
  { mdxPath: 'pages/schools/osu.mdx', slug: 'schools/osu' },
  { mdxPath: 'pages/schools/purdue.mdx', slug: 'schools/purdue' },
  { mdxPath: 'pages/schools/stanford.mdx', slug: 'schools/stanford' },
  { mdxPath: 'pages/schools/uiuc.mdx', slug: 'schools/uiuc' },
  { mdxPath: 'pages/schools/umich.mdx', slug: 'schools/umich' },
  { mdxPath: 'pages/schools/umn.mdx', slug: 'schools/umn' },
  { mdxPath: 'pages/schools/wisc.mdx', slug: 'schools/wisc' },
  { mdxPath: 'pages/admit.mdx', slug: 'admit' },
  { mdxPath: 'pages/apply.mdx', slug: 'apply' },
  { mdxPath: 'pages/bgs.mdx', slug: 'bgs' },
  { mdxPath: 'pages/faq.mdx', slug: 'faq' },
  { mdxPath: 'pages/future.mdx', slug: 'future' },
  { mdxPath: 'pages/intro.mdx', slug: 'intro' },
  { mdxPath: 'pages/material.mdx', slug: 'material' },
  { mdxPath: 'pages/think.mdx', slug: 'think' },
];

// 从 MDX 文件中提取元数据和内容
async function extractContentFromMdx(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // 提取元数据（---之间的内容）
    const metadataMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
    const metadata = {};
    
    if (metadataMatch && metadataMatch[1]) {
      const metadataStr = metadataMatch[1];
      // 解析元数据
      metadataStr.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
          const value = valueParts.join(':').trim();
          if (value.startsWith('"') && value.endsWith('"')) {
            metadata[key.trim()] = value.substring(1, value.length - 1);
          } else {
            metadata[key.trim()] = value;
          }
        }
      });
    }
    
    // 提取实际内容（移除元数据部分）
    let mainContent = content;
    if (metadataMatch) {
      mainContent = content.substring(metadataMatch[0].length).trim();
    }
    
    return {
      title: metadata.title || path.basename(filePath, '.mdx'),
      description: metadata.description || '',
      content: mainContent,
    };
  } catch (error) {
    console.error(`读取文件 ${filePath} 出错:`, error.message);
    return null;
  }
}

// 迁移单个文件到数据库
async function migrateFileToDatabase(mapping) {
  try {
    console.log(`处理: ${mapping.mdxPath} -> ${mapping.slug}`);
    
    // 检查文件是否存在
    try {
      await fs.access(mapping.mdxPath);
    } catch (error) {
      console.warn(`文件不存在，跳过: ${mapping.mdxPath}`);
      return;
    }
    
    // 提取内容
    const { title, description, content } = await extractContentFromMdx(mapping.mdxPath);
    
    if (!content) {
      console.warn(`无法提取内容，跳过: ${mapping.mdxPath}`);
      return;
    }
    
    // 检查页面是否已存在
    const existingPage = await prisma.page.findUnique({
      where: { slug: mapping.slug },
    });
    
    if (existingPage) {
      console.log(`页面已存在，更新内容: ${mapping.slug}`);
      // 更新现有页面
      await prisma.page.update({
        where: { slug: mapping.slug },
        data: {
          title,
          description,
          content,
          version: { increment: 1 },
          lastEditedById: DEFAULT_ADMIN_ID,
        },
      });
      
      // 记录编辑历史
      await prisma.pageEdit.create({
        data: {
          pageId: existingPage.id,
          content,
          title,
          description,
          userId: DEFAULT_ADMIN_ID,
          version: existingPage.version + 1,
          status: 'APPROVED',
          summary: '从MDX文件迁移',
        },
      });
    } else {
      console.log(`创建新页面: ${mapping.slug}`);
      // 创建新页面
      const newPage = await prisma.page.create({
        data: {
          slug: mapping.slug,
          title,
          description,
          content,
          createdById: DEFAULT_ADMIN_ID,
          lastEditedById: DEFAULT_ADMIN_ID,
          version: 1,
          isPublished: true,
          category: mapping.slug.split('/')[0],
        },
      });
      
      // 记录首次编辑历史
      await prisma.pageEdit.create({
        data: {
          pageId: newPage.id,
          content,
          title,
          description,
          userId: DEFAULT_ADMIN_ID,
          version: 1,
          status: 'APPROVED',
          summary: '初始内容导入',
        },
      });
    }
    
    console.log(`成功导入: ${mapping.slug}`);
  } catch (error) {
    console.error(`处理 ${mapping.mdxPath} 失败:`, error);
  }
}

// 主函数，处理所有映射
async function migrateAllContent() {
  try {
    console.log('开始内容迁移...');
    
    // 检查管理员用户是否存在
    const adminUser = await prisma.user.findUnique({
      where: { id: DEFAULT_ADMIN_ID },
    });
    
    if (!adminUser) {
      console.error('指定的管理员ID不存在，请确保用户已创建');
      process.exit(1);
    }
    
    console.log(`使用管理员: ${adminUser.name} (${adminUser.email})`);
    
    // 逐个处理文件
    for (const mapping of contentMapping) {
      await migrateFileToDatabase(mapping);
    }
    
    console.log('内容迁移完成！');
  } catch (error) {
    console.error('迁移过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行迁移
migrateAllContent();