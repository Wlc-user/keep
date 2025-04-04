import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, Alert, Divider, Spin, message } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const { Title, Text, Paragraph } = Typography;

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; password: string; remember: boolean }) => {
    try {
      setLoading(true);
      setError(null);

      const { username, password } = values;

      // 调用登录服务
      const result = await authService.login(username, password);

      if (result.success) {
        // 验证用户角色是否为admin
        if (result.user?.role === 'admin') {
          message.success('管理员登录成功，正在跳转...');
          navigate('/dashboard');
        } else {
          setError('您不是管理员，无法登录管理后台');
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
  const quickLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // 填充表单值（为了视觉反馈）
      form.setFieldsValue({
        username: 'admin',
        password: 'Admin123!',
        remember: true
      });

      // 直接调用登录
      const result = await authService.login('admin', 'Admin123!');

      if (result.success) {
        message.success('管理员身份登录成功，正在跳转...');
        navigate('/dashboard');
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
      background: 'linear-gradient(135deg, #4a0072 0%, #722ed1 100%)' // 管理员专属背景色
    }}>
      <Card
        style={{
          width: 400,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px'
        }}
      >
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />} 
          style={{ padding: 0, marginBottom: 16 }}
          onClick={() => navigate('/')}
        >
          返回选择
        </Button>
        
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <CrownOutlined style={{ fontSize: 40, color: '#722ed1', marginBottom: 16 }} />
          <Title level={2} style={{ margin: '0 0 8px 0', color: '#722ed1' }}>管理员登录</Title>
          <Text type="secondary">请登录以管理在线学习系统</Text>
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
            name="admin_login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入管理员用户名' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="管理员用户名"
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
                <a href="/admin/forgot-password">忘记密码?</a>
              </div>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block
                style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
              >
                管理员登录
              </Button>
            </Form.Item>
          </Form>

          <Divider>快速登录（开发环境）</Divider>
          
          <Button 
            block
            icon={<CrownOutlined />}
            onClick={quickLogin}
            style={{
              borderColor: '#722ed1',
              color: '#722ed1',
            }}
          >
            默认管理员账号
          </Button>
          
          <Paragraph style={{ marginTop: 16, fontSize: 12, color: '#999', textAlign: 'center' }}>
            管理员默认账号：admin / Admin123!
          </Paragraph>
        </Spin>
      </Card>
    </div>
  );
};

export default AdminLogin; 