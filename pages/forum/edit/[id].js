import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { forumOperations } from '../../../lib/db';
import MainLayout from '../../../components/layout/MainLayout';
import ForumLayout from '../../../components/layout/ForumLayout';
import dynamic from 'next/dynamic';

// 动态导入富文本编辑器组件以避免SSR问题
const RichTextEditor = dynamic(() => import('../../../components/ui/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md"></div>,
});

export default function EditForumTopic({ topic, categories }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [title, setTitle] = useState(topic?.title || '');
  const [content, setContent] = useState(topic?.content || '');
  const [selectedCategory, setSelectedCategory] = useState(topic?.categoryId || '');
  
  // 如果用户未登录或无权编辑，重定向
  useEffect(() => {
    if (status !== 'loading' && (!session || 
      (session.user.id !== topic?.userId && session.user.role !== 'ADMIN'))) {
      router.push(`/forum/topic/${topic.id}`);
    }
  }, [session, status, router, topic]);

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('标题不能为空');
      setIsLoading(false);
      return;
    }

    if (!content || content.trim() === '<p><br></p>') {
      setErrorMessage('内容不能为空');
      setIsLoading(false);
      return;
    }

    if (!selectedCategory) {
      setErrorMessage('请选择分类');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/forum/topics/${topic.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          categoryId: selectedCategory,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '更新话题失败');
      }

      // 更新成功，返回话题页面
      router.push(`/forum/topic/${topic.id}`);
    } catch (error) {
      console.error('更新话题失败:', error);
      setErrorMessage(error.message || '更新话题失败，请重试');
      setIsLoading(false);
    }
  };

  // 处理权限检查和加载状态
  if (status === 'loading') {
    return (
      <MainLayout>
        <ForumLayout>
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </ForumLayout>
      </MainLayout>
    );
  }

  if (!session || (session.user.id !== topic?.userId && session.user.role !== 'ADMIN')) {
    return (
      <MainLayout>
        <ForumLayout>
          <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  无权限
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  您没有权限编辑此话题。
                </p>
                <Link href={`/forum/topic/${topic.id}`} passHref>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    返回话题
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </ForumLayout>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ForumLayout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              编辑话题
            </h1>
            <Link href={`/forum/topic/${topic.id}`} passHref>
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
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
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
                <Link href={`/forum/topic/${topic.id}`} passHref>
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
    
    // 获取分类列表
    const categories = await forumOperations.getAllCategories();
    
    return {
      props: {
        topic: JSON.parse(JSON.stringify(topic)),
        categories: JSON.parse(JSON.stringify(categories)),
      },
    };
  } catch (error) {
    console.error('Error fetching topic for editing:', error);
    
    return {
      notFound: true,
    };
  }
}