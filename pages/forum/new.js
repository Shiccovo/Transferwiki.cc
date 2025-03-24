import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import MainLayout from '../../components/layout/MainLayout';
import ForumLayout from '../../components/layout/ForumLayout';
import dynamic from 'next/dynamic';
import { PREDEFINED_CATEGORIES } from '../../components/forum/ForumCategories';

// 动态导入富文本编辑器组件以避免SSR问题
const RichTextEditor = dynamic(() => import('../../components/ui/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md"></div>,
});

export default function CreateForumTopic() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [categories, setCategories] = useState([]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      categoryId: ''
    }
  });

  // 获取分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/forum/categories');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setCategories(data);
          } else {
            // 如果API没有返回分类或返回空数组，使用预设分类
            setCategories(PREDEFINED_CATEGORIES);
          }
        } else {
          console.error('获取分类失败');
          // 使用预设分类作为后备方案
          setCategories(PREDEFINED_CATEGORIES);
        }
      } catch (error) {
        console.error('获取分类错误:', error);
        // 使用预设分类作为后备方案
        setCategories(PREDEFINED_CATEGORIES);
      }
    };

    fetchCategories();
  }, []);

  // 处理权限检查
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

  if (!session) {
    return (
      <MainLayout>
        <ForumLayout>
          <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  需要登录
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  您需要登录后才能创建话题。
                </p>
                <button
                  onClick={() => router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  登录
                </button>
              </div>
            </div>
          </div>
        </ForumLayout>
      </MainLayout>
    );
  }

  // 处理表单提交
  const handleFormSubmit = async (data) => {
    setIsLoading(true);
    
    if (!editorContent || editorContent.trim() === '<p><br></p>') {
      setErrorMessage('内容不能为空');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          content: editorContent,
          categoryId: data.categoryId
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '创建话题失败');
      }
      
      const result = await response.json();
      
      // 跳转到新创建的话题
      router.push(`/forum/topic/${result.id}`);
    } catch (error) {
      console.error('创建话题错误:', error);
      setErrorMessage(error.message || '创建话题失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <ForumLayout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            创建新话题
          </h1>
          
          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200">
                {errorMessage}
              </p>
            </div>
          )}
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* 标题输入 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  标题 *
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title', { 
                    required: '标题不能为空',
                    minLength: { value: 5, message: '标题至少需要5个字符' },
                    maxLength: { value: 100, message: '标题不能超过100个字符' }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="话题标题"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>
              
              {/* 分类选择 */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  分类 *
                </label>
                <select
                  id="categoryId"
                  {...register('categoryId', { required: '请选择分类' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
              
              {/* 内容编辑器 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  内容 *
                </label>
                <RichTextEditor 
                  value={editorContent}
                  onChange={setEditorContent}
                  placeholder="输入话题内容..."
                  height="300px"
                />
                {errorMessage && errorMessage.includes('内容') && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    内容不能为空
                  </p>
                )}
              </div>
              
              {/* 提交按钮 */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/forum')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading ? '发布中...' : '发布话题'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </ForumLayout>
    </MainLayout>
  );
}