/**
 * 创建管理员用户脚本
 * 
 * 使用方法：
 * node scripts/create-admin.js "管理员名称" "admin@example.com"
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('请提供管理员名称和邮箱，例如: node scripts/create-admin.js "管理员名称" "admin@example.com"');
    process.exit(1);
  }

  const [name, email] = args;

  try {
    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // 更新用户角色为管理员
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
      console.log(`已将用户 ${name} (${email}) 设置为管理员`);
    } else {
      // 创建新管理员用户
      user = await prisma.user.create({
        data: {
          name,
          email,
          role: "ADMIN",
          emailVerified: new Date(),
        },
      });
      console.log(`已创建管理员用户: ${name} (${email})`);
    }

    console.log('用户信息:');
    console.log(user);
    
  } catch (error) {
    console.error('创建管理员时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();