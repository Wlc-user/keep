import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';
import { Notification } from '../components/NotificationCenter';
import config from '../config/env'; // 导入环境配置
import errorHandler from '../utils/errorHandler'; // 导入错误处理器
import { ResourceController } from '../utils/ResourceController'; // 正确导入ResourceController类
import mockDataLoader from '../utils/mockDataLoader'; 

// 使用环境配置中的BASE_URL
const BASE_URL = config.API_BASE_URL;

// 最大重试次数
const MAX_RETRIES = 3;

// 不需要身份验证的API路径前缀列表
const PUBLIC_API_PATHS = [
  '/notifications/public',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/debug-login',
  '/auth/emergency-admin',
  '/config/public',
  '/health',
  '/version'
];

// 创建axios实例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: config.API_TIMEOUT || 15000, // 使用配置的超时时间
  headers: {
    'Content-Type': 'application/json'
  }
});

// 在开发环境打印当前使用的API地址
if (process.env.NODE_ENV === 'development') {
  console.log('API服务配置:', {
    baseURL: BASE_URL,
    timeout: config.API_TIMEOUT,
    使用模拟数据: config.USE_MOCK_DATA ? '是' : '否',
    最大重试次数: MAX_RETRIES
  });
}

// 创建用于跟踪请求状态的Map
const pendingRequests = new Map();
const loadedResources = new Set();

/**
 * 生成请求唯一ID
 * @param config 请求配置
 * @returns 请求唯一ID
 */
const getRequestId = (config: AxiosRequestConfig): string => {
  const { method, url, params, data } = config;
  
  // 为GET请求添加时间戳避免缓存
  if (method?.toLowerCase() === 'get') {
    return `${method}:${url}:${JSON.stringify(params || {})}`;
  }
  
  return `${method}:${url}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`;
};

/**
 * 防止重复请求
 * @param config 请求配置
 */
const preventDuplicateRequests = (config: AxiosRequestConfig): void => {
  const requestId = getRequestId(config);
  
  // 取消重复的请求
  if (pendingRequests.has(requestId) && config.method?.toLowerCase() === 'get') {
    const controller = pendingRequests.get(requestId);
    if (controller) {
      console.log(`取消重复请求: ${requestId}`);
      controller.abort();
    }
  }
  
  // 创建AbortController用于以后取消
  const controller = new AbortController();
  config.signal = controller.signal;
  pendingRequests.set(requestId, controller);
  
  // 设置请求ID到headers中
  config.headers = config.headers || {};
  config.headers['X-Request-ID'] = requestId;
};

/**
 * 判断API是否是公开访问(不需要身份验证)
 * @param url API路径
 */
const isPublicApi = (url?: string): boolean => {
  if (!url) return false;
  
  // 移除baseURL部分，仅保留路径
  const path = url.replace(BASE_URL, '');
  
  // 检查是否匹配公开API前缀列表
  return PUBLIC_API_PATHS.some(prefix => path.startsWith(prefix));
};

/**
 * 检查当前用户是否已登录
 */
const isUserLoggedIn = (): boolean => {
  return !!localStorage.getItem('token');
};

/**
 * 添加时间戳到GET请求，避免缓存
 * @param config 请求配置
 */
const addTimestampToGetRequest = (config: AxiosRequestConfig): void => {
  if (config.method?.toLowerCase() === 'get') {
    // 确保params对象存在
    config.params = config.params || {};
    
    // 添加时间戳
    if (!config.params._t) {
      config.params._t = Date.now();
    }
  }
};

/**
 * 为给定url获取模拟数据
 * @param url API路径
 * @param method 请求方法
 * @returns 模拟数据Promise
 */
