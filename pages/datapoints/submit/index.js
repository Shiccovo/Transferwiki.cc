import { useState } from 'react';  
import Link from 'next/link';  
import MainLayout from '../../../components/layout/MainLayout';  

export default function DataPointsPage() {  
  return (  
    <MainLayout>   
      <div className="text-center mb-6">  
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">  
          学生案例提交  
        </h1>  
      </div>  
      <div className="container mx-auto px-4">  
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">  
          {/* 收集表按钮组 */}  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">  
            <a   
              href="https://cloud.seatable.io/dtable/forms/c890b794-5d8f-4748-a62a-5cdfa661fc77/"   
              target="_blank"   
              rel="noopener noreferrer"  
              className="bg-blue-500 text-white px-6 py-4 rounded-lg shadow-md hover:bg-blue-600 transition flex items-center justify-center space-x-2"  
            >  
              <span>📋</span>  
              <span>申请案例收集表</span>  
            </a>  
            <a   
              href="https://cloud.seatable.io/dtable/forms/7b38e332-561e-4f83-821c-e8dea283028d/"   
              target="_blank"   
              rel="noopener noreferrer"  
              className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-md hover:bg-green-600 transition flex items-center justify-center space-x-2"  
            >  
              <span>👥</span>  
              <span>申请者信息收集表</span>  
            </a>  
            <a   
              href="https://cloud.seatable.io/dtable/forms/072d7cbe-dedb-47a1-8d5f-c6ec1f0d7cdd/"   
              target="_blank"   
              rel="noopener noreferrer"  
              className="bg-purple-500 text-white px-6 py-4 rounded-lg shadow-md hover:bg-purple-600 transition flex items-center justify-center space-x-2"  
            >  
              <span>🛂</span>  
              <span>签证收集表</span>  
            </a>  
          </div>  

          {/* 访问数据库按钮 */}  
          <div className="text-center mt-6">  
            <a   
              href="https://cloud.seatable.io/dtable/external-links/b6e97881346e4724bb72/"   
              target="_blank"   
              rel="noopener noreferrer"  
              className="bg-yellow-500 text-white px-8 py-4 rounded-lg shadow-md hover:bg-yellow-600 transition inline-flex items-center space-x-2"  
            >  
              <span>🔍</span>  
              <span>访问申请案例数据库</span>  
            </a>  
          </div>  

          {/* 提交指南 */}  
          <div className="mt-8">  
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">📖 提交指南</h2>  
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">  
              <ol className="space-y-4 text-gray-700 dark:text-gray-300 list-decimal list-inside">  
                <li>  
                  <strong>学生案例数据库特点</strong>  
                  <p className="ml-6 mt-1">这是一个只读的数据表，包含申请案例、申请者信息、签证三个子表，可以导出本地查看</p>  
                </li>  
                <li>  
                  <strong>申请者信息收集表提交</strong>  
                  <p className="ml-6 mt-1">首先在申请者信息收集表中提交个人信息</p>  
                </li>  
                <li>  
                  <strong>申请案例收集表提交</strong>  
                  <p className="ml-6 mt-1">在申请案例收集表中提交录取申请案例，可通过申请者字段链接到个人账户，并关联个人信息。可提交各个选校录取结果</p>  
                </li>  
                <li>  
                  <strong>签证收集表提交（可选）</strong>  
                  <p className="ml-6 mt-1">可在签证收集表中分享你的面签相关信息</p>  
                </li>  
              </ol>  
            </div>  
          </div>  

          {/* FAQ*/}  
          <div className="mt-8">  
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">❓ FAQ</h2>  
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">  
              <ul className="space-y-4 text-gray-700 dark:text-gray-300 list-disc list-inside">  
                <li>  
                    <strong>如何保证我提交的案例会开源而非被owner用于收费访问获利？</strong>  
                    <p className="ml-6 mt-1">  
                        我们的{' '}  
                        <Link   
                            href="/datapoints/submit"   
                            className="text-blue-600 hover:underline"  
                        >  
                        学生案例数据库
                        </Link>{' '}  
                        是完全开源的，任何用户均可点击右上角导出全部数据，这保证所有收集的信息不会被私人垄断。同时本网站遵循{' '}  
                        <a   
                        href="https://creativecommons.org/licenses/by-sa/4.0/"   
                        target="_blank"   
                        rel="noopener noreferrer"  
                        className="text-blue-600 hover:underline"  
                        >  
                        CC BY-SA 4.0协议  
                        </a>  
                        ，公益开源。
                    </p>  
                </li>  
                <li>  
                  <strong>每条记录太长了，左右滑动很麻烦</strong>  
                  <p className="ml-6 mt-1">在该行最左侧序号处悬浮，可以找到缩放按钮，点击即可在标签页中浏览该条记录</p>  
                </li>  
                <li>  
                  <strong>选校选项中没有包含我的选校</strong>  
                  <p className="ml-6 mt-1">请打开在求助版面发帖提供你的未在选项中的选校，管理员会尽快帮你处理。</p>  
                </li>  
              </ul>  
            </div>  
          </div>  
        </div>  
      </div>  
    </MainLayout>  
  );  
}  

export const revalidate = 60; // 每60秒重新生成页面  