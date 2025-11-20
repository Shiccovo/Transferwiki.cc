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

  // Update reply (PUT)
  if (req.method === 'PUT') {
    if (!session) {
      return res.status(401).json({ error: '未授权' });
    }
    
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: '缺少必要字段' });
      }
      
      // 查找回复及其所属话题
      const { data: reply, error: replyError } = await supabase
        .from('ForumReply')
        .select(`
          *,
          topic:ForumTopic(isLocked)
        `)
        .eq('id', id)
        .single();
      
      if (replyError || !reply) {
        console.error('获取回复失败:', replyError);
        return res.status(404).json({ error: '回复不存在' });
      }
      
      // 检查权限
      if (reply.topic.isLocked && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: '话题已锁定，无法编辑回复' });
      }
      
      if (reply.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: '无权编辑该回复' });
      }
      
      // 更新回复 - 首先尝试带isEdited字段
      try {
        const { data: updatedReply, error: updateError } = await supabase
          .from('ForumReply')
          .update({
            content,
            updatedAt: new Date().toISOString(),
            isEdited: true
          })
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) {
          if (updateError.code === 'PGRST204' && updateError.message.includes('isEdited')) {
            // 如果isEdited字段不存在，尝试不包括它的更新
            console.log('isEdited字段不存在，尝试替代方案...');
            const { data: simplifiedUpdate, error: fallbackError } = await supabase
              .from('ForumReply')
              .update({
                content,
                updatedAt: new Date().toISOString()
              })
              .eq('id', id)
              .select()
              .single();
            
            if (fallbackError) {
              console.error('替代更新失败:', fallbackError);
              return res.status(500).json({ error: '更新回复失败' });
            }
            
            return res.status(200).json(simplifiedUpdate);
          } else {
            // 其他错误
            console.error('更新回复失败:', updateError);
            return res.status(500).json({ error: '更新回复失败' });
          }
        }
        
        return res.status(200).json(updatedReply);
      } catch (error) {
        console.error('更新回复过程中出错:', error);
        return res.status(500).json({ error: '更新回复失败' });
      }
    } catch (error) {
      console.error('Error updating reply:', error);
      return res.status(500).json({ error: '更新回复失败' });
    }
  }
  
  // Delete reply (DELETE)
  if (req.method === 'DELETE') {
    if (!session) {
      return res.status(401).json({ error: '未授权' });
    }
    
    try {
      // 查找回复及其所属话题
      const { data: reply, error: replyError } = await supabase
        .from('ForumReply')
        .select(`
          *,
          topic:ForumTopic(isLocked)
        `)
        .eq('id', id)
        .single();
      
      if (replyError || !reply) {
        console.error('获取回复失败:', replyError);
        return res.status(404).json({ error: '回复不存在' });
      }
      
      // 检查权限
      if (reply.topic.isLocked && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: '话题已锁定，无法删除回复' });
      }
      
      if (reply.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: '无权删除该回复' });
      }
      
      // 删除回复
      const { error: deleteError } = await supabase
        .from('ForumReply')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('删除回复失败:', deleteError);
        return res.status(500).json({ error: '删除回复失败' });
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting reply:', error);
      return res.status(500).json({ error: '删除回复失败' });
    }
  }
  
  // 处理其他请求方法
  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}