import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { marked } from 'marked';

export default async function handler(req, res) {
  const { id } = req.query;
  
  // 创建Supabase客户端
  const supabase = createPagesServerClient({ req, res });

  // 获取当前会话
  const { data: { session } } = await supabase.auth.getSession();
  
  // 检查用户是否已登录
  if (!session) {
    return res.status(401).json({ error: '必须登录才能访问此资源' });
  }
  
  // 获取用户资料以检查角色
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
    
  if (!profile || profile.role !== 'ADMIN') {
    return res.status(403).json({ error: '您没有权限访问此资源' });
  }

  if (req.method === 'GET') {
    try {
      // 获取编辑
      const { data: edit, error: editError } = await supabase
        .from('page_edits')
        .select('*, user:profiles(*)')
        .eq('id', id)
        .single();

      if (editError || !edit) {
        return res.status(404).json({ error: '未找到编辑' });
      }

      // 用户名显示
      const userName = edit.user?.email?.split('@')[0] || '未知用户';

      // 将Markdown转换为HTML
      const renderedContent = marked(edit.content);

      // 创建HTML预览
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>编辑预览 - ${edit.pagePath}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            :root {
              --bg-color: #ffffff;
              --text-color: #333333;
              --header-bg: #f5f5f5;
              --border-color: #dddddd;
              --pre-bg: #f5f5f5;
            }
            
            @media (prefers-color-scheme: dark) {
              :root {
                --bg-color: #1a1a1a;
                --text-color: #f0f0f0;
                --header-bg: #2a2a2a;
                --border-color: #444444;
                --pre-bg: #2a2a2a;
              }
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: var(--text-color);
              background-color: var(--bg-color);
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .preview-header {
              background-color: var(--header-bg);
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 5px;
            }
            .content {
              border: 1px solid var(--border-color);
              padding: 20px;
              border-radius: 5px;
            }
            pre {
              background-color: var(--pre-bg);
              padding: 10px;
              border-radius: 5px;
              overflow-x: auto;
            }
            code {
              font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 15px 0;
            }
            th, td {
              border: 1px solid var(--border-color);
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: var(--header-bg);
            }
            img {
              max-width: 100%;
              height: auto;
            }
            
            /* Markdown样式 */
            .markdown-body h1 { font-size: 2em; margin-top: 1em; }
            .markdown-body h2 { font-size: 1.5em; margin-top: 1em; }
            .markdown-body h3 { font-size: 1.3em; }
            .markdown-body h4 { font-size: 1.1em; }
            .markdown-body h5 { font-size: 1em; }
            .markdown-body h6 { font-size: 0.9em; }
            .markdown-body blockquote {
              border-left: 4px solid var(--border-color);
              padding-left: 1em;
              margin-left: 0;
              color: #666;
            }
            .markdown-body a {
              color: #0366d6;
              text-decoration: none;
            }
            .markdown-body a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="preview-header">
            <h1>编辑预览</h1>
            <p><strong>页面路径:</strong> ${edit.pagePath}</p>
            <p><strong>提交者:</strong> ${userName}</p>
            <p><strong>提交时间:</strong> ${new Date(edit.created_at).toLocaleString('zh-CN')}</p>
          </div>
          
          <h2>Markdown 源代码:</h2>
          <pre><code>${edit.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
          
          <h2>渲染预览:</h2>
          <div class="content markdown-body">
            ${renderedContent}
          </div>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    } catch (error) {
      console.error('生成预览错误:', error);
      return res.status(500).json({ error: '生成预览失败' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}