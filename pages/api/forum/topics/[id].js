import { getServerSession } from "next-auth";
import { forumOperations } from "../../../../lib/db";
import { authOptions } from "../../auth/[...nextauth]";
import { supabase } from "../../../../lib/supabase";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: '缺少ID参数' });
  }

  // Get topic (GET)
  if (req.method === 'GET') {
    try {
      // 使用forumOperations获取话题详情
      const { data: topic, error } = await supabase
        .from('ForumTopic')
        .select(`
          *,
          user:userId (*),
          category:categoryId (*),
          replies:ForumReply (
            *,
            user:userId (*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (!topic) {
        return res.status(404).json({ error: '话题不存在' });
      }
      
      return res.status(200).json(topic);
    } catch (error) {
      console.error('Error fetching topic:', error);
      return res.status(500).json({ error: '获取话题失败' });
    }
  }
  
  // Update topic (PUT)
  if (req.method === 'PUT') {
    if (!session) {
      return res.status(401).json({ error: '未授权' });
    }
    
    try {
      const { title, content } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: '缺少必要字段' });
      }
      
      // 查找话题
      const { data: topic, error: fetchError } = await supabase
        .from('ForumTopic')
        .select('userId, isLocked')
        .eq('id', id)
        .single();
      
      if (fetchError || !topic) {
        console.error('获取话题失败:', fetchError);
        return res.status(404).json({ error: '话题不存在' });
      }
      
      // 检查权限
      if (topic.isLocked && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: '话题已锁定，无法编辑' });
      }
      
      if (topic.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: '无权编辑该话题' });
      }
      
      // 更新话题
      const { data: updatedTopic, error: updateError } = await supabase
        .from('ForumTopic')
        .update({
          title,
          content,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) {
        console.error('更新话题失败:', updateError);
        return res.status(500).json({ error: '更新话题失败' });
      }
      
      return res.status(200).json(updatedTopic);
    } catch (error) {
      console.error('Error updating topic:', error);
      return res.status(500).json({ error: '更新话题失败' });
    }
  }
  
  // Delete topic (DELETE)
  if (req.method === 'DELETE') {
    if (!session) {
      return res.status(401).json({ error: '未授权' });
    }
    
    try {
      // 查找话题
      const { data: topic, error: fetchError } = await supabase
        .from('ForumTopic')
        .select('userId')
        .eq('id', id)
        .single();
      
      if (fetchError || !topic) {
        console.error('获取话题失败:', fetchError);
        return res.status(404).json({ error: '话题不存在' });
      }
      
      // 检查权限
      if (topic.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: '无权删除该话题' });
      }
      
      // 先删除所有相关回复
      const { error: deleteRepliesError } = await supabase
        .from('ForumReply')
        .delete()
        .eq('topicId', id);
      
      if (deleteRepliesError) {
        console.error('删除回复失败:', deleteRepliesError);
        return res.status(500).json({ error: '删除话题相关回复失败' });
      }
      
      // 删除话题
      const { error: deleteTopicError } = await supabase
        .from('ForumTopic')
        .delete()
        .eq('id', id);
      
      if (deleteTopicError) {
        console.error('删除话题失败:', deleteTopicError);
        return res.status(500).json({ error: '删除话题失败' });
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting topic:', error);
      return res.status(500).json({ error: '删除话题失败' });
    }
  }
  
  // 处理其他请求方法
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}