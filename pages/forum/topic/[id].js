import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import MainLayout from '../../../components/layout/MainLayout';
import ForumLayout from '../../../components/layout/ForumLayout';
import ReplyCard from '../../../components/forum/ReplyCard';
import LikeButton from '../../../components/forum/LikeButton';
import dynamic from 'next/dynamic';
import { forumOperations } from '../../../lib/db';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import MarkdownContent from '../../../components/ui/MarkdownContent';

// 动态导入富文本编辑器组件以避免SSR问题
const RichTextEditor = dynamic(() => import('../../../components/ui/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md"></div>,
});

export default function TopicView({ topic: initialTopic, categories }) {
  const router = useRouter();
  const user = useUser();
  const supabase = useSupabaseClient();
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [topic, setTopic] = useState(initialTopic);
  const [isReplyPanelOpen, setIsReplyPanelOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // 使用useEffect来确保当初始topic更新时同步到state
  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      setIsLoading(false);
    }
  }, [initialTopic]);

  // 加载用户角色
  useEffect(() => {
    async function getUserRole() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (data) {
            setUserRole(data.role);
          }
        } catch (error) {
          console.error('获取用户角色失败:', error);
        }
      }
    }
    
    getUserRole();
  }, [user, supabase]);

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
    if (!user) {
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

  const fetchTopic = async () => {
    if (!topic?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('ForumTopic')
        .select(`
          *,
          profiles:userid (id, email, avatar_url, role, name)
        `)
        .eq('id', topic.id)
        .single();
      
      if (error) throw error;
      if (data) setTopic(data);
    } catch (error) {
      console.error('获取话题详情错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 在组件内部添加删除帖子的函数
  const handleDeleteTopic = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    // 确认删除
    if (!window.confirm('确定要删除这个话题吗？此操作不可撤销。')) {
      return;
    }

    try {
      // 检查用户是否是管理员或话题作者
      const isAdmin = userRole === 'ADMIN';
      const isAuthor = user.id === topic.profiles?.id;
      
      if (!isAdmin && !isAuthor) {
        alert('您没有权限删除此话题');
        return;
      }

      // 使用Supabase直接删除话题
      const { error } = await supabase
        .from('ForumTopic')
        .delete()
        .eq('id', topic.id);

      if (error) throw error;

      // 删除成功后重定向到论坛首页
      router.push('/forum');
    } catch (error) {
      console.error('删除话题出错:', error);
      alert('删除话题失败: ' + error.message);
    }
  };

  // 在组件内添加用户名显示函数
  const getUserDisplayName = (profile) => {
    if (!profile) return '匿名用户';
    
    // 优先使用name，最后才考虑邮箱前缀
    return profile.name || profile.email?.split('@')[0] || '匿名用户';
  }

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
                  {topic.category && (
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
                  )}
                </ol>
              </nav>
            </div>
            
            {/* 标题和作者信息 */}
            <div className="p-4 pb-0">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <img 
                      src={topic.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(topic.profiles?.email?.split('@')[0] || 'User')}&background=random`}
                      alt={topic.profiles?.displayName || topic.profiles?.email?.split('@')[0] || '用户'} 
                      className="w-10 h-10 rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {topic.title}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        由 {getUserDisplayName(topic.profiles)} 发布于 {formatDate(topic.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <LikeButton topic={topic} />
                  {user && (
                    <button
                      onClick={() => setIsReplyPanelOpen(true)}
                      className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <span>回复</span>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-end mb-4">
                <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  
                  {/* 管理按钮 - 仅对管理员或作者显示 */}
                  {user && (user.role === 'ADMIN' || user.id === topic.profiles?.id) && (
                    <div className="flex space-x-2">
                      <Link href={`/forum/edit/${topic.id}`}>
                        <button className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>编辑</span>
                        </button>
                      </Link>
                      
                      <button
                        onClick={handleDeleteTopic}
                        className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>删除</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 话题内容 */}
            <div className="p-6 pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="prose dark:prose-invert max-w-none">
                {topic.content && topic.content.startsWith('<') ? (
                  <div dangerouslySetInnerHTML={{ __html: topic.content }} />
                ) : (
                  <MarkdownContent content={topic.content} />
                )}
              </div>
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
              {user ? (
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
              ) : (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    请先登录后再发表回复
                  </p>
                  <button
                    onClick={() => router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`)}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </ForumLayout>
    </MainLayout>
  );
}

export async function getServerSideProps({ params, req, res }) {
  try {
    const { id } = params;
    
    // 正确传入req和res
    const supabase = createPagesServerClient({ req, res });
    
    // 添加category关联查询
    const { data: topic, error } = await supabase
      .from('ForumTopic')
      .select(`
        *,
        profiles:userid (id, email, avatar_url, role, name),
        category:categoryId (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
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