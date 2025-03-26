import { useState, useEffect } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

export default function CommentSection({ pagePath }) {
  const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function getUserRole() {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (data) {
          setUserRole(data.role);
        }
      }
    }
    
    getUserRole();
  }, [user, supabase]);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await fetch(`/api/comments?pagePath=${encodeURIComponent(pagePath)}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchComments();
  }, [pagePath]);

  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: data.comment,
          pagePath,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments((prev) => [newComment, ...prev]);
        reset();
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">评论</h2>
      
      {user ? (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
          <div className="mb-4">
            <textarea
              {...register('comment', { 
                required: '请输入评论内容',
                minLength: { value: 2, message: '评论内容太短' } 
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              rows="3"
              placeholder="写下你的评论..."
            ></textarea>
            {errors.comment && (
              <p className="text-red-500 text-sm mt-1">{errors.comment.message}</p>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? '提交中...' : '提交评论'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-8 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-2">请先登录后再发表评论</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            登录
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <motion.div 
              key={comment.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  {comment.user.avatar_url ? (
                    <img 
                      src={comment.user.avatar_url} 
                      alt={comment.user.name || '未知用户'} 
                      className="w-8 h-8 rounded-full" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {(comment.user.name)?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {comment.user.name || '未知用户'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(comment.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-700 dark:text-gray-300">{comment.content}</p>
                </div>
                
                {/* 删除按钮 (仅对评论作者和管理员显示) */}
                {user && (user.id === comment.userId || userRole === 'ADMIN') && (
                  <button
                    onClick={async () => {
                      if (confirm('确定要删除这条评论吗？')) {
                        try {
                          const response = await fetch(`/api/comments/${comment.id}`, {
                            method: 'DELETE',
                          });
                          
                          if (response.ok) {
                            setComments(comments.filter(c => c.id !== comment.id));
                          }
                        } catch (error) {
                          console.error('删除评论失败:', error);
                        }
                      }
                    }}
                    className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 ml-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 my-8 text-center">暂无评论，成为第一个评论的人吧！</p>
      )}
    </div>
  );
}