import { useState, useEffect, useRef } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

export default function MainLayout({ children }) {
  const user = useUser();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const menuRef = useRef(null);
  const supabase = useSupabaseClient();

  // After mounting, we can safely show the UI that depends on the theme
  useEffect(() => {
    setMounted(true);
    // 一段时间后结束加载状态，给会话加载一些时间
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  
  // 加载用户资料
  useEffect(() => {
    async function getUserProfile() {
      if (user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (data) {
            setUserProfile(data);
            // 简单保存用户信息到本地存储用于备份
            localStorage.setItem('userProfile', JSON.stringify(data));
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
    }
    
    getUserProfile();
  }, [user, supabase]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-white dark:bg-gray-900"></div>;
  }

  const UserMenu = () => {
    // 从本地存储获取备份资料
    const storedProfileData = 
      !userProfile && isLoading ? 
      JSON.parse(localStorage.getItem('userProfile') || 'null') : 
      null;
    
    if (isLoading && !user && !storedProfileData) {
      return (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
        </div>
      );
    }
    
    if (!user && !storedProfileData) {
      // 未登录状态
      return (
        <div className="flex items-center space-x-3">
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            登录
          </Link>
        </div>
      );
    }

    // 已登录状态
    const handleSignOut = async () => {
      try {
        await supabase.auth.signOut();
        localStorage.removeItem('userProfile');
        router.push('/');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    };

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center space-x-1 focus:outline-none"
        >
          {userProfile?.avatar_url ? (
            <img
              src={userProfile.avatar_url}
              alt={userProfile.full_name || '用户头像'}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {(userProfile?.full_name || user?.email)?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:inline">
            {userProfile?.full_name || user?.email}
          </span>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              个人资料
            </Link>
            {userProfile?.role === 'ADMIN' && (
              <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                管理中心
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              登出
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Left side: Logo and desktop navigation */}
            <div className="flex items-center">
              <Link href="/" className="font-bold text-xl text-gray-900 dark:text-white mr-8">
                Transferwiki.cc
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className={`text-sm font-medium ${router.pathname === '/' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                  首页
                </Link>
                <Link href="/wiki" className={`text-sm font-medium ${router.pathname.startsWith('/wiki') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                  Wiki
                </Link>
                <Link href="/forum" className={`text-sm font-medium ${router.pathname.startsWith('/forum') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                  论坛
                </Link>
                <Link href="/about" className={`text-sm font-medium ${router.pathname === '/about' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                  关于
                </Link>
              </nav>
            </div>

            {/* Right side: Theme toggle, search, and user menu */}
            <div className="flex items-center space-x-4">
              {/* Search button */}
              <button
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                onClick={() => {/* Open search */}}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Theme toggle */}
              <button
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>

              {/* User Menu */}
              <UserMenu />

              {/* Mobile menu button */}
              <button
                className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4 py-2">
              <nav className="flex flex-col space-y-3 py-3">
                <Link href="/" className={`text-sm font-medium ${router.pathname === '/' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                  首页
                </Link>
                <Link href="/wiki" className={`text-sm font-medium ${router.pathname.startsWith('/wiki') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                  Wiki
                </Link>
                <Link href="/forum" className={`text-sm font-medium ${router.pathname.startsWith('/forum') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                  论坛
                </Link>
                <Link href="/about" className={`text-sm font-medium ${router.pathname === '/about' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                  关于
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} TransferWiki.cc - 转学生资源共享平台
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                使用条款
              </Link>
              <Link href="/privacy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                隐私政策
              </Link>
              <Link href="/contact" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                联系我们
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}