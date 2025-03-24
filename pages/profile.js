import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import { withAuth } from '../lib/auth';
import { useAuth } from './_app';

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  // 初始化用户资料
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setFullName(user.user_metadata?.full_name || '');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 处理更新用户资料
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    setIsUpdating(true);
    setUpdateError('');
    setUpdateSuccess('');
    
    try {
      // 更新用户资料
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName
        }
      });
      
      if (error) throw error;
      
      setUpdateSuccess('个人资料已成功更新！');
      
      // 清除成功消息
      setTimeout(() => {
        setUpdateSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('更新个人资料时出错:', error);
      setUpdateError(error.message || '更新个人资料失败，请稍后再试');
    } finally {
      setIsUpdating(false);
    }
  };

  // 处理更改密码
  const handleChangePassword = () => {
    router.push('/reset-password');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">个人资料</h1>
        </div>
        
        <div className="p-6">
          {updateError && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800">
              {updateError}
            </div>
          )}
          
          {updateSuccess && (
            <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md border border-green-200 dark:border-green-800">
              {updateSuccess}
            </div>
          )}
          
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                电子邮箱
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  disabled
                  value={email}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">邮箱地址不可更改</p>
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                用户名
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? '更新中...' : '保存更改'}
              </button>
              
              <button
                type="button"
                onClick={handleChangePassword}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                更改密码
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// 使用withAuth HOC保护此路由
export const getServerSideProps = withAuth();