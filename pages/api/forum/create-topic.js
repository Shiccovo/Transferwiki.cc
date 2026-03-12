import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  const supabase = createPagesServerClient({ req, res });
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: '未授权' });
    }

    const { title, content, categoryId } = req.body;
    
    // 直接执行SQL插入
    const { data, error } = await supabase.from('ForumTopic').insert({
      title,
      content,
      "categoryId": categoryId,
      userid: session.user.id,
      "createdAt": new Date().toISOString(),
      "updatedAt": new Date().toISOString()
    }).select().single();
    
    if (error) throw error;
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('创建话题错误:', error);
    return res.status(500).json({ error: error.message || '创建话题失败' });
  }
} 