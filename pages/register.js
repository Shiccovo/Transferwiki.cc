import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password', ''); // 用于密码确认验证
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // 检查密码确认是否匹配
      if (data.password !== data.confirmPassword) {
        throw new Error('两次输入的密码不一致');
      }
      
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name || ''
          }
        }
      });
      
      if (error) throw error;
      
      // 注册成功，重定向到登录页面或欢迎页面
      router.push('/register/success');
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage(error.message || '注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="注册" subtitle="创建新账户" type="register">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{errorMessage}</p>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            用户名
          </label>
          <div className="mt-1">
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register('name')}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white sm:text-sm"
            />
          </div>
        </div>
        
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
              {...register('email', { 
                required: '请输入邮箱',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: '请输入有效的邮箱地址'
                }
              })}
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
              autoComplete="new-password"
              required
              {...register('password', { 
                required: '请输入密码',
                minLength: {
                  value: 6,
                  message: '密码至少需要6个字符'
                }
              })}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white sm:text-sm"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            确认密码
          </label>
          <div className="mt-1">
            <input
              id="confirmPassword"
              type="password"
              required
              {...register('confirmPassword', { 
                required: '请确认密码',
                validate: value => value === password || '两次输入的密码不一致'
              })}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white sm:text-sm"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? '注册中...' : '注册'}
          </button>
        </div>
      </form>
      

    </AuthLayout>
  );
}