import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import mockService from '../services/mockService';
import config from '../config/env';

// 定义API基础URL
const apiBaseUrl = config.API_BASE_URL;

// 定义API处理程序
const handlers = [
  // 健康检查API
  http.get(`${apiBaseUrl}/health`, () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: 'development'
    });
  }),

  // 登录API
  http.post(`${apiBaseUrl}/auth/login`, async ({ request }) => {
    try {
      const body = await request.json();
      const { Email, Password } = body;
      
      console.log('模拟服务器收到登录请求:', { Email, Password });
      
      // 特殊处理admin用户
      if (Email === 'admin') {
        console.log('模拟服务器: 管理员登录成功');
        return HttpResponse.json({
          token: 'mock-jwt-token-admin-' + Date.now(),
          userId: '1',
          username: 'admin',
          name: '管理员',
          role: 'admin',
          email: 'admin@example.com'
        });
      }
      
      // 其他用户通过mockService处理
      try {
        const response = await mockService.login(Email, Password);
        console.log('模拟服务器: 登录成功', response);
        return HttpResponse.json(response);
      } catch (error: any) {
        console.log('模拟服务器: 登录失败', error.message);
        return new HttpResponse(
          JSON.stringify({
            statusCode: 401,
            message: error.message || '用户名或密码错误'
          }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (error: any) {
      console.error('模拟服务器: 处理登录请求时出错', error);
      return new HttpResponse(
        JSON.stringify({
          statusCode: 400,
          message: '请求格式错误'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }),

  // 获取课程列表API
  http.get(`${apiBaseUrl}/courses`, async ({ request }) => {
    try {
      const url = new URL(request.url);
      const pageIndex = Number(url.searchParams.get('pageIndex') || '1');
      const pageSize = Number(url.searchParams.get('pageSize') || '10');
      
      const response = await mockService.getCourses(pageIndex, pageSize);
      return HttpResponse.json(response);
    } catch (error) {
      console.error('模拟服务器: 处理课程列表请求时出错', error);
      return new HttpResponse(
        JSON.stringify({
          items: [],
          totalCount: 0,
          pageIndex: 1,
          pageSize: 10
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }),

  // 获取课程详情API
  http.get(`${apiBaseUrl}/courses/:courseId`, async ({ params }) => {
    try {
      const { courseId } = params;
      
      try {
        const response = await mockService.getCourseById(courseId as string);
        return HttpResponse.json(response);
      } catch (error: any) {
        return new HttpResponse(
          JSON.stringify({
            statusCode: 404,
            message: error.message || '课程不存在'
          }),
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (error) {
      console.error('模拟服务器: 处理课程详情请求时出错', error);
      return new HttpResponse(
        JSON.stringify({
          statusCode: 500,
          message: '服务器内部错误'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }),

  // 获取课程学生列表API
  http.get(`${apiBaseUrl}/courses/:courseId/students`, async ({ request, params }) => {
    try {
      const url = new URL(request.url);
      const pageIndex = Number(url.searchParams.get('pageIndex') || '1');
      const pageSize = Number(url.searchParams.get('pageSize') || '10');
      
      return HttpResponse.json({
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
      });
    } catch (error) {
      console.error('模拟服务器: 处理课程学生列表请求时出错', error);
      return new HttpResponse(
        JSON.stringify({
          items: [],
          totalCount: 0,
          pageIndex: 1,
          pageSize: 10
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }),

  // 选课API
  http.post(`${apiBaseUrl}/courses/:courseId/enroll`, async ({ params }) => {
    try {
      const { courseId } = params;
      
      return HttpResponse.json({
        success: true,
        message: '选课成功',
        courseId
      });
    } catch (error) {
      console.error('模拟服务器: 处理选课请求时出错', error);
      return new HttpResponse(
        JSON.stringify({
          success: false,
          message: '选课失败'
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }),

  // 获取课程进度API
  http.get(`${apiBaseUrl}/courses/:courseId/progress`, () => {
    try {
      return HttpResponse.json({
        progress: Math.floor(Math.random() * 100),
        lastStudyTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('模拟服务器: 处理课程进度请求时出错', error);
      return new HttpResponse(
        JSON.stringify({
          progress: 0,
          lastStudyTime: new Date().toISOString()
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  })
];

// 启动模拟服务器
export const startMockServer = () => {
  try {
    if (config.USE_MOCK_DATA) {
      console.log('启用模拟数据，启动模拟服务器...');
      const worker = setupWorker(...handlers);
      worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js'
        }
      }).catch(error => {
        console.error('模拟服务器启动失败:', error);
      });
      
      // 导出worker实例，方便在其他地方使用
      (window as any).__mockWorker = worker;
      console.log('模拟服务器启动成功');
      return true;
    } else {
      console.log('未启用模拟数据');
      return false;
    }
  } catch (error) {
    console.error('启动模拟服务器出错:', error);
    return false;
  }
};

export default {
  startMockServer
}; 