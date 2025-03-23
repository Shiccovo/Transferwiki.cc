import { getServerSession } from "next-auth";
import { forumOperations } from "../../../lib/db";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Get topics (GET)
  if (req.method === 'GET') {
    try {
      const { category, query } = req.query;
      
      // 构建查询条件
      const where = {};
      
      if (category) {
        const categoryObject = await prisma.forumCategory.findUnique({
          where: { slug: category },
        });
        
        if (categoryObject) {
          where.categoryId = categoryObject.id;
        }
      }
      
      if (query) {
        where.OR = [
          { title: { contains: query } },
          { content: { contains: query } },
        ];
      }
      
      // 获取话题
      const topics = await prisma.forumTopic.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' },
          { updatedAt: 'desc' },
        ],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: true,
          replies: {
            select: {
              id: true,
            },
          },
        },
      });
      
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
      
      // 验证分类是否存在
      const category = await prisma.forumCategory.findUnique({
        where: { id: categoryId },
      });
      
      if (!category) {
        return res.status(400).json({ error: '分类不存在' });
      }
      
      // 创建新话题
      const newTopic = await prisma.forumTopic.create({
        data: {
          title,
          content,
          categoryId,
          userId: session.user.id,
          lastReplyAt: new Date(),
        },
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