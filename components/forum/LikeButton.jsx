import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function LikeButton({ topic, onLike }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likes, setLikes] = useState(topic.likes || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLiked, setHasLiked] = useState(
    topic.likedUserIds?.includes(session?.user?.id)
  );

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }
    
    if (isLoading || hasLiked) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/forum/topics/${topic.id}/like`, {
        method: 'POST'
      });

      if (response.ok) {
        setLikes(likes + 1);
        setHasLiked(true);
        if (onLike) onLike(likes + 1);
      } else {
        const errorData = await response.json();
        alert(errorData.error);
      }
    } catch (error) {
      console.error('Error liking topic:', error);
      alert('点赞失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLike} 
      disabled={isLoading || hasLiked}
      className={`flex items-center space-x-1 px-4 py-2 rounded-md ${
        isLoading 
          ? 'bg-gray-100 cursor-not-allowed' 
          : hasLiked
            ? 'bg-blue-50 text-blue-600 cursor-not-allowed'
            : 'hover:bg-blue-50 dark:hover:bg-blue-900/30'
      }`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-5 w-5 ${hasLiked ? 'text-blue-600' : 'text-blue-500'}`}
        fill={hasLiked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" 
        />
      </svg>
      <span className={hasLiked ? 'text-blue-600' : 'text-blue-500'}>{likes}</span>
    </button>
  );
} 