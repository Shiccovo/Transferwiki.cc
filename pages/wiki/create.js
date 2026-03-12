import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import MainLayout from '../../components/layout/MainLayout';
import WikiEditor from '../../components/wiki/WikiEditor';

export default function CreateWikiPage() {
  const router = useRouter();
  const user = useUser();
  const supabase = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [initialData, setInitialData] = useState({});
  
  // 获取URL参数
  useEffect(() => {
    if (router.query.slug) {
      setInitialData(prev => ({ ...prev, title: router.query.slug.replace(/-/g, ' ') }));
    }
    if (router.query.title) {
      setInitialData(prev => ({ ...prev, title: router.query.title }));
    }
    setLoadingUser(false);
  }, [router.query]);
  
  // 处理权限检查
  if (loadingUser) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }
  
  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                需要登录
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                您需要登录后才能创建页面。
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
      </MainLayout>
    );
  }
  
  // 处理表单提交
  const handleSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // 生成slug
      const slug = data.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
      
      if (!slug) {
        throw new Error('无法生成有效的URL，请使用不同的标题');
      }
      
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          slug,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '创建页面失败');
      }
      
      const result = await response.json();
      
      // 跳转到新创建的页面
      router.push(`/wiki/${result.slug}`);
    } catch (error) {
      console.error('创建页面错误:', error);
      setErrorMessage(error.message || '创建页面失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          创建新页面
        </h1>
        
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">
              {errorMessage}
            </p>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <WikiEditor
            initialData={initialData}
            onSubmit={handleSubmit}
            isNew={true}
            isLoading={isLoading}
          />
        </div>
      </div>
    </MainLayout>
  );
}