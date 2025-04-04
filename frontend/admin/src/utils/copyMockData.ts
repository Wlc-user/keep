/**
 * 模拟数据预加载工具
 * 直接将JSON数据加载到内存，避免网络请求
 */
import ResourceController from './ResourceController';
import mockDataLoader, { buildMockPaths } from './mockDataLoader';

// 用户数据
const usersData = [
  {
    "id": 1,
    "username": "admin",
    "name": "管理员",
    "email": "admin@example.com",
    "role": "admin",
    "status": "active",
    "createdAt": "2023-01-01T00:00:00Z",
    "lastLogin": "2023-03-28T08:30:00Z"
  },
  {
    "id": 2,
    "username": "teacher1",
    "name": "张老师",
    "email": "teacher1@example.com",
    "role": "teacher",
    "status": "active",
    "createdAt": "2023-01-10T09:00:00Z",
    "lastLogin": "2023-03-27T14:20:00Z"
  },
  {
    "id": 3,
    "username": "student1",
    "name": "李学生",
    "email": "student1@example.com",
    "role": "student",
    "status": "active",
    "createdAt": "2023-02-15T10:30:00Z",
    "lastLogin": "2023-03-28T09:15:00Z"
  },
  {
    "id": 4,
    "username": "student2",
    "name": "王学生",
    "email": "student2@example.com",
    "role": "student",
    "status": "active",
    "createdAt": "2023-02-20T11:45:00Z",
    "lastLogin": "2023-03-28T10:05:00Z"
  }
];

// 通知数据
const notificationsData = [
  {
    "id": 1,
    "title": "系统维护通知",
    "content": "系统将于本周六22:00-24:00进行例行维护，请提前做好准备。",
    "type": "system",
    "isRead": false,
    "createdAt": "2023-03-28T08:00:00Z",
    "sender": "系统管理员"
  },
  {
    "id": 2,
    "title": "课程调整通知",
    "content": "《数据结构》课程将从下周起调整为每周三下午14:00-16:00。",
    "type": "course",
    "isRead": true,
    "createdAt": "2023-03-27T10:30:00Z",
    "sender": "教务处"
  },
  {
    "id": 3,
    "title": "作业提交提醒",
    "content": "《机器学习》课程作业将于本周五18:00截止提交，请按时完成。",
    "type": "homework",
    "isRead": false,
    "createdAt": "2023-03-26T09:15:00Z",
    "sender": "张老师"
  }
];

// 考试数据
const examsData = [
  {
    "id": 1,
    "title": "网络安全基础考试",
    "description": "测试学生对网络安全基础知识的掌握程度",
    "startTime": "2023-09-01T09:00:00Z",
    "endTime": "2023-09-01T11:00:00Z",
    "totalScore": 100,
    "passingScore": 60,
    "status": "已完成",
    "questionCount": 50
  },
  {
    "id": 2,
    "title": "数据结构期中考试",
    "description": "数据结构与算法期中考试，涵盖基本数据类型及操作",
    "startTime": "2023-10-15T14:00:00Z",
    "endTime": "2023-10-15T16:00:00Z",
    "totalScore": 100,
    "passingScore": 70,
    "status": "未开始",
    "questionCount": 40
  }
];

// 课程数据
const coursesData = [
  {
    "id": 1,
    "title": "数据结构与算法",
    "code": "CS201",
    "description": "介绍基本数据结构和算法设计原理",
    "instructor": "张教授",
    "startDate": "2023-02-15",
    "endDate": "2023-06-30",
    "status": "active",
    "enrollmentCount": 120,
    "maxEnrollment": 150,
    "creditHours": 4
  },
  {
    "id": 2,
    "title": "机器学习基础",
    "code": "AI301",
    "description": "机器学习基本理论和应用实践",
    "instructor": "李教授",
    "startDate": "2023-02-20",
    "endDate": "2023-07-10",
    "status": "active",
    "enrollmentCount": 85,
    "maxEnrollment": 100,
    "creditHours": 3
  }
];

// 学习资料数据
const materialsData = [
  {
    "id": 1,
    "title": "数据结构基础教材",
    "type": "textbook",
    "format": "pdf",
    "description": "数据结构与算法分析基础教材，包含各种数据结构的详细讲解",
    "author": "张教授",
    "uploadDate": "2023-02-18T09:30:00Z",
    "size": 15240000,
    "url": "/materials/data-structure-basics.pdf",
    "courseId": 1,
    "downloadCount": 210
  },
  {
    "id": 2,
    "title": "算法设计实践",
    "type": "slides",
    "format": "pptx",
    "description": "算法设计课程PPT，包含常见算法设计范式和例题",
    "author": "张教授",
    "uploadDate": "2023-02-25T14:15:00Z",
    "size": 8560000,
    "url": "/materials/algorithm-design-practice.pptx",
    "courseId": 1,
    "downloadCount": 185
  }
];

// 预加载模拟数据到ResourceController
export const preloadMockData = (): void => {
  console.log('开始预加载模拟数据到内存...');
  
  // 获取所有可能的路径
  const usersPaths = buildMockPaths('users');
  const notificationsPaths = buildMockPaths('notifications');
  const examsPaths = buildMockPaths('exams');
  const coursesPaths = buildMockPaths('courses');
  const materialsPaths = buildMockPaths('materials');
  
  // 预加载用户数据
  usersPaths.forEach(path => {
    ResourceController.setCachedResource(path, usersData);
  });
  
  // 预加载通知数据
  notificationsPaths.forEach(path => {
    ResourceController.setCachedResource(path, notificationsData);
  });
  
  // 预加载考试数据
  examsPaths.forEach(path => {
    ResourceController.setCachedResource(path, examsData);
  });
  
  // 预加载课程数据
  coursesPaths.forEach(path => {
    ResourceController.setCachedResource(path, coursesData);
  });
  
  // 预加载学习资料数据
  materialsPaths.forEach(path => {
    ResourceController.setCachedResource(path, materialsData);
  });
  
  console.log('模拟数据预加载完成');
};

export default { preloadMockData }; 