const getMockResponse = async (url: string, method: string): Promise<any> => {
  // 解析路径获取资源类型
  let resourceType = 'unknown';
  
  // 尝试从URL中提取资源类型
  const pathParts = url.replace(BASE_URL, '').split('/').filter(Boolean);
  if (pathParts.length > 0) {
    resourceType = pathParts[0]; // 第一段通常是资源类型
  }
  
  // 构建一系列可能的模拟数据路径，按优先级排序
  const possiblePaths = [
    `/mock/${resourceType}/${method.toLowerCase()}.json`,
    `/mock/${resourceType}/get.json`,  // 对GET/POST等都尝试通用的get.json文件
    `mock/${resourceType}/${method.toLowerCase()}.json`,
    `mock/${resourceType}/get.json`,
    `/public/mock/${resourceType}/${method.toLowerCase()}.json`,
    `/public/mock/${resourceType}/get.json`,
    `public/mock/${resourceType}/${method.toLowerCase()}.json`,
    `public/mock/${resourceType}/get.json`,
    `/admin/public/mock/${resourceType}/${method.toLowerCase()}.json`,
    `/admin/public/mock/${resourceType}/get.json`,
    `admin/public/mock/${resourceType}/${method.toLowerCase()}.json`,
    `admin/public/mock/${resourceType}/get.json`
  ];
  
  // 检查是否已加载过这些路径中的任何一个
  for (const path of possiblePaths) {
    if (loadedResources.has(path)) {
      console.log(`使用缓存的模拟数据: ${path}`);
      return loadedResources.get(path);
    }
  }
  
  // 尝试所有可能的路径
  console.log(`尝试加载模拟数据，资源类型: ${resourceType}`);
  for (const path of possiblePaths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        const data = await response.json();
        // 缓存结果
        loadedResources.set(path, data);
        console.log(`成功加载模拟数据: ${path}`);
        return data;
      }
    } catch (error) {
      // 在这里不记录错误，避免过多的控制台输出
      continue;
    }
  }
  
  // 所有路径都失败了，记录警告并提供降级数据
  console.warn(`未能找到 ${resourceType} 的模拟数据，提供降级数据`);
  
  // 基于请求类型提供默认的降级数据
  if (method.toLowerCase() === 'get') {
    // 返回空数组作为GET请求的默认响应
    return [];
  } else {
    // 返回简单的成功响应作为POST/PUT/DELETE等请求的默认响应
    return { 
      success: true, 
      message: '操作成功（模拟）', 
      data: null,
      timestamp: new Date().toISOString() 
    };
  }
};

// 请求拦截器
api.interceptors.request.use(
  async (config) => {
    // 防止重复请求
    preventDuplicateRequests(config);
    
    // 添加时间戳到GET请求
    addTimestampToGetRequest(config);
    
    // 防止API路径中出现重复的/api前缀
    if (config.url && config.url.startsWith('/api') && BASE_URL.endsWith('/api')) {
      // 移除开头的/api以避免重复
      config.url = config.url.replace(/^\/api/, '');
      console.log(`修正后的API路径: ${config.url}`);
    }
    
    // 如果不是公开API且用户已登录，添加身份验证头
    if (!isPublicApi(config.url) && isUserLoggedIn()) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // 改进日志记录，确保显示请求体数据
    if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
      console.log(`发起API请求: ${config.method.toUpperCase()} ${config.url}`, config.data || '无数据');
    } else {
      console.log(`发起API请求: ${config.method?.toUpperCase()} ${config.url}`, config.params || '无参数');
    }
    
    // 返回配置
    return config;
  },
  (error) => {
    console.error('请求拦截器发生错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 完成后从pendingRequests中移除
    const requestId = getRequestId(response.config);
    pendingRequests.delete(requestId);
    
    return response;
  },
  async (error) => {
    // 检查是否是请求被取消的错误
    if (axios.isCancel(error)) {
      console.log(`请求已取消: ${error.config?.url}`);
      // 不自动重试取消的请求，直接返回被拒绝的Promise
      return Promise.reject(error);
    }
    
    // 获取配置，用于可能的重试
    const originalConfig = error.config;
    
    // 如果没有配置或URL，则无法重试
    if (!originalConfig || !originalConfig.url) {
      return Promise.reject(error);
    }
    
    // 添加重试计数器（如果不存在）
    if (originalConfig._retryCount === undefined) {
      originalConfig._retryCount = 0;
    }
    
    // 检查是否是超时错误
    const isTimeoutError = error.code === 'ECONNABORTED' && error.message.includes('timeout');
    
    // 检查是否是网络错误或服务器错误
    const isNetworkError = error.message === 'Network Error';
    const isServerError = error.response && error.response.status >= 500;
    
    // 只有超时、网络错误或服务器错误才重试
    const shouldRetry = (isTimeoutError || isNetworkError || isServerError) && 
      originalConfig._retryCount < MAX_RETRIES;
      
    if (shouldRetry) {
      originalConfig._retryCount++;
      
      // 计算重试延迟（指数退避）
      const delay = originalConfig._retryCount * 1000;
      
      console.log(`正在重试请求 (${originalConfig._retryCount}/${MAX_RETRIES}): ${originalConfig.url}, 延迟: ${delay}ms`);
      
      // 等待指定时间后重试
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 移除以前的AbortController，创建新的
      const requestId = getRequestId(originalConfig);
      pendingRequests.delete(requestId);
      
      // 重新发送请求
      return api(originalConfig);
    }
    
    // 处理特定错误
    const apiPath = extractResourceTypeFromUrl(error.config?.url);
    
    if (error.response) {
      // 有响应但状态码不是2xx
      const { status } = error.response;
      
      switch (status) {
        case 401: // 未授权
          console.error('会话已过期，请重新登录');
          break;
          
        case 403: // 禁止访问
          console.error('没有权限访问此资源');
          break;
          
        case 404: // 资源不存在
          console.error('请求的资源不存在');
          break;
          
        case 500: // 服务器错误
        case 502: // 网关错误
        case 503: // 服务不可用
        case 504: // 网关超时
          // 处理服务器端错误
          handleServerError(apiPath, error);
          break;
          
        default:
          if (!error.response) {
            console.error('网络错误，无法连接到服务器');
          }
      }
    } else if (isTimeoutError) {
      console.error(`请求超时: ${originalConfig.url}`);
      handleServerError(apiPath, error);
    }
    
    return Promise.reject(error);
  }
);

