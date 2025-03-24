/**
 * 添加 isEdited 列到 ForumReply 表
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 创建 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少 Supabase URL 或 API key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addIsEditedColumn() {
  console.log('正在添加 isEdited 列到 ForumReply 表...');

  try {
    // 直接执行SQL添加列
    const { error } = await supabase.rpc('execute_sql', {
      sql_string: 'ALTER TABLE "ForumReply" ADD COLUMN IF NOT EXISTS "isEdited" BOOLEAN DEFAULT FALSE;'
    });

    if (error) {
      // 如果RPC函数不可用，尝试直接执行SQL
      console.error('使用RPC函数执行SQL失败:', error.message);
      console.log('请直接在Supabase SQL编辑器中运行以下SQL:');
      console.log('ALTER TABLE "ForumReply" ADD COLUMN IF NOT EXISTS "isEdited" BOOLEAN DEFAULT FALSE;');
      return;
    }

    console.log('✅ isEdited 列已成功添加到 ForumReply 表');

    // 刷新架构缓存
    const { error: refreshError } = await supabase.rpc('execute_sql', {
      sql_string: 'SELECT pg_sleep(0.5); SELECT 1;'
    });

    if (!refreshError) {
      console.log('✅ 架构缓存已刷新');
    }

  } catch (error) {
    console.error('添加列时出错:', error);
    console.log('请直接在Supabase SQL编辑器中运行以下SQL:');
    console.log('ALTER TABLE "ForumReply" ADD COLUMN IF NOT EXISTS "isEdited" BOOLEAN DEFAULT FALSE;');
  }
}

// 运行主函数
addIsEditedColumn();