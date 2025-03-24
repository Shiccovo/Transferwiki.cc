/**
 * 创建管理员用户脚本
 * 
 * 使用方法：
 * node scripts/create-admin.js "管理员名称" "admin@example.com"
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

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('请提供管理员名称和邮箱，例如: node scripts/create-admin.js "管理员名称" "admin@example.com"');
    process.exit(1);
  }

  const [name, email] = args;

  try {
    // 查找用户
    const { data: existingUser, error: findError } = await supabase
      .from('User')
      .select('*')
      .eq('email', email)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      console.error('查找用户时出错:', findError);
      process.exit(1);
    }

    if (existingUser) {
      // 更新用户角色为管理员
      const { data: updatedUser, error: updateError } = await supabase
        .from('User')
        .update({ role: 'ADMIN' })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('更新用户角色时出错:', updateError);
        process.exit(1);
      }

      console.log(`已将用户 ${name} (${email}) 设置为管理员`);
      console.log('用户信息:');
      console.log(updatedUser);
    } else {
      // 创建新管理员用户
      const { data: newUser, error: createError } = await supabase
        .from('User')
        .insert([{
          name,
          email,
          role: 'ADMIN',
          emailVerified: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('创建管理员用户时出错:', createError);
        process.exit(1);
      }

      console.log(`已创建管理员用户: ${name} (${email})`);
      console.log('用户信息:');
      console.log(newUser);
    }
  } catch (error) {
    console.error('处理过程中出错:', error);
    process.exit(1);
  }
}

main();