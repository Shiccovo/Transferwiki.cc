import { getServerSession } from "next-auth";
import { forumOperations } from "../../../lib/db";
import { authOptions } from "../auth/[...nextauth]";
import { supabase } from "../../../lib/supabase";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Create reply (POST)
  if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ error: '未授权' });
    }
    
    try {
      const { topicId, content } = req.body;
      
      if (!topicId || !content) {
        return res.status(400).json({ error: '缺少必要字段' });
      }
      
      // 验证话题是否存在
      const { data: topic, error: topicError } = await supabase
        .from('ForumTopic')
        .select('isLocked')
        .eq('id', topicId)
        .single();
      
      if (topicError || !topic) {
        console.error('获取话题失败:', topicError);
        return res.status(404).json({ error: '话题不存在' });
      }
      
      // 检查话题是否已锁定
      if (topic.isLocked && session.user.role !== 'ADMIN') {
        return res.status(403).json({ error: '话题已锁定，无法回复' });
      }
      
      // 处理内容，确保它是合法的HTML或纯文本
      let processedContent = content;
      
      // 如果内容是空的HTML，转换为简单文本
      if (processedContent === '<p><br></p>' || processedContent === '<p></p>') {
        processedContent = '';
      }
      
      // 创建回复
      const newReply = await forumOperations.createReply({
        content: processedContent,
        topicId,
        userId: session.user.id,
      });
      
      return res.status(201).json(newReply);
    } catch (error) {
      console.error('Error creating reply:', error);
      return res.status(500).json({ error: '创建回复失败' });
    }
  }
  
  // 处理其他请求方法
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}