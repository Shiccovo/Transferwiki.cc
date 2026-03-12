import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

export default function LikeButton({ topic }) {
  const [likes, setLikes] = useState(topic.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();
  const router = useRouter();

  // 检查当前用户是否已经点赞
  useEffect(() => {
    async function checkLikeStatus() {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/forum/topics/${topic.id}/like?check=true`);
        
        if (response.ok) {
          const data = await response.json();
          setIsLiked(data.isLiked);
        }
      } catch (error) {
        console.error('Failed to check like status:', error);
      }
    }
    
    checkLikeStatus();
  }, [topic.id, user]);

  const handleLike = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/forum/topics/${topic.id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes);
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error('Failed to update like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
        isLiked
          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 ${
          isLiked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
        } ${isLoading ? 'animate-pulse' : ''}`}
        fill={isLiked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={isLiked ? 0 : 2}
          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
        />
      </svg>
      <span>{likes}</span>
    </button>
  );
} 