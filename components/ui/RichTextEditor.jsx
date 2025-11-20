import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// 动态导入 React-Quill 以避免 SSR 问题
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md"></div>,
});

// 定义简化版工具栏，移除一些可能导致格式问题的选项
const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['blockquote', 'code-block'],
    ['clean']
  ],
};

const formats = [
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link',
  'blockquote', 'code-block'
];

export default function RichTextEditor({ 
  value = '', 
  onChange, 
  placeholder = "开始编写内容...",
  height = "400px"
}) {
  const [mounted, setMounted] = useState(false);
  const [innerValue, setInnerValue] = useState(value);
  
  // SSR 兼容性处理
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 当外部值变化时更新内部状态
  useEffect(() => {
    setInnerValue(value);
  }, [value]);
  
  // 处理编辑器内容变化
  const handleChange = (content) => {
    setInnerValue(content);
    if (onChange) {
      onChange(content);
    }
  };
  
  if (!mounted) {
    return <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md"></div>;
  }
  
  return (
    <div className="rich-editor-container">
      <ReactQuill
        theme="snow"
        value={innerValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ height }}
      />
      <style jsx global>{`
        .rich-editor-container .ql-container {
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          background: white;
        }
        
        .dark .rich-editor-container .ql-container {
          background: #1f2937;
          border-color: #374151;
          color: #e5e7eb;
        }
        
        .rich-editor-container .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          background: #f3f4f6;
        }
        
        .dark .rich-editor-container .ql-toolbar {
          background: #374151;
          border-color: #4b5563;
        }
        
        .dark .rich-editor-container .ql-picker,
        .dark .rich-editor-container .ql-picker-label,
        .dark .rich-editor-container .ql-picker-options {
          color: #e5e7eb;
        }
        
        .dark .rich-editor-container .ql-stroke {
          stroke: #e5e7eb;
        }
        
        .dark .rich-editor-container .ql-fill {
          fill: #e5e7eb;
        }
        
        .rich-editor-container .ql-editor {
          min-height: ${height};
          max-height: ${typeof height === 'string' ? `calc(${height} * 2)` : `${height * 2}px`};
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}