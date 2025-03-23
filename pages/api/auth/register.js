import { hash } from 'bcrypt';
import { userOperations } from '../../../lib/db';
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { name, email, password } = req.body;

    // 基本验证
    if (!name || !email || !password) {
      return res.status(400).json({ error: '请提供所有必填字段' });
    }

    // 电子邮件验证
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
    
    // 检查是否为首个用户
    const { data: users } = await supabase.from('User').select('count');
    const isFirstUser = !users || users.count === 0;

    // 创建新用户
    const user = await userOperations.createUser({
      name,
      email,
      password: hashedPassword,
      role: isFirstUser ? 'ADMIN' : 'USER',
    });

    // 不返回密码
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      message: '用户注册成功',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('注册错误:', error);
    return res.status(500).json({ message: '注册过程中发生错误' })
  }
}