import { Notification, NotificationType } from '../components/NotificationCenter';
import apiService from './apiService';
import dayjs from 'dayjs';
import config from '../config/env'; // 导入环境配置
import { INotification } from '../components/NotificationItem';
import mockDataLoader from '../utils/mockDataLoader';
import axios from 'axios';

// 定义API调用状态，用于统计和监控
interface ApiCallStatus {
  lastCallTime: number; // 最后一次调用时间戳
  successCount: number; // 成功次数
  failureCount: number; // 失败次数
  lastErrorMessage?: string; // 最后一次错误信息
  isUsingMockData: boolean; // 是否正在使用模拟数据
  authErrorCount: number; // 认证错误次数
}

/**
 * 消息通知服务类
 * 处理所有与通知相关的API调用和数据逻辑
 */
class NotificationService {
  private apiStatus: ApiCallStatus = {
    lastCallTime: 0,
    successCount: 0,
    failureCount: 0,
    isUsingMockData: false,
    authErrorCount: 0
  };
  
  private readonly MAX_FAILURES_BEFORE_MOCK = 3; // 3次失败后切换到模拟数据
  private readonly RETRY_DELAY_MS = 30000; // 30秒后再尝试真实API
  
  // 修改路径，确保路径前缀正确
  private readonly PUBLIC_NOTIFICATION_API = '/api/notifications/public';
  
  private abortControllerMap = new Map<string, AbortController>();
  
  /**
   * 获取服务状态
   */
  getStatus(): ApiCallStatus {
    return { ...this.apiStatus };
  }
  
  /**
   * 重置服务状态，强制下次调用尝试实际API
   */
  resetStatus(): void {
    this.apiStatus = {
      lastCallTime: 0,
      successCount: 0,
      failureCount: 0,
      isUsingMockData: false,
      authErrorCount: 0
    };
    console.log('通知服务状态已重置，将在下次调用时尝试实际API');
  }
  
  /**
   * 判断是否应该使用模拟数据
   * @returns 是否应该使用模拟数据
   */
  private shouldUseMockData(): boolean {
    // 如果没有配置真实API或明确启用了模拟数据
    if (config.USE_MOCK_DATA) {
      return true;
    }
    
    // 如果最近API调用失败且尚未超过重试时间
    if (this.apiStatus.failureCount > this.MAX_FAILURES_BEFORE_MOCK) {
      const timeSinceLastCall = Date.now() - this.apiStatus.lastCallTime;
      
      // 如果距离上次调用时间不足重试延迟时间，且之前使用了模拟数据，则继续使用
      if (timeSinceLastCall < this.RETRY_DELAY_MS && this.apiStatus.isUsingMockData) {
      return true;
    }
    }
    
    return false;
  }
  
  /**
   * 处理API调用结果
   * @param operation 操作名称或布尔值表示成功状态（向后兼容）
   * @param success 是否成功或错误消息
   * @param errorMessage 错误消息
   * @param isAuthError 是否是认证错误
   */
  private updateApiStatus(operation: string | boolean, success?: boolean | string, errorMessage?: string, isAuthError: boolean = false): void {
    // 向后兼容处理
    if (typeof operation === 'boolean') {
      // 旧方式调用：updateApiStatus(success, errorMessage, isAuthError)
      isAuthError = errorMessage as unknown as boolean || false;
      errorMessage = success as string;
      success = operation;
      operation = 'default';
    }
    
    this.apiStatus.lastCallTime = Date.now();
    
    if (typeof success === 'boolean' ? success : true) {
      this.apiStatus.successCount++;
      this.apiStatus.isUsingMockData = false;
    } else {
      this.apiStatus.failureCount++;
      this.apiStatus.lastErrorMessage = typeof success === 'string' ? success : errorMessage;
      this.apiStatus.isUsingMockData = true;
      
      if (isAuthError) {
        this.apiStatus.authErrorCount++;
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`通知服务API状态更新 (${operation}):`, this.apiStatus);
    }
  }
  
  /**
   * 检查错误是否是认证错误(401)
   * @param error 捕获的错误
   * @returns 是否是认证错误
   */
  private isAuthenticationError(error: any): boolean {
    return error?.response?.status === 401 || 
           error?.message?.includes('unauthorized') ||
           error?.message?.includes('unauthenticated');
  }
  
