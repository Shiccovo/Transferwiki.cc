// 修改用户显示名称逻辑
const getUserDisplayName = (user) => {
  return user.username || user.full_name || user.email?.split('@')[0] || '未知用户';
}

// 在用户表格中使用此函数
<div className="text-sm font-medium text-gray-900 dark:text-white">
  {getUserDisplayName(user)}
</div> 