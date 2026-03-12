import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import DocsLayout from '../../../components/layout/DocsLayout';
import { getAllDocSlugs, getDocBySlug, getDocsNavigation } from '../../../lib/staticDocs';

export default function DocPage({ doc, navigation, error }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 处理加载状态
  if (router.isFallback) {
    return (
      <DocsLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DocsLayout>
    );
  }

  // 处理错误状态
  if (error || !doc) {
    return (
      <DocsLayout>
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              文档不存在
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {error || '该文档不存在。'}
            </p>
            <Link href="/wiki/docs">
              <span className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                返回文档列表
              </span>
            </Link>
          </div>
        </div>
      </DocsLayout>
    );
  }

  return (
    <DocsLayout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* 面包屑导航 */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <li>
              <Link href="/wiki" className="hover:text-blue-600 dark:hover:text-blue-400">
                Wiki
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/wiki/docs" className="hover:text-blue-600 dark:hover:text-blue-400">
                文档
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white">{doc.title}</li>
          </ol>
        </nav>

        <div className="flex gap-8">
          {/* 左侧边栏导航 */}
          <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 transition-all duration-300 overflow-hidden`}>
            <div className="sticky top-20 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  文档导航
                </h3>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/wiki/docs/${item.slug}`}
                    className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                      item.slug === doc.slug
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* 主内容区 */}
          <main className="flex-1 min-w-0">
            {/* 移动端侧边栏切换按钮 */}
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="mb-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>显示导航</span>
              </button>
            )}

            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
              {/* 文档标题 */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4"
              >
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {doc.title}
                </h1>
                {doc.description && (
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {doc.description}
                  </p>
                )}
              </motion.div>

              {/* 文档内容 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: doc.content }}
              />

              {/* 文档底部导航 */}
              <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  {/* 上一篇 */}
                  {navigation.findIndex(d => d.slug === doc.slug) > 0 && (
                    <Link
                      href={`/wiki/docs/${navigation[navigation.findIndex(d => d.slug === doc.slug) - 1].slug}`}
                      className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">上一篇</div>
                        <div>{navigation[navigation.findIndex(d => d.slug === doc.slug) - 1].title}</div>
                      </div>
                    </Link>
                  )}
                  
                  <div className="flex-1"></div>
                  
                  {/* 下一篇 */}
                  {navigation.findIndex(d => d.slug === doc.slug) < navigation.length - 1 && (
                    <Link
                      href={`/wiki/docs/${navigation[navigation.findIndex(d => d.slug === doc.slug) + 1].slug}`}
                      className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400">下一篇</div>
                        <div>{navigation[navigation.findIndex(d => d.slug === doc.slug) + 1].title}</div>
                      </div>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </article>
          </main>
        </div>
      </div>
    </DocsLayout>
  );
}

export async function getStaticPaths() {
  try {
    const slugs = getAllDocSlugs();
    
    const paths = slugs.map((slug) => ({
      params: { slug },
    }));
    
    return {
      paths,
      fallback: false,
    };
  } catch (error) {
    console.error('Error generating static paths:', error);
    return {
      paths: [],
      fallback: false,
    };
  }
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  
  try {
    const doc = await getDocBySlug(slug);
    const navigation = getDocsNavigation();
    
    if (!doc) {
      return {
        props: {
          error: '文档不存在',
          navigation,
        },
      };
    }
    
    return {
      props: {
        doc,
        navigation,
      },
    };
  } catch (error) {
    console.error('Error fetching doc:', error);
    return {
      props: {
        error: '获取文档失败',
        navigation: [],
      },
    };
  }
}

