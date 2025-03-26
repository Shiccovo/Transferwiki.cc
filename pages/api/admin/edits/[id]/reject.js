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

  if (req.method === 'POST') {
    try {
      // 更新编辑状态
      const { data: edit, error: updateError } = await supabase
        .from('page_edits')
        .update({ 
          status: 'REJECTED',
          rejected_at: new Date().toISOString(),
          rejected_by: session.user.id
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError || !edit) {
        return res.status(404).json({ error: '未找到编辑或更新失败' });
      }

      return res.status(200).json({ message: '编辑已被拒绝' });
    } catch (error) {
      console.error('拒绝编辑错误:', error);
      return res.status(500).json({ error: '拒绝编辑失败' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}