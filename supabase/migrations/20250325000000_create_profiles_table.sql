-- 创建 profiles 表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  email TEXT,
  role TEXT DEFAULT 'USER',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 为profiles表添加RLS策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略让用户只能读取和更新自己的信息
CREATE POLICY "用户可以读取自己的完整信息" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的信息" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "所有用户可以读取其他用户的基本信息" ON profiles
  FOR SELECT USING (true);

-- 创建函数，在新用户注册时自动创建profiles记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 为现有用户创建 profiles 记录
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING; 