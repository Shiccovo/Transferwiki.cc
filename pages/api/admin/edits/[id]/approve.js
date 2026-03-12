import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import path from 'path';
import fs from 'fs';

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
      // 获取编辑
      const { data: edit, error: editError } = await supabase
        .from('page_edits')
        .select('*')
        .eq('id', id)
        .single();

      if (editError || !edit) {
        return res.status(404).json({ error: '未找到编辑' });
      }

      // 清理路径以避免目录遍历攻击
      const cleanPath = edit.pagePath.replace(/^\/+|\/+$/g, '');
      
      // 处理根路径 (index.mdx)
      const filePath = cleanPath === '' || cleanPath === '/' 
        ? path.join(process.cwd(), 'pages', 'index.mdx')
        : path.join(process.cwd(), 'pages', `${cleanPath}.mdx`);

      // 确保目录存在
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 写入文件内容
      fs.writeFileSync(filePath, edit.content, 'utf8');
      
      // 更新编辑状态
      const { error: updateError } = await supabase
        .from('page_edits')
        .update({ 
          status: 'APPROVED',
          approved_at: new Date().toISOString(),
          approved_by: session.user.id
        })
        .eq('id', id);

      if (updateError) throw updateError;

      return res.status(200).json({ message: '编辑已批准并应用成功' });
    } catch (error) {
      console.error('批准编辑错误:', error);
      return res.status(500).json({ error: '批准编辑失败' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}