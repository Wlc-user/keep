import React from 'react';
import { Card, Typography, Button, Row, Col, Space, Divider } from 'antd';
import { UserOutlined, BookOutlined, CrownOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  const roles = [
    {
      key: 'admin',
      title: '管理员登录',
      description: '系统管理员与技术支持人员',
      icon: <CrownOutlined style={{ fontSize: 48, color: '#722ed1' }} />,
      color: '#722ed1',
      path: '/admin/login'
    },
    {
      key: 'teacher',
      title: '教师登录',
      description: '课程讲师与教学管理人员',
      icon: <BookOutlined style={{ fontSize: 48, color: '#13c2c2' }} />,
      color: '#13c2c2',
      path: '/teacher/login'
    },
    {
      key: 'student',
      title: '学生登录',
      description: '注册学生与课程学习者',
      icon: <UserOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      color: '#1890ff',
      path: '/student/login'
    }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '50px 20px',
      background: 'linear-gradient(135deg, #f0f2f5 0%, #e6e9ef 100%)'
    }}>
      <div style={{ maxWidth: 1200, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Title level={1} style={{ fontSize: 36 }}>欢迎使用在线学习系统</Title>
          <Paragraph style={{ fontSize: 16 }}>
            请选择您的角色进行登录，或者注册一个新账号
          </Paragraph>
        </div>
        
        <Row gutter={[24, 24]} justify="center">
          {roles.map(role => (
            <Col key={role.key} xs={24} sm={24} md={8}>
              <Card 
                hoverable
                style={{ 
                  height: 300,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 8,
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                bodyStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  height: '100%',
                  padding: '30px 20px'
                }}
                onClick={() => navigate(role.path)}
              >
                <div style={{ marginTop: 20 }}>
                  {role.icon}
                  <Title level={3} style={{ marginTop: 16, color: role.color }}>
                    {role.title}
                  </Title>
                  <Paragraph style={{ fontSize: 14, color: '#666' }}>
                    {role.description}
                  </Paragraph>
                </div>
                
                <Button 
                  type="primary" 
                  size="large"
                  style={{ 
                    marginTop: 20,
                    backgroundColor: role.color,
                    borderColor: role.color
                  }}
                  onClick={() => navigate(role.path)}
                >
                  进入登录
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
        
        <Divider style={{ margin: '40px 0 20px' }}>
          <Text style={{ fontSize: 16, color: '#666' }}>还没有账号?</Text>
        </Divider>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            type="primary" 
            size="large" 
            icon={<UserAddOutlined />}
            style={{ padding: '0 40px' }}
            onClick={() => navigate('/register')}
          >
            注册新账号
          </Button>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Paragraph type="secondary">
            注册即表示您同意遵守我们的 <Link to="/terms">服务条款</Link> 和 <Link to="/privacy">隐私政策</Link>
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection; 