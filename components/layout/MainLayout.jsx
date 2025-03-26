import { useState, useEffect, useRef } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout({ children }) {
  const user = useUser();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
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
    async function loadUserProfile() {
      if (user) {
        try {
          setIsLoadingProfile(true);
          const { data, error } = await supabase
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
          console.error('加载用户资料出错:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        // 用户未登录，清除资料并停止加载
        setUserProfile(null);
        setIsLoadingProfile(false);
      }
    }
    
    loadUserProfile();
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
      !userProfile && isLoadingProfile ? 
      JSON.parse(localStorage.getItem('userProfile') || 'null') : 
      null;
    
    if (isLoadingProfile && !user && !storedProfileData) {
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
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        user={user} 
        userProfile={userProfile} 
        isLoadingProfile={isLoadingProfile} 
      />
      <main className="flex-grow container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}