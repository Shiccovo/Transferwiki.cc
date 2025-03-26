import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

export default function ForumLayout({ children, categories = [] }) {
  const router = useRouter();
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:space-x-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 mb-8 md:mb-0">
          <motion.div 
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">论坛版块</h3>
            <nav className="space-y-1">
              <Link 
                href="/forum"
                className={`block px-3 py-2 rounded-md ${
                  !router.query.category 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                所有话题
              </Link>
              
              {categories.map(category => (
                <Link 
                  key={category.id}
                  href={`/forum?category=${category.slug}`}
                  className={`block px-3 py-2 rounded-md ${
                    router.query.category === category.slug 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
            

          </motion.div>
          
          <motion.div 
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mt-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">快速链接</h3>
            <nav className="space-y-1">
              <Link 
                href="/wiki"
                className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Wiki新人导航
              </Link>

              {/* <Link 
                href="/forum/latest"
                className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                最新回复
              </Link> */}
            </nav>
          </motion.div>
        </div>
        
        {/* Main Content */}
        <motion.div 
          className="flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}