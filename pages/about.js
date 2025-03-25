import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { BookOpenIcon, UsersIcon, AcademicCapIcon, GlobeAltIcon } from '@heroicons/react/outline';

export default function About({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getLayout = Component?.getLayout || ((page) => page);

  // 核心价值模块
  const coreValues = [
    { 
      title: "信息透明化", 
      content: "消除转学过程中的信息壁垒，提供真实可靠的院校数据与案例参考",
      icon: BookOpenIcon 
    },
    { 
      title: "社区共建", 
      content: "由成功转学生们共同维护，内容经多方验证",
      icon: UsersIcon 
    }
  ];

  // 快速导航模块
  const quickLinks = [
    { title: "论坛讨论区", url: "/forum" },
    { title: "院校数据库", url: "/forum/category/school-selection" },
    { title: "Wiki 知识库", url: "/wiki" },
    { title: "成功案例库", url: "/forum/category/offer" }
  ];

  return (
    <SessionProvider 
      session={pageProps?.session}
      refetchInterval={5 * 60}
      refetchOnWindowFocus={true}
    >
      <ThemeProvider attribute="class" defaultTheme="system">
        {getLayout(
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* 使命声明 */}
            <section className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                开放 · 共享 · 赋能
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                我们是由转学生发起的非盈利社区，致力于通过<span className="text-blue-600">去中心化</span>的协作模式，构建全球最大的<span className="text-purple-600">美本转学知识库</span>
              </p>
            </section>

            {/* 核心价值 */}
            <section className="py-16 bg-white dark:bg-gray-800">
              <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8">
                {coreValues.map((value, index) => (
                  <div key={index} className="p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <value.icon className="h-12 w-12 text-blue-600 mb-4" />
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{value.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{value.content}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 内容导航 */}
            <section className="py-16">
              <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                  <AcademicCapIcon className="h-8 w-8 inline-block mr-2 text-blue-600" />
                  快速访问核心资源
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickLinks.map((link, index) => (
                    <a 
                      key={index}
                      href={link.url}
                      className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all text-center"
                    >
                      <div className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600">
                        {link.title}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </section>

            {/* 社区宣言 */}
            <section className="bg-gray-100 dark:bg-gray-800 py-16">
              <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center">
                  <GlobeAltIcon className="h-16 w-16 text-green-600 mx-auto mb-6" />
                  <blockquote className="text-2xl italic text-gray-700 dark:text-gray-300 mb-8">
                    "教育资源的流动不应受限于信息壁垒，我们相信开放共享的力量"
                  </blockquote>
                  <div className="text-gray-600 dark:text-gray-400">
                    已累计服务来自全球<span className="font-bold text-blue-600">120+</span>所高校的转学生
                  </div>
                </div>
              </div>
            </section>

            {/* 参与共建 */}
            <section className="py-16">
              <div className="container mx-auto px-4 text-center">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    加入知识共享计划
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                    本网站遵循<a href="https://creativecommons.org/licenses/by-sa/4.0/" className="text-blue-600 hover:underline">CC BY-SA 4.0协议</a>，欢迎通过以下方式参与内容建设：
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium mb-2">贡献内容</div>
                      <p className="text-sm text-gray-500">编辑维基条目或提交案例</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium mb-2">参与讨论</div>
                      <p className="text-sm text-gray-500">加入我们的Discord社区</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium mb-2">资助我们</div>
                      <p className="text-sm text-gray-500">支持服务器运营费用</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </ThemeProvider>
    </SessionProvider>
  );
}