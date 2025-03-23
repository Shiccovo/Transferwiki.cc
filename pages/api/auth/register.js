import { hash } from 'bcrypt';
import { userOperations } from '../../../lib/db';
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  // 检查请求方法
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { name, email, password } = req.body;

    // 基本验证 - 检查必填字段
    if (!name) {
      return res.status(400).json({ error: '请提供用户名' });
    }
    
    if (!email) {
      return res.status(400).json({ error: '请提供电子邮箱' });
    }
    
    if (!password) {
      return res.status(400).json({ error: '请提供密码' });
    }

    // 电子邮件格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: '请提供有效的电子邮件地址' });
    }

    // 密码长度验证
    if (password.length < 6) {
      return res.status(400).json({ error: '密码必须至少为6个字符' });
    }

    // 检查邮箱是否已被使用
    const existingUser = await userOperations.getUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ error: '此电子邮件已被注册' });
    }

    // 对密码进行哈希处理
    const hashedPassword = await hash(password, 10);
    
    // 检查是否为首个用户 - 首个用户自动成为管理员
    const { count, error: countError } = await supabase
      .from('User')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('获取用户数量失败:', countError);
      return res.status(500).json({ error: '注册过程中发生错误，无法验证用户信息' });
    }
    
    const isFirstUser = !count || count === 0;
    const userRole = isFirstUser ? 'ADMIN' : 'USER';

    // 创建新用户
    try {
      const user = await userOperations.createUser({
        name,
        email,
        password: hashedPassword,
        role: userRole,
      });

      // 确保用户创建成功并有完整信息
      if (!user || !user.id) {
        return res.status(500).json({ error: '创建用户失败，请稍后再试' });
      }

      // 不返回密码
      const { password: _, ...userWithoutPassword } = user;

      // 登录成功 - 返回详细的用户信息
      console.log(`用户注册成功: ${email} (${name}), 角色: ${userRole}`);
      
      return res.status(201).json({
        message: '用户注册成功',
        user: {
          ...userWithoutPassword,
          id: user.id,
          role: user.role
        },
      });
    } catch (createError) {
      console.error('创建用户失败:', createError);
      return res.status(500).json({ error: '创建用户失败，请稍后再试' });
    }
  } catch (error) {
    console.error('注册错误:', error);
    return res.status(500).json({ 
      error: error.message || '注册过程中发生错误，请稍后再试' 
    });
  }
}