  /**
   * 获取通知列表
   * @param params 请求参数，包含分页和过滤条件
   * @returns 通知列表
   */
  async getNotifications(params?: { page?: number; pageSize?: number; type?: string }): Promise<any> {
    try {
      // 创建请求标识
      const requestId = `notifications_${JSON.stringify(params || {})}`;
      
      // 如果有之前的请求，取消它
      if (this.abortControllerMap.has(requestId)) {
        this.abortControllerMap.get(requestId)?.abort();
      }
      
      // 创建新的AbortController
      const abortController = new AbortController();
      this.abortControllerMap.set(requestId, abortController);
      
      // 如果明确要求使用模拟数据
    if (this.shouldUseMockData()) {
        console.log('按照配置使用模拟通知数据');
        const mockData = this.getMockNotifications();
        return {
          data: mockData,
          total: mockData.length,
          page: params?.page || 1,
          pageSize: params?.pageSize || 10
        };
      }
      
      // 准备查询参数
      const queryParams = {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        ...(params?.type && params.type !== 'all' ? { type: params.type } : {})
      };
      
      try {
        // 尝试获取认证用户的通知
        const data = await apiService.get('/api/notifications', queryParams, { 
          signal: abortController.signal 
        });
        
        // 处理API响应
        const processedData = this.processApiResponse(data);
        
        // 请求完成后移除 AbortController
        this.abortControllerMap.delete(requestId);
        
        return {
          data: processedData,
          total: data.total || processedData.length,
          page: params?.page || 1,
          pageSize: params?.pageSize || 10
        };
      } catch (error) {
        // 检查是否是取消错误
        if (axios.isCancel(error) || error.name === 'AbortError' || error.message === 'canceled') {
          console.log('通知请求已取消');
          // 被取消的请求不更新状态
          throw error;
        }
        
        console.log('获取认证用户通知失败，尝试公共通知API', error);
        
        // 判断是否为认证错误，是则更新状态并尝试公共API
        const isAuthError = this.isAuthenticationError(error);
        this.updateApiStatus('getNotifications', false, error?.message, isAuthError);
        
        // 尝试获取公共通知
        try {
          console.log(`尝试从 ${this.PUBLIC_NOTIFICATION_API} 获取公共通知...`);
          
          // 创建新的AbortController用于公共通知请求
          const publicAbortController = new AbortController();
          const publicRequestId = `public_notifications_${JSON.stringify(params || {})}`;
          this.abortControllerMap.set(publicRequestId, publicAbortController);
          
          const publicData = await apiService.get(this.PUBLIC_NOTIFICATION_API, { 
            limit: params?.pageSize || 10,
            ...queryParams
          }, { 
            signal: publicAbortController.signal 
          });
          
          // 清理AbortController
          this.abortControllerMap.delete(publicRequestId);
          
          const processedData = this.processApiResponse(publicData);
          return {
            data: processedData,
            total: publicData.total || processedData.length,
            page: params?.page || 1,
            pageSize: params?.pageSize || 10
          };
        } catch (publicError) {
          // 检查是否是取消错误
          if (axios.isCancel(publicError) || publicError.name === 'AbortError' || publicError.message === 'canceled') {
            console.log('公共通知请求已取消');
            throw publicError;
          }
          
          console.log('获取通知失败:', publicError?.message, publicError);
          this.updateApiStatus('getNotifications', false, publicError?.message);
          
          // 所有API调用失败，使用模拟数据
          console.log('所有API请求失败，使用模拟数据...');
          const mockData = this.getMockNotifications();
          
          // 如果提供了过滤参数，进行过滤
          let filteredData = mockData;
          if (params?.type && params.type !== 'all') {
            filteredData = mockData.filter(item => item.type === params.type);
          }
          
          // 处理分页
          const page = params?.page || 1;
          const pageSize = params?.pageSize || 10;
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedData = filteredData.slice(startIndex, endIndex);
          
          return {
            data: paginatedData,
            total: filteredData.length,
            page,
            pageSize
          };
        }
      }
    } catch (error) {
      // 检查是否是取消错误
      if (axios.isCancel(error) || error.name === 'AbortError' || error.message === 'canceled') {
        console.log('通知最外层请求已取消');
        throw error;
      }
      
      console.error('获取通知数据最终失败:', error);
      const mockData = this.getMockNotifications();
      
      return {
        data: mockData,
        total: mockData.length,
        page: 1,
        pageSize: 10
      };
    }
  }
  
