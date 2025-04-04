import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, Alert, Divider, Spin, Row, Col, message, App } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined, BookOutlined, ReadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const { Title, Text } = Typography;

// 定义测试账号数据
const DEV_ACCOUNTS = [
  { 
    role: 'admin', 
    username: 'admin', 
    password: 'Admin123!', 
    label: '管理员', 
    icon: <CrownOutlined />, 
    color: '#722ed1'
  },
  { 
    role: 'teacher', 
    username: 'teacher', 
    password: 'Teacher123!', 
    label: '教师', 
    icon: <BookOutlined />, 
    color: '#13c2c2'
  },
  { 
    role: 'student', 
    username: 'student', 
    password: 'Student123!', 
    label: '学生', 
    icon: <ReadOutlined />, 
    color: '#1890ff'
  }
];

const LoginContent: React.FC<{ onLogin?: (credentials: { username: string; password: string }) => any }> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  
  const onFinish = async (values: { username: string; password: string; remember: boolean }) => {
    try {
      setLoading(true);
      setError(null);

      const { username, password } = values;
      
      // 如果存在外部传入的onLogin函数，优先使用它
      if (onLogin) {
        const user = onLogin({ username, password });
        if (user) {
          message.success('登录成功，正在跳转...');
          navigate('/dashboard');
          return;
        }
      }
      
      // 否则调用登录服务
      const result = await authService.login(username, password);

      if (result.success) {
        message.success('登录成功，正在跳转...');
        
        // 根据用户角色导航到不同页面
        if (result.user?.role === 'admin') {
          navigate('/dashboard');
        } else if (result.user?.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setError(result.message || '登录失败，请检查用户名和密码');
      }
    } catch (err) {
      console.error('登录错误:', err);
      setError('登录过程中发生错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 快速登录函数
  const quickLogin = async (account: typeof DEV_ACCOUNTS[0]) => {
    try {
      setLoading(true);
      setError(null);
      
      // 填充表单值（为了视觉反馈）
      form.setFieldsValue({
        username: account.username,
        password: account.password,
        remember: true
      });
      
      // 如果存在外部传入的onLogin函数，优先使用它
      if (onLogin) {
        const user = onLogin({ username: account.username, password: account.password });
        if (user) {
          message.success(`以${account.label}身份登录成功，正在跳转...`);
          navigate('/dashboard');
          return;
        }
      }
      
      // 否则直接调用登录
      const result = await authService.login(account.username, account.password);

      if (result.success) {
        message.success(`以${account.label}身份登录成功，正在跳转...`);
        
        // 根据用户角色导航到不同页面
        if (account.role === 'admin') {
          navigate('/dashboard');
        } else if (account.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setError(result.message || '快速登录失败，请尝试手动输入');
      }
    } catch (err) {
      console.error('快速登录错误:', err);
      setError('登录过程中发生错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a365d 0%, #153e75 100%)'
    }}>
      <Card 
        style={{ 
          width: 400, 
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: '0 0 8px 0' }}>在线学习系统</Title>
          <Text type="secondary">请登录以继续使用系统</Text>
        </div>
        
        <Spin spinning={loading}>
          {error && (
            <Alert
              message="登录失败"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Form
            form={form}
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="用户名" 
                autoComplete="username"
              />
            </Form.Item>
            
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                autoComplete="current-password"
              />
            </Form.Item>
            
            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>记住我</Checkbox>
                </Form.Item>
                <a href="/forgot-password">忘记密码?</a>
              </div>
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                登录
              </Button>
            </Form.Item>
          </Form>
          
          <Divider>快速登录（开发环境）</Divider>
          
          <Row gutter={[8, 8]} justify="center">
            {DEV_ACCOUNTS.map(account => (
              <Col key={account.role} span={8}>
                <Button
                  type="default"
                  icon={account.icon}
                  onClick={() => quickLogin(account)}
                  style={{ 
                    width: '100%',
                    borderColor: account.color,
                    color: account.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {account.label}
                </Button>
              </Col>
            ))}
          </Row>
        </Spin>
      </Card>
    </div>
  );
};

// 修改Login组件定义，传递onLogin属性
const Login: React.FC<{ onLogin?: (credentials: { username: string; password: string }) => any }> = (props) => {
  return (
    <App>
      <LoginContent onLogin={props.onLogin} />
    </App>
  );
};

export default Login; 