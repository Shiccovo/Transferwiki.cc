import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MainLayout from '../../components/layout/MainLayout';
import { prisma } from '../../lib/prisma';

// Wiki首页组件
export default function WikiHomePage({ initialCategories, initialPages, error }) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPages, setFilteredPages] = useState(initialPages || []);
  const [isLoading, setIsLoading] = useState(false);
  
  // 根据分类和搜索词筛选页面
  useEffect(() => {
    async function fetchFilteredPages() {
      if (!initialPages) return;
      
      // 如果选择了"全部"且没有搜索词，直接使用初始页面列表
      if (selectedCategory === 'all' && !searchTerm) {
        setFilteredPages(initialPages);
        return;
      }
      
      setIsLoading(true);
      
      try {
        let url = '/api/pages?';
        
        if (selectedCategory !== 'all') {
          url += `category=${encodeURIComponent(selectedCategory)}&`;
        }
        
        if (searchTerm) {
          url += `search=${encodeURIComponent(searchTerm)}&`;
        }
        
        url += 'limit=20';
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setFilteredPages(data.pages);
        }
      } catch (error) {
        console.error('获取筛选页面失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchFilteredPages();
  }, [selectedCategory, searchTerm, initialPages]);
  
  // 处理搜索提交
  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setSearchTerm(formData.get('search'));
  };
  
  // 处理错误状态
  if (error) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              出错了
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {error}
            </p>
            <button
              onClick={() => router.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              重试
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // 获取页面可能的分类列表
  const categories = initialCategories || [];
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* 顶部标题和搜索栏 */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
            Wiki 知识库
          </h1>
          
          <div className="w-full md:w-auto flex space-x-2">
            <form onSubmit={handleSearch} className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="搜索Wiki页面..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-3 text-gray-400 dark:text-gray-500"
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
              </div>
            </form>
            
            <Link href="/wiki/create">
              <span className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                创建页面
              </span>
            </Link>
          </div>
        </div>
        
        {/* 分类筛选器 */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              全部
            </button>
            
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* 页面列表 */}
        {isLoading ? (
          <div className="flex justify-center items-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredPages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map((page) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/wiki/${page.slug}`}>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                      {page.title}
                    </h2>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow">
                      {page.description || page.content.substring(0, 120)}
                      {!page.description && page.content.length > 120 ? '...' : ''}
                    </p>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span>
                        {new Date(page.updatedAt).toLocaleDateString('zh-CN')}
                      </span>
                      <span>{page.viewCount} 次查看</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              找不到与"{searchTerm}"相关的页面
            </p>
            <Link href="/wiki/create">
              <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                创建该页面
              </span>
            </Link>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              该分类下暂无页面
            </p>
            <Link href="/wiki/create">
              <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                创建页面
              </span>
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export async function getStaticProps() {
  try {
    // 获取所有已发布页面
    const pages = await prisma.page.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        lastEditedBy: {
          select: {
            name: true,
          },
        },
      },
      take: 20, // 限制返回页数
    });
    
    // 获取所有可能的分类
    const allCategories = await prisma.page.findMany({
      where: {
        isPublished: true,
        NOT: { category: null },
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });
    
    const categories = allCategories
      .map(page => page.category)
      .filter(category => category); // 过滤掉空值
    
    return {
      props: {
        initialPages: JSON.parse(JSON.stringify(pages)),
        initialCategories: categories,
      },
      revalidate: 60, // 每60秒重新生成页面
    };
  } catch (error) {
    console.error('获取Wiki页面列表失败:', error);
    
    return {
      props: {
        error: '获取Wiki页面列表失败',
        initialPages: [],
        initialCategories: [],
      },
      revalidate: 60,
    };
  }
}