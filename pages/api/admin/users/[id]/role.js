import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  const { id } = req.query;
  
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

  // 防止管理员更改自己的角色
  if (id === session.user.id) {
    return res.status(400).json({ error: '不能更改自己的角色' });
  }

  if (req.method === 'PUT') {
    try {
      const { role } = req.body;
      
      if (!role || !['USER', 'EDITOR', 'ADMIN'].includes(role)) {
        return res.status(400).json({ error: '无效的角色' });
      }

      // 更新用户角色
      const { data: updatedUser, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('更新用户角色错误:', error);
      return res.status(500).json({ error: '更新用户角色失败' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}