-- 创建 avatars 存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 删除旧的策略（如果存在）
DROP POLICY IF EXISTS "允许认证用户上传头像" ON storage.objects;
DROP POLICY IF EXISTS "允许公开访问头像" ON storage.objects;
DROP POLICY IF EXISTS "允许用户更新自己的头像" ON storage.objects;
DROP POLICY IF EXISTS "允许用户删除自己的头像" ON storage.objects;
DROP POLICY IF EXISTS "允许所有人查看头像" ON storage.objects;

-- 创建上传策略
CREATE POLICY "允许认证用户上传头像"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
);

-- 创建更新策略
CREATE POLICY "允许用户更新自己的头像"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 创建删除策略
CREATE POLICY "允许用户删除自己的头像"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 创建查看策略
CREATE POLICY "允许所有人查看头像"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars'); 