// A simplified script to add categories without using color field
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

// Default forum categories with UUID v4s - without color field
const categories = [
  {
    id: '60b77cd6-1a25-4c1c-9e6f-d527277b0271',
    name: '求助',
    slug: 'help',
    order: 1
  },
  {
    id: '04a16308-8ba9-4ac6-a56c-f64b515dcdfd',
    name: '经验分享',
    slug: 'experience',
    order: 2
  },
  {
    id: 'c22aa8b5-ddef-4a0d-b6a1-24e82fe16945',
    name: '选校',
    slug: 'school-selection',
    order: 3
  },
  {
    id: 'bc6e5cf9-2c53-4c75-9b7d-f8a3c4e8943b',
    name: 'Offer',
    slug: 'offer',
    order: 4
  },
  {
    id: 'a10d6948-1c0b-4b24-beda-999e2fc58d5d',
    name: 'Others',
    slug: 'others',
    order: 5
  }
];

async function main() {
  try {
    console.log('🔧 Setting up basic forum categories...');
    
    // Clear and add categories
    console.log('Adding categories...');
    
    // First delete all existing categories
    const { error: deleteError } = await supabase
      .from('ForumCategory')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
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
      console.error('Error creating categories:', error);
    } else {
      console.log('Categories created successfully:');
      data.forEach(cat => console.log(`- ${cat.name} (${cat.slug}), ID: ${cat.id}`));
      console.log('✅ Basic forum setup complete');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

main();