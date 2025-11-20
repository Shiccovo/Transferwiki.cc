// 修改用户显示名称逻辑
const getUserDisplayName = (user) => {
  return user.name || user.email?.split('@')[0] || '未知用户';
}

// 在用户表格中使用此函数
<div className="text-sm font-medium text-gray-900 dark:text-white">
  {getUserDisplayName(user)}
</div>

export default function UserList({ users, onRoleChange }) {
  // 正确显示用户名的辅助函数
  const getUserDisplayName = (user) => {
    return user.name || user.email?.split('@')[0] || '未知用户';
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              用户
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              角色
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              注册时间
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300">
                    {getUserDisplayName(user).charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {getUserDisplayName(user)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </div>
              </td>
              {/* 其余部分保持不变 */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 