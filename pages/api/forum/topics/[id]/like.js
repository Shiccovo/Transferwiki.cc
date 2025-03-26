import { createServerClient } from '../../../../../lib/supabaseServer';

export default async function handler(req, res) {
  const { id } = req.query;
  const isCheckMode = req.query.check === 'true';

  // 创建服务器端的Supabase客户端
  const supabase = createServerClient(req, res);
  
  // 获取当前会话
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // 对于检查请求不需要用户登录
  if (!session && !isCheckMode) {
    return res.status(401).json({ error: '未授权，请先登录' });
  }

  const userId = session?.user?.id;

  // 处理GET请求：检查用户是否已点赞
  if (req.method === 'GET' && isCheckMode) {
    try {
      if (!userId) {
        return res.status(200).json({ isLiked: false });
      }

      // 从ForumTopic表中检查用户是否在likedUserIds数组中
      const { data, error } = await supabase
        .from('ForumTopic')
        .select('likedUserIds')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      const isLiked = Array.isArray(data.likedUserIds) && data.likedUserIds.includes(userId);
      return res.status(200).json({ isLiked });
    } catch (error) {
      console.error('检查点赞状态失败:', error);
      return res.status(500).json({ error: '服务器错误' });
    }
  }

  // 处理POST请求：添加点赞
  if (req.method === 'POST') {
    try {
      // 获取当前帖子信息
      const { data: topic, error: topicError } = await supabase
        .from('ForumTopic')
        .select('likes, likedUserIds')
        .eq('id', id)
        .single();
        
      if (topicError) {
        console.error('获取帖子失败:', topicError);
        return res.status(404).json({ error: '帖子不存在' });
      }

      // 确保likedUserIds是数组
      const likedUserIds = Array.isArray(topic.likedUserIds) ? topic.likedUserIds : [];
      
      // 如果用户已经点赞，则不做任何更改
      if (likedUserIds.includes(userId)) {
        return res.status(200).json({ 
          likes: topic.likes || 0, 
          isLiked: true 
        });
      }

      // 更新点赞信息
      const { data: updatedTopic, error: updateError } = await supabase
        .from('ForumTopic')
        .update({ 
          likes: (topic.likes || 0) + 1,
          likedUserIds: [...likedUserIds, userId],
          updatedAt: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('更新点赞失败:', updateError);
        return res.status(500).json({ error: '更新点赞失败' });
      }

      return res.status(200).json({ 
        likes: updatedTopic.likes || 0, 
        isLiked: true 
      });
    } catch (error) {
      console.error('添加点赞失败:', error);
      return res.status(500).json({ error: '服务器错误' });
    }
  }

  // 处理DELETE请求：取消点赞
  if (req.method === 'DELETE') {
    try {
      // 获取当前帖子信息
      const { data: topic, error: topicError } = await supabase
        .from('ForumTopic')
        .select('likes, likedUserIds')
        .eq('id', id)
        .single();
        
      if (topicError) {
        console.error('获取帖子失败:', topicError);
        return res.status(404).json({ error: '帖子不存在' });
      }

      // 确保likedUserIds是数组
      const likedUserIds = Array.isArray(topic.likedUserIds) ? topic.likedUserIds : [];
      
      // 如果用户没有点赞，则不做任何更改
      if (!likedUserIds.includes(userId)) {
        return res.status(200).json({ 
          likes: topic.likes || 0, 
          isLiked: false 
        });
      }

      // 更新点赞信息
      const { data: updatedTopic, error: updateError } = await supabase
        .from('ForumTopic')
        .update({ 
          likes: Math.max(0, (topic.likes || 0) - 1),
          likedUserIds: likedUserIds.filter(id => id !== userId),
          updatedAt: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('更新点赞失败:', updateError);
        return res.status(500).json({ error: '更新点赞失败' });
      }

      return res.status(200).json({ 
        likes: updatedTopic.likes || 0, 
        isLiked: false 
      });
    } catch (error) {
      console.error('取消点赞失败:', error);
      return res.status(500).json({ error: '服务器错误' });
    }
  }

  // 如果不是支持的请求方法
  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ error: `不支持 ${req.method} 方法` });
} 