// 辅助函数：处理服务器错误
function handleServerError(apiPath: string, error: AxiosError) {
  // 提取资源类型用于降级处理
  const resourceType = extractResourceTypeFromUrl(apiPath);
  
  // 如果能识别资源类型，记录服务降级
  if (resourceType) {
    // 增加降级计数
    const degradationCount = incrementResourceDegradationCount(resourceType);
    console.log(`API请求降级处理，资源类型: ${resourceType}, 降级计数: ${degradationCount}/3`);
    
    // 如果降级次数达到阈值，可以考虑切换到备用数据源
    if (degradationCount >= 3) {
      console.warn(`${resourceType} 服务已降级，将使用备用数据`);
      // 这里可以触发全局事件通知应用使用备用数据
    }
  }
}

// 辅助函数：从URL提取资源类型
function extractResourceTypeFromUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    // 删除参数部分
    const cleanUrl = url.split('?')[0];
    
    // 匹配API路径模式
    const apiPathRegex = /\/api\/([a-zA-Z0-9-_]+)(?:\/|$)/;
    const match = cleanUrl.match(apiPathRegex);
    
    if (match && match[1]) {
      return match[1].toLowerCase();
    }
    
    // 尝试匹配不带/api前缀的直接路径
    const directPathRegex = /\/([a-zA-Z0-9-_]+)(?:\/|$)/;
    const directMatch = cleanUrl.match(directPathRegex);
    
    if (directMatch && directMatch[1]) {
      const possibleType = directMatch[1].toLowerCase();
      
      // 排除通用路径
      if (!['api', 'auth', 'login', 'health'].includes(possibleType)) {
        return possibleType;
      }
    }
  } catch (error) {
    console.error('从URL提取资源类型出错:', error);
  }
  
  // 如果无法提取资源类型，使用URL的最后一部分
  const parts = url.split('/').filter(Boolean);
  if (parts.length > 0) {
    const lastPart = parts[parts.length - 1].split('?')[0];
    if (lastPart && lastPart.length > 0) {
      return lastPart.toLowerCase();
    }
  }
  
  return null;
}

// 资源降级计数器
const resourceDegradationCounters: Record<string, number> = {};

