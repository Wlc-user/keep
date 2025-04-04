/**
 * 设置公共资源目录的脚本
 * 这个脚本会告诉用户如何创建必要的公共资源目录结构和占位图片
 */

const fs = require('fs');
const path = require('path');

// 目录结构
const directories = [
  'public/images/courses',
  'public/images/avatars',
  'public/images/materials',
  'public/images/banners'
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
  const docPath = path.join(__dirname, 'public/images/README.md');
  
  const content = `# 图片资源目录

## 关于404错误

如果您在控制台看到图片404错误，可能是因为应用正在尝试加载模拟数据中引用的图片，但这些图片在您的系统中不存在。

## 解决方案

1. 您可以在这些目录中放置自己的图片，并确保文件名与代码中引用的一致：
   - \`images/courses/\` 目录中放置课程图片，如 \`web-frontend.jpg\`, \`react-advanced.jpg\` 等
   - \`images/avatars/\` 目录中放置用户头像，如 \`teacher1.jpg\`, \`teacher2.jpg\` 等

2. 或者，您可以使用在线占位图片服务，修改代码中的图片URL：
   - 课程图片: \`https://via.placeholder.com/300x200?text=Course+Image\`
   - 用户头像: \`https://via.placeholder.com/80x80?text=Avatar\`

## 图片命名约定

- 课程图片: \`web-frontend.jpg\`, \`react-advanced.jpg\`, \`nodejs.jpg\`, \`python-data.jpg\`, \`mobile-dev.jpg\`, \`cloud-devops.jpg\`
- 用户头像: \`teacher1.jpg\`, \`teacher2.jpg\`, \`teacher3.jpg\`, \`teacher4.jpg\`, \`teacher5.jpg\`

`;

  fs.writeFileSync(docPath, content);
  console.log(`✅ 已创建占位图片说明文档: public/images/README.md`);
}

// 主函数
function main() {
  console.log('开始设置公共资源目录...');
  
  try {
    createDirectories();
    createPlaceholderDoc();
    
    console.log('\n✅ 公共资源目录设置完成！');
    console.log('\n说明：');
    console.log('1. 请查看 public/images/README.md 文件，了解如何解决图片404错误');
    console.log('2. 您可以在对应目录放置自己的图片，或修改模拟数据中的图片URL');
    console.log('\n如需使用在线占位图片，请修改模拟数据中的图片URL为:');
    console.log('- 课程图片: https://via.placeholder.com/300x200?text=Course+Image');
    console.log('- 用户头像: https://via.placeholder.com/80x80?text=Avatar');
  } catch (error) {
    console.error('设置公共资源目录时出错:', error);
  }
}

// 执行主函数
main(); 