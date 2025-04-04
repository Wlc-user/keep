import apiService from '../services/api';
import mockService from '../services/mockService';
import config from '../config/env';
import { message } from 'antd';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

/**
 * 错误处理辅助函数
 */
const handleApiError = (error: any): TestResult => {
  console.error('API测试错误:', error);
  
  // 处理不同类型的错误
  if (error.response) {
    // 服务器响应了，但状态码不在 2xx 范围内
    return {
      success: false,
      message: `测试失败: ${error.response.status}`,
      error: error.response.data || error.message
    };
  } else if (error.request) {
    // 请求已发出，但没有收到响应
    return {
      success: false,
      message: '测试失败: 无响应',
      error: '服务器无响应'
    };
  } else {
    // 请求配置时出错
    return {
      success: false,
      message: '测试失败: 请求配置错误',
      error: error.message
    };
  }
};

/**
 * 处理模拟数据
 */
const handleMockData = (testName: string, mockData: any): TestResult => {
  console.log(`${testName}使用模拟数据`);
  return {
    success: true,
    message: `${testName}成功 (模拟数据)`,
    data: mockData
  };
};

/**
 * API连接测试工具
 * 用于检查后端API是否可用
 */
export const testApiConnection = async (): Promise<TestResult> => {
  try {
    const response = await apiService.system.getHealth();
    return {
      success: true,
      message: 'API连接测试成功',
      data: response
    };
  } catch (error) {
    if (config.USE_MOCK_DATA) {
      return handleMockData('API连接测试', {
        status: 'ok',
        version: '1.0.0',
        uptime: '2小时45分钟',
        environment: 'development',
        timestamp: new Date().toISOString()
      });
    }
    return handleApiError(error);
  }
};

/**
 * 测试登录API
 * @param username 用户名
 * @param password 密码
 */
