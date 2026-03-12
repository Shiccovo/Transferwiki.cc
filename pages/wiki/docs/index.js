import Link from 'next/link';
import { motion } from 'framer-motion';
import DocsLayout from '../../../components/layout/DocsLayout';
import { getAllDocs } from '../../../lib/staticDocs';

export default function DocsIndexPage({ docs }) {
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
            <li className="text-gray-900 dark:text-white">文档</li>
          </ol>
        </nav>

        {/* 页面标题 */}
        <div className="mb-8">
          <motion.h1
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            文档中心
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            浏览完整的使用指南和帮助文档
          </motion.p>
        </div>

        {/* 文档列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docs.map((doc, index) => (
            <motion.div
              key={doc.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={`/wiki/docs/${doc.slug}`}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
                  {/* 文档序号 */}
                  <div className="flex items-center mb-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full font-semibold text-sm">
                      {doc.order}
                    </span>
                  </div>
                  
                  {/* 文档标题 */}
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                    {doc.title}
                  </h2>
                  
                  {/* 文档描述 */}
                  {doc.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow line-clamp-3">
                      {doc.description}
                    </p>
                  )}
                  
                  {/* 阅读链接 */}
                  <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium mt-auto">
                    <span>阅读文档</span>
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* 空状态 */}
        {docs.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              暂无文档
            </p>
          </div>
        )}

        {/* 底部提示 */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            需要帮助？
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            如果您在使用过程中遇到问题，可以查看常见问题或在论坛中提问。
          </p>
          <div className="flex space-x-4">
            <Link href="/wiki/docs/faq">
              <span className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                查看FAQ
              </span>
            </Link>
            <Link href="/forum">
              <span className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                访问论坛
              </span>
            </Link>
          </div>
        </div>
      </div>
    </DocsLayout>
  );
}

export async function getStaticProps() {
  try {
    const docs = getAllDocs();
    
    return {
      props: {
        docs,
      },
    };
  } catch (error) {
    console.error('Error fetching docs:', error);
    return {
      props: {
        docs: [],
      },
    };
  }
}

