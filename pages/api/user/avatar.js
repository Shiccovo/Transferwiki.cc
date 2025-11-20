import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  // 创建 Supabase 客户端
  const supabase = createPagesServerClient({ req, res });

  try {
    // 先检查会话
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError);
      return res.status(401).json({ error: '会话验证失败' });
    }

    if (!session?.user) {
      return res.status(401).json({ error: '未登录' });
    }

    // 确保存储桶存在
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket('avatars');
    if (bucketError && bucketError.message.includes('does not exist')) {
      const { error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      if (createError) {
        console.error('Error creating bucket:', createError);
        return res.status(500).json({ error: '存储初始化失败' });
      }
    }

    // 解析文件
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024,
    });

    const [_, files] = await form.parse(req);
    const file = files.avatar?.[0];

    if (!file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    // 读取文件
    const fileData = await fs.promises.readFile(file.filepath);

    // 生成唯一的文件名
    const timestamp = Date.now();
    const fileName = `${session.user.id}_${timestamp}.jpg`;

    // 上传到 Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, fileData, {
        contentType: file.mimetype,
        upsert: false // 不覆盖，而是创建新文件
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: '文件上传失败' });
    }

    // 获取公共URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // 更新用户资料
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return res.status(500).json({ error: '更新用户资料失败' });
    }

    // 清理临时文件
    await fs.promises.unlink(file.filepath).catch(console.error);

    return res.status(200).json({ avatarUrl: publicUrl });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: '处理失败' });
  }
} 