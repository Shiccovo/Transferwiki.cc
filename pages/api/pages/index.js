import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { pageOperations, pageEditOperations } from '../../../lib/db';
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  // 获取用户会话
  const session = await getServerSession(req, res, authOptions);
  
  // 检查是否已登录
  if (!session || !session.user) {
    return res.status(401).json({ message: '请先登录' });
  }
  
  // 根据请求方法处理不同操作
  switch (req.method) {
    case 'GET':
      return getPages(req, res);
    case 'POST':
      return createPage(req, res, session.user);
    default:
      return res.status(405).json({ message: '方法不允许' });
  }
}

// 获取页面列表
async function getPages(req, res) {
  try {
    const {
      category,
      search,
      limit = 10,
      offset = 0,
      sort = 'updatedAt',
      order = 'desc',
    } = req.query;
    
    // 使用Supabase获取页面列表
    let query = supabase
      .from('Page')
      .select(`
        *,
        createdBy:User!Page_createdById_fkey(*),
        lastEditedBy:User!Page_lastEditedById_fkey(*)
      `)
      .eq('isPublished', true)
      .order(sort, { ascending: order !== 'desc' })
      .range(parseInt(offset, 10), parseInt(offset, 10) + parseInt(limit, 10) - 1);
    
    // 按分类筛选
    if (category) {
      query = query.eq('category', category);
    }
    
    // 按关键词搜索（标题、内容、描述）
    // Supabase 不支持 OR 条件的简单写法，所以我们使用 ilike 进行文本搜索
    if (search) {
      // 使用 Postgres 的 ilike 操作符进行模糊搜索
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // 执行查询
    const { data: pages, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // 获取总数（为了分页）
    // Supabase 不支持像 Prisma 那样直接 count，我们需要单独查询
    const { count, error: countError } = await supabase
      .from('Page')
      .select('*', { count: 'exact', head: true })
      .eq('isPublished', true)
      .maybeSingle();
    
    if (countError) {
      throw countError;
    }
    
    return res.status(200).json({
      pages: pages || [],
      total: count || 0,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
  } catch (error) {
    console.error('获取页面列表错误:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}

// 创建新页面
async function createPage(req, res, user) {
  try {
    const { title, content, description, slug, category, tags } = req.body;
    
    // 验证必要字段
    if (!title || !content || !slug) {
      return res.status(400).json({ message: '标题、内容和slug是必填字段' });
    }
    
    // 检查slug是否已存在
    const existingPage = await pageOperations.getPageBySlug(slug);
    
    if (existingPage) {
      return res.status(409).json({ message: '该URL路径已被使用，请选择其他标题' });
    }
    
    // 准备页面数据
    const pageData = {
      title,
      content,
      description: description || '',
      slug,
      category: category || slug.split('/')[0] || 'general',
      tags: tags || '',
      createdById: user.id,
      lastEditedById: user.id,
      version: 1,
      isPublished: true,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // 创建新页面
    const newPage = await pageOperations.createPage(pageData);
    
    // 创建初始版本记录
    await pageEditOperations.createPageEdit({
      pageId: newPage.id,
      content,
      title,
      description: description || '',
      userId: user.id,
      version: 1,
      status: 'APPROVED',
      summary: '初始创建',
      createdAt: new Date().toISOString(),
    });
    
    return res.status(201).json(newPage);
  } catch (error) {
    console.error('创建页面错误:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
}