import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  const { slug } = req.query;
  
  // 根据请求方法处理不同操作
  switch (req.method) {
    case 'GET':
      return getPage(req, res, slug);
    case 'PUT':
      return updatePage(req, res, slug);
    case 'DELETE':
      return deletePage(req, res, slug);
    default:
      return res.status(405).json({ message: '方法不允许' });
  }
}

// 获取单个页面
async function getPage(req, res, slug) {
  try {
    const page = await prisma.page.findUnique({
      where: { slug },
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
    });
    
    if (!page) {
      return res.status(404).json({ message: '页面不存在' });
    }
    
    // 如果页面未发布，检查用户权限
    if (!page.isPublished) {
      const session = await getServerSession(req, res, authOptions);
      
      // 未登录用户不能查看未发布页面
      if (!session || !session.user) {
        return res.status(404).json({ message: '页面不存在' });
      }
      
      // 只有管理员和页面创建者可以查看未发布页面
      if (session.user.role !== 'ADMIN' && session.user.id !== page.createdById) {
        return res.status(404).json({ message: '页面不存在' });
      }
    }
    
    return res.status(200).json(page);
  } catch (error) {
    console.error('获取页面错误:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}

// 更新页面
async function updatePage(req, res, slug) {
  try {
    // 验证用户会话
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ message: '请先登录' });
    }
    
    // 查找页面
    const page = await prisma.page.findUnique({
      where: { slug },
    });
    
    if (!page) {
      return res.status(404).json({ message: '页面不存在' });
    }
    
    // 获取请求数据
    const { title, content, description, summary } = req.body;
    
    // 验证必要字段
    if (!title || !content) {
      return res.status(400).json({ message: '标题和内容是必填字段' });
    }
    
    // 根据用户角色决定更新流程
    if (session.user.role === 'ADMIN' || session.user.id === page.createdById) {
      // 管理员和创建者可以直接更新页面
      const updatedPage = await prisma.page.update({
        where: { slug },
        data: {
          title,
          content,
          description,
          version: { increment: 1 },
          lastEditedBy: {
            connect: { id: session.user.id },
          },
        },
      });
      
      // 创建编辑历史
      await prisma.pageEdit.create({
        data: {
          pageId: page.id,
          content,
          title,
          description,
          userId: session.user.id,
          version: page.version + 1,
          status: 'APPROVED',
          summary: summary || '更新内容',
        },
      });
      
      return res.status(200).json(updatedPage);
    } else {
      // 普通用户的编辑需要管理员审批
      // 创建编辑请求
      await prisma.pageEdit.create({
        data: {
          pageId: page.id,
          content,
          title,
          description,
          userId: session.user.id,
          version: page.version + 1,
          status: 'PENDING',
          summary: summary || '提交更新请求',
        },
      });
      
      return res.status(202).json({ 
        message: '编辑已提交，等待管理员审核',
        page
      });
    }
  } catch (error) {
    console.error('更新页面错误:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}

// 删除页面
async function deletePage(req, res, slug) {
  try {
    // 验证用户会话
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ message: '请先登录' });
    }
    
    // 只有管理员可以删除页面
    if (session.user.role !== 'ADMIN') {
      return res.status(403).json({ message: '权限不足，只有管理员可以删除页面' });
    }
    
    // 查找页面
    const page = await prisma.page.findUnique({
      where: { slug },
    });
    
    if (!page) {
      return res.status(404).json({ message: '页面不存在' });
    }
    
    // 删除页面及关联的编辑历史
    await prisma.page.delete({
      where: { slug },
    });
    
    return res.status(200).json({ message: '页面已删除' });
  } catch (error) {
    console.error('删除页面错误:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}