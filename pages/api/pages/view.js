import { prisma } from '../../../lib/prisma';

export default async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }
  
  const { slug } = req.query;
  
  if (!slug) {
    return res.status(400).json({ message: '缺少页面slug参数' });
  }
  
  try {
    // 更新页面的查看次数
    const updatedPage = await prisma.page.update({
      where: { slug },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });
    
    return res.status(200).json({
      success: true,
      viewCount: updatedPage.viewCount
    });
  } catch (error) {
    console.error('更新页面查看次数失败:', error);
    
    // 检查是否是页面不存在的错误
    if (error.code === 'P2025') {
      return res.status(404).json({ message: '页面不存在' });
    }
    
    return res.status(500).json({ message: '服务器错误' });
  }
}