import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

// 自定义布局，用于登录页面
export const getLayout = (page) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {page}
    </div>
  );
};

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { error: urlError } = router.query;

  // 如果用户已经登录，重定向到首页
  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  // 处理登录表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('请填写所有字段');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        setError('邮箱或密码不正确');
      } else {
        router.push('/');
      }
    } catch (error) {
      setError('登录失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 处理第三方登录
  const handleOAuthSignIn = (provider) => {
    signIn(provider, { callbackUrl: '/' });
  };

  // 显示URL错误
  useEffect(() => {
    if (urlError) {
      switch (urlError) {
        case 'CredentialsSignin':
          setError('邮箱或密码不正确');
          break;
        case 'SessionRequired':
          setError('请先登录');
          break;
        default:
          setError('登录失败');
          break;
      }
    }
  }, [urlError]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">登录账户</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          或{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            注册新账户
          </Link>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            电子邮箱
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            密码
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              忘记密码?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">或使用其他方式登录</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => handleOAuthSignIn('google')}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.766 12.2764C23.766 11.4607 23.7004 10.6406 23.5687 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"/>
              <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853"/>
              <path d="M5.50253 14.3003C4.99987 12.8099 4.99987 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC04"/>
              <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335"/>
            </svg>
          </button>

          <button
            onClick={() => handleOAuthSignIn('qq')}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.376 0 0 5.376 0 12C0 18.624 5.376 24 12 24C18.624 24 24 18.624 24 12C24 5.376 18.624 0 12 0ZM17.568 14.64C17.328 15.144 16.656 15.984 16.224 16.464C16.224 16.464 16.008 16.776 16.056 16.968C16.104 17.208 16.296 17.928 16.296 17.928C16.296 17.928 16.344 18.288 15.912 18.384C15.456 18.504 15.024 18.024 14.928 17.784C14.832 17.544 14.784 17.112 14.784 17.112C14.784 17.112 14.76 16.656 14.496 16.608C13.536 16.44 12.264 16.296 11.976 16.272C11.688 16.296 10.416 16.44 9.456 16.608C9.192 16.656 9.168 17.112 9.168 17.112C9.168 17.112 9.12 17.544 9.024 17.784C8.928 18.024 8.496 18.504 8.04 18.384C7.608 18.288 7.656 17.928 7.656 17.928C7.656 17.928 7.848 17.208 7.896 16.968C7.944 16.776 7.728 16.464 7.728 16.464C7.296 15.984 6.624 15.144 6.384 14.64C6.12 14.088 6.552 13.8 6.912 13.848C7.296 13.896 7.536 14.28 7.536 14.28C7.536 14.28 8.28 15.432 9.6 15.6C9.6 15.6 9.96 15.648 9.984 15.336C10.008 15.024 9.792 14.544 9.792 14.544C9.792 14.544 9.144 12.792 9.144 12.024C9.144 11.328 9.36 10.704 9.72 10.704C10.08 10.704 10.224 11.016 10.272 11.208C10.32 11.4 10.344 12.192 10.344 12.192C10.344 12.192 10.44 12.456 10.8 12.336C11.16 12.216 11.616 12.144 12 12.144C12.384 12.144 12.84 12.216 13.2 12.336C13.56 12.456 13.656 12.192 13.656 12.192C13.656 12.192 13.68 11.4 13.728 11.208C13.776 11.016 13.92 10.704 14.28 10.704C14.64 10.704 14.856 11.328 14.856 12.024C14.856 12.792 14.208 14.544 14.208 14.544C14.208 14.544 13.992 15.024 14.016 15.336C14.04 15.648 14.4 15.6 14.4 15.6C15.72 15.432 16.464 14.28 16.464 14.28C16.464 14.28 16.704 13.896 17.088 13.848C17.448 13.8 17.88 14.088 17.568 14.64Z" fill="#12B7F5"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// 禁用Nextra默认布局
Login.getLayout = getLayout;