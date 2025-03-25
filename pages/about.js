import MainLayout from '../components/layout/MainLayout';
import { motion } from 'framer-motion';
// import { FaBookOpen, FaUsers, FaGraduationCap, FaGlobe } from 'react-icons/fa';

export default function About() {
  const coreValues = [
    { 
      title: "信息透明化", 
      content: "消除转学过程中的信息壁垒，提供真实可靠的院校数据与案例参考",
      // icon: FaBookOpen 
    },
    { 
      title: "社区共建", 
      content: "由成功转学生们共同维护，内容经多方验证",
      // icon: FaUsers 
    }
  ];

  const quickLinks = [
    { title: "论坛讨论区", url: "/forum" },
    { title: "院校数据库", url: "/forum/category/school-selection" },
    { title: "Wiki 知识库", url: "/wiki" },
    { title: "成功案例库", url: "/forum/category/offer" }
  ];

  return (
    <MainLayout>
      {/* 使命声明 */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Transferwiki.cc
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          我们是由转学生发起的公益社区，致力于传播美本转学相关的免费知识。
        </p>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          我们的前身是 www.transferwiki.com, 由于之前的项目开发者都已停止维护数年，很多内容都已经过时，我们决定重新开始一个项目。
        </p>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          我们目前的唯一官方QQ群：955388093
        </p>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          加入我们的Discord社区(备用): <a href="https://discord.gg/6nYPs2xnjP" className="text-blue-600 hover:underline">https://discord.gg/6nYPs2xnjP</a>
        </p>
        
      </section>

      {/* 核心价值 */}
      {/* <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8">
          {coreValues.map((value, index) => (
            <div key={index} className="p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{value.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{value.content}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* 内容导航 */}
      {/* <section className="py-16"> */}
        {/* <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
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
      </section> */}

      {/* 社区宣言 */}
      {/* <section className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <blockquote className="text-2xl italic text-gray-700 dark:text-gray-300 mb-8">
              "教育资源的流动不应受限于信息壁垒，我们相信开放共享的力量"
            </blockquote>
            <div className="text-gray-600 dark:text-gray-400">
              已累计服务来自全球<span className="font-bold text-blue-600">120+</span>所高校的转学生
            </div>
          </div>
        </div>
      </section> */}

      {/* 参与共建 */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              加入知识共享计划
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto text-lg">
              本网站遵循<a href="https://creativecommons.org/licenses/by-sa/4.0/" className="text-blue-600 hover:underline">CC BY-SA 4.0协议</a>，欢迎通过以下方式参与内容建设：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                <div className="font-medium mb-3 text-xl">贡献内容</div>
                <p className="text-sm text-gray-500 leading-relaxed">编辑维基条目或提交录取案例</p>
              </div>
              <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                <div className="font-medium mb-3 text-xl">参与讨论</div>
                <p className="text-sm text-gray-500 leading-relaxed">加入我们的QQ群</p>
              </div>
              <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                <div className="font-medium mb-3 text-xl">宣传本站</div>
                <p className="text-sm text-gray-500 leading-relaxed">发送给你需要的朋友</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}