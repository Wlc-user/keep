import apiService from './apiService';
import { message } from 'antd';
import config from '../config/env';
import mockDataLoader from '../utils/mockDataLoader';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin: string;
  avatar?: string;
}

class UserService {
  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('正在获取当前用户信息...');
      
      // 优先使用模拟数据
      if (config.USE_MOCK_DATA) {
        console.log('尝试从模拟数据获取当前用户');
        try {
          const mockUsers = await mockDataLoader.loadMockData('users');
          if (mockUsers && Array.isArray(mockUsers) && mockUsers.length > 0) {
            // 返回第一个用户作为当前用户
            console.log('成功从模拟数据获取当前用户');
            return mockUsers[0];
          }
        } catch (mockError) {
          console.error('获取模拟用户数据失败，回退到API:', mockError);
        }
      }
      
      // 如果模拟数据获取失败或未启用，尝试使用API
      const response = await apiService.get('/api/auth/me');
      return response;
    } catch (error) {
      console.error('获取当前用户信息失败:', error);
      return null;
    }
  }
  
  /**
   * 获取用户列表
   * @returns 用户列表
   */
  async getUsers(): Promise<User[]> {
    try {
      console.log('正在获取用户列表...');
      
      // 优先使用模拟数据
      if (config.USE_MOCK_DATA) {
        console.log('尝试从模拟数据获取用户列表');
        try {
          const mockData = await mockDataLoader.loadMockData('users');
          if (mockData && Array.isArray(mockData)) {
            console.log(`成功从模拟数据获取用户列表: ${mockData.length}`);
            return mockData;
          }
        } catch (mockError) {
          console.error('获取模拟用户列表失败，回退到API:', mockError);
        }
      }
      
      // 如果模拟数据获取失败或未启用，尝试使用API
      const response = await apiService.get('/api/users');
      return response.items || [];
    } catch (error) {
      console.error('获取用户列表失败:', error);
      return [];
    }
  }
  
  /**
   * 登录
   * @param username 用户名
   * @param password 密码
   * @returns 登录结果
   */
  async login(username: string, password: string): Promise<{ token: string; user: User } | null> {
    try {
      if (config.USE_MOCK_DATA) {
        // 模拟登录
        const users = await this.getUsers();
        const user = users.find(u => u.username === username);
        
        if (user) {
          // 生成一个模拟token
          const token = `mock-token-${Date.now()}`;
          localStorage.setItem('token', token);
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          return { token, user };
        } else {
          message.error('用户名或密码错误');
          return null;
        }
      }
      
      const response = await apiService.post('/api/auth/login', { username, password });
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        return response;
      }
      return null;
    } catch (error) {
      console.error('登录失败:', error);
      message.error('登录失败，请稍后再试');
      return null;
    }
  }
  
  /**
   * 登出
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  }
}

export default new UserService(); 