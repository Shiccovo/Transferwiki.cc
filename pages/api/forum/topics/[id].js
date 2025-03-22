import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  // Get topic (GET)
  if (req.method === 'GET') {
    try {
      const topic = await prisma.forumTopic.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              createdAt: true,
            },
          },
          category: true,
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      });
      
      if (!topic) {
        return res.status(404).json({ error: '话题不存在' });
      }
      
      return res.status(200).json(topic);
    } catch (error) {
      console.error('Error fetching topic:', error);
      return res.status(500).json({ error: '获取话题失败' });
    }
  }
  
  // Update topic (PUT)
  if (req.method === 'PUT') {
    if (!session) {
      return res.status(401).json({ error: '未授权' });
    }
    
    try {
      const { title, content } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: '缺少必要字段' });
      }
      
      // 查找话题
      const topic = await prisma.forumTopic.findUnique({
        where: { id },
        select: { userId: true, isLocked: true },
      });
      
      if (!topic) {
        return res.status(404).json({ error: '话题不存在' });
      }
      
      // 检查权限
      if (topic.isLocked && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: '话题已锁定，无法编辑' });
      }
      
      if (topic.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: '无权编辑该话题' });
      }
      
      // 更新话题
      const updatedTopic = await prisma.forumTopic.update({
        where: { id },
        data: {
          title,
          content,
          updatedAt: new Date(),
        },
      });
      
      return res.status(200).json(updatedTopic);
    } catch (error) {
      console.error('Error updating topic:', error);
      return res.status(500).json({ error: '更新话题失败' });
    }
  }
  
  // Delete topic (DELETE)
  if (req.method === 'DELETE') {
    if (!session) {
      return res.status(401).json({ error: '未授权' });
    }
    
    try {
      // 查找话题
      const topic = await prisma.forumTopic.findUnique({
        where: { id },
        select: { userId: true },
      });
      
      if (!topic) {
        return res.status(404).json({ error: '话题不存在' });
      }
      
      // 检查权限
      if (topic.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: '无权删除该话题' });
      }
      
      // 删除话题
      await prisma.forumTopic.delete({
        where: { id },
      });
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting topic:', error);
      return res.status(500).json({ error: '删除话题失败' });
    }
  }
  
  // 处理其他请求方法
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}