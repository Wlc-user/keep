import { Material, MaterialCategory, MaterialListResponse, MaterialType, MaterialStatus } from '../types/material';

// 模拟素材数据
export const mockMaterials: Material[] = [
  {
    id: '1',
    title: 'JavaScript基础教程',
    description: '适合初学者的JavaScript入门教程',
    url: 'https://example.com/materials/js-basics.pdf',
    thumbnailUrl: 'https://example.com/thumbnails/js-basics.jpg',
    type: MaterialType.DOCUMENT,
    status: MaterialStatus.APPROVED,
    categoryId: '1',
    categoryName: '编程语言',
    uploaderId: 'teacher1',
    uploaderName: '张教授',
    tags: ['JavaScript', '编程', '入门'],
    size: 2048000,
    downloadCount: 156,
    viewCount: 1024,
    createdAt: '2023-01-15 10:30:00',
    updatedAt: '2023-01-15 10:30:00'
  },
  {
    id: '2',
    title: 'React实战视频',
    description: 'React框架开发实战课程',
    url: 'https://example.com/materials/react-course.mp4',
    thumbnailUrl: 'https://example.com/thumbnails/react-course.jpg',
    type: MaterialType.VIDEO,
    status: MaterialStatus.APPROVED,
    categoryId: '2',
    categoryName: '前端框架',
    uploaderId: 'teacher2',
    uploaderName: '李讲师',
    tags: ['React', '前端', '框架'],
    size: 512000000,
    downloadCount: 89,
    viewCount: 432,
    createdAt: '2023-02-20 14:15:00',
    updatedAt: '2023-02-20 14:15:00'
  },
  {
    id: '3',
    title: 'Python数据分析',
    description: '使用Python进行数据分析的教程',
    url: 'https://example.com/materials/python-data.pdf',
    thumbnailUrl: 'https://example.com/thumbnails/python-data.jpg',
    type: MaterialType.DOCUMENT,
    status: MaterialStatus.PENDING,
    categoryId: '3',
    categoryName: '数据分析',
    uploaderId: 'teacher3',
    uploaderName: '王教授',
    tags: ['Python', '数据分析', '统计'],
    size: 3072000,
    downloadCount: 0,
    viewCount: 0,
    createdAt: '2023-03-05 09:45:00',
    updatedAt: '2023-03-05 09:45:00'
  },
  {
    id: '4',
    title: '机器学习算法讲解',
    description: '常见机器学习算法原理与实现',
    url: 'https://example.com/materials/ml-algorithms.pptx',
    thumbnailUrl: 'https://example.com/thumbnails/ml-algorithms.jpg',
    type: MaterialType.DOCUMENT,
    status: MaterialStatus.APPROVED,
    categoryId: '4',
    categoryName: '人工智能',
    uploaderId: 'teacher4',
    uploaderName: '赵博士',
    tags: ['机器学习', 'AI', '算法'],
    size: 5120000,
    downloadCount: 210,
    viewCount: 567,
    createdAt: '2023-01-28 16:20:00',
    updatedAt: '2023-01-28 16:20:00'
  },
  {
    id: '5',
    title: '网络安全基础',
    description: '网络安全基础知识与实践',
    url: 'https://example.com/materials/network-security.mp4',
    thumbnailUrl: 'https://example.com/thumbnails/network-security.jpg',
    type: MaterialType.VIDEO,
    status: MaterialStatus.REJECTED,
    categoryId: '5',
    categoryName: '网络安全',
    uploaderId: 'teacher5',
    uploaderName: '钱教授',
    tags: ['网络安全', '加密', '防护'],
    size: 256000000,
    downloadCount: 0,
    viewCount: 0,
    createdAt: '2023-02-10 11:30:00',
    updatedAt: '2023-02-10 11:30:00',
    rejectReason: '视频质量不佳，请重新录制'
  }
];

// 模拟素材分类数据
export const mockCategories: MaterialCategory[] = [
  {
    id: '1',
    name: '编程语言',
    description: '各种编程语言的学习资料',
    parentId: null,
    createdAt: '2023-01-01 00:00:00',
    updatedAt: '2023-01-01 00:00:00'
  },
  {
    id: '2',
    name: '前端框架',
    description: '前端开发框架相关资料',
    parentId: null,
    createdAt: '2023-01-01 00:00:00',
    updatedAt: '2023-01-01 00:00:00'
  },
  {
    id: '3',
    name: '数据分析',
    description: '数据分析与处理相关资料',
    parentId: null,
    createdAt: '2023-01-01 00:00:00',
    updatedAt: '2023-01-01 00:00:00'
  },
  {
    id: '4',
    name: '人工智能',
    description: '人工智能与机器学习资料',
    parentId: null,
    createdAt: '2023-01-01 00:00:00',
    updatedAt: '2023-01-01 00:00:00'
  },
  {
    id: '5',
    name: '网络安全',
    description: '网络安全相关学习资料',
    parentId: null,
    createdAt: '2023-01-01 00:00:00',
    updatedAt: '2023-01-01 00:00:00'
  }
];

// 模拟获取素材列表
export const getMockMaterials = (params: any): MaterialListResponse => {
  const { page = 1, pageSize = 10, keyword, type, status, categoryId } = params;
  
  let filteredMaterials = [...mockMaterials];
  
  // 关键词过滤
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    filteredMaterials = filteredMaterials.filter(
      item => 
        item.title.toLowerCase().includes(lowerKeyword) || 
        item.description.toLowerCase().includes(lowerKeyword) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerKeyword)))
    );
  }
  
  // 类型过滤
  if (type) {
    filteredMaterials = filteredMaterials.filter(item => item.type === type);
  }
  
  // 状态过滤
  if (status) {
    filteredMaterials = filteredMaterials.filter(item => item.status === status);
  }
  
  // 分类过滤
  if (categoryId) {
    filteredMaterials = filteredMaterials.filter(item => item.categoryId === categoryId);
  }
  
  // 计算总数
  const total = filteredMaterials.length;
  
  // 分页
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMaterials = filteredMaterials.slice(startIndex, endIndex);
  
  return {
    items: paginatedMaterials,
    total,
    page,
    pageSize
  };
};

// 模拟获取素材详情
export const getMockMaterial = (id: string): Material | null => {
  return mockMaterials.find(item => item.id === id) || null;
};

// 模拟获取素材分类
export const getMockCategories = (): MaterialCategory[] => {
  return mockCategories;
}; 