// 增加资源降级计数
function incrementResourceDegradationCount(resourceType: string): number {
  if (!resourceDegradationCounters[resourceType]) {
    resourceDegradationCounters[resourceType] = 0;
  }
  
  resourceDegradationCounters[resourceType]++;
  return resourceDegradationCounters[resourceType];
}

// 检查是否为身份验证相关端点
function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/') || url.includes('/login') || url.includes('/logout');
}

// 通用请求方法
const genericAPI = {
  // GET请求
  get: <T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
    return api.get(url, { params, ...config });
  },
  
  // POST请求
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return api.post(url, data, config);
  },
  
  // PUT请求
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return api.put(url, data, config);
  },
  
  // DELETE请求
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return api.delete(url, config);
  },
  
  // 上传文件请求
  upload: <T>(url: string, file: File, config?: AxiosRequestConfig): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    };
    
    return api.post(url, formData, uploadConfig);
  },
  
  // 批量上传文件请求
  batchUpload: <T>(url: string, files: File[], config?: AxiosRequestConfig): Promise<T> => {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    
    const uploadConfig: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    };
    
    return api.post(url, formData, uploadConfig);
  },
  
  // PATCH请求
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return api.patch(url, data, config)
      .then((response: AxiosResponse<T>) => response.data);
  },
  
  // 下载文件
  download: (url: string, params?: any, config?: AxiosRequestConfig): Promise<Blob> => {
    return api.get(url, {
      params,
      responseType: 'blob',
      ...config
    }).then(response => response.data);
  }
};

// 通知相关API
const notifications = {
  // 获取所有通知
  getAll: (params?: any) => genericAPI.get('/notifications', params),
  
  // 标记通知为已读
  markAsRead: (id: string) => genericAPI.put(`/notifications/${id}/read`),
  
  // 标记所有通知为已读
  markAllAsRead: () => genericAPI.put('/notifications/read-all'),
  
  // 删除通知
  deleteNotification: (id: string) => genericAPI.delete(`/notifications/${id}`),
  
  // 删除所有通知
  deleteAll: () => genericAPI.delete('/notifications/delete-all'),
  
  // 获取未读通知数量
  getUnreadCount: () => genericAPI.get('/notifications/unread-count'),
  
  // 发送通知
  send: (notification: Partial<Notification>) => genericAPI.post('/notifications', notification)
};

// 考试相关API
const exams = {
  // 获取考试列表
  getAll: (params?: any) => genericAPI.get('/exams', params),
  
  // 获取单个考试详情
  getById: (id: string) => genericAPI.get(`/exams/${id}`),
  
  // 创建考试
  create: (data: any) => genericAPI.post('/exams', data),
  
  // 更新考试
  update: (id: string, data: any) => genericAPI.put(`/exams/${id}`, data),
  
  // 删除考试
  delete: (id: string) => genericAPI.delete(`/exams/${id}`),
  
  // 发布考试
  publish: (id: string) => genericAPI.post(`/exams/${id}/publish`),
  
  // 审核考试
  review: (id: string, data: any) => genericAPI.post(`/exams/${id}/review`, data),
  
  // 获取考试提交
  getSubmissions: (params?: any) => genericAPI.get('/exam-submissions', params),
  
  // 获取单个考试提交
  getSubmission: (id: string) => genericAPI.get(`/exam-submissions/${id}`),
  
  // 提交考试
  submit: (examId: string, data: any) => genericAPI.post(`/exams/${examId}/submit`, data),
  
  // 评分考试
  grade: (submissionId: string, data: any) => genericAPI.post(`/exam-submissions/${submissionId}/grade`, data),
  
  // 考试分析
  analytics: {
    // 获取考试整体分析
    getOverall: (examId: string) => genericAPI.get(`/exam-analytics/overall/${examId}`),
    
    // 获取班级考试分析
    getClass: (examId: string, classId: string) => genericAPI.get(`/exam-analytics/class/${examId}/${classId}`),
    
    // 获取学生考试分析
    getStudent: (examId: string, studentId: string) => genericAPI.get(`/exam-analytics/student/${examId}/${studentId}`),
    
    // 获取题目分析
    getQuestion: (examId: string, questionId: string) => genericAPI.get(`/exam-analytics/question/${examId}/${questionId}`),
    
    // 高级查询
    query: (params: any) => genericAPI.post('/exam-analytics/query', params)
  }
};

