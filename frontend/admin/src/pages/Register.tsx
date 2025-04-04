import React, { useState } from 'react';
import { Form, Input, Button, Select, Card, Typography, Alert, Row, Col, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, TeamOutlined, IdcardOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const onFinish = async (values: RegisterFormValues) => {
    try {
      setLoading(true);
      setError(null);

      const { username, email, password, firstName, lastName, role } = values;

      // 调用注册API
      const response = await apiService.post('/api/auth/register', {
        username,
        email,
        password,
        firstName,
        lastName,
        role
      });

      if (response.success) {
        // 保存令牌到本地存储
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        
        // 保存用户信息
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // 跳转到角色对应的页面
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setError(response.message || '注册失败，请稍后重试');
      }
    } catch (err: any) {
      console.error('注册错误:', err);
      setError(err.response?.data?.message || '注册过程中发生错误，请稍后重试');
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
      background: 'linear-gradient(135deg, #f0f2f5 0%, #e6e9ef 100%)'
    }}>
      <Card
        style={{
          width: 600,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px'
        }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>在线学习系统 - 注册</Title>
        
        {error && (
          <Alert
            message="注册失败"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="名"
                rules={[{ required: true, message: '请输入您的名' }]}
              >
                <Input prefix={<IdcardOutlined />} placeholder="您的名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="姓"
                rules={[{ required: true, message: '请输入您的姓' }]}
              >
                <Input prefix={<IdcardOutlined />} placeholder="您的姓" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入您的用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" autoComplete="username" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入您的邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" autoComplete="email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度至少为6个字符' }
            ]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: '请确认您的密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不匹配'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择您的角色' }]}
          >
            <Select placeholder="选择您的角色" prefix={<TeamOutlined />}>
              <Option value="student">学生</Option>
              <Option value="teacher">教师</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              注册
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>已有账号?</Divider>
        <div style={{ textAlign: 'center' }}>
          <Link to="/login">返回登录</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register; 