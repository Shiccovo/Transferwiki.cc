import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import MainLayout from '../../../components/layout/MainLayout';
import WikiEditor from '../../../components/wiki/WikiEditor';
import { pageOperations } from '../../../lib/db';

export default function EditWikiPage({ page, error }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(error || '');
  
  // 处理权限检查
  if (!session) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                需要登录
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                您需要登录后才能编辑页面。
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
  
  // 处理错误状态
  if (errorMessage) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                编辑失败
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {errorMessage}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  返回
                </button>
                <button
                  onClick={() => router.push(`/wiki/create?slug=${router.query.slug}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  创建新页面
                </button>
              </div>
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
      const response = await fetch(`/api/pages/${router.query.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '保存页面失败');
      }
      
      // 跳转到页面查看
      router.push(`/wiki/${router.query.slug}`);
    } catch (error) {
      console.error('编辑页面错误:', error);
      setErrorMessage(error.message || '编辑页面失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          编辑页面
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <WikiEditor
            initialData={page}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </MainLayout>
  );
}

export async function getServerSideProps({ params, req }) {
  const { slug } = params;
  
  try {
    // 使用Supabase API获取页面
    const page = await pageOperations.getPageBySlug(slug);
    
    if (!page) {
      return {
        props: {
          error: '页面不存在',
        },
      };
    }
    
    return {
      props: {
        page: JSON.parse(JSON.stringify(page)),
      },
    };
  } catch (error) {
    console.error('获取页面错误:', error);
    
    return {
      props: {
        error: '获取页面失败',
      },
    };
  }
}