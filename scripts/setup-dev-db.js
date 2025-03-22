/**
 * 设置开发环境数据库（SQLite）
 */
const fs = require('fs');
const path = require('path');

console.log('设置开发环境数据库（SQLite）...');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 替换数据库配置为 SQLite
schema = schema.replace(
  /datasource db {[^}]*}/s,
  `datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}`
);

// 删除所有 @db.Text 标记
schema = schema.replace(/@db\.Text/g, '');

fs.writeFileSync(schemaPath, schema);

console.log('已更新 schema.prisma 配置为 SQLite');
console.log('');
console.log('现在，请运行以下命令生成客户端并创建数据库：');
console.log('npx prisma generate && npx prisma db push');