import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthLayout from '../components/AuthLayout';
import { motion } from 'framer-motion';

export default function RegisterSuccess() {
  const router = useRouter();
  
  // 5秒后自动跳转到登录页
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <AuthLayout title="注册成功" subtitle="请前往邮箱验证您的账户">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          我们已向您的邮箱发送了验证链接，请点击链接完成注册。
        </p>
        
        <Link href="/login">
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            返回登录
          </motion.a>
        </Link>
      </div>
    </AuthLayout>
  );
} 