import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { PrismaClient } from '@prisma/client';
import '../styles/globals.css';

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Global prisma instance
export let prisma;

// Initialize PrismaClient in development with global.prisma
if (process.env.NODE_ENV === 'development') {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
} else {
  // In production, always create a new PrismaClient instance
  prisma = new PrismaClient();
}

export default function App({ Component, pageProps }) {
  const [supabase, setSupabase] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (supabaseUrl && supabaseAnonKey) {
      setSupabase(createClient(supabaseUrl, supabaseAnonKey));
    }
    
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

  return (
    <SessionProvider 
      session={pageProps.session}
      refetchInterval={5 * 60} // 每5分钟重新获取会话以确保会话始终是最新的
      refetchOnWindowFocus={true} // 窗口获得焦点时重新获取会话
    >
      <ThemeProvider attribute="class" defaultTheme="system">
        {getLayout(<Component {...pageProps} supabase={supabase} />)}
      </ThemeProvider>
    </SessionProvider>
  );
}