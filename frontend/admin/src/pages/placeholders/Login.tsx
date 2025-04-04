import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, message, Alert, Divider, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: { username: string; password: string; remember: boolean }) => {
    try {
      setLoading(true);
      setError(null);

      const { username, password } = values;
      
      // 调用登录服务
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
          
          <Divider>开发账号</Divider>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Button size="small" onClick={() => {
              const form = document.forms.namedItem('login') as HTMLFormElement;
              if (form) {
                (form.elements.namedItem('username') as HTMLInputElement).value = 'admin';
                (form.elements.namedItem('password') as HTMLInputElement).value = 'Admin123!';
              }
            }}>
              管理员
            </Button>
            <Button size="small" onClick={() => {
              const form = document.forms.namedItem('login') as HTMLFormElement;
              if (form) {
                (form.elements.namedItem('username') as HTMLInputElement).value = 'teacher';
                (form.elements.namedItem('password') as HTMLInputElement).value = 'Teacher123!';
              }
            }}>
              教师
            </Button>
            <Button size="small" onClick={() => {
              const form = document.forms.namedItem('login') as HTMLFormElement;
              if (form) {
                (form.elements.namedItem('username') as HTMLInputElement).value = 'student';
                (form.elements.namedItem('password') as HTMLInputElement).value = 'Student123!';
              }
            }}>
              学生
            </Button>
          </div>
        </Spin>
      </Card>
    </div>
  );
};

export default Login; 