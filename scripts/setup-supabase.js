const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

// 获取环境变量 - 支持两种可能的环境变量名称
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('错误: 缺少Supabase环境变量。请在.env文件中设置NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY。');
  process.exit(1);
}

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDatabase() {
  console.log('开始设置Supabase数据库...');

  try {
    // 创建用户表
    console.log('创建User表...');
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'User',
      table_definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT,
        email TEXT UNIQUE,
        emailVerified TIMESTAMP,
        image TEXT,
        password TEXT,
        role TEXT DEFAULT 'USER',
        bio TEXT,
        location TEXT,
        website TEXT,
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW()
      `
    });

    // 创建Session表
    console.log('创建Session表...');
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'Session',
      table_definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        sessionToken TEXT UNIQUE,
        userId UUID REFERENCES User(id) ON DELETE CASCADE,
        expires TIMESTAMP
      `
    });

    // 创建Account表
    console.log('创建Account表...');
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'Account',
      table_definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        userId UUID REFERENCES User(id) ON DELETE CASCADE,
        type TEXT,
        provider TEXT,
        providerAccountId TEXT,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        UNIQUE(provider, providerAccountId)
      `
    });

    // 创建VerificationToken表
    console.log('创建VerificationToken表...');
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'VerificationToken',
      table_definition: `
        identifier TEXT,
        token TEXT UNIQUE,
        expires TIMESTAMP,
        UNIQUE(identifier, token)
      `
    });

    // 创建其他表
    // 创建Page表
    console.log('创建Page表...');
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'Page',
      table_definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        slug TEXT UNIQUE,
        title TEXT,
        content TEXT,
        description TEXT,
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW(),
        createdById UUID REFERENCES User(id),
        lastEditedById UUID REFERENCES User(id),
        version INTEGER DEFAULT 1,
        isPublished BOOLEAN DEFAULT TRUE,
        viewCount INTEGER DEFAULT 0,
        category TEXT,
        tags TEXT
      `
    });

    // 创建PageEdit表
    console.log('创建PageEdit表...');
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'PageEdit',
      table_definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        pageId UUID REFERENCES Page(id) ON DELETE CASCADE,
        content TEXT,
        title TEXT,
        description TEXT,
        createdAt TIMESTAMP DEFAULT NOW(),
        userId UUID REFERENCES User(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'PENDING',
        version INTEGER,
        summary TEXT,
        diff TEXT
      `
    });

    // 创建Comment表
    console.log('创建Comment表...');
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'Comment',
      table_definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        content TEXT,
        pagePath TEXT,
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW(),
        userId UUID REFERENCES User(id) ON DELETE CASCADE
      `
    });

    // 创建ForumCategory表
    console.log('创建ForumCategory表...');
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'ForumCategory',
      table_definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT,
        description TEXT,
        slug TEXT UNIQUE,
        order INTEGER DEFAULT 0,
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW(),
        isActive BOOLEAN DEFAULT TRUE
      `
    });

    // 创建ForumTopic表
    console.log('创建ForumTopic表...');
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'ForumTopic',
      table_definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT,
        content TEXT,
        categoryId UUID REFERENCES ForumCategory(id) ON DELETE CASCADE,
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW(),
        userId UUID REFERENCES User(id) ON DELETE CASCADE,
        viewCount INTEGER DEFAULT 0,
        isPinned BOOLEAN DEFAULT FALSE,
        isLocked BOOLEAN DEFAULT FALSE,
        lastReplyAt TIMESTAMP
      `
    });

    // 创建ForumReply表
    console.log('创建ForumReply表...');
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'ForumReply',
      table_definition: `
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        content TEXT,
        topicId UUID REFERENCES ForumTopic(id) ON DELETE CASCADE,
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW(),
        userId UUID REFERENCES User(id) ON DELETE CASCADE,
        isEdited BOOLEAN DEFAULT FALSE
      `
    });

    // 创建初始管理员
    console.log('创建初始管理员用户...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    // 检查是否已存在管理员
    const { data: existingAdmin } = await supabase
      .from('User')
      .select('*')
      .eq('email', 'admin@example.com')
      .single();
    
    if (!existingAdmin) {
      const { data: admin, error } = await supabase
        .from('User')
        .insert([
          {
            name: '管理员',
            email: 'admin@example.com',
            password: adminPassword,
            role: 'ADMIN'
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('创建管理员失败:', error);
      } else {
        console.log('管理员用户已创建:', admin.name);
      }
    } else {
      console.log('管理员用户已存在，跳过创建');
    }

    // 创建函数来增加页面浏览量
    console.log('创建页面浏览量增加函数...');
    await supabase.rpc('create_increment_page_view_function', {
      function_definition: `
        CREATE OR REPLACE FUNCTION increment_page_view(page_slug TEXT) 
        RETURNS VOID AS $$
        BEGIN
          UPDATE "Page" SET "viewCount" = "viewCount" + 1 WHERE slug = page_slug;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    // 创建函数来增加话题浏览量
    console.log('创建话题浏览量增加函数...');
    await supabase.rpc('create_increment_topic_view_function', {
      function_definition: `
        CREATE OR REPLACE FUNCTION increment_topic_view(topic_id UUID) 
        RETURNS VOID AS $$
        BEGIN
          UPDATE "ForumTopic" SET "viewCount" = "viewCount" + 1 WHERE id = topic_id;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    console.log('数据库设置完成！');
  } catch (error) {
    console.error('数据库设置失败:', error);
    process.exit(1);
  }
}

setupDatabase();