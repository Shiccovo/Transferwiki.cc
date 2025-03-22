import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MainLayout from '../../components/layout/MainLayout';
import ForumLayout from '../../components/layout/ForumLayout';
import TopicCard from '../../components/forum/TopicCard';
import { prisma } from '../../lib/prisma';

export default function ForumHome({ categories, topics }) {
  const [sortBy, setSortBy] = useState('latest');
  const [filter, setFilter] = useState('all');
  
  // Sort and filter topics
  const sortedTopics = [...topics].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    } else if (sortBy === 'popular') {
      return b.viewCount - a.viewCount;
    } else if (sortBy === 'activity') {
      return b.replies.length - a.replies.length;
    }
    return 0;
  });
  
  const filteredTopics = sortedTopics.filter(topic => {
    if (filter === 'all') return true;
    if (filter === 'pinned') return topic.isPinned;
    return false;
  });
  
  return (
    <MainLayout>
      <ForumLayout categories={categories}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">论坛讨论区</h1>
              
              <div className="flex flex-wrap gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="latest">最新发布</option>
                  <option value="popular">最多浏览</option>
                  <option value="activity">最高活跃</option>
                </select>
                
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">所有主题</option>
                  <option value="pinned">置顶主题</option>
                </select>
                
                <Link href="/forum/new">
                  <span className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    发表新话题
                  </span>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Topics List */}
          <div className="p-4">
            {filteredTopics.length > 0 ? (
              <div className="space-y-4">
                {filteredTopics.map(topic => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  暂无话题
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  成为第一个发表话题的用户吧！
                </p>
                <Link href="/forum/new">
                  <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                    发表新话题
                  </span>
                </Link>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {filteredTopics.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    显示 <span className="font-medium">1</span> 到{' '}
                    <span className="font-medium">{filteredTopics.length}</span> 条，共{' '}
                    <span className="font-medium">{topics.length}</span> 条结果
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <a
                      href="#"
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <span className="sr-only">上一页</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      1
                    </a>
                    <a
                      href="#"
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <span className="sr-only">下一页</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </ForumLayout>
    </MainLayout>
  );
}

export async function getServerSideProps() {
  try {
    // Get forum categories
    const categories = await prisma.forumCategory.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
    
    // Get forum topics
    const topics = await prisma.forumTopic.findMany({
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' },
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        replies: {
          select: {
            id: true,
          },
        },
      },
    });
    
    return {
      props: {
        categories: JSON.parse(JSON.stringify(categories)),
        topics: JSON.parse(JSON.stringify(topics)),
      },
    };
  } catch (error) {
    console.error('Error fetching forum data:', error);
    
    return {
      props: {
        categories: [],
        topics: [],
      },
    };
  }
}