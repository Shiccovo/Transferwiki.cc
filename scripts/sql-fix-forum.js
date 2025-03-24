// Direct SQL approach to fix forum tables
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Using Supabase URL:', supabaseUrl);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or API key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function executeSQL(query) {
  try {
    console.log('Executing SQL:', query);
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_string: query
    });

    if (error) {
      console.error('SQL execution error:', error);
      return false;
    }

    console.log('SQL executed successfully');
    return true;
  } catch (error) {
    console.error('Error executing SQL:', error);
    return false;
  }
}

async function main() {
  try {
    console.log('🔧 Running forum fix script...');

    // Add color column to ForumCategory
    await executeSQL(`
      ALTER TABLE IF EXISTS "ForumCategory" 
      ADD COLUMN IF NOT EXISTS "color" TEXT;
    `);

    // Add categories using direct SQL
    const categories = [
      {
        name: '求助',
        slug: 'help',
        color: '#EF4444',
        order: 1
      },
      {
        name: '经验分享',
        slug: 'experience',
        color: '#3B82F6',
        order: 2
      },
      {
        name: '选校',
        slug: 'school-selection',
        color: '#10B981',
        order: 3
      },
      {
        name: 'Offer',
        slug: 'offer',
        color: '#F59E0B',
        order: 4
      },
      {
        name: 'Others',
        slug: 'others',
        color: '#6B7280',
        order: 5
      }
    ];

    // Clear existing categories
    await executeSQL(`DELETE FROM "ForumCategory" WHERE TRUE;`);

    // Insert each category
    for (const cat of categories) {
      await executeSQL(`
        INSERT INTO "ForumCategory" (name, slug, color, "order")
        VALUES ('${cat.name}', '${cat.slug}', '${cat.color}', ${cat.order});
      `);
    }

    console.log('✅ Forum categories setup completed');
  } catch (error) {
    console.error('Script error:', error);
  }
}

main();