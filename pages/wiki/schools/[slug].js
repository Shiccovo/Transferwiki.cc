import Link from 'next/link';
import { motion } from 'framer-motion';
import DocsLayout from '../../../components/layout/DocsLayout';
import { getAllSchoolSlugs, getSchoolBySlug } from '../../../lib/staticDocs';
import SiteMeta from '../../../components/SiteMeta';

export default function SchoolPage({ school, error }) {
  if (error || !school) {
    return (
      <DocsLayout>
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">页面不存在</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error || '该学校页面不存在。'}</p>
          <Link href="/wiki/school_list">
            <span className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              返回学校列表
            </span>
          </Link>
        </div>
      </DocsLayout>
    );
  }

  return (
    <>
      <SiteMeta
        title={school.title}
        canonical={`/wiki/schools/${school.slug}`}
        description={school.description || `${school.title} 转学指南 — 申请材料、重要日期、录取数据。`}
      />
      <DocsLayout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* 面包屑 */}
          <nav className="mb-6 text-sm">
            <ol className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/wiki" className="hover:text-blue-600 dark:hover:text-blue-400">Wiki</Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/wiki/school_list" className="hover:text-blue-600 dark:hover:text-blue-400">学校列表</Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 dark:text-white">{school.title}</li>
            </ol>
          </nav>

          <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4"
            >
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {school.title}
              </h1>
              {school.description && (
                <p className="text-lg text-gray-600 dark:text-gray-400">{school.description}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: school.content }}
            />
          </article>
        </div>
      </DocsLayout>
    </>
  );
}

export async function getStaticPaths() {
  const slugs = getAllSchoolSlugs();
  return {
    paths: slugs.map(slug => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  try {
    const school = await getSchoolBySlug(slug);
    if (!school) {
      return { props: { error: '学校页面不存在' } };
    }
    return { props: { school } };
  } catch (error) {
    console.error('Error fetching school:', error);
    return { props: { error: '获取页面失败' } };
  }
}
