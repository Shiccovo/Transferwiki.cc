import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  // 获取用户会话
  const session = await getServerSession(req, res, authOptions);
  
  // 检查是否已登录
  if (!session || !session.user) {
    return res.status(401).json({ message: '请先登录' });
  }
  
  // 根据请求方法处理不同操作
  switch (req.method) {
    case 'GET':
      return getPages(req, res);
    case 'POST':
      return createPage(req, res, session.user);
    default:
      return res.status(405).json({ message: '方法不允许' });
  }
}

// 获取页面列表
async function getPages(req, res) {
  try {
    const {
      category,
      search,
      limit = 10,
      offset = 0,
      sort = 'updatedAt',
      order = 'desc',
    } = req.query;
    
    // 构建查询条件
    const where = {
      isPublished: true, // 默认只返回已发布页面
    };
    
    // 按分类筛选
    if (category) {
      where.category = category;
    }
    
    // 按关键词搜索（标题、内容、描述）
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // 执行查询
    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        orderBy: { [sort]: order },
        take: parseInt(limit, 10),
        skip: parseInt(offset, 10),
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          lastEditedBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.page.count({ where }),
    ]);
    
    return res.status(200).json({
      pages,
      total,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
  } catch (error) {
    console.error('获取页面列表错误:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}

// 创建新页面
async function createPage(req, res, user) {
  try {
    const { title, content, description, slug, category, tags } = req.body;
    
    // 验证必要字段
    if (!title || !content || !slug) {
      return res.status(400).json({ message: '标题、内容和slug是必填字段' });
    }
    
    // 检查slug是否已存在
    const existingPage = await prisma.page.findUnique({
      where: { slug },
    });
    
    if (existingPage) {
      return res.status(409).json({ message: '该URL路径已被使用，请选择其他标题' });
    }
    
    // 创建新页面
    const newPage = await prisma.page.create({
      data: {
        title,
        content,
        description,
        slug,
        category: category || slug.split('/')[0] || 'general',
        tags: tags || '',
        createdBy: {
          connect: { id: user.id },
        },
        lastEditedBy: {
          connect: { id: user.id },
        },
        version: 1,
        isPublished: true,
      },
    });
    
    // 创建初始版本记录
    await prisma.pageEdit.create({
      data: {
        pageId: newPage.id,
        content,
        title,
        description,
        userId: user.id,
        version: 1,
        status: 'APPROVED',
        summary: '初始创建',
      },
    });
    
    return res.status(201).json(newPage);
  } catch (error) {
    console.error('创建页面错误:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}