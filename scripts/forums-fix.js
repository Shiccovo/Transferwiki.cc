// CommonJS version of the forum setup script

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or API key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Default forum categories
const categories = [
  {
    name: '求助',
    slug: 'help',
    color: '#EF4444', // 红色
    order: 1
  },
  {
    name: '经验分享',
    slug: 'experience',
    color: '#3B82F6', // 蓝色
    order: 2
  },
  {
    name: '选校',
    slug: 'school-selection',
    color: '#10B981', // 绿色
    order: 3
  },
  {
    name: 'Offer',
    slug: 'offer',
    color: '#F59E0B', // 黄色
    order: 4
  },
  {
    name: 'Others',
    slug: 'others',
    color: '#6B7280', // 灰色
    order: 5
  }
];

async function main() {
  try {
    console.log('🔧 Adding categories to ForumCategory table...');

    // First check if the table exists
    const { data: existingCategories, error: checkError } = await supabase
      .from('ForumCategory')
      .select('*');

    if (checkError) {
      console.error('Error checking categories:', checkError);
      return;
    }

    // Insert categories if none exist or if the existing ones need to be updated
    const { data: insertedData, error: insertError } = await supabase
      .from('ForumCategory')
      .upsert(categories.map((cat, index) => ({
        ...cat,
        id: existingCategories && existingCategories[index] ? existingCategories[index].id : undefined
      })))
      .select();

    if (insertError) {
      console.error('Error inserting/updating categories:', insertError);
    } else {
      console.log(`✅ Successfully added/updated ${insertedData.length} categories:`);
      insertedData.forEach(cat => console.log(`- ${cat.name} (${cat.slug}): ${cat.color}, ID: ${cat.id}`));
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

main();