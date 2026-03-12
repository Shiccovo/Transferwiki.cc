import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { pageOperations, pageEditOperations } from '../../../../lib/db';

export default async function handler(req, res) {
  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }
  
  const { slug } = req.query;
  
  if (!slug) {
    return res.status(400).json({ message: '缺少页面slug参数' });
  }
  
  try {
    // 获取用户会话
    const session = await getServerSession(req, res, authOptions);
    
    // 查找页面
    const page = await pageOperations.getPageBySlug(slug);
    
    if (!page) {
      return res.status(404).json({ message: '页面不存在' });
    }
    
    // 如果页面未发布，检查权限
    if (!page.isPublished) {
      // 未登录用户不能查看未发布页面的历史
      if (!session || !session.user) {
        return res.status(404).json({ message: '页面不存在' });
      }
      
      // 只有管理员和页面创建者可以查看未发布页面的历史
      if (session.user.role !== 'ADMIN' && session.user.id !== page.createdById) {
        return res.status(404).json({ message: '页面不存在' });
      }
    }
    
    // 获取分页参数
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;
    
    // 获取历史编辑记录
    const edits = await pageEditOperations.getPageEdits(page.id);
    const total = edits.length;
    
    // Apply pagination manually since we're getting all edits at once with Supabase
    const pagedEdits = edits.slice(offset, offset + limit);
    
    // 普通用户只能看到已审核通过的编辑
    let filteredEdits = pagedEdits;
    if (!session || (session.user.role !== 'ADMIN' && session.user.id !== page.createdById)) {
      filteredEdits = pagedEdits.filter(edit => edit.status === 'APPROVED');
    }
    
    return res.status(200).json({
      edits: filteredEdits,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('获取页面历史记录错误:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}