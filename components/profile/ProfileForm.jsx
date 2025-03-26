import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function ProfileForm({ user }) {
  const supabase = useSupabaseClient();
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState(user.avatar_url || user.image);
  const [bio, setBio] = useState(user.bio || '');
  const [name, setName] = useState(user.full_name || user.name || '');
  const fileInputRef = useRef(null);
  const router = useRouter();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      console.log('Starting file upload...');
      
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          // 不设置 Content-Type，让浏览器自动处理 multipart/form-data
        },
      });

      console.log('Upload response status:', response.status);

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '上传失败');
      }

      console.log('Upload successful:', data);
      setAvatar(data.avatarUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert(error.message || '上传头像失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: name,
          bio: bio,
          avatar_url: avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('个人资料已更新');
      router.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('更新失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 头像上传区域 */}
        <div className="flex flex-col items-center">
          <div 
            className="relative w-32 h-32 cursor-pointer group"
            onClick={handleAvatarClick}
          >
            <div className="relative w-32 h-32 rounded-full overflow-hidden">
              <Image
                src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`}
                alt="Avatar"
                width={128}
                height={128}
                className="object-cover rounded-full"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-sm">更换头像</span>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* 用户名输入 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            用户名
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          />
        </div>

        {/* 个人简介输入 */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            个人简介
          </label>
          <textarea
            id="bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            placeholder="写点什么介绍一下自己..."
          />
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? '保存中...' : '保存修改'}
          </button>
        </div>
      </form>
    </motion.div>
  );
} 