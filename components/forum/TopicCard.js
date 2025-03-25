import Link from 'next/link';

export default function TopicCard({ topic }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <Link href={`/forum/topic/${topic.id}`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600">
              {topic.title}
            </h3>
            {topic.isPinned && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                置顶
              </span>
            )}
          </div>
          
          <div className="flex items-center mb-3">
            <img
              src={topic.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(topic.user?.name || 'Anonymous')}&background=random`}
              alt={topic.user?.name || 'Anonymous'}
              className="w-8 h-8 rounded-full mr-3"
            />
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                {topic.user?.name || '匿名用户'}
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(topic.createdAt).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
          
          <div className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {topic.content?.replace(/<[^>]*>/g, '') || ''}
          </div>
          
          <div className="flex items-center justify-between mt-3 text-sm text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {topic.viewCount || 0}
              </span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {topic.replies?.length || 0}
              </span>
            </div>
            
            {topic.category && (
              <span className="flex items-center text-xs" style={{ color: topic.category?.color || '#6B7280' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {topic.category?.name || '未分类'}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
} 