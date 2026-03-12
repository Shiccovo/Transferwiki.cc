import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useForm } from 'react-hook-form';
import MainLayout from '../../components/layout/MainLayout';
import ForumLayout from '../../components/layout/ForumLayout';
import dynamic from 'next/dynamic';
import { PREDEFINED_CATEGORIES } from '../../components/forum/ForumCategories';

// 动态导入富文本编辑器组件以避免SSR问题
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>加载编辑器中...</p>,
});

const modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['link', 'image'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  }
};

export default function CreateForumTopic() {
  const router = useRouter();
  const user = useUser();
  const supabase = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
        const { data, error } = await supabase
          .from('ForumCategory')
          .select('*')
          .order('sortOrder', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setCategories(data);
        } else {
          // 如果数据库没有分类或返回空数组，使用预设分类
          setCategories(PREDEFINED_CATEGORIES);
        }
      } catch (error) {
        console.error('获取分类错误:', error);
        // 使用预设分类作为后备方案
        setCategories(PREDEFINED_CATEGORIES);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCategories();
  }, [supabase]);

  // 处理权限检查
  if (loadingUser) {
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

  if (!user) {
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
    setErrorMessage('');
    
    if (!editorContent || editorContent.trim() === '<p><br></p>') {
      setErrorMessage('内容不能为空');
      setIsLoading(false);
      return;
    }

    try {
      // 使用API路由替代直接插入
      const response = await fetch('/api/forum/create-topic', {
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
        const errorData = await response.json();
        throw new Error(errorData.error || '创建话题失败');
      }

      const newTopic = await response.json();
      
      // 跳转到新创建的话题
      router.push(`/forum/topic/${newTopic.id}`);
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
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900 dark:text-red-100 dark:border-red-800">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                标题
              </label>
              <input
                type="text"
                id="title"
                {...register('title', { required: '请输入标题' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="请输入标题"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                分类
              </label>
              <select
                id="categoryId"
                {...register('categoryId', { required: '请选择分类' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">选择分类</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categoryId.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                内容
              </label>
              <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
                <ReactQuill
                  value={editorContent}
                  onChange={setEditorContent}
                  modules={modules}
                  theme="snow"
                  placeholder="请输入话题内容..."
                  className="h-64 rounded-md dark:bg-gray-700"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    提交中...
                  </div>
                ) : '发布话题'}
              </button>
            </div>
          </form>
        </div>
      </ForumLayout>
    </MainLayout>
  );
}