import { getServerSession } from "next-auth";
import { forumOperations } from "../../../lib/db";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Create reply (POST)
  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ error: '未授权' });
    }
    
    try {
      const { topicId, content } = req.body;
      
      if (!topicId || !content) {
        return res.status(400).json({ error: '缺少必要字段' });
      }
      
      // 验证话题是否存在
      const topic = await prisma.forumTopic.findUnique({
        where: { id: topicId },
        select: { isLocked: true },
      });
      
      if (!topic) {
        return res.status(404).json({ error: '话题不存在' });
      }
      
      // 检查话题是否已锁定
      if (topic.isLocked && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: '话题已锁定，无法回复' });
      }
      
      // 创建回复
      const newReply = await prisma.forumReply.create({
        data: {
          content,
          topicId,
          userId: session.user.id,
        },
      });
      
      // 更新话题最后回复时间
      await prisma.forumTopic.update({
        where: { id: topicId },
        data: {
          lastReplyAt: new Date(),
          updatedAt: new Date(),
        },
      });
      
      return res.status(201).json(newReply);
    } catch (error) {
      console.error('Error creating reply:', error);
      return res.status(500).json({ error: '创建回复失败' });
    }
  }
  
  // 处理其他请求方法
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}