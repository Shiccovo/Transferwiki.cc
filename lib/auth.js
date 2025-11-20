import { supabase } from './supabase';

/**
 * 服务器端验证用户是否已登录
 * @returns {Promise<{user: Object|null, error: Error|null}>}
 */
export async function serverAuth() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return { user: null, error };
    }
    
    if (!data.session) {
      return { user: null, error: null };
    }
    
    return { user: data.session.user, error: null };
  } catch (error) {
    console.error('服务器验证错误:', error);
    return { user: null, error };
  }
}

/**
 * 服务器端获取用户角色
 * @param {string} userId 用户ID
 * @returns {Promise<{role: string|null, error: Error|null}>}
 */
export async function getUserRole(userId) {
  try {
    if (!userId) {
      return { role: null, error: new Error('没有提供用户ID') };
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (error) {
      return { role: null, error };
    }
    
    return { role: data?.role || null, error: null };
  } catch (error) {
    console.error('获取用户角色错误:', error);
    return { role: null, error };
  }
}

/**
 * 提取用户的安全信息，避免序列化问题
 * @param {Object} user Supabase用户对象
 * @returns {Object} 只包含安全可序列化字段的用户对象
 */
function getSerializableUser(user) {
  if (!user) return null;
  
  // 只返回需要的、可序列化的字段
  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
    // user_metadata是普通对象，应该可以安全序列化
    user_metadata: user.user_metadata || {}
  };
}

/**
 * 受保护的路由，获取服务器端props并重定向非登录用户
 * @param {Function} getPropsFunc 可选，获取页面props的函数
 * @returns {Function} getServerSideProps函数
 */
export function withAuth(getPropsFunc) {
  return async (context) => {
    const { req } = context;
    
    const { user, error } = await serverAuth();
    
    if (error || !user) {
      return {
        redirect: {
          destination: `/login?redirect=${encodeURIComponent(req.url || '/')}`,
          permanent: false,
        },
      };
    }
    
    // 获取用户角色
    const { role } = await getUserRole(user.id);
    
    // 如果提供了获取props的函数，则调用它
    if (getPropsFunc) {
      const pageProps = await getPropsFunc(context);
      
      return {
        props: {
          ...pageProps,
          // 不传递完整的user对象，客户端将使用useAuth hook获取用户信息
          userRole: role,
        },
      };
    }
    
    // 默认返回用户角色信息，但不传递完整的user对象
    return {
      props: {
        userRole: role,
      },
    };
  };
}

/**
 * 受保护的管理员路由，获取服务器端props并重定向非管理员用户
 * @param {Function} getPropsFunc 可选，获取页面props的函数
 * @returns {Function} getServerSideProps函数
 */
export function withAdminAuth(getPropsFunc) {
  return async (context) => {
    const { req } = context;
    
    const { user, error } = await serverAuth();
    
    if (error || !user) {
      return {
        redirect: {
          destination: `/login?redirect=${encodeURIComponent(req.url || '/')}`,
          permanent: false,
        },
      };
    }
    
    // 获取用户角色
    const { role, error: roleError } = await getUserRole(user.id);
    
    if (roleError || role !== 'ADMIN') {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
        props: {},
      };
    }
    
    // 如果提供了获取props的函数，则调用它
    if (getPropsFunc) {
      const pageProps = await getPropsFunc(context);
      
      return {
        props: {
          ...pageProps,
          // 不传递完整的user对象，客户端将使用useAuth hook获取用户信息
          userRole: role,
        },
      };
    }
    
    // 默认返回用户角色信息，但不传递完整的user对象
    return {
      props: {
        userRole: role,
      },
    };
  };
}

/**
 * 检查客户端用户是否是管理员
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }
    
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    return data?.role === 'ADMIN';
  } catch (error) {
    console.error('检查管理员权限错误:', error);
    return false;
  }
}