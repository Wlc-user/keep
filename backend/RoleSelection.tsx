import React from 'react';
import { Card, Typography, Button, Row, Col, Space } from 'antd';
import { UserOutlined, BookOutlined, CrownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

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
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a365d 0%, #153e75 100%)'
    }}>
      <div style={{ width: '80%', maxWidth: 1000 }}>
        <Title 
          level={1} 
          style={{ 
            textAlign: 'center', 
            color: 'white', 
            marginBottom: 40,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          在线学习系统
        </Title>
        
        <Paragraph 
          style={{ 
            textAlign: 'center', 
            color: 'white', 
            fontSize: 18,
            marginBottom: 40 
          }}
        >
          请选择您的身份进行登录
        </Paragraph>
        
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
        
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Space>
            <Button type="link" style={{ color: 'white' }}>关于我们</Button>
            <Button type="link" style={{ color: 'white' }}>帮助中心</Button>
            <Button type="link" style={{ color: 'white' }}>联系支持</Button>
          </Space>
          <Paragraph style={{ color: 'rgba(255,255,255,0.6)', marginTop: 16 }}>
            © 2025 在线学习系统 版权所有
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection; 