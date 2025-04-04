import api from './api';
import config from '../config/env';
import { User, UserRole } from '../contexts/AppContext';

// 生成时间戳，避免缓存问题
const timestamp = () => Math.floor(Date.now() / 1000);

export interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
  name?: string;
  avatar?: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 添加登录结果接口
export interface LoginResult {
  success: boolean;
  user?: User;
  message?: string;
  token?: string;
  refreshToken?: string;
}

/**
 * 用于管理用户认证的服务
 */
class AuthService {
  /**
   * 初始化认证
   */
  async initAuth(): Promise<boolean> {
    try {
      const token = localStorage.getItem(config.AUTH.TOKEN_KEY);
      const refreshToken = localStorage.getItem(config.AUTH.REFRESH_TOKEN_KEY);
      
      if (!token || !refreshToken) {
        return false;
      }
      
      // 检查token是否即将过期
      if (this.isTokenExpiringSoon()) {
        await this.refreshToken();
      }
      
      return true;
    } catch (error) {
      console.error('初始化认证失败:', error);
      return false;
    }
  }
  
  /**
   * 用户登录
   * @param username 用户名
   * @param password 密码
   * @returns 登录结果
   */
  async login(username: string, password: string): Promise<LoginResult> {
    console.log('正在尝试登录...', { username, password: '******' });
    
    try {
      // 完全使用模拟数据模式，不尝试连接API
      console.log('使用模拟数据登录...');
      
      // 模拟用户数据
      const mockUsers = [
        { id: '1', username: 'admin', name: '管理员', role: 'admin', avatar: '/assets/avatars/admin.png' },
        { id: '2', username: 'teacher', name: '张老师', role: 'teacher', avatar: '/assets/avatars/teacher.png' },
        { id: '3', username: 'student', name: '李学生', role: 'student', avatar: '/assets/avatars/student.png' }
      ];
      
      // 查找用户
      const user = mockUsers.find(u => u.username === username);
      
      if (user) {
        // 生成模拟token
        const token = `mock-token-${Date.now()}`;
        const refreshToken = `mock-refresh-token-${Date.now()}`;
        
        // 保存token和用户信息
        this.saveToken(token, refreshToken);
        this.saveUserInfo(user);
        
        console.log('模拟登录成功:', user);
        return {
          success: true,
          user,
          token,
          refreshToken
        };
      } else {
        console.log('模拟登录失败: 用户名或密码错误');
        return {
          success: false,
          message: '用户名或密码错误'
        };
      }
    } catch (error) {
      console.error('API登录失败:', error);
      
      // 使用备用模拟数据登录方式
      if (username === 'admin' || username === 'teacher' || username === 'student') {
        // 预设账号自动登录成功
        const role = username;
        const mockUser = {
          id: username === 'admin' ? '1' : (username === 'teacher' ? '2' : '3'),
          username: username,
          name: username === 'admin' ? '管理员' : (username === 'teacher' ? '张老师' : '李学生'),
          role: role,
          avatar: `/assets/avatars/${role}.png`
        };
        
        // 生成模拟token
        const token = `mock-token-${Date.now()}`;
        const refreshToken = `mock-refresh-token-${Date.now()}`;
        
        // 保存token和用户信息
        this.saveToken(token, refreshToken);
        this.saveUserInfo(mockUser);
        
        console.log('备用模拟登录成功:', mockUser);
        return {
          success: true,
          user: mockUser,
          token,
          refreshToken
        };
      }
      
      return {
        success: false,
        message: '登录失败: ' + (error instanceof Error ? error.message : '未知错误')
      };
    }
  }
  
  /**
   * 确保用户角色正确设置
   */
  private ensureUserRole(user: User): void {
    if (!user.role || !['admin', 'teacher', 'student'].includes(user.role)) {
      console.warn('用户角色未设置或无效:', user.role);
      
      // 基于用户名或ID推断角色
      if (user.username.includes('admin') || user.email?.includes('admin')) {
        user.role = 'admin';
      } else if (user.username.includes('teacher') || user.email?.includes('teacher') || user.title) {
        user.role = 'teacher';
      } else {
        user.role = 'student';
      }
      
      console.log('已自动设置用户角色为:', user.role);
    }
  }
  