  /**
   * 处理API响应数据
   */
  private processApiResponse(data: any): INotification[] {
    try {
      if (!data) return [];
      
      // 通知数据可能在items数组中或直接是数组
      const notificationArray = Array.isArray(data) ? data : (data.items || []);
      
      if (notificationArray.length > 0) {
        // 更新API状态
      this.updateApiStatus('getNotifications', true);
        
        // 格式化通知
        return notificationArray.map((notification: any): INotification => ({
          id: notification.id || `mock-${Math.random().toString(36).substring(2, 11)}`,
          title: notification.title,
          content: notification.content,
          type: notification.type || 'info',
          createdAt: notification.createdAt || new Date().toISOString(),
          read: notification.read || false,
          sender: notification.sender?.name || 'System',
          avatar: notification.sender?.avatar || '/assets/avatar/default.png',
          link: notification.link || '',
          isRead: notification.read || false
        }));
      }
      
      return [];
    } catch (error) {
      console.error('处理通知API响应失败:', error);
      return [];
    }
  }
  
  /**
   * 获取模拟通知数据
   */
  private getMockNotifications(): INotification[] {
    // 模拟的通知数据
    const mockNotifications: INotification[] = [
      {
        id: 'mock-1',
        title: '系统通知',
        content: '欢迎使用在线学习系统！',
        type: 'info',
        read: false,
        isRead: false,
        createdAt: dayjs().subtract(1, 'hour').toISOString(),
        sender: '系统管理员',
        avatar: '/assets/avatar/admin.png',
        link: '/dashboard'
      },
      {
        id: 'mock-2',
        title: '课程更新',
        content: '您关注的《Web开发入门》课程已更新最新内容',
        type: 'success',
        read: false,
        isRead: false,
        createdAt: dayjs().subtract(1, 'day').toISOString(),
        sender: '教务管理员',
        avatar: '/assets/avatar/teacher.png',
        link: '/courses/1'
      },
      {
        id: 'mock-3',
        title: '作业提醒',
        content: '您有一个作业即将到期，请及时提交',
        type: 'warning',
        read: false,
        isRead: false,
        createdAt: dayjs().subtract(2, 'day').toISOString(),
        sender: '张老师',
        avatar: '/assets/avatar/teacher2.png',
        link: '/assignments/5'
      },
      {
        id: 'mock-4',
        title: '系统维护通知',
        content: '系统将于本周六晚上10点-12点进行维护升级，请提前做好准备',
        type: 'error',
        read: true,
        isRead: true,
        createdAt: dayjs().subtract(3, 'day').toISOString(),
        sender: '技术支持',
        avatar: '/assets/avatar/support.png',
        link: '/announcements/2'
      },
      {
        id: 'mock-5',
        title: '考试成绩已公布',
        content: '您参加的《数据结构》期末考试成绩已公布，请查看',
        type: 'info',
        read: true,
        isRead: true,
        createdAt: dayjs().subtract(5, 'day').toISOString(),
        sender: '教务处',
        avatar: '/assets/avatar/admin.png',
        link: '/grades'
      },
      {
        id: 'mock-6',
        title: '学习进度提醒',
        content: '您的《JavaScript高级编程》课程学习进度已完成75%',
        type: 'success',
        read: true,
        isRead: true,
        createdAt: dayjs().subtract(7, 'day').toISOString(),
        sender: '学习助手',
        avatar: '/assets/avatar/assistant.png',
        link: '/courses/3'
      },
      {
        id: 'mock-7',
        title: '新课程推荐',
        content: '基于您的学习历史，我们推荐您学习《React入门到精通》课程',
        type: 'info',
        read: false,
        isRead: false,
        createdAt: dayjs().subtract(10, 'day').toISOString(),
        sender: '课程推荐系统',
        avatar: '/assets/avatar/robot.png',
        link: '/courses/12'
      }
    ];
    
    // 更新为使用模拟数据
    this.apiStatus.isUsingMockData = true;
    
    return mockNotifications;
  }
  
