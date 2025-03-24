// Create forum categories using direct Supabase client operations
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or API key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Default forum categories with UUID v4s
const categories = [
  {
    id: '60b77cd6-1a25-4c1c-9e6f-d527277b0271',
    name: '求助',
    slug: 'help',
    color: '#EF4444', // 红色
    order: 1
  },
  {
    id: '04a16308-8ba9-4ac6-a56c-f64b515dcdfd',
    name: '经验分享',
    slug: 'experience',
    color: '#3B82F6', // 蓝色
    order: 2
  },
  {
    id: 'c22aa8b5-ddef-4a0d-b6a1-24e82fe16945',
    name: '选校',
    slug: 'school-selection',
    color: '#10B981', // 绿色
    order: 3
  },
  {
    id: 'bc6e5cf9-2c53-4c75-9b7d-f8a3c4e8943b',
    name: 'Offer',
    slug: 'offer',
    color: '#F59E0B', // 黄色
    order: 4
  },
  {
    id: 'a10d6948-1c0b-4b24-beda-999e2fc58d5d',
    name: 'Others',
    slug: 'others',
    color: '#6B7280', // 灰色
    order: 5
  }
];

async function main() {
  try {
    console.log('🔧 Setting up forum categories...');
    
    // First, check if we have categories
    const { data: existingData, error: selectError } = await supabase
      .from('ForumCategory')
      .select('count');
    
    if (selectError) {
      // This might mean the table doesn't exist - let's try creating it
      console.log('Error checking category count - the table might need to be created first');
      
      // Create the ForumCategory table if it doesn't exist
      // Note: Normally this would be done through migrations, but we're doing it here for simplicity
      const createTableSql = `
        CREATE TABLE IF NOT EXISTS "ForumCategory" (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          color TEXT,
          "order" INTEGER DEFAULT 0,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      console.log('Attempting to create ForumCategory table...');
      // Unfortunately we can't easily run this directly through the Supabase client,
      // so we'll just instruct the user to run this manually if needed
      console.log('Please run the following SQL in your Supabase SQL editor:');
      console.log(createTableSql);
    }
    
    // Clear and add categories
    console.log('Adding categories...');
    // First delete all existing categories - risky but simple for this demo
    const { error: deleteError } = await supabase
      .from('ForumCategory')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
    
    if (deleteError) {
      console.error('Error deleting existing categories:', deleteError);
    } else {
      console.log('Existing categories deleted (if any)');
    }
    
    // Insert new ones
    const { data, error } = await supabase
      .from('ForumCategory')
      .insert(categories)
      .select();
    
    if (error) {
      if (error.message.includes('column "color" of relation "ForumCategory" does not exist')) {
        console.error('Error: The color column is missing in the ForumCategory table.');
        console.log('Please run the following SQL in your Supabase SQL editor:');
        console.log('ALTER TABLE "ForumCategory" ADD COLUMN IF NOT EXISTS "color" TEXT;');
      } else {
        console.error('Error creating categories:', error);
      }
    } else {
      console.log('Categories created successfully:', data);
      console.log('✅ Forum setup complete');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

main();