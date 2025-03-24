import { getServerSession } from "next-auth";
import { forumOperations } from "../../../lib/db";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Get topics (GET)
  if (req.method === 'GET') {
    try {
      const { category, query } = req.query;
      
      // 基本查询条件
      let topics = [];
      
      if (category) {
        // 通过分类slug获取话题
        const categoryObject = await forumOperations.getCategoryBySlug(category);
        
        if (categoryObject) {
          topics = await forumOperations.getTopicsByCategory(categoryObject.id);
        }
      } else if (query) {
        // 搜索功能实现
        topics = await forumOperations.searchTopics(query);
      } else {
        // 获取所有话题
        topics = await forumOperations.getAllTopics();
      }
      
      return res.status(200).json(topics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      return res.status(500).json({ error: '获取话题失败' });
    }
  }
  
  // Create topic (POST)
  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ error: '未授权' });
    }
    
    try {
      const { title, content, categoryId } = req.body;
      
      if (!title || !content || !categoryId) {
        return res.status(400).json({ error: '缺少必要字段' });
      }
      
      // 创建新话题
      const newTopic = await forumOperations.createTopic({
        title,
        content,
        categoryId,
        userId: session.user.id,
        lastReplyAt: new Date().toISOString(),
        isPinned: false,
        viewCount: 0
      });
      
      return res.status(201).json(newTopic);
    } catch (error) {
      console.error('Error creating topic:', error);
      return res.status(500).json({ error: '创建话题失败' });
    }
  }
  
  // 处理其他请求方法
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}