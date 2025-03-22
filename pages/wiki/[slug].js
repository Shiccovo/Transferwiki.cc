import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import MainLayout from '../../components/layout/MainLayout';
import WikiLayout from '../../components/layout/WikiLayout';
import MarkdownContent from '../../components/ui/MarkdownContent';
import { prisma } from '../../lib/prisma';

export default function WikiPage({ page, error }) {
  const router = useRouter();
  const { slug } = router.query;
  
  // 处理加载状态
  if (router.isFallback) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }
  
  // 处理错误状态
  if (error || !page) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              页面不存在
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {error || '该页面不存在或已被删除。'}
            </p>
            <button
              onClick={() => router.push('/wiki/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              创建这个页面
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <WikiLayout
        title={page.title}
        description={page.description}
        slug={page.slug}
        lastEditedBy={page.lastEditedBy}
        lastEditedAt={page.updatedAt}
        version={page.version}
      >
        <MarkdownContent content={page.content} />
      </WikiLayout>
    </MainLayout>
  );
}

export async function getStaticPaths() {
  try {
    const pages = await prisma.page.findMany({
      where: { isPublished: true },
      select: { slug: true },
      take: 10, // 只预生成最新的10个页面
    });
    
    const paths = pages.map((page) => ({
      params: { slug: page.slug },
    }));
    
    return {
      paths,
      fallback: true, // 启用按需生成
    };
  } catch (error) {
    console.error('Error generating static paths:', error);
    return {
      paths: [],
      fallback: true,
    };
  }
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  
  try {
    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        lastEditedBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    if (!page || !page.isPublished) {
      return {
        props: {
          error: '页面不存在或未发布',
        },
        revalidate: 60,
      };
    }
    
    return {
      props: {
        page: JSON.parse(JSON.stringify(page)),
      },
      revalidate: 60, // 每分钟重新验证
    };
  } catch (error) {
    console.error('Error fetching page:', error);
    return {
      props: {
        error: '获取页面失败',
      },
      revalidate: 60,
    };
  }
}