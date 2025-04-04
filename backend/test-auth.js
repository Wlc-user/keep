// 测试脚本：创建应急管理员账户
const fetch = require('node-fetch');

async function createEmergencyAdmin() {
  try {
    console.log('正在请求创建应急管理员账户...');
    const response = await fetch('http://localhost:5187/api/auth/emergency-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('API响应状态码:', response.status);
    console.log('API响应内容:', JSON.stringify(data, null, 2));
    
    if (response.status === 200) {
      console.log('应急管理员账户创建成功!');
      if (data.accounts) {
        console.log('可用账户信息:');
        data.accounts.forEach(account => {
          console.log(`- 用户名: ${account.username}, 密码: ${account.password}, 角色: ${account.role}`);
        });
      }
    } else {
      console.error('创建失败:', data.error || data.message || '未知错误');
    }
  } catch (error) {
    console.error('请求过程中发生错误:', error.message);
  }
}

// 执行测试
createEmergencyAdmin(); 