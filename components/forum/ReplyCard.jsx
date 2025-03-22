import { useState } from 'react';
import { useSession } from 'next-auth/react';
import MarkdownContent from '../ui/MarkdownContent';
import { motion } from 'framer-motion';

export default function ReplyCard({ reply, onEdit, onDelete, isFirst = false }) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  
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
  
  const canEdit = session && (session.user.id === reply.userId || session.user.role === 'ADMIN');
  
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
        <div className="flex items-start">
          {/* User Avatar */}
          <div className="mr-4">
            {reply.user.image ? (
              <img
                src={reply.user.image}
                alt={reply.user.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {reply.user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {reply.user.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {new Date(reply.createdAt).toLocaleString('zh-CN')}
              </span>
              {reply.isEdited && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 italic">
                  (已编辑)
                </span>
              )}
              {isFirst && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  楼主
                </span>
              )}
            </div>
            
            {isEditing ? (
              <div className="mb-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm dark:bg-gray-800 dark:text-white"
                  rows={6}
                ></textarea>
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
                <MarkdownContent content={reply.content} />
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