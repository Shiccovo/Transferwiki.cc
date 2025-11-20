import { useState, useEffect } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import dynamic from 'next/dynamic';
import { formatDate } from '../../lib/utils';
import { motion } from 'framer-motion';
import MarkdownContent from '../ui/MarkdownContent';
import Image from 'next/image';
import { stringToColor } from '../../lib/utils';

// 动态导入富文本编辑器组件以避免SSR问题
const RichTextEditor = dynamic(() => import('../ui/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md"></div>,
});

export default function ReplyCard({ reply, onEdit, onDelete, isFirst = false }) {
  const user = useUser();
  const supabase = useSupabaseClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [userRole, setUserRole] = useState(null);
  
  // 加载用户角色
  useEffect(() => {
    async function getUserRole() {
      if (user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (data) {
            setUserRole(data.role);
          }
        } catch (error) {
          console.error('Error loading role:', error);
        }
      }
    }
    
    getUserRole();
  }, [user, supabase]);
  
  // 确保我们能正确获取回复用户的名称 - 使用profiles.name
  const authorName = reply.profiles ? (reply.profiles.name || '未知用户') : '未知用户';
  const replyUserColor = stringToColor(authorName);
  
  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(reply.content);
  };
  
  const handleSave = async () => {
    try {
      await onEdit(reply.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit reply:', error);
      alert('编辑失败，请稍后再试');
    }
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(reply.content);
  };
  
  const handleDelete = async () => {
    if (window.confirm('确定要删除此回复吗？此操作不可撤销。')) {
      try {
        await onDelete(reply.id);
      } catch (error) {
        console.error('Failed to delete reply:', error);
        alert('删除失败，请稍后再试');
      }
    }
  };
  
  const canEdit = user && (user.id === reply.userId || userRole === 'ADMIN');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4 ${
        isFirst ? 'border-l-4 border-blue-500 dark:border-blue-400' : ''
      }`}
    >
      <div className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <img 
              src={reply.profiles?.avatar_url || '/default-avatar.png'} 
              alt={authorName}
              className="h-10 w-10 rounded-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {authorName}
                  {isFirst && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      作者
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(reply.createdAt)}
                </p>
              </div>
            </div>
            
            {isEditing ? (
              <div className="mb-2">
                <RichTextEditor
                  value={editContent}
                  onChange={setEditContent}
                  placeholder="编辑回复内容..."
                  height="200px"
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {/* 如果内容是HTML格式，使用dangerouslySetInnerHTML */}
                {reply.content && reply.content.startsWith('<') ? (
                  <div dangerouslySetInnerHTML={{ __html: reply.content }} />
                ) : (
                  <MarkdownContent content={reply.content} />
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        {canEdit && !isEditing && (
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={handleEdit}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              编辑
            </button>
            <button
              onClick={handleDelete}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            >
              删除
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}