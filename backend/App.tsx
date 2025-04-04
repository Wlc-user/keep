import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
import { Spin, message } from 'antd';
import './mockMaterialsService'; // 引入模拟服务

// 应用资源初始化函数
const initializeAppResources = async () => {
  try {
    // 检查环境变量或localStorage中的配置
    const useMockApi = localStorage.getItem('useMockApi') === 'true' || process.env.REACT_APP_USE_MOCK_API === 'true';
    
    // 如果使用模拟数据，则配置拦截器
    if (useMockApi) {
      console.log('应用已配置为使用模拟API数据');
    } else {
      console.log('应用已配置为直接使用后端API');
    }
    
    // 这里可以添加其他应用初始化逻辑
    // 例如：加载用户配置、检查认证状态等
    
    return true;
  } catch (error) {
    console.error('应用资源初始化失败:', error);
    message.error('系统初始化失败，请刷新页面重试');
    return false;
  }
};

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    // 初始化应用资源
    const initialize = async () => {
      const success = await initializeAppResources();
      setIsInitialized(success);
    };
    
    initialize();
  }, []);
  
  // 显示加载中状态
  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="系统正在初始化..." />
      </div>
    );
  }
  
  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
}

export default App; 