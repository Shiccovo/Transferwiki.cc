import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import AuthLayout from '../components/AuthLayout';

// 自定义布局，用于登录页面
export const getLayout = (page) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {page}
    </div>
  );
};

export default function Login() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const { redirect } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (error) throw error;
      
      // 登录成功，重定向到主页或指定的重定向页面
      router.push(redirect || '/');
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('邮箱或密码错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="登录" type="login">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{errorMessage}</p>
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            邮箱
          </label>
          <div className="mt-1">
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              {...register('email', { required: '请输入邮箱' })}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white sm:text-sm"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            密码
          </label>
          <div className="mt-1">
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              {...register('password', { required: '请输入密码' })}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white sm:text-sm"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </div>
      </form>
      

    </AuthLayout>
  );
}

// 禁用Nextra默认布局
Login.getLayout = getLayout;