// 知识图谱相关API
const knowledgeGraph = {
  // 获取知识图谱列表
  getAll: (params?: any) => genericAPI.get('/knowledge-graphs', params),
  
  // 获取单个知识图谱
  getById: (id: string) => genericAPI.get(`/knowledge-graphs/${id}`),
  
  // 创建知识图谱
  create: (data: any) => genericAPI.post('/knowledge-graphs', data),
  
  // 更新知识图谱
  update: (id: string, data: any) => genericAPI.put(`/knowledge-graphs/${id}`, data),
  
  // 删除知识图谱
  delete: (id: string) => genericAPI.delete(`/knowledge-graphs/${id}`),
  
  // 导入知识图谱
  import: (data: FormData) => genericAPI.upload('/knowledge-graphs/import', data),
  
  // 从文档生成知识图谱
  generateFromDoc: (data: any) => genericAPI.post('/knowledge-graphs/generate-from-doc', data),
  
  // 学习路径
  learningPaths: {
    // 获取学习路径列表
    getAll: (params?: any) => genericAPI.get('/learning-paths', params),
    
    // 获取单个学习路径
    getById: (id: string) => genericAPI.get(`/learning-paths/${id}`),
    
    // 创建学习路径
    create: (data: any) => genericAPI.post('/learning-paths', data),
    
    // 更新学习路径
    update: (id: string, data: any) => genericAPI.put(`/learning-paths/${id}`, data),
    
    // 删除学习路径
    delete: (id: string) => genericAPI.delete(`/learning-paths/${id}`),
    
    // 自动生成学习路径
    generate: (graphId: string, params: any) => genericAPI.post(`/knowledge-graphs/${graphId}/generate-path`, params)
  }
};

// 学生评估相关API
const evaluations = {
  // 获取学生评估数据
  getStudentEvaluation: (studentId: string, params?: any) => 
    genericAPI.get(`/evaluations/students/${studentId}`, params),
  
  // 获取学生评估历史
  getEvaluationHistory: (studentId: string, params?: any) => 
    genericAPI.get(`/evaluations/students/${studentId}/history`, params),
  
  // 保存学生评估
  saveStudentEvaluation: (data: any) => 
    genericAPI.post('/evaluations/students', data),
  
  // 导出评估报告
  exportEvaluation: (studentId: string, format: string) => 
    genericAPI.get(`/evaluations/students/${studentId}/export`, { format }, 
      { responseType: 'blob' }),
  
  // 获取班级评估
  getClassEvaluation: (classId: string, params?: any) => 
    genericAPI.get(`/evaluations/classes/${classId}`, params),
  
  // 获取评估模板
  getTemplates: (params?: any) => 
    genericAPI.get('/evaluations/templates', params),
  
  // 获取单个评估模板
  getTemplateById: (id: string) => 
    genericAPI.get(`/evaluations/templates/${id}`),
  
  // 创建评估模板
  createTemplate: (data: any) => 
    genericAPI.post('/evaluations/templates', data),
  
  // 更新评估模板
  updateTemplate: (id: string, data: any) => 
    genericAPI.put(`/evaluations/templates/${id}`, data),
  
  // 删除评估模板
  deleteTemplate: (id: string) => 
    genericAPI.delete(`/evaluations/templates/${id}`)
};

