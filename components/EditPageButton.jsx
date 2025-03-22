import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function EditPageButton({ slug }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  if (!session) return null;
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
      >
        <span>编辑</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 ml-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => router.push(`/wiki/edit/${slug}`)}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            编辑页面
          </button>
          
          {session.user.role === 'ADMIN' && (
            <>
              <button
                onClick={() => router.push(`/wiki/history/${slug}`)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                查看历史版本
              </button>
              <button
                onClick={() => {
                  if (confirm('确定要删除此页面吗？此操作不可撤销。')) {
                    // 调用删除API
                    fetch(`/api/pages/${slug}`, {
                      method: 'DELETE',
                      headers: {
                        'Content-Type': 'application/json',
                      }
                    }).then(response => {
                      if (response.ok) {
                        router.push('/wiki');
                      } else {
                        alert('删除失败，请重试。');
                      }
                    });
                  }
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
              >
                删除页面
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}