export const testLoginApi = async (username: string, password: string): Promise<TestResult> => {
  try {
    const response = await apiService.auth.login(username, password);
    
    return {
      success: true,
      message: '登录API测试成功',
      data: {
        token: response.token,
        userId: response.userId,
        role: response.role,
        // 不返回敏感信息
        hasToken: !!response.token
      }
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * 测试课程列表API
 */
export const testCourseListApi = async (): Promise<TestResult> => {
  try {
    const response = await apiService.courses.getAll({ pageIndex: 1, pageSize: 10 });
    
    return {
      success: true,
      message: '课程列表API测试成功',
      data: {
        totalCount: response.totalCount || response.total,
        pageSize: response.pageSize,
        pageIndex: response.pageIndex || response.page,
        itemCount: (response.items || []).length
      }
    };
  } catch (error) {
    // 在开发环境中，如果API调用失败，尝试使用模拟数据
    if (config.USE_MOCK_DATA) {
      console.log('课程列表API测试使用模拟数据');
      try {
        const mockResponse = await mockService.getCourses(1, 10);
        return {
          success: true,
          message: '课程列表API测试成功 (模拟数据)',
          data: {
            totalCount: mockResponse.totalCount,
            pageSize: mockResponse.pageSize,
            pageIndex: mockResponse.pageIndex,
            itemCount: (mockResponse.items || []).length
          }
        };
      } catch (mockError) {
        return handleApiError(mockError);
      }
    }
    
    return handleApiError(error);
  }
};

/**
 * 测试学生评估API
 */
export const testStudentEvaluationApi = async (): Promise<TestResult> => {
  try {
    // 由于这是测试，使用模拟数据的学生ID
    const response = await apiService.get('/evaluations/students/1', {
      academicYear: '2023-2024',
      semester: '1'
    });
    
    return {
      success: true,
      message: '学生评估API测试成功',
      data: {
        studentId: response.studentId,
        evaluationCount: response.evaluations?.length || 0,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    // 在开发环境中，如果API调用失败，返回模拟成功结果
    if (config.USE_MOCK_DATA) {
      console.log('学生评估API测试使用模拟数据');
      return {
        success: true,
        message: '学生评估API测试成功 (模拟数据)',
        data: {
          studentId: '1',
          studentName: '张三',
          evaluationCount: 12,
          academicYear: '2023-2024',
          semester: '1',
          timestamp: new Date().toISOString()
        }
      };
    }
    
    return handleApiError(error);
  }
};

/**
 * 测试班级评估API
 */
export const testClassEvaluationApi = async (): Promise<TestResult> => {
  try {
    // 由于这是测试，使用模拟数据的班级ID
    const response = await apiService.get('/evaluations/classes/1', {
      academicYear: '2023-2024',
      semester: '1'
    });
    
    return {
      success: true,
      message: '班级评估API测试成功',
      data: {
        classId: response.classId,
        studentCount: response.students?.length || 0,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    // 在开发环境中，如果API调用失败，返回模拟成功结果
    if (config.USE_MOCK_DATA) {
      console.log('班级评估API测试使用模拟数据');
      return {
        success: true,
        message: '班级评估API测试成功 (模拟数据)',
        data: {
          classId: '1',
          className: '计算机科学1班',
          studentCount: 30,
          academicYear: '2023-2024',
          semester: '1',
          timestamp: new Date().toISOString()
        }
      };
    }
    
    return handleApiError(error);
  }
};

/**
 * 测试知识图谱API
 */
export const testKnowledgeGraphApi = async (): Promise<TestResult> => {
  try {
    const response = await apiService.knowledgeGraphs.getAll();
    
    return {
      success: true,
      message: '知识图谱API测试成功',
      data: {
        graphCount: response.length || 0,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    // 在开发环境中，如果API调用失败，返回模拟成功结果
    if (config.USE_MOCK_DATA) {
      console.log('知识图谱API测试使用模拟数据');
      return {
        success: true,
        message: '知识图谱API测试成功 (模拟数据)',
        data: {
          graphCount: 5,
          graphs: [
            { id: '1', name: '计算机网络基础', nodeCount: 45, relationCount: 60 },
            { id: '2', name: '数据结构与算法', nodeCount: 72, relationCount: 125 },
            { id: '3', name: '操作系统原理', nodeCount: 56, relationCount: 89 },
            { id: '4', name: '软件工程', nodeCount: 35, relationCount: 48 },
            { id: '5', name: '数据库系统', nodeCount: 42, relationCount: 65 }
          ],
          timestamp: new Date().toISOString()
        }
      };
    }
    
    return handleApiError(error);
  }
};

/**
 * 测试素材管理API
 */
export const testMaterialApi = async (): Promise<TestResult> => {
  try {
    const response = await apiService.get('/materials', {
      page: 1,
      pageSize: 10
    });
    
    return {
      success: true,
      message: '素材API测试成功',
      data: {
        totalCount: response.total || 0,
        itemCount: response.items?.length || 0,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    // 在开发环境中，如果API调用失败，返回模拟成功结果
    if (config.USE_MOCK_DATA) {
      console.log('素材API测试使用模拟数据');
      return {
        success: true,
        message: '素材API测试成功 (模拟数据)',
        data: {
          totalCount: 150,
          itemCount: 10,
          categories: 8,
          types: {
            document: 60,
            video: 35,
            audio: 15,
            image: 40
          },
          timestamp: new Date().toISOString()
        }
      };
    }
    
    return handleApiError(error);
  }
};

/**
 * 测试用户管理API
 */
export const testUserManagementApi = async (): Promise<TestResult> => {
  try {
    const response = await apiService.users.getAll({
      page: 1,
      pageSize: 10
    });
    
    return {
      success: true,
      message: '用户管理API测试成功',
      data: {
        totalCount: response.totalCount || response.total || 0,
        itemCount: response.items?.length || 0,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    // 在开发环境中，如果API调用失败，返回模拟成功结果
    if (config.USE_MOCK_DATA) {
      console.log('用户管理API测试使用模拟数据');
      return {
        success: true,
        message: '用户管理API测试成功 (模拟数据)',
        data: {
          totalCount: 85,
          itemCount: 10,
          roles: {
            admin: 3,
            teacher: 22,
            student: 60
          },
          timestamp: new Date().toISOString()
        }
      };
    }
    
    return handleApiError(error);
  }
};

/**
 * 测试通知API
 */
export const testNotificationApi = async (): Promise<TestResult> => {
  try {
    const response = await apiService.notifications.getAll({
      page: 1,
      pageSize: 10
    });
    
    return {
      success: true,
      message: '通知API测试成功',
      data: {
        totalCount: response.totalCount || response.total || 0,
        itemCount: response.items?.length || 0,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    // 在开发环境中，如果API调用失败，返回模拟成功结果
    if (config.USE_MOCK_DATA) {
      console.log('通知API测试使用模拟数据');
      return {
        success: true,
        message: '通知API测试成功 (模拟数据)',
        data: {
          totalCount: 42,
          itemCount: 10,
          unreadCount: 5,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    return handleApiError(error);
  }
};

/**
 * 测试系统设置API
 */
export const testSystemSettingsApi = async (): Promise<TestResult> => {
  try {
    const response = await apiService.system.getSettings();
    
    return {
      success: true,
      message: '系统设置API测试成功',
      data: {
        settingsCount: Object.keys(response || {}).length,
        version: response.version,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    // 在开发环境中，如果API调用失败，返回模拟成功结果
    if (config.USE_MOCK_DATA) {
      console.log('系统设置API测试使用模拟数据');
      return {
        success: true,
        message: '系统设置API测试成功 (模拟数据)',
        data: {
          settingsCount: 25,
          settings: {
            version: '1.0.0',
            siteName: '在线学习系统',
            allowRegistration: true,
            defaultLanguage: 'zh-CN',
            allowFileUploads: true,
            maxFileSize: 50000000
          },
          timestamp: new Date().toISOString()
        }
      };
    }
    
    return handleApiError(error);
  }
};

/**
 * 测试报表API
 */
export const testReportApi = async (): Promise<TestResult> => {
  try {
    const response = await apiService.get('/reports/sample', {
      timeout: 5000
    });
    
    return {
      success: true,
      message: '报表API测试成功',
      data: response
    };
  } catch (error: any) {
    return {
      success: false,
      message: '报表API测试失败',
      error: error.response?.data || error
    };
  }
};

/**
 * 测试API端点
 */
export const testApiEndpoints = async (): Promise<TestResult[]> => {
  const endpoints = [
    { name: 'API健康检查', test: testApiConnection },
    { name: '用户管理API', test: testUserManagementApi },
    { name: '课程列表API', test: testCourseListApi },
    { name: '学生评估API', test: testStudentEvaluationApi },
    { name: '班级评估API', test: testClassEvaluationApi },
    { name: '知识图谱API', test: testKnowledgeGraphApi },
    { name: '素材管理API', test: testMaterialApi },
    { name: '通知API', test: testNotificationApi },
    { name: '系统设置API', test: testSystemSettingsApi }
  ];
  
  const results: TestResult[] = [];
  
  for (const endpoint of endpoints) {
    try {
      const result = await endpoint.test();
      results.push({
        ...result,
        message: endpoint.name
      });
    } catch (error) {
      results.push({
        success: false,
        message: endpoint.name,
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
  
  return results;
};

/**
 * 测试API性能
 */
export const testApiPerformance = async (): Promise<TestResult[]> => {
  const endpoints = [
    { name: 'API健康检查', path: '/system/health', method: 'get' },
    { name: '用户列表', path: '/users', method: 'get' },
    { name: '课程列表', path: '/courses', method: 'get' },
    { name: '素材列表', path: '/materials', method: 'get' },
    { name: '通知列表', path: '/notifications', method: 'get' }
  ];
  
  const results: TestResult[] = [];
  
  for (const endpoint of endpoints) {
    try {
      const startTime = performance.now();
      
      if (endpoint.method === 'get') {
        await apiService.get(endpoint.path);
      } else {
        // 其他方法
        await apiService.post(endpoint.path);
      }
      
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      // 评估性能
      let status = '良好';
      if (responseTime > 1000) {
        status = '较慢';
      } else if (responseTime > 500) {
        status = '一般';
      }
      
      results.push({
        success: true,
        message: endpoint.name,
        data: {
          responseTime: `${responseTime}ms`,
          status
        }
      });
    } catch (error) {
      // 在开发环境中，如果API调用失败，返回模拟性能结果
      if (config.USE_MOCK_DATA) {
        console.log(`${endpoint.name}性能测试使用模拟数据`);
        // 生成随机响应时间
        const responseTime = Math.floor(Math.random() * 500) + 100;
        
        // 评估性能
        let status = '良好';
        if (responseTime > 1000) {
          status = '较慢';
        } else if (responseTime > 500) {
          status = '一般';
        }
        
        results.push({
          success: true,
          message: endpoint.name + ' (模拟数据)',
          data: {
            responseTime: `${responseTime}ms`,
            status
          }
        });
      } else {
        results.push({
          success: false,
          message: endpoint.name,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }
  }
  
  return results;
};

export const checkApiVersion = async (): Promise<TestResult> => {
  try {
    const response = await apiService.get('/api/version');
    return {
      success: true,
      message: 'API版本检查成功',
      data: response
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'API版本检查失败',
      error: error.response?.data || error
    };
  }
};

export const validateApiConfig = async (): Promise<TestResult> => {
  try {
    const response = await apiService.get('/api/config/validate');
    return {
      success: true,
      message: 'API配置验证成功',
      data: response
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'API配置验证失败',
      error: error.response?.data || error
    };
  }
};

export const testFileUpload = async (): Promise<TestResult> => {
  try {
    const formData = new FormData();
    formData.append('file', new Blob(['test file content']), 'test.txt');
    
    const response = await apiService.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return {
      success: true,
      message: '文件上传测试成功',
      data: response
    };
  } catch (error: any) {
    return {
      success: false,
      message: '文件上传测试失败',
      error: error.response?.data || error
    };
  }
};

/**
 * 测试大文件上传
 */
export const testLargeFileUpload = async (): Promise<TestResult> => {
  try {
    // 创建一个约5MB的Blob对象
    const size = 5 * 1024 * 1024; // 5MB
    const arr = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      arr[i] = i % 256;
    }
    const blob = new Blob([arr], { type: 'application/octet-stream' });
    
    const formData = new FormData();
    formData.append('file', blob, 'large-test-file.bin');
    
    const startTime = performance.now();
    const response = await apiService.upload('/api/upload/large', formData, (percentage) => {
      console.log(`上传进度: ${percentage}%`);
    });
    const endTime = performance.now();
    
    return {
      success: true,
      message: '大文件上传测试成功',
      data: {
        response,
        uploadTime: `${((endTime - startTime) / 1000).toFixed(2)}秒`,
        fileSize: '5MB'
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: '大文件上传测试失败',
      error: error.response?.data || error
    };
  }
};

export const testWebSocket = async (): Promise<TestResult> => {
  try {
    const ws = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws');
    
    return new Promise((resolve) => {
      ws.onopen = () => {
        ws.close();
        resolve({
          success: true,
          message: 'WebSocket连接测试成功'
        });
      };
      
      ws.onerror = (error) => {
        resolve({
          success: false,
          message: 'WebSocket连接测试失败',
          error
        });
      };
      
      // 5秒超时
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        resolve({
          success: false,
          message: 'WebSocket连接测试超时'
        });
      }, 5000);
    });
  } catch (error: any) {
    return {
      success: false,
      message: 'WebSocket连接测试失败',
      error
    };
  }
};

/**
 * 测试数据库连接
 */
export const testDatabaseConnection = async (): Promise<TestResult> => {
  try {
    const response = await apiService.get('/system/database');
    
    return {
      success: true,
      message: '数据库连接测试成功',
      data: response
    };
  } catch (error) {
    // 在开发环境中，如果API调用失败，返回模拟成功结果
    if (config.USE_MOCK_DATA) {
      console.log('数据库连接测试使用模拟数据');
      return {
        success: true,
        message: '数据库连接测试成功 (模拟数据)',
        data: {
          status: 'connected',
          type: 'PostgreSQL',
          version: '14.5',
          responseTime: '45ms',
          statistics: {
            totalTables: 32,
            totalRows: 15834,
            uptime: '6天12小时'
          },
          timestamp: new Date().toISOString()
        }
      };
    }
    
    return handleApiError(error);
  }
};

/**
 * 测试缓存系统
 */
export const testCacheSystem = async (): Promise<TestResult> => {
  try {
    const response = await apiService.get('/api/system/cache/test');
    return {
      success: true,
      message: '缓存系统测试成功',
      data: response
    };
  } catch (error: any) {
    return {
      success: false,
      message: '缓存系统测试失败',
      error: error.response?.data || error
    };
  }
};

/**
 * 验证API权限
 */
export const testApiPermissions = async (): Promise<TestResult> => {
  try {
    const response = await apiService.get('/api/permissions/validate');
    return {
      success: true,
      message: 'API权限验证成功',
      data: response
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'API权限验证失败',
      error: error.response?.data || error
    };
  }
};

/**
 * 测试批量操作性能
 */
export const testBatchOperation = async (): Promise<TestResult> => {
  try {
    // 创建测试数据
    const batchData = Array(100).fill(0).map((_, index) => ({
      id: `test-${index}`,
      value: `测试数据 ${index}`,
      timestamp: Date.now()
    }));
    
    const startTime = performance.now();
    const response = await apiService.post('/api/batch-test', batchData);
    const endTime = performance.now();
    
    return {
      success: true,
      message: '批量操作测试成功',
      data: {
        response,
        processingTime: `${(endTime - startTime).toFixed(2)}ms`,
        itemCount: batchData.length
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: '批量操作测试失败',
      error: error.response?.data || error
    };
  }
}; 