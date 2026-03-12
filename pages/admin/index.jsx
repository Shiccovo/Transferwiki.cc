import { useState, useEffect } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import MainLayout from '../../components/layout/MainLayout';
import Link from 'next/link';

export default function AdminDashboard() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [pendingEdits, setPendingEdits] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('edits');

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (data) {
            setProfile(data);
            if (data.role !== 'ADMIN') {
              router.replace('/');
            } else {
              fetchData();
            }
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        router.replace('/login');
      }
    }
    
    loadProfile();
  }, [user, supabase, router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 获取待审核编辑
      const { data: edits, error: editsError } = await supabase
        .from('page_edits')
        .select('*, user:profiles(*)')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });
        
      if (!editsError) {
        setPendingEdits(edits || []);
      }

      // 获取所有用户
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, name, role, created_at')
        .order('created_at', { ascending: false });
        
      if (!usersError) {
        setUsers(allUsers || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveEdit = async (editId) => {
    try {
      // 先获取编辑信息
      const { data: edit, error: getError } = await supabase
        .from('page_edits')
        .select('*')
        .eq('id', editId)
        .single();

      if (getError) throw getError;

      // 更新编辑状态为已批准
      const { error: updateError } = await supabase
        .from('page_edits')
        .update({ status: 'APPROVED' })
        .eq('id', editId);

      if (updateError) throw updateError;

      // 刷新数据
      fetchData();
    } catch (error) {
      console.error('Error approving edit:', error);
      alert('批准编辑失败：' + error.message);
    }
  };

  const handleRejectEdit = async (editId) => {
    try {
      // 更新编辑状态为已拒绝
      const { error } = await supabase
        .from('page_edits')
        .update({ status: 'REJECTED' })
        .eq('id', editId);

      if (error) throw error;

      // 刷新数据
      fetchData();
    } catch (error) {
      console.error('Error rejecting edit:', error);
      alert('拒绝编辑失败：' + error.message);
    }
  };

  const handleUpdateUserRole = async (userId, role) => {
    try {
      // 更新用户角色
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;

      // 刷新数据
      fetchData();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('更新用户角色失败：' + error.message);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">管理中心</h1>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button 
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'edits' 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('edits')}
              >
                待审核编辑 ({pendingEdits.length})
              </button>
              <button 
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'users' 
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('users')}
              >
                用户管理 ({users.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'edits' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">待审核的页面编辑</h2>
                
                {pendingEdits.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">目前没有待审核的编辑。</p>
                ) : (
                  <div className="space-y-6">
                    {pendingEdits.map((edit) => (
                      <div key={edit.id} className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              页面路径: <span className="text-blue-600 dark:text-blue-400">{edit.pagePath}</span>
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              提交者: {edit.user?.name || '未知用户'} | 
                              提交时间: {new Date(edit.created_at).toLocaleString('zh-CN')}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <a 
                              href={`/api/admin/edits/${edit.id}/preview`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              预览
                            </a>
                            <button 
                              onClick={() => handleApproveEdit(edit.id)}
                              className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded border border-green-200 dark:border-green-800 text-sm hover:bg-green-200 dark:hover:bg-green-800"
                            >
                              批准
                            </button>
                            <button 
                              onClick={() => handleRejectEdit(edit.id)}
                              className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded border border-red-200 dark:border-red-800 text-sm hover:bg-red-200 dark:hover:bg-red-800"
                            >
                              拒绝
                            </button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="font-medium text-sm">内容预览:</p>
                          <pre className="mt-1 text-xs bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 overflow-auto max-h-32">
                            {edit.content.slice(0, 500)}{edit.content.length > 500 ? '...' : ''}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'users' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">用户管理</h2>
                
                {users.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">没有找到用户。</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            用户
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            邮箱
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            注册时间
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            角色
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {user.avatar_url ? (
                                    <img 
                                      className="h-10 w-10 rounded-full" 
                                      src={user.avatar_url} 
                                      alt={user.name || user.email?.split('@')[0]} 
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                      {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.name || user.email?.split('@')[0]}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(user.created_at).toLocaleDateString('zh-CN')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <select
                                value={user.role}
                                onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                className="block w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={profile?.id === user.id} // 不能更改自己的角色
                              >
                                <option value="USER">用户</option>
                                <option value="EDITOR">编辑</option>
                                <option value="ADMIN">管理员</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}