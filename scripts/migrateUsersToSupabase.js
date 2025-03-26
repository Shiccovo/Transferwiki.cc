// 这个文件应该在服务器端运行，使用node scripts/migrateUsersToSupabase.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// 加载环境变量
dotenv.config();

// 使用服务角色来创建管理员客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 这是服务角色密钥，不要泄露或前端使用
);

// 记录迁移日志
const logFile = fs.createWriteStream('./migration-log.txt', { flags: 'a' });
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logFile.write(logMessage + '\n');
};

async function migrateUsers() {
  try {
    // 1. 从旧的User表获取所有用户
    log('开始获取现有用户...');
    const { data: existingUsers, error: fetchError } = await supabaseAdmin
      .from('User')
      .select('*');

    if (fetchError) {
      throw new Error(`获取现有用户失败: ${fetchError.message}`);
    }

    log(`找到 ${existingUsers.length} 个用户需要迁移`);

    // 2. 检查哪些用户已经存在于Auth中
    const { data: existingAuthUsers } = await supabaseAdmin
      .from('auth.users')
      .select('email');
    
    const existingEmails = new Set(existingAuthUsers.map(user => user.email.toLowerCase()));
    
    // 3. 为每个用户创建Auth账户
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of existingUsers) {
      try {
        // 跳过已存在的用户
        if (user.email && existingEmails.has(user.email.toLowerCase())) {
          log(`用户 ${user.email} 已存在于Auth系统，跳过`);
          continue;
        }
        
        // 生成随机密码 (或其他方式)
        const temporaryPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).toUpperCase().slice(-2) + '!1';
        
        // 创建用户
        const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: temporaryPassword,
          email_confirm: true, // 自动确认邮箱
          user_metadata: {
            name: user.name,
            avatar_url: user.image
          }
        });
        
        if (createError) {
          throw new Error(`创建Auth用户失败: ${createError.message}`);
        }
        
        // 将原用户ID和新用户ID的映射存储起来，以便后续更新其他表的引用
        await supabaseAdmin
          .from('UserMigrationMap')
          .insert({
            oldId: user.id,
            newId: newAuthUser.id,
            email: user.email,
            migratedAt: new Date().toISOString()
          });
        
        // 发送密码重置邮件
        await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: user.email
        });
        
        log(`成功迁移用户: ${user.email}`);
        successCount++;
      } catch (err) {
        log(`迁移用户 ${user.email || user.id} 失败: ${err.message}`);
        errorCount++;
      }
    }
    
    log(`迁移完成: 成功 ${successCount} 个, 失败 ${errorCount} 个`);
    
    // 4. 更新其他表的外键引用
    await updateForeignKeys();
    
    log('所有操作完成');
  } catch (error) {
    log(`迁移过程中发生错误: ${error.message}`);
  } finally {
    logFile.end();
  }
}

async function updateForeignKeys() {
  try {
    log('开始更新外键引用...');
    
    // 获取ID映射
    const { data: idMappings, error } = await supabaseAdmin
      .from('UserMigrationMap')
      .select('oldId, newId');
    
    if (error) {
      throw new Error(`获取ID映射失败: ${error.message}`);
    }
    
    // 创建映射对象
    const idMap = {};
    idMappings.forEach(mapping => {
      idMap[mapping.oldId] = mapping.newId;
    });
    
    // 更新ForumTopic表
    const { error: topicError } = await supabaseAdmin.rpc('update_forum_topic_user_ids', { id_map: idMap });
    if (topicError) log(`更新ForumTopic表失败: ${topicError.message}`);
    
    // 更新ForumReply表
    const { error: replyError } = await supabaseAdmin.rpc('update_forum_reply_user_ids', { id_map: idMap });
    if (replyError) log(`更新ForumReply表失败: ${replyError.message}`);
    
    // 更新其他需要更新的表...
    
    log('外键引用更新完成');
  } catch (error) {
    log(`更新外键引用时出错: ${error.message}`);
  }
}

// 执行迁移
migrateUsers(); 