import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';
import config from '../config/env';
import mockService from './mockService';

// API请求配置
const DEFAULT_CONFIG: AxiosRequestConfig = {
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  }
};

/**
 * API服务类
 * 处理所有对后端的请求
 */
class ApiService {
  private instance: AxiosInstance;
  public isMockEnabled: boolean;

  constructor(config: AxiosRequestConfig & { USE_MOCK_DATA?: boolean }) {
    this.instance = axios.create(config);
    this.isMockEnabled = config.USE_MOCK_DATA === true;
    
    this.setupInterceptors();
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
// 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 获取存储的令牌
    const token = localStorage.getItem('token');
    if (token && config.headers) {
          // 将令牌添加到请求头
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
      (error) => {
        console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        // 处理成功响应
        return this.handleSuccessResponse(response);
      },
      (error) => {
        // 处理错误响应
        return this.handleErrorResponse(error);
      }
    );
  }

  /**
   * 处理成功的响应
   * @param response Axios响应对象
   * @returns 处理后的数据
   * @private
   */
  private handleSuccessResponse(response: AxiosResponse): any {
    if (!response || !response.data) {
      throw new Error('响应数据为空');
    }

    // 处理标准API响应格式
    if (response.data.hasOwnProperty('code') && response.data.hasOwnProperty('data')) {
      const { code, message, data } = response.data;
      
      // 如果返回的代码不是成功，抛出错误
      if (code !== 200 && code !== 0) {
        const error = new Error(message || '请求失败');
        (error as any).code = code;
        (error as any).response = response;
        throw error;
      }
      
      return data;
    }
    
    // 如果不是标准格式，直接返回数据
    return response.data;
  }

  /**
   * 处理错误响应
   * @param error Axios错误对象
   * @returns 拒绝的Promise
   * @private
   */
  private handleErrorResponse(error: any): Promise<never> {
    console.error('API请求错误:', error);
    
    let message = '请求失败，请稍后重试';
    let code = 'UNKNOWN_ERROR';
    let details = null;
    
    if (error.response) {
      // 服务器响应了，但状态码不在 2xx 范围内
      const { status } = error.response;
      
      switch (status) {
        case 401:
          message = '未登录或登录已过期，请重新登录';
          code = 'UNAUTHORIZED';
          // 可以在此触发登出操作
          break;
        case 403:
          message = '您没有权限访问此资源';
          code = 'FORBIDDEN';
          break;
        case 404:
          message = '请求的资源不存在';
          code = 'NOT_FOUND';
          break;
        case 500:
          message = '服务器错误，请联系管理员';
          code = 'SERVER_ERROR';
          break;
        default:
          message = error.response.data?.message || `请求失败，状态码: ${status}`;
          code = `HTTP_ERROR_${status}`;
      }
      
      details = error.response.data;
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      message = '服务器无响应，请检查您的网络连接';
      code = 'NO_RESPONSE';
    } else {
      // 请求配置时出错
      message = error.message || '请求配置错误';
      code = 'REQUEST_SETUP_ERROR';
    }
    
    // 创建统一的错误对象
    const apiError: any = new Error(message);
    apiError.code = code;
    apiError.details = details;
    apiError.originalError = error;
    
    // 返回被拒绝的Promise
    return Promise.reject(apiError);
  }

  /**
   * 处理所有类型的请求
   */
  private async handleRequest<T>(
    method: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { useMock?: boolean }
  ): Promise<T> {
    // 使用环境配置中的 USE_MOCK_DATA 作为默认值
    const useMock = config?.useMock !== undefined ? config.useMock : this.isMockEnabled;
    
    // 如果启用了模拟数据，直接使用模拟数据，不尝试调用真实API
    if (useMock) {
      console.log(`${method} ${url} 使用模拟数据模式`);
      
      // 尝试获取模拟数据
      const mockData = await this.mockRequest(method, url, data);
      if (mockData !== null) {
        console.log(`${method} ${url} 成功获取模拟数据`);
        return mockData as T;
      }
      
      // 如果没有匹配的模拟数据，返回一个默认响应
      console.warn(`${method} ${url} 没有匹配的模拟数据，返回空响应`);
      return {} as T;
    } else {
      // 尝试调用真实API，如果失败则回退到模拟数据
      try {
        // 正常API调用流程
        const response = await this._request(method, url, data, config);
        return this.handleSuccessResponse(response);
      } catch (error) {
        console.warn(`${method} ${url} 真实API请求失败，尝试使用模拟数据`, error);
        
        // 如果配置允许在API失败时回退到模拟数据
        if (config.API_BASE_URL && config.API_BASE_URL.includes('localhost')) {
          console.log(`本地开发环境：${method} ${url} 回退到模拟数据`);
          const mockData = await this.mockRequest(method, url, data);
          if (mockData !== null) {
            console.log(`${method} ${url} 成功获取模拟数据（回退）`);
            return mockData as T;
          }
        }
        
        // 如果没有模拟数据或不允许回退，则继续抛出错误
        return this.handleErrorResponse(error);
      }
    }
  }

