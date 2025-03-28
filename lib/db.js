import { supabase } from './supabase';

// 用户相关函数
export const userOperations = {
  // 按ID获取用户
  async getUserById(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // 按邮箱获取用户
  async getUserByEmail(email) {
    // 先从auth.users查询用户ID
    const { data: userData, error: userError } = await supabase
      .rpc('get_user_by_email', { email_input: email });
    
    if (userError) throw userError;
    if (!userData || userData.length === 0) return null;
    
    // 然后根据ID查询profiles表
    return await this.getUserById(userData[0].id);
  },
  
  // 更新用户档案
  async updateUser(id, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // 获取所有用户
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');
    
    if (error) throw error;
    return data;
  }
};

// Wiki页面相关函数
export const pageOperations = {
  // 获取所有页面
  async getAllPages(limit = 10) {
    const { data, error } = await supabase
      .from('Page')
      .select(`
        *,
        createdBy:profiles(*),
        lastEditedBy:profiles(*)
      `)
      .eq('isPublished', true)
      .order('updatedAt', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },
  
  // 按Slug获取页面
  async getPageBySlug(slug) {
    const { data, error } = await supabase
      .from('Page')
      .select(`
        *,
        createdBy:profiles(*),
        lastEditedBy:profiles(*)
      `)
      .eq('slug', slug)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
  
  // 创建新页面
  async createPage(pageData) {
    const { data, error } = await supabase
      .from('Page')
      .insert([pageData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // 更新页面
  async updatePage(id, updates) {
    const { data, error } = await supabase
      .from('Page')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // 增加页面浏览量
  async incrementPageView(slug) {
    const { error } = await supabase.rpc('increment_page_view', { 
      page_slug: slug 
    });
    
    if (error) throw error;
    return true;
  }
};

// 页面编辑相关函数
export const pageEditOperations = {
  // 创建页面编辑
  async createPageEdit(editData) {
    const { data, error } = await supabase
      .from('PageEdit')
      .insert([editData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // 获取指定ID的编辑
  async getEditById(id) {
    const { data, error } = await supabase
      .from('PageEdit')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
  
  // 获取页面的所有编辑
  async getPageEdits(pageId) {
    const { data, error } = await supabase
      .from('PageEdit')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('pageId', pageId)
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  // 获取待审核的编辑
  async getPendingEdits() {
    const { data, error } = await supabase
      .from('PageEdit')
      .select(`
        *,
        user:profiles(*),
        page:Page(*)
      `)
      .eq('status', 'PENDING')
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  // 更新编辑状态
  async updateEditStatus(id, status) {
    const { data, error } = await supabase
      .from('PageEdit')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// 论坛相关函数
export const forumOperations = {
  // 获取所有分类
  async getAllCategories() {
    const { data, error } = await supabase
      .from('ForumCategory')
      .select('*')
      .order('order');
    
    if (error) throw error;
    return data;
  },
  
  // 通过Slug获取分类
  async getCategoryBySlug(slug) {
    const { data, error } = await supabase
      .from('ForumCategory')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
  
  // 获取所有话题
  async getAllTopics(limit = 20) {
    const { data, error } = await supabase
      .from('ForumTopic')
      .select(`
        *,
        user:profiles(*),
        category:ForumCategory(*),
        replies:ForumReply(count)
      `)
      .order('isPinned', { ascending: false })
      .order('updatedAt', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },
  
  // 搜索话题
  async searchTopics(query, limit = 20) {
    const { data, error } = await supabase
      .from('ForumTopic')
      .select(`
        *,
        user:profiles(*),
        category:ForumCategory(*),
        replies:ForumReply(count)
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('updatedAt', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },
  
  // 获取分类下的话题
  async getTopicsByCategory(categoryId, limit = 20) {
    const { data, error } = await supabase
      .from('ForumTopic')
      .select(`
        *,
        user:profiles(*),
        category:ForumCategory(*),
        replies:ForumReply(count)
      `)
      .eq('categoryId', categoryId)
      .order('isPinned', { ascending: false })
      .order('updatedAt', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },
  
  // 获取热门话题
  async getPopularTopics(limit = 5) {
    const { data, error } = await supabase
      .from('ForumTopic')
      .select(`
        *,
        user:profiles(*),
        category:ForumCategory(*),
        replies:ForumReply(count)
      `)
      .order('viewCount', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },
  
  // 获取话题详情
  async getTopicById(id) {
    const { data, error } = await supabase
      .from('ForumTopic')
      .select(`
        *,
        user:profiles(*),
        category:ForumCategory(*),
        replies:ForumReply(
          *,
          user:profiles(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // 如果有回复，处理HTML内容
    if (data && data.replies && data.replies.length > 0) {
      // 将纯文本回复内容转换为HTML（如果内容不是HTML格式）
      data.replies = data.replies.map(reply => {
        // 检查内容是否已经是HTML格式（简单检查）
        const isHtml = reply.content && (
          reply.content.startsWith('<') || 
          reply.content.includes('</') || 
          reply.content.includes('/>') ||
          reply.content.includes('&lt;')
        );
        
        // 非HTML内容处理
        if (!isHtml && reply.content) {
          // 将换行转换为<br>，简单的文本到HTML转换
          reply.content = reply.content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>')
            .replace(/\r/g, '')
            .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        }
        
        return reply;
      });
    }
    
    return data;
  },
  
  // 创建新话题
  async createTopic(topicData) {
    const { data, error } = await supabase
      .from('ForumTopic')
      .insert([topicData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // 创建回复
  async createReply(replyData) {
    const { data, error } = await supabase
      .from('ForumReply')
      .insert([replyData])
      .select()
      .single();
    
    if (error) throw error;
    
    // 更新话题的最后回复时间
    await supabase
      .from('ForumTopic')
      .update({ lastReplyAt: new Date().toISOString() })
      .eq('id', replyData.topicId);
    
    return data;
  },
  
  // 增加话题浏览量
  async incrementTopicView(id) {
    const { error } = await supabase.rpc('increment_topic_view', { 
      topic_id: id 
    });
    
    if (error) throw error;
    return true;
  }
};

// 评论相关函数
export const commentOperations = {
  // 获取页面评论
  async getCommentsByPage(pagePath) {
    const { data, error } = await supabase
      .from('Comment')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('pagePath', pagePath)
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  // 创建评论
  async createComment(commentData) {
    const { data, error } = await supabase
      .from('Comment')
      .insert([commentData])
      .select(`
        *,
        user:profiles(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // 删除评论
  async deleteComment(id) {
    const { error } = await supabase
      .from('Comment')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};