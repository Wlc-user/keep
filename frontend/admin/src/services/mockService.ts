import { message } from 'antd';

// 模拟用户数据
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    name: '管理员',
    role: 'admin',
    email: 'admin@example.com',
    phone: '13800138000',
    department: '信息技术部',
    bio: '系统管理员，负责平台维护和用户管理'
  },
  {
    id: '2',
    username: 'teacher',
    name: '张教授',
    role: 'teacher',
    email: 'teacher@example.com',
    phone: '13800138001',
    department: '计算机科学系',
    bio: '资深教授，专注于人工智能和机器学习研究'
  },
  {
    id: '3',
    username: 'student',
    name: '李同学',
    role: 'student',
    email: 'student@example.com',
    phone: '13800138002',
    department: '计算机科学系',
    bio: '大三学生，对前端开发充满热情'
  }
];

// 模拟课程数据
const mockCourses = Array(10).fill(0).map((_, index) => ({
  id: `${index + 1}`,
  title: `示例课程 ${index + 1}`,
  description: `这是一个示例课程描述 ${index + 1}`,
  teacherId: '2',
  teacherName: '张教授',
  categoryName: index % 3 === 0 ? '计算机科学' : (index % 3 === 1 ? '数据科学' : '人工智能'),
  startDate: '2023-04-01',
  endDate: '2023-07-30',
  studentCount: 30 + index,
  isEnrolled: index < 4,
  progress: index < 4 ? Math.floor(Math.random() * 100) : 0,
  status: index < 4 ? (index % 3 === 0 ? 'in_progress' : (index % 3 === 1 ? 'completed' : 'not_started')) : 'not_started',
  isFree: index % 2 === 0,
  price: index % 2 === 0 ? 0 : 99 + index * 10
}));

// 模拟学习材料数据
const mockMaterials = Array(20).fill(0).map((_, index) => ({
  id: `material-${index + 1}`,
  title: `学习资料 ${index + 1}`,
  type: index % 3 === 0 ? 'video' : (index % 3 === 1 ? 'document' : 'quiz'),
  courseId: `${Math.floor(index / 2) + 1}`,
  chapterId: `chapter-${Math.floor(index / 5) + 1}`,
  duration: index % 3 === 0 ? 15 + index : null,
  fileSize: index % 3 === 1 ? 1024 * (index + 1) : null,
  url: `https://example.com/materials/${index + 1}`,
  createdAt: new Date(2023, 0, index + 1).toISOString()
}));

// 添加材料统计模拟数据
export const mockMaterialStatistics = {
  totalCount: 120,
  viewCount: 4560,
  downloadCount: 986,
  byCategory: [
    { category: '视频', count: 45, percentage: 37.5 },
    { category: '文档', count: 38, percentage: 31.7 },
    { category: '图片', count: 22, percentage: 18.3 },
    { category: '音频', count: 15, percentage: 12.5 }
  ],
  byType: [
    { type: '课程材料', count: 65, percentage: 54.2 },
    { type: '补充资料', count: 32, percentage: 26.7 },
    { type: '作业', count: 23, percentage: 19.1 }
  ],
  dailyUploads: Array(30).fill(0).map((_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    count: Math.floor(Math.random() * 10)
  })),
  mostViewed: Array(5).fill(0).map((_, i) => ({
    id: `material-${i+1}`,
    title: `热门材料 ${i+1}`,
    viewCount: 100 - i * 15,
    type: i % 3 === 0 ? '视频' : (i % 3 === 1 ? '文档' : '图片')
  })),
  recentUploads: Array(5).fill(0).map((_, i) => ({
    id: `material-new-${i+1}`,
    title: `最新材料 ${i+1}`,
    uploadDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    uploader: '张教授'
  }))
};

/**
 * 模拟登录服务
 * @param username 用户名
 * @param password 密码
 * @returns 模拟登录响应
 */
export const mockLogin = (username: string, password: string) => {
  console.log(`模拟登录: ${username} / ${password}`);
  
  // 开发模式下，对任何用户名都允许空密码或admin密码
  const isDevMode = process.env.NODE_ENV === 'development';
  const isAdminPassword = password.toLowerCase() === 'admin';
  const isEmptyPassword = !password || password.trim() === '';
  
  // 规范化用户名
  const normalizedUsername = username.toLowerCase().trim();
  
  // 检查用户名和密码
  let isValidLogin = false;
  let userRole = 'student';
  let userName = '';
  
  // 根据用户名设置角色和显示名称
  switch (normalizedUsername) {
    case 'admin':
      userRole = 'admin';
      userName = '管理员';
      // 管理员可以使用空密码或"admin"密码
      isValidLogin = isDevMode ? (isEmptyPassword || isAdminPassword) : isAdminPassword;
      break;
    case 'teacher':
      userRole = 'teacher';
      userName = '教师';
      // 教师可以使用空密码或"admin"密码
      isValidLogin = isDevMode ? (isEmptyPassword || isAdminPassword) : isAdminPassword;
      break;
    case 'student':
      userRole = 'student';
      userName = '学生';
      // 学生可以使用空密码或"admin"密码
      isValidLogin = isDevMode ? (isEmptyPassword || isAdminPassword) : isAdminPassword;
      break;
    default:
      // 如果是开发环境，其他用户名也尝试允许登录
      if (isDevMode && (isEmptyPassword || isAdminPassword)) {
        userRole = 'student';
        userName = `用户${normalizedUsername}`;
        isValidLogin = true;
      }
  }
  
  console.log(`登录检查: 用户=${normalizedUsername}, 角色=${userRole}, 有效=${isValidLogin}`);
  
  return new Promise((resolve, reject) => {
    // 添加随机延迟，模拟网络请求
    setTimeout(() => {
      if (isValidLogin) {
        // 模拟令牌生成
        const token = `mock_token_${normalizedUsername}_${Date.now()}`;
        const userId = `user_${normalizedUsername}_${Date.now()}`;
        
        // 返回多种可能的响应格式之一，以便测试前端的适应性
        const responseTypes = [
          // 1. 基本响应格式
          {
            token,
            id: userId,
            username: normalizedUsername,
            name: userName,
            role: userRole,
            success: true
          },
          // 2. ASP.NET Core风格的响应
          {
            success: true,
            token: token,
            data: {
              token,
              user: {
                id: userId,
                username: normalizedUsername,
                name: userName,
                role: userRole
              }
            },
            message: "登录成功"
          },
          // 3. JWT格式响应
          {
            token: token,
            access_token: token,
            userId: userId,
            username: normalizedUsername,
            displayName: userName,
            userRole: userRole,
            expiresIn: 3600
          },
          // 4. 另一种通用API响应格式
          {
            code: 200,
            token: token,
            data: {
              token,
              userInfo: {
                id: userId,
                username: normalizedUsername,
                nickname: userName,
                role: userRole
              }
            },
            message: "登录成功"
          }
        ];
        
        // 对于开发环境，随机选择一种响应格式，增加前端适应性测试
        // 对于生产环境，使用第一种基本格式保持稳定
        const responseIndex = isDevMode ? Math.floor(Math.random() * responseTypes.length) : 0;
        const response = responseTypes[responseIndex];
        
        console.log(`模拟登录成功: 使用响应格式 ${responseIndex + 1}`, response);
        resolve(response);
      } else {
        console.log(`模拟登录失败: 用户名或密码错误`);
        reject({
          message: '用户名或密码错误',
          status: 401
        });
      }
    }, 300 + Math.random() * 500); // 随机延迟300-800毫秒
  });
};

