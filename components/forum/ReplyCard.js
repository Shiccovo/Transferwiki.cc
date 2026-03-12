export default function ReplyCard({ reply, isFirst, onEdit, onDelete }) {
  // 添加用户名显示函数
  const getUserDisplayName = (profile) => {
    if (!profile) return '匿名用户';
    return profile.full_name || profile.email?.split('@')[0] || '匿名用户';
  }

  return (
    <div className="...">
      <div className="flex items-center space-x-2">
        <img
          src={reply.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName(reply.user))}&background=random`}
          alt={getUserDisplayName(reply.user)}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {getUserDisplayName(reply.user)}
            {isFirst && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                楼主
              </span>
            )}
          </div>
          {/* ... */}
        </div>
      </div>
      {/* ... */}
    </div>
  );
} 