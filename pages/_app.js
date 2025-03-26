import { ThemeProvider } from 'next-themes';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useEffect, useState, createContext, useContext } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import '../styles/globals.css';
import '../styles/quill.css';
import { useRouter } from 'next/router';

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function App({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);

  // Handle page views for analytics
  useEffect(() => {
    const handleRouteChange = (url) => {
      // Only redirect in production environment
      if (process.env.NODE_ENV === 'production' && !window.location.hostname.includes('transferwiki.cc')) {
        window.location.href = `https://transferwiki.cc${url}`;
        return;
      }

      // Increment view count for wiki pages
      if (url.startsWith('/wiki/') && url !== '/wiki/' && url !== '/wiki/create' && !url.includes('/edit/') && !url.includes('/history/')) {
        const slug = url.replace('/wiki/', '');
        
        // Call API to increment view count
        fetch(`/api/pages/view?slug=${encodeURIComponent(slug)}`, {
          method: 'POST',
        }).catch(err => {
          console.error('Failed to increment page view:', err);
        });
      }
      
      // Increment view count for forum topics
      if (url.startsWith('/forum/topic/')) {
        const topicId = url.replace('/forum/topic/', '');
        
        // Call API to increment view count
        fetch(`/api/forum/view?id=${encodeURIComponent(topicId)}`, {
          method: 'POST',
        }).catch(err => {
          console.error('Failed to increment topic view:', err);
        });
      }
    };

    // Subscribe to router events
    if (mounted) {
      const { Router } = require('next/router');
      Router.events.on('routeChangeComplete', handleRouteChange);
      
      return () => {
        Router.events.off('routeChangeComplete', handleRouteChange);
      };
    }
  }, [mounted]);

  useEffect(() => {
    const handleStart = () => {
      // 可以添加加载指示器
    };

    const handleComplete = () => {
      // 可以移除加载指示器
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  useEffect(() => {
    // 监听认证状态变化
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('userProfile');
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabaseClient]);

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <ThemeProvider attribute="class" defaultTheme="system">
        {getLayout(<Component {...pageProps} />)}
      </ThemeProvider>
    </SessionContextProvider>
  );
}