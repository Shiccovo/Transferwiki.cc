import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  try {
    // 查找话题
    const topic = await prisma.forumTopic.findUnique({
      where: { id },
      select: { id: true, viewCount: true },
    });
    
    if (!topic) {
      return res.status(404).json({ error: '话题不存在' });
    }
    
    // 更新话题浏览量
    await prisma.forumTopic.update({
      where: { id: topic.id },
      data: {
        viewCount: topic.viewCount + 1,
      },
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating view count:', error);
    return res.status(500).json({ error: '更新浏览量失败' });
  }
}