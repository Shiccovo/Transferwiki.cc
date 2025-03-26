import { getServerSession } from "next-auth";
import { supabase } from "../../../../../lib/supabase";
import { authOptions } from "../../../../../pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const { id } = req.query;

    // 在 API 处理函数开始时添加这个日志
    console.log('Session user:', session?.user);

    // 检查请求方法
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: '方法不允许' });
    }

    // 检查登录状态
    if (!session?.user?.id) {
      return res.status(401).json({ error: '请先登录' });
    }

    // 检查帖子 ID
    if (!id) {
      return res.status(400).json({ error: '缺少帖子ID' });
    }

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

    // 检查用户是否已经点赞
    const likedUserIds = topic.likedUserIds || [];
    if (likedUserIds.includes(session.user.id)) {
      return res.status(400).json({ error: '您已经点过赞了' });
    }

    // 更新点赞信息
    const { data: updatedTopic, error: updateError } = await supabase
      .from('ForumTopic')
      .update({ 
        likes: (topic.likes || 0) + 1,
        likedUserIds: [...likedUserIds, session.user.id],
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('更新点赞失败:', updateError);
      return res.status(500).json({ error: '更新点赞失败' });
    }

    return res.status(200).json(updatedTopic);
  } catch (error) {
    console.error('点赞处理失败:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
} 