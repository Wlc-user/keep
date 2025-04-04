import React, { useState, useEffect } from 'react';
import { 
  Card, Tabs, Form, Input, Button, Upload, message, 
  Avatar, Typography, Row, Col, Divider, Skeleton, 
  Descriptions, Badge, Space
} from 'antd';
import { 
  UserOutlined, MailOutlined, LockOutlined, 
  UploadOutlined, SafetyOutlined, BookOutlined, 
  EditOutlined, SaveOutlined, CloseOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import authService from '../services/authService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface UserProfileData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
}

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const currentUser = authService.getCurrentUser();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // 确定是当前用户还是查看其他用户
        let userId = id;
        if (!userId) {
          if (!currentUser?.id) {
            message.error('无法获取用户信息');
            navigate('/');
            return;
          }
          userId = currentUser.id;
          setIsCurrentUser(true);
        } else {
          setIsCurrentUser(currentUser?.id === userId);
        }
        
        // 获取用户数据
        const response = await apiService.get(`/api/users/${userId}`);
        setUserData(response);
        
        // 设置表单初始值
        form.setFieldsValue({
          firstName: response.firstName,
          lastName: response.lastName,
          displayName: response.displayName,
          email: response.email
        });
      } catch (error) {
        console.error('获取用户数据失败:', error);
        message.error('获取用户信息失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [id, form, navigate, currentUser]);
  
  const handleEdit = () => {
    setEditMode(true);
  };
  
  const handleCancel = () => {
    setEditMode(false);
    // 重置表单
    if (userData) {
      form.setFieldsValue({
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: userData.displayName,
        email: userData.email
      });
    }
  };
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!userData) return;
      
      // 准备更新的用户数据
      const updatedUserData = {
        ...userData,
        firstName: values.firstName,
        lastName: values.lastName,
        displayName: values.displayName,
        email: values.email
      };
      
      // 发送更新请求
      await apiService.put(`/api/users/${userData.id}`, updatedUserData);
      
      // 更新本地数据
      setUserData(updatedUserData);
      setEditMode(false);
      
      message.success('个人信息更新成功');
      
      // 如果是当前用户，还需要更新本地存储的用户信息
      if (isCurrentUser && currentUser) {
        const updatedCurrentUser = {
          ...currentUser,
          firstName: values.firstName,
          lastName: values.lastName,
          displayName: values.displayName,
          email: values.email
        };
        
        authService.saveUserInfo(updatedCurrentUser);
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      message.error('更新用户信息失败，请稍后重试');
    }
  };
  
  const handlePasswordChange = async (values: any) => {
    try {
      if (!userData) return;
      
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的新密码不一致');
        return;
      }
      
      // 发送密码更新请求
      await apiService.post(`/api/users/${userData.id}/change-password`, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      
      message.success('密码修改成功');
      
      // 重置表单
      form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
    } catch (error) {
      console.error('修改密码失败:', error);
      message.error('修改密码失败，请检查您的当前密码是否正确');
    }
  };
  
  const uploadProps: UploadProps = {
    name: 'avatar',
    action: '/api/users/avatar',
    headers: {
      authorization: 'Bearer ' + localStorage.getItem('token') || '',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success('头像上传成功');
        // 更新用户头像
        if (userData && info.file.response?.avatarUrl) {
          setUserData({
            ...userData,
            avatarUrl: info.file.response.avatarUrl
          });
          
          // 如果是当前用户，同时更新本地存储
          if (isCurrentUser && currentUser) {
            const updatedCurrentUser = {
              ...currentUser,
              avatarUrl: info.file.response.avatarUrl
            };
            authService.saveUserInfo(updatedCurrentUser);
          }
        }
      } else if (info.file.status === 'error') {
        message.error('头像上传失败');
      }
    },
  };
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge color="red" text="管理员" />;
      case 'teacher':
        return <Badge color="blue" text="教师" />;
      case 'student':
        return <Badge color="green" text="学生" />;
      default:
        return <Badge color="default" text={role} />;
    }
  };
  
  if (loading) {
    return (
      <Card style={{ margin: 20 }}>
        <Skeleton avatar active paragraph={{ rows: 10 }} />
      </Card>
    );
  }
  
  if (!userData) {
    return (
      <Card style={{ margin: 20 }}>
        <Title level={3}>无法获取用户信息</Title>
        <Button type="primary" onClick={() => navigate('/')}>返回首页</Button>
      </Card>
    );
  }
  
  return (
    <div style={{ padding: 20 }}>
      <Card>
        <Row gutter={[24, 24]}>
          {/* 用户基本信息展示区 */}
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <Avatar 
              size={120} 
              src={userData.avatarUrl}
              icon={<UserOutlined />} 
              style={{ marginBottom: 16 }}
            />
            
            {isCurrentUser && (
              <div style={{ marginTop: 10, marginBottom: 20 }}>
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>更换头像</Button>
                </Upload>
              </div>
            )}
            
            <Title level={3}>{userData.displayName || `${userData.firstName} ${userData.lastName}`}</Title>
            <Text>@{userData.username}</Text>
            <div style={{ margin: '12px 0' }}>
              {getRoleBadge(userData.role)}
            </div>
            
            <Divider />
            
            <Descriptions layout="vertical" column={1} size="small">
              <Descriptions.Item label="用户名">{userData.username}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{userData.email}</Descriptions.Item>
              <Descriptions.Item label="账号状态">
                {userData.isActive ? 
                  <Badge status="success" text="活跃" /> : 
                  <Badge status="error" text="已禁用" />
                }
              </Descriptions.Item>
              {userData.createdAt && (
                <Descriptions.Item label="注册日期">
                  {new Date(userData.createdAt).toLocaleDateString()}
                </Descriptions.Item>
              )}
              {userData.lastLogin && (
                <Descriptions.Item label="最后登录">
                  {new Date(userData.lastLogin).toLocaleString()}
                </Descriptions.Item>
              )}
            </Descriptions>
            
            {isCurrentUser && !editMode && (
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={handleEdit}
                style={{ marginTop: 20 }}
              >
                编辑个人信息
              </Button>
            )}
          </Col>
          
          {/* 编辑区 */}
          <Col xs={24} md={16}>
            <Tabs defaultActiveKey="profile">
              <TabPane 
                tab={
                  <span>
                    <UserOutlined />
                    个人资料
                  </span>
                } 
                key="profile"
              >
                {editMode ? (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="firstName"
                          label="名"
                          rules={[{ required: true, message: '请输入您的名' }]}
                        >
                          <Input prefix={<UserOutlined />} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="lastName"
                          label="姓"
                          rules={[{ required: true, message: '请输入您的姓' }]}
                        >
                          <Input prefix={<UserOutlined />} />
                        </Form.Item>
                      </Col>
                    </Row>
                    
                    <Form.Item
                      name="displayName"
                      label="显示名称"
                    >
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                    
                    <Form.Item
                      name="email"
                      label="邮箱"
                      rules={[
                        { required: true, message: '请输入您的邮箱' },
                        { type: 'email', message: '请输入有效的邮箱地址' }
                      ]}
                    >
                      <Input prefix={<MailOutlined />} />
                    </Form.Item>
                    
                    <Form.Item>
                      <Space>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                          保存更改
                        </Button>
                        <Button onClick={handleCancel} icon={<CloseOutlined />}>
                          取消
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                ) : (
                  <Descriptions 
                    title="个人资料" 
                    layout="vertical" 
                    bordered
                    column={{ xs: 1, sm: 2 }}
                  >
                    <Descriptions.Item label="姓名">{userData.firstName} {userData.lastName}</Descriptions.Item>
                    <Descriptions.Item label="显示名称">{userData.displayName || '未设置'}</Descriptions.Item>
                    <Descriptions.Item label="用户名">{userData.username}</Descriptions.Item>
                    <Descriptions.Item label="电子邮箱">{userData.email}</Descriptions.Item>
                    <Descriptions.Item label="角色">{getRoleBadge(userData.role)}</Descriptions.Item>
                    <Descriptions.Item label="账户状态">
                      {userData.isActive ? 
                        <Badge status="success" text="活跃" /> : 
                        <Badge status="error" text="已禁用" />
                      }
                    </Descriptions.Item>
                    <Descriptions.Item label="个人简介" span={2}>
                      暂无个人简介
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </TabPane>
              
              {isCurrentUser && (
                <TabPane 
                  tab={
                    <span>
                      <SafetyOutlined />
                      安全设置
                    </span>
                  } 
                  key="security"
                >
                  <Title level={4}>修改密码</Title>
                  <Form
                    layout="vertical"
                    onFinish={handlePasswordChange}
                  >
                    <Form.Item
                      name="currentPassword"
                      label="当前密码"
                      rules={[{ required: true, message: '请输入当前密码' }]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                    
                    <Form.Item
                      name="newPassword"
                      label="新密码"
                      rules={[
                        { required: true, message: '请输入新密码' },
                        { min: 6, message: '密码长度至少为6个字符' }
                      ]}
                      hasFeedback
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                    
                    <Form.Item
                      name="confirmPassword"
                      label="确认新密码"
                      dependencies={['newPassword']}
                      hasFeedback
                      rules={[
                        { required: true, message: '请确认新密码' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('两次输入的密码不匹配'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        更新密码
                      </Button>
                    </Form.Item>
                  </Form>
                  
                  <Divider />
                  
                  <Title level={4}>账户安全</Title>
                  <Descriptions bordered column={1}>
                    <Descriptions.Item label="账户保护">
                      <Badge status="success" text="已启用密码保护" />
                    </Descriptions.Item>
                    <Descriptions.Item label="登录状态">
                      <Badge status="processing" text="当前设备已登录" />
                    </Descriptions.Item>
                    <Descriptions.Item label="两步验证">
                      <Badge status="default" text="未启用" />
                      <Button type="link" size="small">启用</Button>
                    </Descriptions.Item>
                  </Descriptions>
                </TabPane>
              )}
              
              {userData.role === 'student' && (
                <TabPane 
                  tab={
                    <span>
                      <BookOutlined />
                      学习记录
                    </span>
                  } 
                  key="learning"
                >
                  <Title level={4}>已选课程</Title>
                  <Paragraph>暂无学习记录</Paragraph>
                </TabPane>
              )}
            </Tabs>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default UserProfile; 