  /**
   * 获取模拟的未读通知数量
   */
  private getMockUnreadCount(): number {
    return this.getMockNotifications().filter(n => !n.read).length;
  }
  
  /**
   * 标记通知为已读
   * @param notificationId 通知ID
   * @returns 操作结果
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      if (this.shouldUseMockData()) {
    console.log(`模拟标记通知 ${notificationId} 为已读`);
    this.updateApiStatus('markAsRead', true);
    return true;
      }
      
      await apiService.put(`/notifications/${notificationId}/read`);
      this.updateApiStatus('markAsRead', true);
      return true;
    } catch (error) {
      console.error(`标记通知 ${notificationId} 为已读失败:`, error);
      this.updateApiStatus('markAsRead', false, error?.message);
      return false;
    }
  }
  
  /**
   * 标记所有通知为已读
   * @returns 操作结果
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      if (this.shouldUseMockData()) {
    console.log('模拟标记所有通知为已读');
    this.updateApiStatus('markAllAsRead', true);
    return true;
      }
      
      await apiService.put('/notifications/read-all');
      this.updateApiStatus('markAllAsRead', true);
      return true;
    } catch (error) {
      console.error('标记所有通知为已读失败:', error);
      this.updateApiStatus('markAllAsRead', false, error?.message);
      return false;
    }
  }
  
  /**
   * 删除通知
   * @param notificationId 通知ID
   * @returns 操作结果
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      if (this.shouldUseMockData()) {
    console.log(`模拟删除通知 ${notificationId}`);
    this.updateApiStatus('deleteNotification', true);
    return true;
      }
      
      await apiService.delete(`/notifications/${notificationId}`);
      this.updateApiStatus('deleteNotification', true);
      return true;
    } catch (error) {
      console.error(`删除通知 ${notificationId} 失败:`, error);
      this.updateApiStatus('deleteNotification', false, error?.message);
      return false;
    }
  }
  
  /**
   * 删除所有通知
   * @returns 操作结果
   */
  async deleteAllNotifications(): Promise<boolean> {
    try {
      if (this.shouldUseMockData()) {
    console.log('模拟删除所有通知');
    this.updateApiStatus('deleteAllNotifications', true);
    return true;
      }
      
      await apiService.delete('/notifications');
      this.updateApiStatus('deleteAllNotifications', true);
      return true;
    } catch (error) {
      console.error('删除所有通知失败:', error);
      this.updateApiStatus('deleteAllNotifications', false, error?.message);
      return false;
    }
  }
  
  /**
   * 获取未读通知数量
   * @returns 未读通知数量
   */
  async getUnreadCount(): Promise<number> {
    try {
      if (this.shouldUseMockData()) {
    console.log('使用模拟未读通知数量');
    const count = this.getMockUnreadCount();
    this.updateApiStatus('getUnreadCount', true);
    return count;
      }
      
      const count = await apiService.get('/notifications/unread-count');
      this.updateApiStatus('getUnreadCount', true);
      return count;
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
      this.updateApiStatus('getUnreadCount', false, error?.message);
      return this.getMockUnreadCount();
    }
  }
  
  /**
   * 发送通知
   * @param notification 通知数据
   * @returns 操作结果
   */
  async sendNotification(notification: Partial<Notification>): Promise<boolean> {
    try {
      if (this.shouldUseMockData()) {
        console.log('模拟发送通知:', notification);
        this.updateApiStatus('sendNotification', true);
        return true;
      }
      
      await apiService.post('/notifications', notification);
      this.updateApiStatus('sendNotification', true);
      return true;
    } catch (error) {
      console.error('发送通知失败:', error);
      this.updateApiStatus('sendNotification', false, error?.message);
      
      if (config.USE_MOCK_DATA) {
        console.log('回退到模拟发送通知');
        return true;
      }
      
      return false;
    }
  }
}

// 创建并导出服务实例
const notificationService = new NotificationService();
export default notificationService; 