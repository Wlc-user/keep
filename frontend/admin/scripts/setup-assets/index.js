/**
 * 设置公共资源目录的脚本
 * 这个脚本会告诉用户如何创建必要的公共资源目录结构和占位图片
 */

const fs = require('fs');
const path = require('path');

// 目录结构
const directories = [
  '../../public/images/courses',
  '../../public/images/avatars',
  '../../public/images/materials',
  '../../public/images/banners'
];

// 创建目录
function createDirectories() {
  console.log('创建公共资源目录...');
  
  directories.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ 已创建目录: ${dir}`);
    } else {
      console.log(`✓ 目录已存在: ${dir}`);
    }
  });
}

// 创建简单的占位图片HTML说明
function createPlaceholderDoc() {
  const docPath = path.join(__dirname, '../../public/images/README.md');
  
  const content = `# 图片资源目录

## 关于404错误

如果您在控制台看到图片404错误，可能是因为应用正在尝试加载模拟数据中引用的图片，但这些图片在您的系统中不存在。

## 解决方案

1. 您可以在这些目录中放置自己的图片，并确保文件名与代码中引用的一致：
   - \`images/courses/\` 目录中放置课程图片，如 \`web-frontend.jpg\`, \`react-advanced.jpg\` 等
   - \`images/avatars/\` 目录中放置用户头像，如 \`teacher1.jpg\`, \`teacher2.jpg\` 等

2. 或者，您可以修改模拟数据中的图片URL为在线占位图片服务：
   - 课程图片: \`https://via.placeholder.com/300x200?text=Course+Image\`
   - 用户头像: \`https://via.placeholder.com/80x80?text=Avatar\`

## 图片命名约定

- 课程图片: \`web-frontend.jpg\`, \`react-advanced.jpg\`, \`nodejs.jpg\`, \`python-data.jpg\`, \`mobile-dev.jpg\`, \`cloud-devops.jpg\`
- 用户头像: \`teacher1.jpg\`, \`teacher2.jpg\`, \`teacher3.jpg\`, \`teacher4.jpg\`, \`teacher5.jpg\`

`;

  fs.writeFileSync(docPath, content);
  console.log(`✅ 已创建占位图片说明文档: public/images/README.md`);
}

// 创建在线占位图片版本的模拟数据
function createOnlinePlaceholderDataFile() {
  const filePath = path.join(__dirname, '../../src/services/mockPlaceholderData.js');
  
  const content = `/**
 * 使用在线占位图片服务的模拟数据
 */

export const MOCK_COURSES_PLACEHOLDER = [
  {
    id: '1',
    title: 'Web前端开发基础',
    description: '学习HTML, CSS和JavaScript的基础知识，构建响应式网页。',
    category: '前端开发',
    status: 'published',
    enrolledStudents: 156,
    progress: 100,
    coverImage: 'https://via.placeholder.com/300x200?text=Web前端开发',
    teacherName: '李明',
    teacherAvatar: 'https://via.placeholder.com/80x80?text=李明',
    level: '入门',
    price: 299,
    isFree: false,
    createdAt: '2023-05-01',
    publishedAt: '2023-05-10',
  },
  {
    id: '2',
    title: 'React高级组件设计',
    description: '深入理解React组件设计模式，学习高阶组件、Hooks等高级概念。',
    category: '前端开发',
    status: 'published',
    enrolledStudents: 78,
    progress: 100,
    coverImage: 'https://via.placeholder.com/300x200?text=React高级组件',
    teacherName: '张华',
    teacherAvatar: 'https://via.placeholder.com/80x80?text=张华',
    level: '高级',
    price: 499,
    isFree: false,
    createdAt: '2023-06-15',
    publishedAt: '2023-06-25',
  },
  {
    id: '3',
    title: 'Node.js后端开发',
    description: '使用Node.js和Express框架构建RESTful API和Web应用。',
    category: '后端开发',
    status: 'published',
    enrolledStudents: 42,
    progress: 80,
    coverImage: 'https://via.placeholder.com/300x200?text=Node.js开发',
    teacherName: '王刚',
    teacherAvatar: 'https://via.placeholder.com/80x80?text=王刚',
    level: '中级',
    price: 399,
    isFree: false,
    createdAt: '2023-07-10',
    publishedAt: '2023-07-20',
  },
  {
    id: '4',
    title: 'Python数据分析',
    description: '学习使用Python进行数据清洗、分析和可视化。',
    category: '数据科学',
    status: 'draft',
    enrolledStudents: 0,
    progress: 60,
    coverImage: 'https://via.placeholder.com/300x200?text=Python数据分析',
    teacherName: '刘芳',
    teacherAvatar: 'https://via.placeholder.com/80x80?text=刘芳',
    level: '中级',
    price: 349,
    isFree: false,
    createdAt: '2023-08-05',
    publishedAt: null,
  },
  {
    id: '5',
    title: '移动应用开发基础',
    description: '了解原生和跨平台移动应用开发的基础知识。',
    category: '移动开发',
    status: 'published',
    enrolledStudents: 65,
    progress: 100,
    coverImage: 'https://via.placeholder.com/300x200?text=移动应用开发',
    teacherName: '陈静',
    teacherAvatar: 'https://via.placeholder.com/80x80?text=陈静',
    level: '入门',
    price: 0,
    isFree: true,
    createdAt: '2023-09-01',
    publishedAt: '2023-09-10',
  },
  {
    id: '6',
    title: '云计算与DevOps',
    description: '学习云服务、容器化和CI/CD流程，实现自动化部署。',
    category: '云计算',
    status: 'published',
    enrolledStudents: 37,
    progress: 90,
    coverImage: 'https://via.placeholder.com/300x200?text=云计算与DevOps',
    teacherName: '赵明',
    teacherAvatar: 'https://via.placeholder.com/80x80?text=赵明',
    level: '高级',
    price: 599,
    isFree: false,
    createdAt: '2023-10-05',
    publishedAt: '2023-10-15',
  }
];
`;

  fs.writeFileSync(filePath, content);
  console.log(`✅ 已创建在线占位图片模拟数据文件: src/services/mockPlaceholderData.js`);
}

// 主函数
function main() {
  console.log('开始设置公共资源目录...');
  
  try {
    createDirectories();
    createPlaceholderDoc();
    createOnlinePlaceholderDataFile();
    
    console.log('\n✅ 公共资源目录设置完成！');
    console.log('\n说明：');
    console.log('1. 请查看 public/images/README.md 文件，了解如何解决图片404错误');
    console.log('2. 您可以在对应目录放置自己的图片');
    console.log('3. 或者，您可以导入在线占位图片模拟数据:');
    console.log('   import { MOCK_COURSES_PLACEHOLDER } from \'../services/mockPlaceholderData\';');
    console.log('');
    console.log('现在尝试重启应用，应该可以看到课程数据并且不会有图片404错误');
  } catch (error) {
    console.error('设置公共资源目录时出错:', error);
  }
}

// 执行主函数
main(); 