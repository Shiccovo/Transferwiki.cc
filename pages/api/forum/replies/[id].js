import { getServerSession } from "next-auth";
import { forumOperations } from "../../../../lib/db";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  // Update reply (PUT)
  if (req.method === 'PUT') {
    if (!session) {
      return res.status(401).json({ error: '未授权' });
    }
    
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: '缺少必要字段' });
      }
      
      // 查找回复
      const reply = await prisma.forumReply.findUnique({
        where: { id },
        include: {
          topic: {
            select: {
              isLocked: true,
            },
          },
        },
      });
      
      if (!reply) {
        return res.status(404).json({ error: '回复不存在' });
      }
      
      // 检查权限
      if (reply.topic.isLocked && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: '话题已锁定，无法编辑回复' });
      }
      
      if (reply.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: '无权编辑该回复' });
      }
      
      // 更新回复
      const updatedReply = await prisma.forumReply.update({
        where: { id },
        data: {
          content,
          updatedAt: new Date(),
          isEdited: true,
        },
      });
      
      return res.status(200).json(updatedReply);
    } catch (error) {
      console.error('Error updating reply:', error);
      return res.status(500).json({ error: '更新回复失败' });
    }
  }
  
  // Delete reply (DELETE)
  if (req.method === 'DELETE') {
    if (!session) {
      return res.status(401).json({ error: '未授权' });
    }
    
    try {
      // 查找回复
      const reply = await prisma.forumReply.findUnique({
        where: { id },
        include: {
          topic: {
            select: {
              isLocked: true,
            },
          },
        },
      });
      
      if (!reply) {
        return res.status(404).json({ error: '回复不存在' });
      }
      
      // 检查权限
      if (reply.topic.isLocked && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: '话题已锁定，无法删除回复' });
      }
      
      if (reply.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: '无权删除该回复' });
      }
      
      // 删除回复
      await prisma.forumReply.delete({
        where: { id },
      });
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting reply:', error);
      return res.status(500).json({ error: '删除回复失败' });
    }
  }
  
  // 处理其他请求方法
  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}