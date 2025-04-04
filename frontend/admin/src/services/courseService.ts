import apiService from './apiService';
import { message } from 'antd';
import config from '../config/env';
import mockDataLoader from '../utils/mockDataLoader';

// 课程详情接口
export interface CourseDetail {
  id: string;
  title: string;
  description: string;
  teacher: {
    id: string;
    name: string;
    title: string;
    department: string;
    avatar: string;
  };
  startDate: string;
  endDate: string;
  schedule: string;
  location: string;
  enrolledStudents: number;
  progress: number;
  chapters: Array<{
    id: string;
    title: string;
    description: string;
    sections: Array<{
      id: string;
      title: string;
      type: string;
      duration: number;
      completed: boolean;
    }>;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    description: string;
    deadline: string;
    status: string;
  }>;
  materials: Array<{
    id: string;
    title: string;
    type: string;
    size: string;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
  }>;
}

// 学生信息接口
export interface StudentInfo {
  id: string;
  name: string;
  avatar: string;
  progress: number;
  lastActive: string;
}

// 学生列表响应接口
export interface StudentsResponse {
  items: StudentInfo[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  instructorName?: string;
  startDate: string;
  endDate: string;
  status: string;
  enrollmentCount: number;
  maxEnrollment: number;
  creditHours: number;
}

class CourseService {
  
  /**
   * 获取课程列表
   * @returns 课程列表
   */
  async getCourses(): Promise<Course[]> {
    try {
      console.log('正在获取课程数据...');
      
      // 优先使用模拟数据
      if (config.USE_MOCK_DATA) {
        console.log('尝试从模拟数据获取课程');
        try {
          const mockData = await mockDataLoader.loadMockData('courses');
          if (mockData && Array.isArray(mockData)) {
            console.log(`成功从模拟数据获取课程: ${mockData.length}`);
            return mockData;
          }
        } catch (mockError) {
          console.error('获取模拟课程数据失败，回退到API:', mockError);
        }
      }
      
      // 如果模拟数据获取失败或未启用，尝试使用API
      const response = await apiService.get('/api/courses');
      return response.items || [];
    } catch (error) {
      console.error('获取课程数据失败:', error);
      return [];
    }
  }

  /**
   * 获取课程详情
   * @param courseId 课程ID
   */
  async getCourseDetail(courseId: string): Promise<CourseDetail> {
    try {
      const response = await apiService.courses.getById(courseId);
      return response as CourseDetail;
    } catch (error) {
      console.error('获取课程详情失败:', error);
      throw error;
    }
  }

  /**
   * 获取课程学生列表
   * @param courseId 课程ID
   * @param pageIndex 页码
   * @param pageSize 每页数量
   */
  async getStudentsByCourse(courseId: string, pageIndex = 1, pageSize = 10): Promise<StudentsResponse> {
    try {
      const response = await apiService.get(`/courses/${courseId}/students`, {
        pageIndex,
        pageSize
      });
      return response as StudentsResponse;
    } catch (error) {
      console.error('获取课程学生列表失败:', error);
      // 返回模拟数据
      return {
        items: Array(pageSize).fill(0).map((_, index) => ({
          id: `${index + 1}`,
          name: `学生${index + 1}`,
          avatar: '',
          progress: Math.floor(Math.random() * 100),
          lastActive: `2023-03-${10 + Math.floor(Math.random() * 15)}`
        })),
        totalCount: 45,
        pageIndex,
        pageSize
      };
    }
  }

  /**
   * 选课
   * @param courseId 课程ID
   */
  async enrollCourse(courseId: string) {
    try {
      return await apiService.post(`/courses/${courseId}/enroll`, {});
    } catch (error) {
      console.error('选课失败:', error);
      throw error;
    }
  }

  /**
   * 获取课程进度
   * @param courseId 课程ID
   */
  async getCourseProgress(courseId: string) {
    try {
      return await apiService.get(`/courses/${courseId}/progress`);
    } catch (error) {
      console.error('获取课程进度失败:', error);
      // 返回模拟数据
      return {
        progress: Math.floor(Math.random() * 100),
        lastStudyTime: new Date().toISOString()
      };
    }
  }
}

export default new CourseService(); 

// 模拟课程数据，使用相对路径
export const MOCK_COURSES = [
  {
    id: '1',
    title: 'Web前端开发基础',
    description: '学习HTML, CSS和JavaScript的基础知识，构建响应式网页。',
    category: '前端开发',
    status: 'published',
    enrolledStudents: 156,
    progress: 100,
    coverImage: '/images/courses/web-frontend.jpg',
    teacherName: '李明',
    teacherAvatar: '/images/avatars/teacher1.jpg',
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
    coverImage: '/images/courses/react-advanced.jpg',
    teacherName: '张华',
    teacherAvatar: '/images/avatars/teacher2.jpg',
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
    coverImage: '/images/courses/nodejs.jpg',
    teacherName: '王刚',
    teacherAvatar: '/images/avatars/teacher3.jpg',
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
    coverImage: '/images/courses/python-data.jpg',
    teacherName: '刘芳',
    teacherAvatar: '/images/avatars/teacher4.jpg',
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
    coverImage: '/images/courses/mobile-dev.jpg',
    teacherName: '陈静',
    teacherAvatar: '/images/avatars/teacher5.jpg',
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
    coverImage: '/images/courses/cloud-devops.jpg',
    teacherName: '赵明',
    teacherAvatar: '/images/avatars/teacher1.jpg',
    level: '高级',
    price: 599,
    isFree: false,
    createdAt: '2023-10-05',
    publishedAt: '2023-10-15',
  }
]; 