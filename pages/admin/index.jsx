import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import PageLayout from '../../components/PageLayout';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pendingEdits, setPendingEdits] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('edits');

  useEffect(() => {
    // Check if user is admin
    if (status === 'authenticated') {
      if (session.user.role !== 'ADMIN') {
        router.replace('/');
      } else {
        fetchData();
      }
    } else if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [session, status, router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch pending edits
      const editsResponse = await fetch('/api/admin/edits');
      if (editsResponse.ok) {
        const editsData = await editsResponse.json();
        setPendingEdits(editsData);
      }

      // Fetch users
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveEdit = async (editId) => {
    try {
      const response = await fetch(`/api/admin/edits/${editId}/approve`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh data
        fetchData();
      }
    } catch (error) {
      console.error('Error approving edit:', error);
    }
  };

  const handleRejectEdit = async (editId) => {
    try {
      const response = await fetch(`/api/admin/edits/${editId}/reject`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh data
        fetchData();
      }
    } catch (error) {
      console.error('Error rejecting edit:', error);
    }
  };

  const handleUpdateUserRole = async (userId, role) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });
      
      if (response.ok) {
        // Refresh data
        fetchData();
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <PageLayout meta={{ title: '管理中心' }}>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout meta={{ title: '管理中心' }}>
      <div className="tabs mb-6 border-b">
        <button 
          className={`tab ${activeTab === 'edits' ? 'tab-active border-b-2 border-blue-500' : ''} py-2 px-4`}
          onClick={() => setActiveTab('edits')}
        >
          待审核编辑
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'tab-active border-b-2 border-blue-500' : ''} py-2 px-4`}
          onClick={() => setActiveTab('users')}
        >
          用户管理
        </button>
      </div>

      {activeTab === 'edits' && (
        <div>
          <h2 className="text-xl font-bold mb-4">待审核的页面编辑 ({pendingEdits.length})</h2>
          
          {pendingEdits.length === 0 ? (
            <p className="text-gray-500">目前没有待审核的编辑。</p>
          ) : (
            <div className="space-y-6">
              {pendingEdits.map((edit) => (
                <div key={edit.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold">页面路径: {edit.pagePath}</h3>
                      <p className="text-sm text-gray-500">
                        由 {edit.user.name} 提交于 {new Date(edit.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveEdit(edit.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        批准
                      </button>
                      <button
                        onClick={() => handleRejectEdit(edit.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        拒绝
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">编辑内容预览:</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">
                      <pre className="whitespace-pre-wrap">{edit.content.substring(0, 500)}...</pre>
                    </div>
                    <button
                      onClick={() => window.open(`/api/admin/edits/${edit.id}/preview`, '_blank')}
                      className="mt-2 px-3 py-1 border border-gray-300 text-sm rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      查看完整预览
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h2 className="text-xl font-bold mb-4">用户管理 ({users.length})</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.image && (
                          <img className="h-8 w-8 rounded-full mr-2" src={user.image} alt="" />
                        )}
                        <div>
                          <div className="text-sm font-medium">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-800' 
                          : user.role === 'EDITOR' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                        className="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={session?.user?.id === user.id} // Cannot change own role
                      >
                        <option value="USER">USER</option>
                        <option value="EDITOR">EDITOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageLayout>
  );
}