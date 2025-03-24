/**
 * Add predefined forum categories to the database
 * 
 * This script uses direct SQL to ensure the color column exists and populates
 * the ForumCategory table with default values.
 */

import { supabase } from '../lib/supabase.js';

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

// First, add the color column with direct SQL
async function setupCategories() {
  try {
    console.log('🔧 Setting up forum categories...');
    
    // 1. First, execute SQL to add the color column if it doesn't exist
    const { data: addColumnResult, error: columnError } = await supabase.rpc(
      'add_color_column_to_forum_category',
      {}
    );
    
    if (columnError) {
      // If the RPC doesn't exist, we'll try to execute the SQL directly
      console.log('RPC function not found, trying direct SQL...');
      
      // Execute SQL directly to create the color column
      const { error: sqlError } = await supabase.from('_sqlexecution').select(`
        sql_result:exec_sql('ALTER TABLE "ForumCategory" ADD COLUMN IF NOT EXISTS "color" TEXT;')
      `);
      
      if (sqlError) {
        console.error('Error adding color column:', sqlError);
        console.log('Continuing anyway, the column might already exist...');
      } else {
        console.log('✅ Color column added or already exists');
      }
    } else {
      console.log('✅ Color column added or already exists');
    }
    
    // 2. Check if we already have categories
    const { data: existingCategories, error: checkError } = await supabase
      .from('ForumCategory')
      .select('id');
    
    if (checkError) {
      console.error('Error checking existing categories:', checkError);
      return;
    }
    
    if (existingCategories && existingCategories.length > 0) {
      console.log(`Found ${existingCategories.length} existing categories. Skipping creation.`);
      return;
    }
    
    // 3. Insert the categories
    const { data, error } = await supabase
      .from('ForumCategory')
      .insert(categories)
      .select();
    
    if (error) {
      console.error('Error creating categories:', error);
    } else {
      console.log(`✅ Successfully created ${data.length} forum categories:`);
      data.forEach(category => {
        console.log(`- ${category.name} (${category.slug}): ${category.color}, ID: ${category.id}`);
      });
    }
    
  } catch (error) {
    console.error('Error setting up categories:', error);
  }
}

// Execute the setup
setupCategories();