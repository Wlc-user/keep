// 增强登录逻辑的handleLogin函数
const handleLogin = (userData: User, token: string) => {
  console.log('AuthContext: 开始登录处理', { userData });
  
  // 保存令牌到本地存储
  localStorage.setItem('token', token);
  console.log('AuthContext: 令牌已保存到localStorage');
  
  // 保存上次登录的用户名，用于自动填充
  if (userData.username) {
    localStorage.setItem('lastUsername', userData.username);
    console.log('AuthContext: 上次登录用户名已保存');
  }
  
  // 更新状态
  setUser(userData);
  setAuthState({
    authenticated: true,
    user: userData,
    loading: false,
    initialized: true
  });
  
  console.log('AuthContext: 登录成功，用户身份:', {
    userId: userData.id,
    username: userData.username,
    role: userData.role,
    isAuthenticated: true
  });
};

// 增强登出逻辑的handleLogout函数
const handleLogout = () => {
  console.log('AuthContext: 开始登出处理');
  
  // 从本地存储中移除令牌
  localStorage.removeItem('token');
  console.log('AuthContext: 令牌已从localStorage移除');
  
  // 保留上次登录的用户名
  const lastUsername = localStorage.getItem('lastUsername');
  console.log(`AuthContext: 保留上次登录用户名: ${lastUsername || '无'}`);
  
  // 重置状态
  setUser(null);
  setAuthState({
    authenticated: false,
    user: null,
    loading: false,
    initialized: true
  });
  
  console.log('AuthContext: 登出成功，用户已注销');
  
  // 可选: 在开发环境下，刷新页面以确保完全重置状态
  if (process.env.NODE_ENV === 'development') {
    console.log('AuthContext: 在开发环境中，重定向到登录页面');
    // 使用延时确保状态更新后再跳转
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  }
}; 