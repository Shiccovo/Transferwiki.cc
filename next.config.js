/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
    domains: [
      'pvwvxslykvgalmvhfivv.supabase.co', // 移除 https://
      'ui-avatars.com'
    ],
  },

  // 自定义域名时不需要basePath和assetPrefix
  basePath: '',
  assetPrefix: '',
  // 禁用 trailingSlash 以确保URL没有尾部斜杠
  trailingSlash: false,
  // 重写规则，处理旧页面重定向
  async rewrites() {
    return [
      // 将旧的学校页面重定向到新的wiki页面
      {
        source: '/schools/:slug',
        destination: '/wiki/schools/:slug',
      },
      // 将旧的静态页面重定向到新的wiki页面
      {
        source: '/admit',
        destination: '/wiki/admit',
      },
      {
        source: '/apply',
        destination: '/wiki/apply',
      },
      {
        source: '/faq',
        destination: '/wiki/faq',
      },
      {
        source: '/material',
        destination: '/wiki/material',
      },
      {
        source: '/think',
        destination: '/wiki/think',
      },
      // 其他可能需要的重定向规则
    ];
  },
};

module.exports = nextConfig;