  /**
   * 保存Token
   */
  saveToken(token: string, refreshToken: string): void {
    localStorage.setItem(config.AUTH.TOKEN_KEY, token);
    localStorage.setItem(config.AUTH.REFRESH_TOKEN_KEY, refreshToken);
    
    // 解析并设置token过期时间
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.exp) {
          localStorage.setItem(config.AUTH.TOKEN_EXPIRY_KEY, payload.exp.toString());
        }
      }
    } catch (e) {
      console.error('解析Token失败:', e);
    }
  }
  
  /**
   * 记录下一次token刷新时间
   */
  logNextRefreshTime(): void {
    try {
      const expiryStr = localStorage.getItem(config.AUTH.TOKEN_EXPIRY_KEY);
      if (expiryStr) {
        const expiry = parseInt(expiryStr, 10) * 1000; // 转换为毫秒
        const refreshBefore = expiry - config.AUTH.REFRESH_BEFORE_EXPIRY;
        const refreshTime = new Date(refreshBefore);
        console.log(`Token将在 ${refreshTime.toLocaleTimeString()} 刷新`);
      }
    } catch (e) {
      console.error('计算刷新时间失败:', e);
    }
  }
  
  /**
   * 保存用户信息
   */
  saveUserInfo(user: User): void {
    localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(user));
  }
  
  /**
   * 获取当前用户
   */
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(config.AUTH.USER_KEY);
      if (!userStr) return null;
      
      const user = JSON.parse(userStr) as User;
      
      // 确保用户角色正确
      this.ensureUserRole(user);
      
      return user;
    } catch (e) {
      console.error('获取当前用户失败:', e);
      return null;
    }
  }
  
  /**
   * 登出
   */
  logout(): void {
    localStorage.removeItem(config.AUTH.TOKEN_KEY);
    localStorage.removeItem(config.AUTH.REFRESH_TOKEN_KEY);
    localStorage.removeItem(config.AUTH.TOKEN_EXPIRY_KEY);
    localStorage.removeItem(config.AUTH.USER_KEY);
  }
  
  /**
   * 检查Token是否有效
   */
  isTokenValid(): boolean {
    const token = localStorage.getItem(config.AUTH.TOKEN_KEY);
    if (!token) return false;
    
    // 验证token是否过期
    try {
      const expiryStr = localStorage.getItem(config.AUTH.TOKEN_EXPIRY_KEY);
      if (expiryStr) {
        const expiry = parseInt(expiryStr, 10) * 1000; // 转换为毫秒
        return Date.now() < expiry;
      }
    } catch (e) {
      console.error('验证Token有效性失败:', e);
    }
    
    return false;
  }
  
  /**
   * 检查Token是否即将过期
   */
  isTokenExpiringSoon(): boolean {
    try {
      const expiryStr = localStorage.getItem(config.AUTH.TOKEN_EXPIRY_KEY);
      if (expiryStr) {
        const expiry = parseInt(expiryStr, 10) * 1000; // 转换为毫秒
        return Date.now() > (expiry - config.AUTH.REFRESH_BEFORE_EXPIRY);
      }
    } catch (e) {
      console.error('检查Token是否即将过期失败:', e);
    }
    
    return false;
  }

  /**
   * 刷新Token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem(config.AUTH.REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw new Error('没有可用的刷新令牌');
      }
      
      const response = await api.post('/auth/refresh', { refreshToken });
      
      if (response && response.token) {
        this.saveToken(response.token, response.refreshToken || refreshToken);
        console.log('Token已刷新');
        this.logNextRefreshTime();
        return true;
      }
      
      throw new Error('刷新令牌失败: 无效的响应数据');
    } catch (error) {
      console.error('刷新令牌请求失败:', error);
      throw error;
    }
  }
  
  /**
   * 检查并刷新Token
   */
  async checkAndRefreshToken(): Promise<boolean> {
    if (this.isTokenExpiringSoon()) {
      return await this.refreshToken();
    }
    return true;
  }

  /**
   * 检查并自动登录
   * 如果存在有效的 token，则自动恢复用户会话
   */
  async checkAndAutoLogin(): Promise<boolean> {
    try {
      console.log('检查是否可以自动登录...');
      const token = localStorage.getItem(config.AUTH.TOKEN_KEY);
      const userStr = localStorage.getItem(config.AUTH.USER_KEY);
      
      if (!token || !userStr) {
        console.log('没有找到保存的登录信息，无法自动登录');
        return false;
      }
      
      // 检查token是否有效
      if (!this.isTokenValid()) {
        console.log('保存的token已过期，尝试刷新...');
        // 尝试刷新token
        const refreshed = await this.checkAndRefreshToken().catch(() => false);
        if (!refreshed) {
          console.log('无法刷新token，需要重新登录');
          this.logout();
          return false;
        }
      }
      
      // 验证token并获取用户信息
      console.log('使用保存的凭据自动登录');
      return true;
    } catch (error) {
      console.error('自动登录失败:', error);
      return false;
    }
  }

  /**
   * 验证令牌是否有效
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem(config.AUTH.TOKEN_KEY);
      
      if (!token) {
        console.warn('无令牌可验证');
        return false;
      }
      
      // 调用后端验证端点
      const response = await api.get('/auth/verify', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response?.success === true;
    } catch (error) {
      console.error('验证令牌失败:', error);
      return false;
    }
  }
}

export default new AuthService();