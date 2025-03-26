import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import LikeButton from './LikeButton';
import { formatDate } from '../../lib/utils';
import Image from 'next/image';
import { stringToColor } from '../../lib/utils';

export default function TopicCard({ topic }) {
  const [likes, setLikes] = useState(topic.likes || 0);

  // 计算帖子发布时间
  const topicDate = formatDate(topic.createdAt);
  
  // 使用正确的用户数据结构 - 优先使用name
  const authorName = topic.profiles ? (topic.profiles.name || topic.profiles.displayName || topic.profiles.email.split('@')[0]) : '未知用户';
  const userColor = stringToColor(authorName);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/forum/topics/${topic.id}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        setLikes(likes + 1);
      } else {
        const errorData = await response.json();
        alert(errorData.error);
      }
    } catch (error) {
      console.error('Error liking topic:', error);
      alert('点赞失败，请稍后再试');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4 hover:shadow-lg transition-shadow duration-200"
    >
      <Link href={`/forum/topic/${topic.id}`}>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  {topic.profiles?.avatar_url ? (
                    <Image 
                      src={topic.profiles.avatar_url} 
                      alt={authorName} 
                      width={48} 
                      height={48} 
                      className="rounded-full"
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base"
                      style={{ backgroundColor: userColor }}
                    >
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {authorName}
                    </span>
                    {topic.isPinned && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        置顶
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    发表于 {topicDate}
                  </span>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {topic.title}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                {topic.content?.replace(/<[^>]*>/g, '') || ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
            <div className="flex items-center space-x-6">
              <LikeButton topic={topic} />
              
              <div className="flex items-center space-x-1">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" 
                  />
                </svg>
                <span>{topic.replies?.length || 0}</span>
              </div>
            </div>

            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span style={{ color: topic.category?.color || '#6B7280' }}>
                {topic.category?.name || '未分类'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}