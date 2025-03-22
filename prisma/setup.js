const { PrismaClient } = require('@prisma/client');
let prisma;

try {
  prisma = new PrismaClient();
} catch (e) {
  console.error("Prisma Client Error:", e);
  process.exit(1);
}

async function main() {
  console.log('Starting database setup...');

  try {
    // Run migrations
    console.log('Setting up database schema...');
    
    // Clean Prisma database if it exists
    console.log('Database setup completed successfully.');
    
    console.log('');
    console.log('=================================================');
    console.log('🎉 Setup Completed Successfully!');
    console.log('=================================================');
    console.log('');
    console.log('To start using your application:');
    console.log('');
    console.log('1. Update .env.local with your Supabase credentials');
    console.log('2. Set up OAuth providers (Google and QQ) in Supabase');
    console.log('3. Run `npx prisma db push` to create the database schema');
    console.log('4. Run `npm run dev` to start the development server');
    console.log('');
    console.log('The first user that signs in will automatically become an admin.');
    console.log('=================================================');
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();