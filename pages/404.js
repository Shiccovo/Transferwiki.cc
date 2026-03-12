import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MainLayout from '../components/layout/MainLayout';

export default function Custom404() {
  const router = useRouter();
  const path = router.asPath;
  
  useEffect(() => {
    // 处理旧的MDX页面重定向
    if (path.startsWith('/schools/')) {
      // 比如 /schools/osu → /wiki/schools/osu
      const newPath = `/wiki${path}`;
      router.replace(newPath);
    }
    // 处理其他旧的静态页面重定向
    else if (path === '/admit' || path === '/apply' || path === '/faq' || path === '/material' || path === '/think') {
      router.replace(`/wiki${path}`);
    }
  }, [path, router]);
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            页面未找到
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            抱歉，您访问的页面不存在或已被移动。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <span className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 inline-block">
                返回首页
              </span>
            </Link>
            <Link href="/wiki">
              <span className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-medium rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 inline-block">
                浏览 Wiki
              </span>
            </Link>
          </div>
          
          <div className="mt-12">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              我们网站正在升级，部分旧链接可能已失效。<br />
              您可以使用顶部的搜索框找到您需要的内容。
            </p>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}