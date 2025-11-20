import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import EditPageButton from '../EditPageButton';

export default function WikiLayout({ 
  children, 
  title, 
  description, 
  slug, 
  lastEditedBy, 
  lastEditedAt, 
  version 
}) {
  const { data: session } = useSession();
  const [showTableOfContents, setShowTableOfContents] = useState(true);
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Content */}
        <div className="md:flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <motion.h1 
                className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {title}
              </motion.h1>
              {description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {description}
                </p>
              )}
              
              {/* Edit buttons and metadata */}
              <div className="flex flex-wrap items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4 mb-2 md:mb-0">
                  {lastEditedBy && (
                    <span>
                      最后编辑: {lastEditedBy.name} 于 {new Date(lastEditedAt).toLocaleDateString('zh-CN')}
                    </span>
                  )}
                  {version && (
                    <span className="hidden md:inline">•</span>
                  )}
                  {version && (
                    <span className="hidden md:inline">
                      版本 {version}
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Link href={`/wiki/history/${slug}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    历史版本
                  </Link>
                  
                  {session && (
                    <EditPageButton slug={slug} />
                  )}
                </div>
              </div>
            </div>
            
            {/* Wiki Content */}
            <article className="prose dark:prose-invert max-w-none">
              {children}
            </article>
          </div>
          
          {/* Comments Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">评论</h2>
            {/* Comments component will be added here */}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="md:w-64 space-y-6">
          {/* Table of Contents */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-20">
            <div 
              className="flex items-center justify-between cursor-pointer mb-2"
              onClick={() => setShowTableOfContents(!showTableOfContents)}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">目录</h3>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 ${showTableOfContents ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {showTableOfContents && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {/* Table of contents would be dynamically generated */}
                <ul className="space-y-1 list-disc list-inside">
                  <li>
                    <a href="#section-1" className="hover:text-blue-600 dark:hover:text-blue-400">
                      Section 1
                    </a>
                  </li>
                  <li>
                    <a href="#section-2" className="hover:text-blue-600 dark:hover:text-blue-400">
                      Section 2
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          {/* Related Pages */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">相关页面</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  相关页面 1
                </Link>
              </li>
              <li>
                <Link href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  相关页面 2
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}