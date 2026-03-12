import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

// 自定义布局，用于更新密码页面
export const getLayout = (page) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {page}
    </div>
  );
};

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);

  // 检查用户是否已通过重置链接登录
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('获取会话失败:', error);
        setError('无法验证您的会话，请重新尝试重置密码流程');
        return;
      }
      
      if (data?.session) {
        setUser(data.session.user);
      } else {
        // 用户没有有效会话，可能是直接访问此页面而不是通过密码重置邮件
        setError('无效的会话，请通过重置密码邮件链接访问此页面');
      }
    };
    
    checkSession();
  }, []);

  // 处理更新密码表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证表单
    if (!password || !confirmPassword) {
      setError('请填写所有必填字段');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不匹配');
      return;
    }
    
    // 验证密码强度
    if (password.length < 8) {
      setError('密码长度至少为8个字符');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // 使用Supabase更新密码
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      // 密码更新成功
      setSuccess('密码已成功更新！');
      
      // 3秒后重定向到登录页面
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (error) {
      console.error('更新密码失败:', error);
      setError(error.message || '更新密码失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">设置新密码</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            返回登录
          </Link>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md border border-green-200 dark:border-green-800">
          {success}
        </div>
      )}

      {!user && !error ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">验证会话中...</span>
        </div>
      ) : error && !user ? (
        <div className="text-center py-4">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Link href="/reset-password" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            重新发起密码重置
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              新密码
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                placeholder="请输入新密码"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              确认新密码
            </label>
            <div className="mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                placeholder="请再次输入新密码"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !user}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '更新中...' : '更新密码'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// 禁用Nextra默认布局
UpdatePassword.getLayout = getLayout;