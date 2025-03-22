const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据...');
  
  // 创建管理员用户
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: '管理员',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  
  console.log('管理员用户已创建:', admin.name);
  
  // 创建论坛分类
  const categories = [
    {
      name: '通用讨论',
      description: '关于转学的一般性讨论',
      slug: 'general',
      order: 1,
    },
    {
      name: '申请经验',
      description: '分享你的申请经验和技巧',
      slug: 'application',
      order: 2,
    },
    {
      name: '学校讨论',
      description: '特定学校的讨论和信息分享',
      slug: 'schools',
      order: 3,
    },
    {
      name: '材料准备',
      description: '关于转学材料准备的讨论',
      slug: 'materials',
      order: 4,
    },
    {
      name: '网站反馈',
      description: '关于网站功能和内容的反馈',
      slug: 'feedback',
      order: 5,
    },
  ];
  
  for (const category of categories) {
    await prisma.forumCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  
  console.log('论坛分类已创建');
  
  // 创建一些示例Wiki页面
  const wikiPages = [
    {
      title: '转学指南',
      slug: 'transfer-guide',
      description: '全面的转学申请指南',
      content: `# 转学指南

## 概述

转学是一个复杂的过程，需要仔细规划和准备。本指南将帮助你了解转学的基本步骤和注意事项。

## 申请时间线

1. **研究学校（提前6-12个月）**
   - 确定目标学校
   - 了解申请要求和截止日期

2. **准备申请材料（提前4-6个月）**
   - 准备成绩单
   - 准备推荐信
   - 撰写个人陈述

3. **提交申请（按照截止日期）**

4. **等待录取结果（1-3个月）**

5. **做出决定并完成转学手续**

## 常见问题

### 1. 什么时候开始申请最合适？

通常建议在计划转学的前一年开始研究和准备。

### 2. 如何选择合适的学校？

考虑以下因素：
- 学术声誉
- 专业强度
- 地理位置
- 学费和经济援助
- 校园文化

### 3. 转学成功的关键因素是什么？

- 良好的学术表现
- 有说服力的转学理由
- 完整且准时的申请材料
- 与目标学校的匹配度`,
      category: '申请指南',
      tags: '指南,申请,转学',
    },
    {
      title: '文书写作技巧',
      slug: 'essay-writing-tips',
      description: '转学申请文书写作的关键技巧',
      content: `# 转学申请文书写作技巧

## 什么是好的转学文书？

一篇好的转学文书应该清晰地解释你为什么要转学，以及为什么目标学校是你的理想选择。它应该是个人化的、具体的，并且展示你的思考过程。

## 文书结构

### 1. 开头

开头应该简洁有力，直接切入主题。可以从一个简短的故事或思考开始，但要确保它与你的转学理由相关。

### 2. 为什么要离开当前学校

解释你为什么要离开当前学校，但要注意语气：
- 避免抱怨或负面评价
- 专注于你的成长需求
- 强调你对新机会的追求

### 3. 为什么选择目标学校

详细说明为什么目标学校适合你：
- 特定的学术项目或课程
- 研究机会
- 校园文化和环境
- 课外活动或实习机会

### 4. 你能带来什么

解释你将如何对目标学校做出贡献：
- 你的独特经验或视角
- 特殊技能或才能
- 校园参与计划

### 5. 结尾

总结你的主要观点，重申你转学的决心和理由。

## 写作技巧

1. **具体而非笼统**：用具体例子和细节支持你的观点。

2. **真实性**：保持真实，表达你真正的想法和经历。

3. **突出成长**：展示你的成长和学习经历。

4. **精简**：遵守字数限制，删除冗余内容。

5. **多次修改**：写完初稿后，多次修改和完善。

6. **寻求反馈**：请他人阅读并提供反馈。

## 常见错误

- 过于笼统
- 重复简历内容
- 语法和拼写错误
- 负面评价当前学校
- 缺乏具体的学校研究

记住，一篇好的文书不仅展示你的写作能力，更重要的是展示你的思考能力和对自己教育道路的规划。`,
      category: '材料准备',
      tags: '文书,写作,技巧',
    },
  ];
  
  for (const page of wikiPages) {
    const existingPage = await prisma.page.findUnique({
      where: { slug: page.slug },
    });
    
    if (!existingPage) {
      const newPage = await prisma.page.create({
        data: {
          title: page.title,
          slug: page.slug,
          description: page.description,
          content: page.content,
          category: page.category,
          tags: page.tags,
          createdById: admin.id,
          lastEditedById: admin.id,
        },
      });
      
      await prisma.pageEdit.create({
        data: {
          pageId: newPage.id,
          content: page.content,
          title: page.title,
          description: page.description,
          userId: admin.id,
          status: 'APPROVED',
          version: 1,
          summary: '初始创建',
        },
      });
    }
  }
  
  console.log('Wiki页面已创建');
  
  // 创建一些示例论坛话题
  const topics = [
    {
      title: '欢迎来到TransferWiki论坛',
      content: `# 欢迎来到TransferWiki论坛！

这是一个专为转学生设计的平台，在这里你可以：

- 分享转学经验和技巧
- 讨论申请过程中的问题
- 获取各个学校的最新信息
- 结交志同道合的朋友

希望这个平台能够帮助你在转学路上走得更顺利！`,
      categorySlug: 'general',
      isPinned: true,
    },
    {
      title: '如何准备转学申请材料？',
      content: `我计划明年转学，现在开始准备申请材料。想请教大家以下几个问题：

1. 成绩单需要如何处理？是否需要翻译？
2. 推荐信一般找谁写比较合适？
3. 个人陈述有什么注意事项？

感谢各位的建议！`,
      categorySlug: 'materials',
    },
  ];
  
  for (const topic of topics) {
    const category = await prisma.forumCategory.findUnique({
      where: { slug: topic.categorySlug },
    });
    
    if (category) {
      await prisma.forumTopic.create({
        data: {
          title: topic.title,
          content: topic.content,
          categoryId: category.id,
          userId: admin.id,
          isPinned: topic.isPinned || false,
          lastReplyAt: new Date(),
        },
      });
    }
  }
  
  console.log('论坛话题已创建');
  
  console.log('数据初始化完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });