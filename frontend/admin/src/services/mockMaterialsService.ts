import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// 定义模拟分类
const mockCategories = [
  { id: 1, name: '教学课件', description: '课堂教学使用的幻灯片和讲义' },
  { id: 2, name: '学习资料', description: '辅助学习的各类资料' },
  { id: 3, name: '实验指导', description: '实验课程相关的指导书和材料' },
  { id: 4, name: '参考书籍', description: '课程参考书籍和电子书' },
  { id: 5, name: '练习题', description: '课程练习题和答案' },
  { id: 6, name: '案例分析', description: '实际案例的分析材料' }
];

// 定义模拟教师课程
const mockTeacherCourses = [
  { id: 1, name: '计算机网络', code: 'CS301', description: '计算机网络基础课程' },
  { id: 2, name: '数据结构', code: 'CS201', description: '数据结构与算法分析' },
  { id: 3, name: '操作系统', code: 'CS302', description: '操作系统原理与设计' }
];

// 定义模拟学生课程
const mockStudentCourses = [
  { id: 1, name: '计算机网络', code: 'CS301', description: '计算机网络基础课程', teachers: [{ id: 'teacher1', name: '张教授' }] },
  { id: 2, name: '数据结构', code: 'CS201', description: '数据结构与算法分析', teachers: [{ id: 'teacher2', name: '李教授' }] },
  { id: 4, name: '软件工程', code: 'CS401', description: '软件开发流程与管理', teachers: [{ id: 'teacher3', name: '王教授' }] }
];

// 生成模拟材料数据
const generateMockMaterials = (count = 50) => {
  const materials = [];
  const fileTypes = ['doc', 'pdf', 'ppt', 'xls', 'zip', 'jpg', 'png'];
  const statuses = ['Pending', 'Approved', 'Rejected', 'Unpublished'];
  const users = ['张教授', '李教授', '王教授', '管理员'];
  
  for (let i = 1; i <= count; i++) {
    const category = mockCategories[Math.floor(Math.random() * mockCategories.length)];
    const courseId = Math.random() > 0.2 ? mockTeacherCourses[Math.floor(Math.random() * mockTeacherCourses.length)].id : null;
    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const viewCount = Math.floor(Math.random() * 1000);
    const downloadCount = Math.floor(Math.random() * 500);
    const likeCount = Math.floor(Math.random() * 200);
    
    materials.push({
      id: i,
      title: `材料${i}: ${category.name}示例`,
      description: `这是一个${category.name}的示例材料，用于演示系统功能。`,
      category: category.name,
      fileType: fileType,
      fileSize: Math.floor(Math.random() * 10 * 1024 * 1024), // 随机文件大小，最大10MB
      filePath: `/assets/mock-materials/sample.${fileType}`,
      thumbnailUrl: `/assets/images/thumbnails/${fileType}.png`,
      courseId: courseId,
      courseName: courseId ? mockTeacherCourses.find(c => c.id === courseId)?.name : null,
      createdBy: users[Math.floor(Math.random() * users.length)],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(), // 过去30天内的随机时间
      accessLevel: Math.random() > 0.3 ? 'Public' : 'Course',
      status: status,
      viewCount: viewCount,
      downloadCount: downloadCount,
      likeCount: likeCount,
      isLiked: Math.random() > 0.7 // 30%的材料已点赞
    });
  }
  
  return materials;
};

// 分页数据处理辅助函数
const paginateData = (data, page = 1, pageSize = 10) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = data.slice(startIndex, endIndex);
  return {
    items,
    totalCount: data.length,
    currentPage: page,
    pageSize: pageSize,
    totalPages: Math.ceil(data.length / pageSize)
  };
};

// 生成50个模拟材料
const mockMaterials = generateMockMaterials(50);

// 模拟上传的文件
let nextMaterialId = mockMaterials.length + 1;

// 模拟API拦截器设置
const setupMockApi = () => {
  const mock = new MockAdapter(axios, { delayResponse: 800 }); // 模拟网络延迟
  
  // 模拟获取材料列表
  mock.onGet(/\/api\/materials(\?.*)?$/).reply(config => {
    const params = new URLSearchParams(config.url.split('?')[1]);
    const page = parseInt(params.get('page') || '1');
    const pageSize = parseInt(params.get('pageSize') || '10');
    const search = params.get('search');
    const category = params.get('category');
    const courseId = params.get('courseId');
    const status = params.get('status');
    const myMaterials = params.get('myMaterials');
    
    let filteredMaterials = [...mockMaterials];
    
    // 应用过滤条件
    if (search) {
      const searchLower = search.toLowerCase();
      filteredMaterials = filteredMaterials.filter(m => 
        m.title.toLowerCase().includes(searchLower) || 
        m.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (category) {
      filteredMaterials = filteredMaterials.filter(m => m.category === category);
    }
    
    if (courseId) {
      filteredMaterials = filteredMaterials.filter(m => m.courseId === parseInt(courseId));
    }
    
    if (status && status !== 'all') {
      filteredMaterials = filteredMaterials.filter(m => m.status === status);
    }
    
    // 学生只能看到已通过审核的公开材料或者所选课程的材料
    if (localStorage.getItem('userRole') === 'student') {
      const enrolledCourseIds = mockStudentCourses.map(c => c.id);
      filteredMaterials = filteredMaterials.filter(m => 
        m.status === 'Approved' && (m.accessLevel === 'Public' || (m.courseId && enrolledCourseIds.includes(m.courseId)))
      );
    }
    
    // 教师只能看到自己创建的材料或者所教课程的材料
    if (localStorage.getItem('userRole') === 'teacher' && myMaterials === 'true') {
      const teachingCourseIds = mockTeacherCourses.map(c => c.id);
      filteredMaterials = filteredMaterials.filter(m => 
        m.createdBy === localStorage.getItem('userName') || (m.courseId && teachingCourseIds.includes(m.courseId))
      );
    }
    
    // 分页处理
    const result = paginateData(filteredMaterials, page, pageSize);
    
    return [200, result];
  });
  
  // 模拟获取单个材料
  mock.onGet(/\/api\/materials\/\d+/).reply(config => {
    const id = parseInt(config.url.split('/').pop());
    const material = mockMaterials.find(m => m.id === id);
    
    if (material) {
      // 增加查看计数
      material.viewCount += 1;
      return [200, material];
    } else {
      return [404, { message: '材料不存在' }];
    }
  });
  
  // 模拟创建材料
  mock.onPost('/api/materials').reply(config => {
    const materialData = JSON.parse(config.data);
    const newMaterial = {
      id: nextMaterialId++,
      ...materialData,
      createdAt: new Date().toISOString(),
      viewCount: 0,
      downloadCount: 0,
      likeCount: 0,
      isLiked: false
    };
    
    mockMaterials.push(newMaterial);
    return [201, newMaterial];
  });
  
  // 模拟更新材料
  mock.onPut(/\/api\/materials\/\d+/).reply(config => {
    const id = parseInt(config.url.split('/').pop());
    const index = mockMaterials.findIndex(m => m.id === id);
    
    if (index !== -1) {
      const updateData = JSON.parse(config.data);
      mockMaterials[index] = { ...mockMaterials[index], ...updateData };
      return [200, mockMaterials[index]];
    } else {
      return [404, { message: '材料不存在' }];
    }
  });
  
  // 模拟删除材料
  mock.onDelete(/\/api\/materials\/\d+/).reply(config => {
    const id = parseInt(config.url.split('/').pop());
    const index = mockMaterials.findIndex(m => m.id === id);
    
    if (index !== -1) {
      mockMaterials.splice(index, 1);
      return [204];
    } else {
      return [404, { message: '材料不存在' }];
    }
  });
  
  // 模拟获取材料分类
  mock.onGet('/api/materials/categories').reply(() => {
    return [200, mockCategories];
  });
  
  // 模拟上传材料文件
  mock.onPost('/api/materials/upload').reply(() => {
    // 模拟文件上传成功
    return [200, { 
      filePath: `/assets/uploads/mock-file-${Date.now()}.pdf`,
      fileType: 'pdf',
      fileSize: 1024 * 1024 * 2, // 2MB
      thumbnailUrl: '/assets/images/thumbnails/pdf.png'
    }];
  });
  
  // 模拟获取热门材料
  mock.onGet('/api/materials/popular').reply(config => {
    const params = new URLSearchParams(config.url.split('?')[1]);
    const limit = parseInt(params.get('limit') || '5');
    
    // 获取已审核通过的材料，按下载量排序
    const popularMaterials = mockMaterials
      .filter(m => m.status === 'Approved')
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, limit);
      
    return [200, popularMaterials];
  });
  
  // 模拟获取最新材料
  mock.onGet('/api/materials/recent').reply(config => {
    const params = new URLSearchParams(config.url.split('?')[1]);
    const limit = parseInt(params.get('limit') || '5');
    
    // 获取已审核通过的材料，按创建时间排序
    const recentMaterials = mockMaterials
      .filter(m => m.status === 'Approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
      
    return [200, recentMaterials];
  });
  
  // 模拟记录查看次数
  mock.onPost(/\/api\/materials\/\d+\/view/).reply(config => {
    const id = parseInt(config.url.split('/')[3]);
    const material = mockMaterials.find(m => m.id === id);
    
    if (material) {
      material.viewCount += 1;
      return [200, { success: true }];
    } else {
      return [404, { message: '材料不存在' }];
    }
  });
  
  // 模拟记录下载次数
  mock.onPost(/\/api\/materials\/\d+\/download/).reply(config => {
    const id = parseInt(config.url.split('/')[3]);
    const material = mockMaterials.find(m => m.id === id);
    
    if (material) {
      material.downloadCount += 1;
      return [200, { success: true }];
    } else {
      return [404, { message: '材料不存在' }];
    }
  });
  
  // 模拟点赞
  mock.onPost(/\/api\/materials\/\d+\/like/).reply(config => {
    const id = parseInt(config.url.split('/')[3]);
    const material = mockMaterials.find(m => m.id === id);
    
    if (material) {
      material.likeCount += 1;
      material.isLiked = true;
      return [200, { success: true }];
    } else {
      return [404, { message: '材料不存在' }];
    }
  });
  
  // 模拟取消点赞
  mock.onDelete(/\/api\/materials\/\d+\/like/).reply(config => {
    const id = parseInt(config.url.split('/')[3]);
    const material = mockMaterials.find(m => m.id === id);
    
    if (material) {
      material.likeCount = Math.max(0, material.likeCount - 1);
      material.isLiked = false;
      return [200, { success: true }];
    } else {
      return [404, { message: '材料不存在' }];
    }
  });
  
  // 模拟获取教师课程
  mock.onGet('/api/teachers/my-courses').reply(() => {
    return [200, mockTeacherCourses];
  });
  
  // 模拟获取学生课程
  mock.onGet('/api/students/my-courses').reply(() => {
    return [200, mockStudentCourses];
  });
};

// 模拟服务接口
const mockMaterialsService = {
  setupMockApi,
  
  getMaterials: async (params = {}) => {
    // 自动转换参数格式以适应模拟数据API
    const response = await axios.get('/api/materials', { params });
    return response.data;
  },
  
  getMaterial: async (id) => {
    const response = await axios.get(`/api/materials/${id}`);
    return response.data;
  },
  
  createMaterial: async (materialData) => {
    const response = await axios.post('/api/materials', materialData);
    return response.data;
  },
  
  updateMaterial: async (id, materialData) => {
    const response = await axios.put(`/api/materials/${id}`, materialData);
    return response.data;
  },
  
  deleteMaterial: async (id) => {
    const response = await axios.delete(`/api/materials/${id}`);
    return response.data;
  },
  
  getCategories: async () => {
    const response = await axios.get('/api/materials/categories');
    return response.data;
  },
  
  uploadMaterial: async (formData) => {
    const response = await axios.post('/api/materials/upload', formData);
    return response.data;
  },
  
  getPopularMaterials: async (limit = 5) => {
    const response = await axios.get('/api/materials/popular', { params: { limit } });
    return response.data;
  },
  
  getRecentMaterials: async (limit = 5) => {
    const response = await axios.get('/api/materials/recent', { params: { limit } });
    return response.data;
  },
  
  recordMaterialView: async (id) => {
    const response = await axios.post(`/api/materials/${id}/view`);
    return response.data;
  },
  
  recordMaterialDownload: async (id) => {
    const response = await axios.post(`/api/materials/${id}/download`);
    return response.data;
  },
  
  likeMaterial: async (id) => {
    const response = await axios.post(`/api/materials/${id}/like`);
    return response.data;
  },
  
  unlikeMaterial: async (id) => {
    const response = await axios.delete(`/api/materials/${id}/like`);
    return response.data;
  },
  
  getTeacherCourses: async () => {
    const response = await axios.get('/api/teachers/my-courses');
    return response.data;
  },
  
  getStudentCourses: async () => {
    const response = await axios.get('/api/students/my-courses');
    return response.data;
  }
};

// 自动初始化模拟API
setupMockApi();

export default mockMaterialsService; 