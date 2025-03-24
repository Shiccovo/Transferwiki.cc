/**
 * Setup Default Forum Categories
 * 
 * This script creates predefined forum categories for TransferWiki.
 */

import { supabase } from '../lib/supabase.js';

async function setupCategories() {
  try {
    console.log('🔧 Setting up default forum categories...');
    
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
    
    // First, check if there are any existing categories
    const { data: existingCategories, error: checkError } = await supabase
      .from('ForumCategory')
      .select('id');
      
    if (checkError) {
      console.error('Error checking existing categories:', checkError);
      return;
    }
    
    if (existingCategories && existingCategories.length > 0) {
      console.log(`Found ${existingCategories.length} existing categories. No need to create defaults.`);
      return;
    }
    
    // Create the predefined categories
    const { data, error } = await supabase
      .from('ForumCategory')
      .insert(categories)
      .select();
      
    if (error) {
      console.error('Error creating default categories:', error);
    } else {
      console.log(`✅ Successfully created ${data.length} default forum categories:`);
      data.forEach(category => {
        console.log(`- ${category.name} (${category.slug}): ${category.color}, ID: ${category.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Execute the setup
setupCategories();