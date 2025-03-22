import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma";
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import { authOptions } from "../../../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  // Check if user is authenticated and is an admin
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to access this resource' });
  }

  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'You do not have permission to access this resource' });
  }

  if (req.method === 'GET') {
    try {
      // Get the edit
      const edit = await prisma.pageEdit.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!edit) {
        return res.status(404).json({ error: 'Edit not found' });
      }

      // Create HTML preview
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>编辑预览 - ${edit.pagePath}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .preview-header {
              background-color: #f5f5f5;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 5px;
            }
            .content {
              border: 1px solid #ddd;
              padding: 20px;
              border-radius: 5px;
            }
            pre {
              background-color: #f5f5f5;
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
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="preview-header">
            <h1>编辑预览</h1>
            <p><strong>页面路径:</strong> ${edit.pagePath}</p>
            <p><strong>提交者:</strong> ${edit.user.name}</p>
            <p><strong>提交时间:</strong> ${new Date(edit.createdAt).toLocaleString('zh-CN')}</p>
          </div>
          
          <h2>Markdown 内容:</h2>
          <pre><code>${edit.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
          
          <h2>渲染预览:</h2>
          <div class="content">
            ${edit.content}
          </div>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    } catch (error) {
      console.error('Error generating preview:', error);
      return res.status(500).json({ error: 'Failed to generate preview' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}