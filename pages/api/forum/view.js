import { forumOperations } from "../../../lib/db";

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
    // 使用forumOperations中的方法增加浏览量
    const success = await forumOperations.incrementTopicView(id);
    
    if (!success) {
      return res.status(404).json({ error: '话题不存在或增加浏览量失败' });
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating view count:', error);
    return res.status(500).json({ error: '更新浏览量失败' });
  }
}