import { getServerSession } from "next-auth";
import { supabase } from "../../../../lib/supabase";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  if (\!id) {
    return res.status(400).json({ error: '缺少ID参数' });
  }

  // Get category by ID (GET)
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('ForumCategory')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (\!data) {
        return res.status(404).json({ error: '分类不存在' });
      }
      
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching category:', error);
      return res.status(500).json({ error: '获取分类失败' });
    }
  }

  // Update category (PUT) - Admin only
  if (req.method === 'PUT') {
    if (\!session || session.user.role \!== 'ADMIN') {
      return res.status(403).json({ error: '无权更新分类' });
    }
    
    try {
      const { name, description, slug, order, color } = req.body;
      
      // 验证必要字段
      if (\!name || \!slug) {
        return res.status(400).json({ error: '缺少必要字段' });
      }
      
      // 如果更改了slug，检查新slug是否已存在
      if (slug) {
        const { data: existingCategory } = await supabase
          .from('ForumCategory')
          .select('*')
          .eq('slug', slug)
          .neq('id', id)
          .single();
        
        if (existingCategory) {
          return res.status(400).json({ error: '该分类Slug已被使用' });
        }
      }
      
      // 更新分类
      const { data, error } = await supabase
        .from('ForumCategory')
        .update({
          name,
          description,
          slug,
          order,
          color
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error updating category:', error);
      return res.status(500).json({ error: '更新分类失败' });
    }
  }

  // Delete category (DELETE) - Admin only
  if (req.method === 'DELETE') {
    if (\!session || session.user.role \!== 'ADMIN') {
      return res.status(403).json({ error: '无权删除分类' });
    }
    
    try {
      // 检查分类下是否有话题
      const { data: topics } = await supabase
        .from('ForumTopic')
        .select('id')
        .eq('categoryId', id);
      
      if (topics && topics.length > 0) {
        return res.status(400).json({ error: '该分类下有话题，无法删除' });
      }
      
      // 删除分类
      const { error } = await supabase
        .from('ForumCategory')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting category:', error);
      return res.status(500).json({ error: '删除分类失败' });
    }
  }

  // 处理其他请求方法
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
