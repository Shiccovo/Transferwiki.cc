/**
 * Supabase Database Setup Script
 * 
 * This script initializes the tables needed for the TransferWiki application in Supabase.
 * Run this script once to set up your database schema.
 */

import { supabase } from '../lib/supabase.js';

async function setupDatabase() {
  try {
    console.log('🔧 Starting Supabase database setup...');

    // Create User table
    console.log('Creating User table...');
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'User',
      definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        image TEXT,
        role TEXT NOT NULL DEFAULT 'USER',
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      `
    });

    // Create Page table
    console.log('Creating Page table...');
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'Page',
      definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        description TEXT,
        category TEXT,
        tags TEXT,
        viewCount INTEGER NOT NULL DEFAULT 0,
        version INTEGER NOT NULL DEFAULT 1,
        isPublished BOOLEAN NOT NULL DEFAULT true,
        isDeleted BOOLEAN NOT NULL DEFAULT false,
        createdById UUID REFERENCES "User"(id),
        lastEditedById UUID REFERENCES "User"(id),
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      `
    });

    // Create Page_createdById_fkey relationship
    console.log('Creating Page_createdById_fkey relationship...');
    await supabase.rpc('create_foreign_key_if_not_exists', {
      table_name: 'Page',
      column_name: 'createdById',
      foreign_table: 'User',
      foreign_column: 'id',
      constraint_name: 'Page_createdById_fkey'
    });

    // Create Page_lastEditedById_fkey relationship
    console.log('Creating Page_lastEditedById_fkey relationship...');
    await supabase.rpc('create_foreign_key_if_not_exists', {
      table_name: 'Page',
      column_name: 'lastEditedById',
      foreign_table: 'User',
      foreign_column: 'id',
      constraint_name: 'Page_lastEditedById_fkey'
    });

    // Create PageEdit table
    console.log('Creating PageEdit table...');
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'PageEdit',
      definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        pageId UUID REFERENCES "Page"(id) NOT NULL,
        userId UUID REFERENCES "User"(id) NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        description TEXT,
        summary TEXT,
        version INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      `
    });

    // Create Comment table
    console.log('Creating Comment table...');
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'Comment',
      definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        userId UUID REFERENCES "User"(id) NOT NULL,
        pagePath TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      `
    });

    // Create ForumCategory table
    console.log('Creating ForumCategory table...');
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'ForumCategory',
      definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        order INTEGER NOT NULL DEFAULT 0,
        isActive BOOLEAN NOT NULL DEFAULT true,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      `
    });

    // Create ForumTopic table
    console.log('Creating ForumTopic table...');
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'ForumTopic',
      definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        userId UUID REFERENCES "User"(id) NOT NULL,
        categoryId UUID REFERENCES "ForumCategory"(id) NOT NULL,
        viewCount INTEGER NOT NULL DEFAULT 0,
        isPinned BOOLEAN NOT NULL DEFAULT false,
        isLocked BOOLEAN NOT NULL DEFAULT false,
        lastReplyAt TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      `
    });

    // Create ForumReply table
    console.log('Creating ForumReply table...');
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'ForumReply',
      definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        content TEXT NOT NULL,
        userId UUID REFERENCES "User"(id) NOT NULL,
        topicId UUID REFERENCES "ForumTopic"(id) NOT NULL,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
        updatedAt TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
      `
    });

    // Create functions for incrementing counts
    console.log('Creating increment_page_view function...');
    await supabase.rpc('create_function_if_not_exists', {
      function_name: 'increment_page_view',
      definition: `
        CREATE OR REPLACE FUNCTION increment_page_view(page_slug TEXT)
        RETURNS VOID AS $$
        BEGIN
          UPDATE "Page"
          SET "viewCount" = "viewCount" + 1
          WHERE slug = page_slug;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    console.log('Creating increment_topic_view function...');
    await supabase.rpc('create_function_if_not_exists', {
      function_name: 'increment_topic_view',
      definition: `
        CREATE OR REPLACE FUNCTION increment_topic_view(topic_id UUID)
        RETURNS VOID AS $$
        BEGIN
          UPDATE "ForumTopic"
          SET "viewCount" = "viewCount" + 1
          WHERE id = topic_id;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    console.log('✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

// Execute the setup
setupDatabase();