import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import { forumOperations } from '../../../lib/db';
import MainLayout from '../../../components/layout/MainLayout';
import ForumLayout from '../../../components/layout/ForumLayout';
import dynamic from 'next/dynamic';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

// 动态导入富文本编辑器组件以避免SSR问题
const RichTextEditor = dynamic(() => import('../../../components/ui/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md"></div>,
});

export default function EditForumTopic({ topic: initialTopic, categories }) {
  const router = useRouter();
  const user = useUser();
  const supabase = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [title, setTitle] = useState(initialTopic?.title || '');
  const [content, setContent] = useState(initialTopic?.content || '');
  const [categoryId, setCategoryId] = useState(initialTopic?.categoryId || '');
  const [userRole, setUserRole] = useState(null);
  const [topic, setTopic] = useState(initialTopic);
  
  // 加载用户角色和检查权限
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

  // 初始化topic状态
  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
    }
  }, [initialTopic]);

  // 权限检查
  useEffect(() => {
    if (!user) {
      // 未登录用户重定向到登录页
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (topic && userRole) {
      // 验证用户是否有权限编辑这个话题（管理员或作者）
      if (userRole !== 'ADMIN' && user.id !== topic.userid) {
        router.push('/forum');
      }
    }
  }, [user, userRole, topic, router]);

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (!title.trim()) {
        throw new Error('标题不能为空');
      }

      if (!content || content.trim() === '<p><br></p>') {
        throw new Error('内容不能为空');
      }

      if (!categoryId) {
        throw new Error('请选择一个分类');
      }

      // 使用Supabase API更新话题
      const topicId = router.query.id;
      const { error } = await supabase
        .from('ForumTopic')
        .update({
          title,
          content,
          categoryId,
          updatedAt: new Date().toISOString()
        })
        .eq('id', topicId);

      if (error) {
        throw new Error(error.message || '更新话题失败');
      }

      router.push(`/forum/topic/${topicId}`);
    } catch (error) {
      console.error('更新话题错误:', error);
      setErrorMessage(error.message || '更新话题失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 如果页面正在加载或者话题不存在
  if (!topic) {
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

  return (
    <MainLayout>
      <ForumLayout categories={categories}>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              编辑话题
            </h1>
            <Link href={`/forum/topic/${router.query.id}`} passHref>
              <button className="flex items-center text-blue-600 dark:text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                返回话题
              </button>
            </Link>
          </div>

          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200">
                {errorMessage}
              </p>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 标题输入 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  标题 *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="话题标题"
                  required
                />
              </div>

              {/* 分类选择 */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  分类 *
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">选择分类</option>
                  {categories.map(category => (
                    <option 
                      key={category.id} 
                      value={category.id}
                      style={{
                        backgroundColor: category.color ? `${category.color}20` : 'transparent',
                        color: category.color || 'currentColor'
                      }}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 内容编辑器 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  内容 *
                </label>
                <RichTextEditor 
                  value={content}
                  onChange={setContent}
                  placeholder="输入话题内容..."
                  height="300px"
                />
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end space-x-3">
                <Link href={`/forum/topic/${router.query.id}`} passHref>
                  <button 
                    type="button"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    取消
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading ? '保存中...' : '保存修改'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </ForumLayout>
    </MainLayout>
  );
}

export async function getServerSideProps({ params, req, res }) {
  try {
    const { id } = params;
    
    // 创建supabase客户端
    const supabase = createPagesServerClient({ req, res });
    
    // 获取话题详情
    const { data: topic, error } = await supabase
      .from('ForumTopic')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !topic) {
      return {
        notFound: true,
      };
    }
    
    // 获取分类列表
    const categories = await forumOperations.getAllCategories();
    
    return {
      props: {
        topic: JSON.parse(JSON.stringify(topic)),
        categories: JSON.parse(JSON.stringify(categories)),
      },
    };
  } catch (error) {
    console.error('Error fetching topic for edit:', error);
    return {
      notFound: true,
    };
  }
}