  /**
   * 尝试使用mock服务
   */
  private async mockRequest(method: string, url: string, data?: any): Promise<any | null> {
    console.log(`[Mock API] ${method.toUpperCase()} ${url}`);
    
    // 延迟以模拟网络请求
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
    
    // 认证相关API
    if (url.startsWith('/auth')) {
      const authPath = url.replace('/auth', '');
      
      if (authPath === '/login' && method === 'post') {
        const { username, password } = data;
        return mockService.login(username, password);
      }
      
      if (authPath === '/register' && method === 'post') {
        return { success: true, message: '注册成功', user: data };
      }
      
      return null;
    }
    
    // 课程相关API
    if (url.startsWith('/courses')) {
      // 处理获取课程列表
      if (url === '/courses' && method === 'get') {
        const { page = 1, pageSize = 10 } = data || {};
        return mockService.getCourses(Number(page), Number(pageSize));
      }
      
      // 处理获取单个课程
      const courseMatch = url.match(/\/courses\/([^\/]+)$/);
      if (courseMatch && method === 'get') {
        const courseId = courseMatch[1];
        return mockService.getCourseById(courseId);
      }
      
      return null;
    }
    
    // 文件上传API
    if (url.startsWith('/api/upload')) {
      const { checkChunkUploadStatus, uploadChunk, mergeChunks } = await import('./mockUploadService');
      
      // 检查分片上传状态
      if (url === '/api/upload/check' && method === 'get') {
        const { fileHash } = data;
        return checkChunkUploadStatus(fileHash);
      }
      
      // 上传文件分片
      if (url === '/api/upload/chunk' && method === 'post') {
        // 从FormData中提取参数
        const file = data.get('file');
        const fileHash = data.get('fileHash');
        const filename = data.get('filename');
        const chunkIndex = parseInt(data.get('chunkIndex'), 10);
        const chunkSize = parseInt(data.get('chunkSize'), 10);
        const chunkCount = parseInt(data.get('chunkCount'), 10);
        const fileSize = parseInt(data.get('fileSize'), 10);
        
        return uploadChunk({
          file,
          fileHash,
          filename,
          chunkIndex,
          chunkSize,
          chunkCount,
          fileSize
        });
      }
      
      // 合并文件分片
      if (url === '/api/upload/merge' && method === 'post') {
        return mergeChunks(data);
      }
      
      return null;
    }
    
    // 没有匹配的mock服务
    return null;
  }

