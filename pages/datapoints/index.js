import { useState } from 'react';  
import Link from 'next/link';  
import { motion, AnimatePresence } from 'framer-motion';  
import dynamic from 'next/dynamic';  
import MainLayout from '../../components/layout/MainLayout';  

// 动态加载 iframe 组件  
const DynamicIframe = dynamic(  
  () => import('../../components/datapoints/DynamicIframe'),   
  {  
    ssr: false,  
    loading: () => <p>Loading iframe...</p>  
  }  
);  

export default function DataPointsPage() {  
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);  
  const seaTableUrl = 'https://cloud.seatable.io/dtable/external-links/b6e97881346e4724bb72/';  

  return (  
    <MainLayout> 
      {/* Main Content - 使用网格布局 */}  
      <div className="text-center mb-6">  
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">  
          Transferwiki 学生案例 
        </h1>  
      </div>  
      <div className="container mx-auto px-4">  
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">  
          {/* 使用指南 */}  
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">  
            <div   
              onClick={() => setIsGuideExpanded(!isGuideExpanded)}  
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition"  
            >  
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">  
                📖 请先阅读使用指南  
              </h2>  
              <span className="text-gray-600 dark:text-gray-400">  
                {isGuideExpanded ? '▲' : '▼'}  
              </span>  
            </div>  
            
            <AnimatePresence>  
              {isGuideExpanded && (  
                <motion.div  
                  initial={{ opacity: 0, height: 0 }}  
                  animate={{ opacity: 1, height: 'auto' }}  
                  exit={{ opacity: 0, height: 0 }}  
                  className="p-4 border-t border-gray-200 dark:border-gray-700"  
                >  
                  <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">  
                    <li>本数据库记录Transfer美本申请的所有数据均来自实际申请者提供的信息！</li>  
                    <li>该数据库共分为三个子表，分别为申请案例，申请者信息，签证。</li>  
                    <li>申请者信息：每条记录对应每位申请者的详细背景。</li>
                    <li>申请案例：每条记录链接到一个申请者和其申请的一个专业，并按学校和专业分组，使得用户可以方便地按照用户或项目浏览或检索。</li>
                    <li>签证：每条记录了申请者签证状况和面签相关因素</li>  
                    <li>  
                      该数据库遵循{' '}  
                      <a   
                        href="https://creativecommons.org/licenses/by-nc-sa/4.0/"   
                        target="_blank"   
                        rel="noopener noreferrer"   
                        className="text-blue-600 hover:underline"  
                      >  
                        CC BY-SA 4.0协议
                      </a>  
                      ，公益开源，期待用户根据{' '}  
                      <Link   
                        href="/datapoints/submit"   
                        className="text-blue-600 hover:underline"  
                      >  
                        学生案例提交
                      </Link>{' '}  
                      中的指引提交你的申请结果，帮助到更多的转学申请者！  
                    </li>  
                    <li>点击右上角插件，可以使用时间线、SQL查询等功能。</li>  
                  </ul>  
                </motion.div>  
              )}  
            </AnimatePresence>   
          </div>  

          {/* SeaTable 嵌入 */}  
          <div className="w-full h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">  
            <DynamicIframe   
              src={seaTableUrl}   
              title="SeaTable Embed"   
            />  
          </div>  

          {/* 操作按钮 */}  
          <div className="flex flex-col sm:flex-row gap-4 justify-center">  
            <Link href="/datapoints/submit">  
              <span className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-200 inline-block text-center">  
                📝 提交新学生案例 
              </span>  
            </Link>  
            <a   
              href={seaTableUrl}   
              target="_blank"   
              rel="noopener noreferrer"  
              className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200 inline-block text-center"  
            >  
              🔍 在 SeaTable 中浏览  
            </a>  
          </div>  
        </div>  
      </div>  
    </MainLayout>  
  );  
}  

export const revalidate = 60; // 每60秒重新生成页面  