// 教师分组相关API
const teacherGroups = {
  // 获取教师分组列表
  getAll: (params?: any) => genericAPI.get('/teacher-groups', params),
  
  // 获取单个教师分组
  getById: (id: string) => genericAPI.get(`/teacher-groups/${id}`),
  
  // 创建教师分组
  create: (data: any) => genericAPI.post('/teacher-groups', data),
  
  // 更新教师分组
  update: (id: string, data: any) => genericAPI.put(`/teacher-groups/${id}`, data),
  
  // 删除教师分组
  delete: (id: string) => genericAPI.delete(`/teacher-groups/${id}`),
  
  // 添加成员
  addMember: (groupId: string, teacherId: string) => genericAPI.post(`/teacher-groups/${groupId}/members`, { teacherId }),
  
  // 移除成员
  removeMember: (groupId: string, teacherId: string) => genericAPI.delete(`/teacher-groups/${groupId}/members/${teacherId}`),
  
  // 设置组长
  setLeader: (groupId: string, teacherId: string) => genericAPI.put(`/teacher-groups/${groupId}/leader`, { teacherId }),
  
  // 获取分组活动
  getActivities: (groupId: string, params?: any) => genericAPI.get(`/teacher-groups/${groupId}/activities`, params),
  
  // 创建分组活动
  createActivity: (groupId: string, data: any) => genericAPI.post(`/teacher-groups/${groupId}/activities`, data),
  
  // 获取分组讨论
  getDiscussions: (groupId: string, params?: any) => genericAPI.get(`/teacher-groups/${groupId}/discussions`, params),
  
  // 创建分组讨论
  createDiscussion: (groupId: string, data: any) => genericAPI.post(`/teacher-groups/${groupId}/discussions`, data),
  
  // 回复讨论
  replyDiscussion: (groupId: string, discussionId: string, data: any) => 
    genericAPI.post(`/teacher-groups/${groupId}/discussions/${discussionId}/replies`, data)
};

// 课程相关API
const courses = {
  getAll: (params?: any, signal?: AbortSignal) => {
    return genericAPI.get('/api/courses', params, { signal });
  },
  getById: (id: string) => {
    return genericAPI.get(`/api/courses/${id}`);
  },
  create: (data: any) => {
    return genericAPI.post('/api/courses', data);
  },
  update: (id: string, data: any) => {
    return genericAPI.put(`/api/courses/${id}`, data);
  },
  delete: (id: string) => {
    return genericAPI.delete(`/api/courses/${id}`);
  },
  getCategories: (signal?: AbortSignal) => {
    return genericAPI.get('/api/courses/categories', undefined, { signal });
  },
  createCategory: (name: string) => {
    return genericAPI.post('/api/courses/categories', { name });
  },
  getChapters: (courseId: string) => {
    return genericAPI.get(`/api/courses/${courseId}/chapters`);
  },
  createChapter: (courseId: string, data: any) => {
    return genericAPI.post(`/api/courses/${courseId}/chapters`, data);
  },
  updateChapter: (courseId: string, chapterId: string, data: any) => {
    return genericAPI.put(`/api/courses/${courseId}/chapters/${chapterId}`, data);
  },
  deleteChapter: (courseId: string, chapterId: string) => {
    return genericAPI.delete(`/api/courses/${courseId}/chapters/${chapterId}`);
  },
  getLessons: (courseId: string, chapterId: string) => {
    return genericAPI.get(`/api/courses/${courseId}/chapters/${chapterId}/lessons`);
  },
  createLesson: (courseId: string, chapterId: string, data: any) => {
    return genericAPI.post(`/api/courses/${courseId}/chapters/${chapterId}/lessons`, data);
  },
  updateLesson: (courseId: string, chapterId: string, lessonId: string, data: any) => {
    return genericAPI.put(`/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`, data);
  },
  deleteLesson: (courseId: string, chapterId: string, lessonId: string) => {
    return genericAPI.delete(`/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`);
  },
  getEnrollments: (courseId: string, params?: any) => {
    return genericAPI.get(`/api/courses/${courseId}/enrollments`, params);
  },
  enroll: (courseId: string) => {
    return genericAPI.post(`/api/courses/${courseId}/enroll`);
  },
  unenroll: (courseId: string) => {
    return genericAPI.delete(`/api/courses/${courseId}/enroll`);
  }
};

// 上传相关API
const uploads = {
  // 上传文件
  uploadFile: async (formData: FormData, onProgress?: (percentage: number) => void) => {
    try {
      const response = await genericAPI.upload('/courses/uploads', formData, onProgress);
      return response;
    } catch (error) {
      console.error('上传文件失败', error);
      throw error;
    }
  }
};

// 完整的API服务
const apiService = {
  ...genericAPI,
  notifications,
  exams,
  knowledgeGraph,
  evaluations,
  teacherGroups,
  courses,
  uploads
};

export default apiService; 