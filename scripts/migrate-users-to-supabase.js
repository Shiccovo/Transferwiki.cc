require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 需要使用 service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// MongoDB 配置
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

async function migrateUsers() {
  console.log('开始迁移用户数据到 Supabase...');
  
  // 连接到 MongoDB
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(dbName);
  const userCollection = db.collection('users');
  
  // 获取所有用户
  const users = await userCollection.find({}).toArray();
  console.log(`找到 ${users.length} 个用户需要迁移`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const user of users) {
    try {
      // 使用 admin API 创建用户
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password, // 如果密码已经是哈希值，需要先生成随机密码
        email_confirm: true, // 自动确认邮箱
        user_metadata: {
          full_name: user.name || '',
          avatar_url: user.image || '',
        },
      });
      
      if (error) throw error;
      
      // 更新 profiles 表
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: user.name || '',
          bio: user.bio || '',
          avatar_url: user.image || '',
          role: user.role || 'USER',
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.user.id);
      
      if (profileError) throw profileError;
      
      console.log(`迁移用户成功: ${user.email}`);
      successCount++;
    } catch (error) {
      console.error(`迁移用户失败 ${user.email}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`迁移完成: 成功 ${successCount}, 失败 ${errorCount}`);
  await client.close();
}

migrateUsers().catch(console.error); 