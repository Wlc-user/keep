import axios, { AxiosError } from 'axios';
import apiService from './apiService';
import config from '../config/env';

// 诊断服务状态
export interface DiagnosticResult {
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
  timestamp: Date;
}

export interface ConnectionCheckResult {
  api: DiagnosticResult;
  auth: DiagnosticResult;
  cors: DiagnosticResult;
  proxy: DiagnosticResult;
  overall: DiagnosticResult;
}

/**
 * 诊断服务
 * 用于测试和诊断API连接问题
 */
class DiagnosticsService {
  /**
   * 检查与API服务器的连接
   */
  async checkApiConnection(): Promise<DiagnosticResult> {
    try {
      console.log('检查API连接...');
      
      // 使用不经过拦截器的原始axios实例
      const healthCheckUrl = `${config.API_BASE_URL.includes('http') ? 
        config.API_BASE_URL : 
        window.location.origin + config.API_BASE_URL}/diagnostics/health`;
      
      console.log(`健康检查URL: ${healthCheckUrl}`);
      
      const start = Date.now();
      const response = await axios.get(healthCheckUrl, { 
        timeout: 5000,
        headers: { 'Cache-Control': 'no-cache' }  
      });
      const duration = Date.now() - start;
      
      console.log('健康检查响应:', response.data);
      
      if (response.status === 200) {
        return {
          status: 'success',
          message: `API服务正常运行，响应时间: ${duration}ms`,
          details: response.data,
          timestamp: new Date()
        };
      } else {
        return {
          status: 'warning',
          message: `API服务响应非200状态码: ${response.status}`,
          details: response.data,
          timestamp: new Date()
        };
      }
    } catch (error) {
      console.error('API连接检查失败:', error);
      
      const axiosError = error as AxiosError;
      return {
        status: 'error',
        message: axiosError.response 
          ? `API连接错误 (${axiosError.response.status}): ${axiosError.message}` 
          : `API连接错误: ${axiosError.message}`,
        details: {
          error: axiosError.message,
          code: axiosError.code,
          response: axiosError.response?.data,
          config: axiosError.config
        },
        timestamp: new Date()
      };
    }
  }
  
  /**
   * 检查CORS配置
   */
  async checkCors(): Promise<DiagnosticResult> {
    try {
      console.log('检查CORS配置...');
      
      // 直接访问API服务器，不通过代理
      const corsTestUrl = `http://localhost:5188/api/diagnostics/cors-test`;
      const response = await axios.get(corsTestUrl, { 
        timeout: 5000,
        headers: { 'X-Cors-Test': 'true' }
      });
      
      console.log('CORS测试响应:', response.data);
      
      return {
        status: 'success',
        message: 'CORS配置正常',
        details: response.data,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('CORS检查失败:', error);
      
      const axiosError = error as AxiosError;
      return {
        status: 'error',
        message: axiosError.response 
          ? `CORS错误 (${axiosError.response.status}): ${axiosError.message}` 
          : `CORS错误: ${axiosError.message}`,
        details: {
          error: axiosError.message,
          code: axiosError.code,
          response: axiosError.response?.data
        },
        timestamp: new Date()
      };
    }
  }
  
  /**
   * 检查代理配置
   */
  async checkProxy(): Promise<DiagnosticResult> {
    try {
      console.log('检查代理配置...');
      
      // 通过相对路径访问，应该走代理
      const response = await apiService.get('/diagnostics/cors-test');
      
      console.log('代理测试响应:', response);
      
      return {
        status: 'success',
        message: '代理配置正常',
        details: response,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('代理检查失败:', error);
      
      return {
        status: 'error',
        message: `代理错误: ${(error as Error).message}`,
        details: error,
        timestamp: new Date()
      };
    }
  }
  
  /**
   * 检查身份验证
   */
  async checkAuth(): Promise<DiagnosticResult> {
    try {
      console.log('检查身份验证...');
      
      // 尝试访问需要认证的API
      const token = localStorage.getItem('token');
      
      if (!token) {
        return {
          status: 'warning',
          message: '未找到认证令牌，请先登录',
          timestamp: new Date()
        };
      }
      
      try {
        // 尝试使用令牌获取用户信息
        const response = await apiService.get('/auth/userinfo');
        
        console.log('认证检查响应:', response);
        
        return {
          status: 'success',
          message: '身份验证正常',
          details: response,
          timestamp: new Date()
        };
      } catch (authError) {
        console.error('认证请求失败:', authError);
        
        // 尝试访问一个开放的端点作为对照
        try {
          await apiService.get('/diagnostics/health');
          
          // 如果开放端点可访问，但认证端点失败，说明是认证问题
          return {
            status: 'error',
            message: `身份验证失败，但API服务可访问: ${(authError as Error).message}`,
            details: authError,
            timestamp: new Date()
          };
        } catch (openError) {
          // 如果开放端点也失败，说明是API连接问题
          return {
            status: 'error',
            message: '无法连接到API服务',
            details: { authError, openError },
            timestamp: new Date()
          };
        }
      }
    } catch (error) {
      console.error('认证检查失败:', error);
      
      return {
        status: 'error',
        message: `认证检查错误: ${(error as Error).message}`,
        details: error,
        timestamp: new Date()
      };
    }
  }
  
  /**
   * 运行完整的连接诊断
   */
  async runConnectionDiagnostics(): Promise<ConnectionCheckResult> {
    console.log('开始运行连接诊断...');
    
    // 并行运行所有检查
    const [apiResult, corsResult, proxyResult, authResult] = await Promise.all([
      this.checkApiConnection(),
      this.checkCors().catch(error => ({
        status: 'error' as const,
        message: `CORS检查异常: ${error.message}`,
        details: error,
        timestamp: new Date()
      })),
      this.checkProxy().catch(error => ({
        status: 'error' as const,
        message: `代理检查异常: ${error.message}`,
        details: error,
        timestamp: new Date()
      })),
      this.checkAuth().catch(error => ({
        status: 'error' as const,
        message: `认证检查异常: ${error.message}`,
        details: error,
        timestamp: new Date()
      }))
    ]);
    
    // 汇总结果
    const successCount = [apiResult, corsResult, proxyResult, authResult]
      .filter(result => result.status === 'success')
      .length;
    
    const overallStatus = successCount === 4 
      ? 'success' 
      : (successCount >= 2 ? 'warning' : 'error');
    
    const overall: DiagnosticResult = {
      status: overallStatus as any,
      message: successCount === 4 
        ? '所有连接检查都通过' 
        : `${4 - successCount}个检查失败，${successCount}个检查通过`,
      details: {
        successCount,
        totalChecks: 4,
        apiStatus: apiResult.status,
        corsStatus: corsResult.status,
        proxyStatus: proxyResult.status,
        authStatus: authResult.status
      },
      timestamp: new Date()
    };
    
    console.log('诊断完成:', {
      api: apiResult,
      cors: corsResult,
      proxy: proxyResult,
      auth: authResult,
      overall
    });
    
    return {
      api: apiResult,
      cors: corsResult,
      proxy: proxyResult,
      auth: authResult,
      overall
    };
  }
}

export default new DiagnosticsService(); 