import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TopicCard({ topic }) {
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
              <div className="flex items-center mb-3">
                <img
                  src={topic.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(topic.user?.name || 'Anonymous')}&background=random`}
                  alt={topic.user?.name || 'Anonymous'}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {topic.user?.name || '匿名用户'}
                    </span>
                    {topic.isPinned && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        置顶
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    发表于 {new Date(topic.createdAt).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {topic.title}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                {topic.content?.replace(/<[^>]*>/g, '') || ''}
              </p>
            </div>
            
            <div className="ml-4 flex flex-col items-center">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {topic.replies?.length || 0}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">回复</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span style={{ color: topic.category?.color || '#6B7280' }}>
                {topic.category?.name || '未分类'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{topic.viewCount || 0}</span>
              </div>
              
              {topic.lastReplyAt && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>最后回复：{new Date(topic.lastReplyAt).toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}