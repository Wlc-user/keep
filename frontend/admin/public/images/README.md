# 图片资源目录

## 关于404错误

如果您在控制台看到图片404错误，可能是因为应用正在尝试加载模拟数据中引用的图片，但这些图片在您的系统中不存在。

## 解决方案

1. 您可以在这些目录中放置自己的图片，并确保文件名与代码中引用的一致：
   - `images/courses/` 目录中放置课程图片，如 `web-frontend.jpg`, `react-advanced.jpg` 等
   - `images/avatars/` 目录中放置用户头像，如 `teacher1.jpg`, `teacher2.jpg` 等

2. 或者，您可以修改模拟数据中的图片URL为在线占位图片服务：
   - 课程图片: `https://via.placeholder.com/300x200?text=Course+Image`
   - 用户头像: `https://via.placeholder.com/80x80?text=Avatar`

## 图片命名约定

- 课程图片: `web-frontend.jpg`, `react-advanced.jpg`, `nodejs.jpg`, `python-data.jpg`, `mobile-dev.jpg`, `cloud-devops.jpg`
- 用户头像: `teacher1.jpg`, `teacher2.jpg`, `teacher3.jpg`, `teacher4.jpg`, `teacher5.jpg`

