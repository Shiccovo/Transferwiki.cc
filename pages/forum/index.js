import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { forumOperations } from '../../lib/db';
import MainLayout from '../../components/layout/MainLayout';
import ForumLayout from '../../components/layout/ForumLayout';
import TopicCard from '../../components/forum/TopicCard';
import SiteMeta from '../../components/SiteMeta';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default function ForumHome({ categories, topics }) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState('latest');
  const currentCategory = router.query.category;
  
  // 过滤和排序话题
  const filteredTopics = topics.filter(topic => 
    !currentCategory || topic.category?.slug === currentCategory
  );
  
  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'popular') {
      return (b.likes || 0) - (a.likes || 0);
    }
    return 0;
  });

  return (
    <>
      <SiteMeta
        title="论坛"
        canonical="/forum"
        description="在 Transferwiki 论坛与转学生们交流选校、申请、文书等经验，获取最新的转学资讯。"
      />
    <MainLayout>
      <ForumLayout categories={categories}>
        <div className="space-y-4">
          {/* 顶部标题和分类信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentCategory 
                  ? `${categories.find(c => c.slug === currentCategory)?.name || '话题'}`
                  : '所有话题'
                }
              </h1>
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="latest">最新</option>
                  <option value="popular">最热</option>
                </select>
                <Link
                  href="/forum/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  发布新话题
                </Link>
              </div>
            </div>
          </div>

          {/* 话题列表 */}
          {sortedTopics.length > 0 ? (
            sortedTopics.map(topic => (
              <TopicCard key={topic.id} topic={topic} />
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                {currentCategory ? '该分类下暂无话题' : '暂无话题'}
              </p>
            </div>
          )}
        </div>
      </ForumLayout>
    </MainLayout>
    </>
  );
}

export async function getServerSideProps({ req, res }) {
  try {
    // 获取所有分类
    const categories = await forumOperations.getAllCategories();
    
    // 创建supabase客户端，正确传入req和res
    const supabase = createPagesServerClient({ req, res });
    
    // 获取所有话题，使用正确的关系名称和字段
    const { data: topics, error } = await supabase
      .from('ForumTopic')
      .select(`
        *,
        category:categoryId (*),
        profiles:userid (id, email, avatar_url, full_name),
        replies:ForumReply (*)
      `)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    
    // 无需额外处理，full_name 字段已正确查询

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