import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  // 创建Supabase客户端
  const supabase = createPagesServerClient({ req, res });

  // 获取当前会话
  const { data: { session } } = await supabase.auth.getSession();
  
  // 检查用户是否已登录
  if (!session) {
    return res.status(401).json({ error: '必须登录才能访问此资源' });
  }
  
  // 获取用户资料以检查角色
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
    
  if (!profile || profile.role !== 'ADMIN') {
    return res.status(403).json({ error: '您没有权限访问此资源' });
  }

  if (req.method === 'GET') {
    try {
      // 获取所有用户
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }

      return res.status(200).json(users);
    } catch (error) {
      console.error('获取用户列表错误:', error);
      return res.status(500).json({ error: '获取用户列表失败' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}