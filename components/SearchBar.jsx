import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const TYPE_LABEL = { wiki: 'Wiki', school: '学校' };
const TYPE_COLOR = {
  wiki: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  school: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

export default function SearchBar() {
  const router = useRouter();
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // 防抖搜索
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.results || []);
        setActiveIndex(0);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // 点击外部关闭
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 路由跳转后清空
  useEffect(() => {
    const clear = () => { setQuery(''); setIsOpen(false); };
    router.events.on('routeChangeStart', clear);
    return () => router.events.off('routeChangeStart', clear);
  }, [router]);

  const handleKeyDown = (e) => {
    if (!isOpen || !results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      router.push(results[activeIndex].href);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative hidden md:block">
      {/* 输入框 */}
      <div className="flex items-center w-56 lg:w-72 h-8 px-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-transparent focus-within:border-blue-400 focus-within:bg-white dark:focus-within:bg-gray-700 transition-colors">
        {isLoading ? (
          <svg className="h-3.5 w-3.5 text-gray-400 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (results.length) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="搜索..."
          className="flex-1 ml-2 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); inputRef.current?.focus(); }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 下拉结果 */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 lg:w-96 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {results.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((item, i) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <div
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        i === activeIndex
                          ? 'bg-blue-50 dark:bg-blue-900/30'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0 text-gray-400">
                        {item.type === 'school' ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422A12.083 12.083 0 0112 21.5a12.083 12.083 0 01-6.16-10.922L12 14z" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.title}
                          </span>
                          <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium ${TYPE_COLOR[item.type]}`}>
                            {TYPE_LABEL[item.type]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {item.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              未找到与 <span className="font-medium text-gray-700 dark:text-gray-300">"{query}"</span> 相关的内容
            </div>
          )}
        </div>
      )}
    </div>
  );
}
