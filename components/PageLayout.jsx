import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import CommentSection from './CommentSection';
import EditPageButton from './EditPageButton';
import { useRouter } from 'next/router';

export default function PageLayout({ children, frontMatter, meta }) {
  const { title, description } = frontMatter || meta || {};
  const { data: session } = useSession();
  const router = useRouter();
  const currentPath = router.asPath;

  return (
    <article className="nx-min-h-screen">
      <div className="flex justify-between items-center mb-6">
        {title && (
          <motion.h1 
            className="nx-text-4xl nx-font-bold nx-tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h1>
        )}
        
        {session && <EditPageButton currentPath={currentPath} />}
      </div>
      
      {description && (
        <motion.div 
          className="nx-text-xl nx-text-gray-600 nx-mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {description}
        </motion.div>
      )}

      <motion.div 
        className="nx-prose nx-prose-blue nx-max-w-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {children}
      </motion.div>

      {/* Don't show comments on auth pages or login/register pages */}
      {!currentPath.startsWith('/auth/') && 
       !currentPath.startsWith('/login') && 
       !currentPath.startsWith('/register') && 
       <CommentSection pagePath={currentPath} />}
    </article>
  );
}