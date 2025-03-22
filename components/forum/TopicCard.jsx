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
              <div className="flex items-center mb-2">
                {topic.isPinned && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">
                    置顶
                  </span>
                )}
                {topic.isLocked && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 mr-2">
                    已锁定
                  </span>
                )}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {topic.title}
                </h2>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">{topic.user.name}</span>
                {' '}发表于{' '}
                {new Date(topic.createdAt).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                {topic.content.replace(/#+|\*\*|\*|~~|`|>|!?\[.*?\]\(.*?\)/g, '').substring(0, 150)}
                {topic.content.length > 150 ? '...' : ''}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <span>{topic.category.name}</span>
            </div>
            
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{topic.viewCount}</span>
            </div>
            
            {topic.lastReplyAt && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {new Date(topic.lastReplyAt).toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}