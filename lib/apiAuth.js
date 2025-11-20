import { createServerClient } from './supabaseServer';

// 中间件函数，用于API认证检查
export async function withAuth(req, res, handler) {
  const supabase = createServerClient(req, res);
  
  // 获取当前会话
  const { data: { session } } = await supabase.auth.getSession();
  
  // 用户未登录
  if (!session) {
    return res.status(401).json({ error: '未授权，请先登录' });
  }
  
  // 继续处理请求
  req.supabase = supabase;
  req.user = session.user;
  
  return handler(req, res);
}

// 可选的中间件函数，对于某些可以未登录也可以访问的API
export async function withOptionalAuth(req, res, handler) {
  const supabase = createServerClient(req, res);
  
  // 获取当前会话
  const { data: { session } } = await supabase.auth.getSession();
  
  // 添加会话信息，但不阻止未登录用户
  req.supabase = supabase;
  req.user = session?.user || null;
  
  return handler(req, res);
} 