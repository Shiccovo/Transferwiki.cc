import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import MarkdownContent from '../ui/MarkdownContent';

export default function WikiEditor({ 
  initialData = {}, 
  onSubmit, 
  isNew = false,
  isLoading = false
}) {
  const { data: session } = useSession();
  const [previewMode, setPreviewMode] = useState(false);
  const [content, setContent] = useState(initialData.content || '');
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: initialData.title || '',
      description: initialData.description || '',
      content: initialData.content || '',
      summary: initialData.summary || ''
    }
  });
  
  const watchContent = watch('content');
  
  useEffect(() => {
    setContent(watchContent);
  }, [watchContent]);
  
  const handleFormSubmit = (data) => {
    if (onSubmit) {
      onSubmit(data);
    }
  };
  
  if (!session) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <p className="text-yellow-800 dark:text-yellow-200">
          您需要登录才能编辑页面
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* 编辑/预览切换 */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          className={`py-2 px-4 font-medium ${
            !previewMode 
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setPreviewMode(false)}
        >
          编辑
        </button>
        <button
          type="button"
          className={`py-2 px-4 font-medium ${
            previewMode 
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setPreviewMode(true)}
        >
          预览
        </button>
      </div>
      
      {previewMode ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {watch('title')}
          </h1>
          
          {watch('description') && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              {watch('description')}
            </p>
          )}
          
          <div className="prose dark:prose-invert max-w-none">
            <MarkdownContent content={content} />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* 标题输入 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              标题 *
            </label>
            <input
              type="text"
              id="title"
              {...register('title', { required: '标题不能为空' })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="页面标题"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>
          
          {/* 描述输入 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              描述（可选）
            </label>
            <input
              type="text"
              id="description"
              {...register('description')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="页面简短描述"
            />
          </div>
          
          {/* 内容输入 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              内容 *
            </label>
            <textarea
              id="content"
              {...register('content', { required: '内容不能为空' })}
              rows={20}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
              placeholder="使用Markdown格式编写内容"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.content.message}
              </p>
            )}
          </div>
          
          {/* 编辑摘要 */}
          {!isNew && (
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                编辑摘要（可选）
              </label>
              <input
                type="text"
                id="summary"
                {...register('summary')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="简述此次编辑的内容"
              />
            </div>
          )}
          
          {/* 提交按钮 */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? '保存中...' : isNew ? '创建页面' : '保存修改'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}