  /**
   * GET请求
   */
  public get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>('get', url, params, config);
  }

  /**
   * POST请求
   */
  public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>('post', url, data, config);
  }

  /**
   * PUT请求
   */
  public put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>('put', url, data, config);
  }

  /**
   * DELETE请求
   */
  public delete<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>('delete', url, params, config);
  }

  /**
   * PATCH请求
   */
  public patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>('patch', url, data, config);
  }

  /**
   * 上传文件
   */
  public upload<T>(url: string, formData: FormData, onProgress?: (percentage: number) => void): Promise<T> {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      }
    };
    
    return this.post<T>(url, formData, config);
  }

  /**
   * 下载文件
   */
  public download(url: string, params?: any): Promise<Blob> {
    const config: AxiosRequestConfig = {
      responseType: 'blob'
    };
    
    return this.get(url, params, config);
  }

  /**
   * 认证相关API
   */
  public auth = {
    login: async (username: string, password: string): Promise<any> => {
      // 首先检查是否启用了模拟数据模式
      if (this.isMockEnabled) {
        console.log('使用模拟登录数据 - 模拟数据模式已启用');
        
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 模拟登录成功
        const userData = {
          token: `mock-jwt-token-${Date.now()}`,
          userId: '1',
          username: username,
          name: username === 'admin' ? '管理员' : 
                username === 'teacher' ? '张教授' : '李同学',
          role: username === 'admin' ? 'admin' : 
                username === 'teacher' ? 'teacher' : 'student',
          email: `${username}@example.com`
        };
        
        console.log('模拟登录成功:', userData);
        return userData;
      }
      
      // 如果未启用模拟数据，则正常发送API请求
      try {
        const response = await this.post('/User/login', { username, password });
        return response;
      } catch (error) {
        console.error('登录失败:', error);
        // 如果是网络错误，返回更友好的错误信息
        if (error.message === 'Network Error') {
          throw new Error('服务器无响应，请检查您的网络连接');
        }
        throw error;
      }
    },
    register: (data: any) => {
      return this.post('/User/register', data);
    },
    forgotPassword: (email: string) => {
      return this.post('/User/forgot-password', { email });
    },
    resetPassword: (token: string, password: string) => {
      return this.post('/User/reset-password', { token, password });
    },
    refreshToken: () => {
      return this.post('/User/refresh-token');
    },
    checkEmailExists: (email: string) => {
      return this.get('/User/check-email', { email });
    }
  };

  /**
   * 课程相关API
   */
  public courses = {
    getAll: (params?: any) => {
      return this.get('/courses', params);
    },
    getById: (id: string) => {
      return this.get(`/courses/${id}`);
    },
    create: (data: any) => {
      return this.post('/courses', data);
    },
    update: (id: string, data: any) => {
      return this.put(`/courses/${id}`, data);
    },
    delete: (id: string) => {
      return this.delete(`/courses/${id}`);
    },
    enroll: (courseId: string) => {
      return this.post(`/courses/${courseId}/enroll`);
    },
    unenroll: (courseId: string) => {
      return this.delete(`/courses/${courseId}/enroll`);
    },
    getStudents: (courseId: string, params?: any) => {
      return this.get(`/courses/${courseId}/students`, params);
    },
    getMaterials: (courseId: string) => {
      return this.get(`/courses/${courseId}/materials`);
    },
    getProgress: (courseId: string) => {
      return this.get(`/courses/${courseId}/progress`);
    },
    updateProgress: (courseId: string, data: any) => {
      return this.post(`/courses/${courseId}/progress`, data);
    }
  };

  /**
   * 用户相关API
   */
  public users = {
    getAll: (params?: any) => {
      return this.get('/users', params);
    },
    getById: (id: string) => {
      return this.get(`/users/${id}`);
    },
    create: (data: any) => {
      return this.post('/users', data);
    },
    update: (id: string, data: any) => {
      return this.put(`/users/${id}`, data);
    },
    delete: (id: string) => {
      return this.delete(`/users/${id}`);
    },
    updateProfile: (data: any) => {
      return this.put('/users/profile', data);
    },
    changePassword: (data: any) => {
      return this.put('/users/password', data);
    }
  };

  /**
   * 素材相关API
   */
  public materials = {
    getAll: (params?: any) => {
      return this.get('/materials', params);
    },
    getById: (id: string) => {
      return this.get(`/materials/${id}`);
    },
    create: (data: any) => {
      return this.post('/materials', data);
    },
    update: (id: string, data: any) => {
      return this.put(`/materials/${id}`, data);
    },
    delete: (id: string) => {
      return this.delete(`/materials/${id}`);
    },
    approve: (id: string, approved: boolean, comment?: string) => {
      return this.put(`/materials/${id}/approve`, { approved, comment });
    },
    search: (params?: any) => {
      return this.get('/materials/search', params);
    },
    upload: (formData: FormData, onProgress?: (percentage: number) => void) => {
      return this.upload('/materials/upload', formData, onProgress);
    },
    download: (id: string) => {
      return this.download(`/materials/${id}/download`);
    },
    incrementViewCount: (id: string) => {
      return this.post(`/materials/${id}/view`);
    }
  };

  /**
   * 文件上传相关API
   */
  public uploads = {
    // 检查分片上传状态
    checkChunkStatus: (fileHash: string) => {
      return this.get('/api/upload/check', { fileHash });
    },
    
    // 上传文件分片
    uploadChunk: (formData: FormData, onProgress?: (percentage: number) => void) => {
      return this.upload('/api/upload/chunk', formData, onProgress);
    },
    
    // 合并文件分片
    mergeChunks: (params: {
      fileHash: string;
      filename: string;
      fileSize: number;
      chunkCount: number;
    }) => {
      return this.post('/api/upload/merge', params);
    },
    
    // 取消上传
    cancelUpload: (fileHash: string) => {
      return this.delete('/api/upload/cancel', { fileHash });
    }
  };

  /**
   * 分类相关API
   */
  public categories = {
    getAll: () => {
      return this.get('/categories');
    },
    getById: (id: string) => {
      return this.get(`/categories/${id}`);
    },
    create: (data: any) => {
      return this.post('/categories', data);
    },
    update: (id: string, data: any) => {
      return this.put(`/categories/${id}`, data);
    },
    delete: (id: string) => {
      return this.delete(`/categories/${id}`);
    }
  };

  /**
   * 评价相关API
   */
  public evaluations = {
    getStudentEvaluation: (studentId: string, params?: any) => {
      return this.get(`/evaluations/students/${studentId}`, params);
    },
    getClassEvaluation: (classId: string, params?: any) => {
      return this.get(`/evaluations/classes/${classId}`, params);
    },
    saveStudentEvaluation: (data: any) => {
      return this.post('/evaluations/students', data);
    },
    getEvaluationHistory: (studentId: string, params?: any) => {
      return this.get(`/evaluations/students/${studentId}/history`, params);
    },
    exportEvaluation: (studentId: string, format: string) => {
      return this.download(`/evaluations/students/${studentId}/export`, { format });
    }
  };

  /**
   * 通知相关API
   */
  public notifications = {
    getAll: (params?: any) => {
      return this.get('/notifications', params);
    },
    getById: (id: string) => {
      return this.get(`/notifications/${id}`);
    },
    markAsRead: (id: string) => {
      return this.put(`/notifications/${id}/read`);
    },
    markAllAsRead: () => {
      return this.put('/notifications/read-all');
    },
    getUnreadCount: () => {
      return this.get('/notifications/unread-count');
    }
  };

  /**
   * 系统相关API
   */
  public system = {
    getSettings: () => {
      return this.get('/system/settings');
    },
    updateSettings: (data: any) => {
      return this.put('/system/settings', data);
    },
    getHealth: () => {
      return this.get('/system/health');
    },
    getLogs: (params?: any) => {
      return this.get('/system/logs', params);
    }
  };

  /**
   * 知识图谱相关API
   */
  public knowledgeGraphs = {
    getAll: (params?: any) => {
      return this.get('/knowledge-graphs', params);
    },
    getById: (id: string) => {
      return this.get(`/knowledge-graphs/${id}`);
    },
    create: (data: any) => {
      return this.post('/knowledge-graphs', data);
    },
    update: (id: string, data: any) => {
      return this.put(`/knowledge-graphs/${id}`, data);
    },
    delete: (id: string) => {
      return this.delete(`/knowledge-graphs/${id}`);
    },
    getPaths: (graphId: string) => {
      return this.get(`/knowledge-graphs/${graphId}/paths`);
    },
    createPath: (graphId: string, data: any) => {
      return this.post(`/knowledge-graphs/${graphId}/paths`, data);
    },
    updatePath: (graphId: string, pathId: string, data: any) => {
      return this.put(`/knowledge-graphs/${graphId}/paths/${pathId}`, data);
    },
    deletePath: (graphId: string, pathId: string) => {
      return this.delete(`/knowledge-graphs/${graphId}/paths/${pathId}`);
    }
  };

  /**
   * 发送实际的 API 请求
   * @param method HTTP 方法
   * @param url 请求路径
   * @param data 请求数据
   * @param config 请求配置
   * @returns API 响应
   * @private
   */
  private async _request(
    method: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse> {
    const fullConfig = { ...config };
    let response;

    switch (method.toLowerCase()) {
      case 'get':
        response = await this.instance.get(url, { ...fullConfig, params: data });
        break;
      case 'post':
        response = await this.instance.post(url, data, fullConfig);
        break;
      case 'put':
        response = await this.instance.put(url, data, fullConfig);
        break;
      case 'delete':
        response = await this.instance.delete(url, { ...fullConfig, params: data });
        break;
      case 'patch':
        response = await this.instance.patch(url, data, fullConfig);
        break;
      default:
        throw new Error(`不支持的HTTP方法: ${method}`);
    }

    return response;
  }
}

// 创建API服务实例
const apiService = new ApiService(DEFAULT_CONFIG);

export default apiService; 
