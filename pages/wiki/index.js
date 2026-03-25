import Link from 'next/link';
import { motion } from 'framer-motion';
import DocsLayout from '../../components/layout/DocsLayout';
import { getAllDocs } from '../../lib/staticDocs';
import SiteMeta from '../../components/SiteMeta';

export default function WikiDirectoryPage({ docs = [] }) {
  return (
    <>
      <SiteMeta
        title="Wiki 文章目录"
        canonical="/wiki"
        description="Transferwiki 知识库文章目录：浏览所有转学相关文章。"
      />
      <DocsLayout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* 页面标题 */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Wiki 文章目录
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              共 {docs.length} 篇文章
            </p>
          </motion.div>

          {/* 文章列表 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {docs.map((doc, index) => (
              <motion.div
                key={doc.slug}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Link href={`/wiki/${doc.slug}`}>
                  <div className={`flex items-center px-6 py-4 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${
                    index !== docs.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                  }`}>
                    {/* 序号 */}
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-semibold mr-4">
                      {doc.order}
                    </span>

                    {/* 标题和描述 */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-medium text-gray-900 dark:text-white truncate">
                        {doc.title}
                      </h2>
                      {doc.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {doc.description}
                        </p>
                      )}
                    </div>

                    {/* 箭头 */}
                    <svg
                      className="flex-shrink-0 w-5 h-5 text-gray-400 ml-4"
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
                </Link>
              </motion.div>
            ))}
          </div>

          {/* 空状态 */}
          {docs.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              暂无文章
            </div>
          )}
        </div>
      </DocsLayout>
    </>
  );
}

export async function getStaticProps() {
  try {
    const docs = getAllDocs();
    return { props: { docs } };
  } catch (error) {
    console.error('Error fetching docs:', error);
    return { props: { docs: [] } };
  }
}
