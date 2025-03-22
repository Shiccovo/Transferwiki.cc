import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Get all categories (GET)
  if (req.method === 'GET') {
    try {
      const categories = await prisma.forumCategory.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          order: 'asc',
        },
      });
      
      return res.status(200).json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: '获取分类失败' });
    }
  }
  
  // Create new category (POST) - Admin only
  if (req.method === 'POST') {
    if (!session || session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权创建分类' });
    }
    
    try {
      const { name, description, slug, order } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ error: '缺少必要字段' });
      }
      
      // 检查slug是否已存在
      const existingCategory = await prisma.forumCategory.findUnique({
        where: { slug },
      });
      
      if (existingCategory) {
        return res.status(400).json({ error: '分类已存在' });
      }
      
      // 创建新分类
      const newCategory = await prisma.forumCategory.create({
        data: {
          name,
          description,
          slug,
          order: order || 0,
        },
      });
      
      return res.status(201).json(newCategory);
    } catch (error) {
      console.error('Error creating category:', error);
      return res.status(500).json({ error: '创建分类失败' });
    }
  }
  
  // 处理其他请求方法
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}