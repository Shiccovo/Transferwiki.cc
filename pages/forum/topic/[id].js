import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import MainLayout from '../../../components/layout/MainLayout';
import ForumLayout from '../../../components/layout/ForumLayout';
import ReplyCard from '../../../components/forum/ReplyCard';
import dynamic from 'next/dynamic';
import { forumOperations } from '../../../lib/db';

// 动态导入富文本编辑器组件以避免SSR问题
const RichTextEditor = dynamic(() => import('../../../components/ui/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md"></div>,
});

export default function TopicView({ topic, categories }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 如果页面正在加载或者话题不存在
  if (router.isFallback || !topic) {
    return (
      <MainLayout>
        <ForumLayout categories={categories}>
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </ForumLayout>
      </MainLayout>
    );
  }

  // 提交回复
  const handleSubmitReply = async () => {
    if (!session) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (!replyContent || replyContent.trim() === '<p><br></p>') {
      setErrorMessage('回复内容不能为空');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/forum/replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyContent,
          topicId: topic.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '回复发送失败');
      }

      // 清空编辑器并刷新页面
      setReplyContent('');
      router.reload();
    } catch (error) {
      console.error('回复发送错误:', error);
      setErrorMessage(error.message || '回复发送失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <ForumLayout categories={categories}>
        <div className="space-y-6">
          {/* 话题标题和内容（合并为一个卡片） */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* 面包屑导航 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                  <li className="inline-flex items-center">
                    <Link href="/forum">
                      <span className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        论坛
                      </span>
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                      <Link href={`/forum?category=${topic.category.slug}`}>
                        <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                          {topic.category.name}
                        </span>
                      </Link>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
            
            {/* 标题和作者信息 */}
            <div className="p-4 pb-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {topic.title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-between mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <img
                    src={topic.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(topic.user.name)}&background=random`}
                    alt={topic.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {topic.user.name}
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        楼主
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      发表于 {new Date(topic.createdAt).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>浏览: {topic.viewCount}</span>
                  <span>回复: {topic.replies.length}</span>
                  
                  {/* 管理按钮 - 仅对管理员或作者显示 */}
                  {session && (session.user.role === 'ADMIN' || session.user.id === topic.userId) && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          // 编辑帖子
                          const confirmEdit = window.confirm('确定要编辑这个帖子吗？');
                          if (confirmEdit) {
                            // 使用router跳转到编辑页面
                            router.push(`/forum/edit/${topic.id}`);
                          }
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        编辑
                      </button>
                      
                      {session.user.role === 'ADMIN' && (
                        <button 
                          onClick={() => {
                            // 删除帖子
                            const confirmDelete = window.confirm('确定要删除这个帖子吗？此操作不可撤销。');
                            if (confirmDelete) {
                              // 调用API删除
                              fetch(`/api/forum/topics/${topic.id}`, {
                                method: 'DELETE',
                              })
                              .then(response => {
                                if (response.ok) {
                                  // 删除成功，跳转到论坛首页
                                  router.push('/forum');
                                } else {
                                  alert('删除失败，请重试');
                                }
                              })
                              .catch(error => {
                                console.error('删除话题失败:', error);
                                alert('删除失败，请重试');
                              });
                            }
                          }}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 话题内容 */}
            <div className="p-6 pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: topic.content }} />
            </div>
          </div>
          
          {/* 回复列表 */}
          {topic.replies && topic.replies.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  回复 ({topic.replies.length})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {topic.replies.map((reply, index) => (
                  <ReplyCard 
                    key={reply.id} 
                    reply={reply} 
                    isFirst={index === 0 && reply.userId === topic.userId}
                    onEdit={async (replyId, content) => {
                      try {
                        const response = await fetch(`/api/forum/replies/${replyId}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ content }),
                        });

                        if (!response.ok) {
                          const error = await response.json();
                          throw new Error(error.error || '编辑回复失败');
                        }

                        router.reload();
                      } catch (error) {
                        console.error('编辑回复错误:', error);
                        throw error;
                      }
                    }}
                    onDelete={async (replyId) => {
                      try {
                        const response = await fetch(`/api/forum/replies/${replyId}`, {
                          method: 'DELETE',
                        });

                        if (!response.ok) {
                          const error = await response.json();
                          throw new Error(error.error || '删除回复失败');
                        }

                        router.reload();
                      } catch (error) {
                        console.error('删除回复错误:', error);
                        throw error;
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* 回复表单 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                发表回复
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              {!session ? (
                <div className="text-center py-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    请登录后发表回复
                  </p>
                  <Link href={`/login?redirect=${encodeURIComponent(router.asPath)}`}>
                    <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                      登录
                    </span>
                  </Link>
                </div>
              ) : (
                <>
                  {errorMessage && (
                    <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                      <p className="text-red-800 dark:text-red-200">
                        {errorMessage}
                      </p>
                    </div>
                  )}
                  
                  <RichTextEditor
                    value={replyContent}
                    onChange={setReplyContent}
                    placeholder="输入回复内容..."
                    height="200px"
                  />
                  
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSubmitReply}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isSubmitting ? '发送中...' : '发送回复'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </ForumLayout>
    </MainLayout>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const { id } = params;
    
    // 获取话题详情
    const topic = await forumOperations.getTopicById(id);
    
    // 如果话题不存在
    if (!topic) {
      return {
        notFound: true,
      };
    }
    
    // 恢复这行
    await forumOperations.incrementTopicView(id);
    
    // 获取分类列表
    const categories = await forumOperations.getAllCategories();
    
    return {
      props: {
        topic: JSON.parse(JSON.stringify(topic)),
        categories: JSON.parse(JSON.stringify(categories)),
      },
    };
  } catch (error) {
    console.error('Error fetching topic:', error);
    return {
      notFound: true,
    };
  }
}