// 错误处理和默认响应生成器
const mockHelpers = {
  /**
   * 生成分页响应
   */
  createPaginatedResponse: (items: any[], pageIndex: number, pageSize: number) => {
    const start = (pageIndex - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = items.slice(start, end);
    
    return {
      items: paginatedItems,
      totalCount: items.length,
      pageIndex,
      pageSize
    };
  },
  
  /**
   * 模拟网络延迟
   */
  delay: (min = 200, max = 800) => {
    return new Promise(resolve => setTimeout(resolve, min + Math.random() * (max - min)));
  },
  
  /**
   * 生成带有概率的错误
   */
  maybeError: (errorProbability = 0.1, errorMessage = '模拟错误', status = 500) => {
    if (Math.random() < errorProbability) {
      return {
        error: true,
        message: errorMessage,
        status
      };
    }
    return { error: false };
  }
};

// 模拟获取课程列表（增强版）
export const mockGetCourses = async (pageIndex = 1, pageSize = 10, filters?: any) => {
  await mockHelpers.delay();
  
  // 应用过滤器（如果有）
  let filteredCourses = [...mockCourses];
  
  if (filters) {
    if (filters.title) {
      filteredCourses = filteredCourses.filter(c => 
        c.title.toLowerCase().includes(filters.title.toLowerCase())
      );
    }
    
    if (filters.categoryName) {
      filteredCourses = filteredCourses.filter(c => 
        c.categoryName === filters.categoryName
      );
    }
    
    if (filters.status) {
      filteredCourses = filteredCourses.filter(c => 
        c.status === filters.status
      );
    }
    
    if (filters.isEnrolled !== undefined) {
      filteredCourses = filteredCourses.filter(c => 
        c.isEnrolled === filters.isEnrolled
      );
    }
  }
  
  // 返回分页结果
  return mockHelpers.createPaginatedResponse(filteredCourses, pageIndex, pageSize);
};

// 模拟获取已注册课程（学生视角）
export const mockGetEnrolledCourses = async (pageIndex = 1, pageSize = 10) => {
  await mockHelpers.delay();
  const enrolledCourses = mockCourses.filter(c => c.isEnrolled);
  return mockHelpers.createPaginatedResponse(enrolledCourses, pageIndex, pageSize);
};

// 模拟获取课程材料
export const mockGetCourseMaterials = async (courseId: string) => {
  await mockHelpers.delay();
  const materials = mockMaterials.filter(m => m.courseId === courseId);
  return materials;
};

// 模拟获取用户数据
export const mockGetUserProfile = async (userId?: string) => {
  await mockHelpers.delay();
  // 如果没有指定用户ID，返回默认的学生用户
  if (!userId) {
    return mockUsers.find(u => u.role === 'student');
  }
  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    throw new Error('用户不存在');
  }
  return user;
};

// 模拟获取所有用户
export const mockGetAllUsers = async (pageIndex = 1, pageSize = 10, filters?: any) => {
  await mockHelpers.delay();
  
  // 应用过滤器（如果有）
  let filteredUsers = [...mockUsers];
  
  if (filters) {
    if (filters.role) {
      filteredUsers = filteredUsers.filter(u => u.role === filters.role);
    }
    
    if (filters.username) {
      filteredUsers = filteredUsers.filter(u => 
        u.username.toLowerCase().includes(filters.username.toLowerCase())
      );
    }
    
    if (filters.name) {
      filteredUsers = filteredUsers.filter(u => 
        u.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
  }
  
  return mockHelpers.createPaginatedResponse(filteredUsers, pageIndex, pageSize);
};

// 模拟获取课程详情
export const mockGetCourseById = (courseId: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const course = mockCourses.find(c => c.id === courseId);
      
      if (course) {
        resolve({
          ...course,
          chapters: [
            {
              id: '1',
              title: '第1章 课程介绍',
              sections: [
                { id: '1-1', title: '1.1 课程概述', type: 'video', duration: 10, completed: true },
                { id: '1-2', title: '1.2 学习方法', type: 'video', duration: 15, completed: true }
              ]
            },
            {
              id: '2',
              title: '第2章 基础知识',
              sections: [
                { id: '2-1', title: '2.1 基本概念', type: 'video', duration: 20, completed: false },
                { id: '2-2', title: '2.2 实践应用', type: 'video', duration: 25, completed: false }
              ]
            }
          ]
        });
      } else {
        reject(new Error('课程不存在'));
      }
    }, 800);
  });
};

// 模拟获取材料统计数据
export const mockGetMaterialStatistics = async (startDate?: string, endDate?: string) => {
  await mockHelpers.delay();
  
  // 根据日期范围调整数据
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    // 仅调整日期相关的数据
    return {
      ...mockMaterialStatistics,
      dailyUploads: Array(daysDiff).fill(0).map((_, i) => {
        const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 10)
        };
      })
    };
  }
  
  return mockMaterialStatistics;
};

// 扩展模拟服务对象
const mockService = {
  login: mockLogin,
  getCourses: mockGetCourses,
  getCourseById: mockGetCourseById,
  getEnrolledCourses: mockGetEnrolledCourses,
  getCourseMaterials: mockGetCourseMaterials,
  getUserProfile: mockGetUserProfile,
  getAllUsers: mockGetAllUsers,
  getMaterialStatistics: mockGetMaterialStatistics,
  
  // 提供对模拟数据的直接访问
  mockUsers,
  mockCourses,
  mockMaterials,
  mockMaterialStatistics,
  
  // 帮助函数
  createPaginatedResponse: mockHelpers.createPaginatedResponse
};

export default mockService; 