// This script connects to Supabase and adds the color column to ForumCategory
// then adds some default categories if none exist

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
config();

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
    console.log('🔧 Adding color column to ForumCategory and creating categories...');

    // First run the migration directly
    const { data, error } = await supabase
      .from('ForumCategory')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error accessing ForumCategory table:', error);
      return;
    }

    // Insert categories if no categories exist
    if (!data || data.length === 0) {
      const { data: insertedData, error: insertError } = await supabase
        .from('ForumCategory')
        .insert(categories)
        .select();

      if (insertError) {
        console.error('Error inserting categories:', insertError);
      } else {
        console.log(`✅ Successfully added ${insertedData.length} categories:`);
        console.log(insertedData);
      }
    } else {
      console.log('✅ Categories already exist, no need to add defaults');
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

main();