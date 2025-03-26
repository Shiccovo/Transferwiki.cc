import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MainLayout from '../components/layout/MainLayout';
import { pageOperations, forumOperations } from '../lib/db';

export default function Home({ recentPages, popularTopics }) {
  const router = useRouter();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white mb-12">
        <div className="container mx-auto text-center px-4">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Transferwiki.cc - 施工中
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            为转学生提供全面的指南、经验分享和资源聚合
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/wiki">
              <span className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200">
                新人导航
              </span>
            </Link>
            <Link href="/forum">
              <span className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200">
                参与讨论
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Recent Wiki Pages */}
        <div className="col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">最新Wiki页面</h2>
              <Link href="/wiki">
                <span className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  查看全部
                </span>
              </Link>
            </div>
            
            <div className="space-y-6">
              {recentPages.length > 0 ? (
                recentPages.map((page) => (
                  <motion.div
                    key={page.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0"
                  >
                    <Link href={`/wiki/${page.slug}`}>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                          {page.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {page.description || page.content.substring(0, 150)}
                          {!page.description && page.content.length > 150 ? '...' : ''}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <span>由 {page.lastEditedBy.name} 更新于 {new Date(page.updatedAt).toLocaleDateString('zh-CN')}</span>
                          <span className="mx-2">•</span>
                          <span>版本 {page.version}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">暂无页面</p>
              )}
            </div>
          </div>
        </div>

        {/* Forum Activity & Stats */}
        <div className="col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">热门讨论</h2>
              <Link href="/forum">
                <span className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  查看全部
                </span>
              </Link>
            </div>
            
            <div className="space-y-4">
              {popularTopics.length > 0 ? (
                popularTopics.map((topic) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link href={`/forum/topic/${topic.id}`}>
                      <div className="group p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1 mb-1">
                          {topic.title}
                        </h3>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            {topic.replies.length} 条回复
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {topic.viewCount} 次查看
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">暂无话题</p>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">快速链接</h2>
            
            <ul className="space-y-2">
              <li>
                <Link href="/wiki/create">
                  <span className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    创建新页面
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/forum/new">
                  <span className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    发表新话题
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    关于我们
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export async function getStaticProps() {
  try {
    // Get recent Wiki pages
    const recentPages = await pageOperations.getAllPages(5);

    // Get popular forum topics
    const popularTopics = await forumOperations.getPopularTopics(5);

    return {
      props: {
        recentPages: JSON.parse(JSON.stringify(recentPages)),
        popularTopics: JSON.parse(JSON.stringify(popularTopics))
      },
      revalidate: 60 // Revalidate every 60 seconds
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    
    return {
      props: {
        recentPages: [],
        popularTopics: []
      },
      revalidate: 60
    };
  }
}