import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    // 使用 createPagesServerClient 创建服务端 Supabase 客户端
    const supabase = createPagesServerClient({ req, res });
    
    // 获取当前用户会话
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const { name, bio, image } = req.body;

    // 更新用户资料
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: name,
        bio,
        avatar_url: image,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);

    if (error) throw error;

    return res.status(200).json({ message: '更新成功' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: '更新失败' });
  }
} 