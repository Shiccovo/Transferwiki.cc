import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import SearchBar from '../SearchBar';

export default function Header({ user, userProfile, isLoadingProfile }) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const supabase = useSupabaseClient();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-40 w-full backdrop-blur bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* 左侧：Logo + 导航 */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="font-bold text-xl text-gray-900 dark:text-white mr-8">
              Transferwiki.cc
            </Link>
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
              <Link href="/datapoints" className={`text-sm font-medium ${router.pathname.startsWith('/datapoints') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                学生案例
              </Link>
              <Link href="/about" className={`text-sm font-medium ${router.pathname === '/about' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                关于
              </Link>
            </nav>
          </div>

          {/* 右侧：搜索框 + 主题切换 + 用户菜单 */}
          <div className="flex items-center gap-3">

            {/* 内联搜索框 */}
            <SearchBar />

            {/* 主题切换 */}
            <button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none flex-shrink-0"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              {resolvedTheme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* 用户菜单 */}
            <div className="relative flex-shrink-0">
              {isLoadingProfile ? (
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ) : user ? (
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center"
                >
                  {userProfile?.avatar_url ? (
                    <img className="h-8 w-8 rounded-full" src={userProfile.avatar_url} alt={userProfile.full_name || '用户头像'} />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                      {userProfile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="hidden md:block ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {userProfile?.full_name || user.email?.split('@')[0]}
                  </span>
                </button>
              ) : (
                <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                  登录
                </Link>
              )}

              {isProfileMenuOpen && user && (
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

            {/* 移动端汉堡菜单 */}
            <button
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 移动端菜单展开 */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-3 space-y-3">
            {/* 移动端搜索框 */}
            <div className="flex items-center h-9 px-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-transparent focus-within:border-blue-400">
              <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索..."
                className="flex-1 ml-2 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    router.push(`/wiki?search=${encodeURIComponent(e.target.value.trim())}`);
                    setIsMobileMenuOpen(false);
                  }
                }}
              />
            </div>
            <nav className="flex flex-col space-y-3">
              <Link href="/" className={`text-sm font-medium ${router.pathname === '/' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>首页</Link>
              <Link href="/wiki" className={`text-sm font-medium ${router.pathname.startsWith('/wiki') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>Wiki</Link>
              <Link href="/forum" className={`text-sm font-medium ${router.pathname.startsWith('/forum') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>论坛</Link>
              <Link href="/datapoints" className={`text-sm font-medium ${router.pathname.startsWith('/datapoints') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>学生案例</Link>
              <Link href="/about" className={`text-sm font-medium ${router.pathname === '/about' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>关于</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
