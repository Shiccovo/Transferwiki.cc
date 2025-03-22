/**
 * 设置生产环境数据库（PostgreSQL）
 */
const fs = require('fs');
const path = require('path');

console.log('设置生产环境数据库（PostgreSQL）...');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 替换数据库配置为 PostgreSQL
schema = schema.replace(
  /datasource db {[^}]*}/s,
  `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
);

// 为长文本字段添加 @db.Text 标记
schema = schema.replace(
  /(refresh_token\s+String\?)/g,
  '$1 @db.Text'
);

schema = schema.replace(
  /(access_token\s+String\?)/g,
  '$1 @db.Text'
);

schema = schema.replace(
  /(id_token\s+String\?)/g,
  '$1 @db.Text'
);

schema = schema.replace(
  /(content\s+String)/g,
  '$1 @db.Text'
);

fs.writeFileSync(schemaPath, schema);

console.log('已更新 schema.prisma 配置为 PostgreSQL');
console.log('');
console.log('确保您的 .env 或 .env.local 文件中包含有效的 DATABASE_URL');
console.log('例如: DATABASE_URL="postgresql://postgres:password@db.your-project-id.supabase.co:5432/postgres"');
console.log('');
console.log('现在，请运行以下命令生成客户端并创建数据库：');
console.log('npx prisma generate && npx prisma db push');