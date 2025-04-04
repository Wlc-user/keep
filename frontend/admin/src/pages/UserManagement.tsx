import React, { useState, useEffect } from 'react';
import {
  Table, Button, Input, Space, Card, Avatar, Tag, Typography, Modal, Tabs, Form,
  Select, message, Spin, Popconfirm, Upload, Switch, Tooltip, Empty
} from 'antd';
import {
  UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  UploadOutlined, ExportOutlined, ImportOutlined, ProfileOutlined
} from '@ant-design/icons';
import apiService from '../services/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface User {
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

interface UserFormValues {
  id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role: string;
  password?: string;
  confirmPassword?: string;
  isActive: boolean;
  avatar?: any;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加用户');
  const [form] = Form.useForm<UserFormValues>();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 尝试不同的API路径获取用户数据
      console.log('尝试获取用户数据...');
      
      // 尝试方法1: 使用推荐的API路径
      let usersData: any = null;
      
      try {
        // 先尝试 /api/users 路径
        usersData = await apiService.get('/api/users');
        console.log('通过 /api/users 获取数据成功');
      } catch (error) {
        console.log('/api/users 路径不可用，尝试其他路径');
        
        // 尝试方法2: 使用另一个可能的路径
        try {
          usersData = await apiService.get('/users');
          console.log('通过 /users 获取数据成功');
        } catch (altPathError) {
          console.log('所有API路径尝试失败');
          throw new Error('无法从任何API路径获取用户数据');
        }
      }
      
      // 处理获取到的数据
      if (usersData) {
        if (Array.isArray(usersData)) {
          // 处理API返回的数组数据
          setUsers(usersData);
        } else if (usersData.items && Array.isArray(usersData.items)) {
          // 处理包装在items字段中的数据格式
          setUsers(usersData.items);
        } else if (usersData.data && Array.isArray(usersData.data)) {
          // 处理包装在data字段中的数据格式
          setUsers(usersData.data);
        } else {
          // 数据格式不符合预期
          console.warn('API返回的数据格式不符合预期');
          message.error('获取用户数据格式不正确');
          setUsers([]);
        }
      } else {
        console.warn('未能获取到用户数据');
        message.error('获取用户数据失败');
        setUsers([]);
      }
    } catch (error) {
      console.error('获取用户数据失败:', error);
      
      // 判断错误类型
      if (axios.isCancel(error)) {
        console.log('请求被取消，这通常是由于页面切换导致的');
      } else if (axios.isAxiosError(error)) {
        if (error.response) {
          console.log(`服务器返回错误: ${error.response.status}`);
        } else if (error.request) {
          console.log('无法连接到服务器，请检查网络');
        }
      }
      
      message.error('获取用户数据失败，请稍后重试');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleAddUser = () => {
    setModalTitle('添加用户');
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      role: 'student',
      isActive: true
    });
    setModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setModalTitle('编辑用户');
    setEditingUser(user);
    form.setFieldsValue({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      role: user.role,
      isActive: user.isActive
    });
    setModalVisible(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await apiService.delete(`/api/users/${userId}`);
      message.success('用户已删除');
      fetchUsers();
    } catch (error) {
      console.error('删除用户失败:', error);
      message.error('删除用户失败，请稍后重试');
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      // 构建更新或创建的用户对象
      const userData = {
        username: values.username,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        displayName: values.displayName,
        role: values.role,
        isActive: values.isActive
      };
      
      if (!editingUser) {
        // 添加密码字段，仅在创建新用户时
        userData['password'] = values.password;
      }
      
      if (editingUser) {
        // 更新现有用户
        await apiService.put(`/api/users/${editingUser.id}`, userData);
        message.success('用户已更新');
      } else {
        // 创建新用户
        await apiService.post('/api/users', userData);
        message.success('用户已创建');
      }
      
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('保存用户失败:', error);
      message.error('保存用户失败，请检查表单数据或稍后重试');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleViewUserProfile = (userId: string) => {
    navigate(`/users/${userId}`);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchText.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchText.toLowerCase())) ||
      (user.displayName && user.displayName.toLowerCase().includes(searchText.toLowerCase()));
    
    if (activeTab === 'all') {
      return matchesSearch;
    }
    
    return matchesSearch && user.role.toLowerCase() === activeTab;
  });

  const getRoleTag = (role: string) => {
    let color = '';
    let text = '';
    
    switch (role.toLowerCase()) {
      case 'admin':
        color = 'red';
        text = '管理员';
        break;
      case 'teacher':
        color = 'blue';
        text = '教师';
        break;
      case 'student':
        color = 'green';
        text = '学生';
        break;
      default:
        color = 'default';
        text = role;
    }
    
    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: User) => (
        <Space>
          <Avatar 
            src={record.avatarUrl} 
            icon={<UserOutlined />} 
            size="small"
          />
          <a onClick={() => handleViewUserProfile(record.id)}>{text}</a>
        </Space>
      )
    },
    {
      title: '姓名',
      key: 'name',
      render: (_: any, record: User) => (
        <span>
          {record.firstName} {record.lastName}
          {record.displayName && <Text type="secondary"> ({record.displayName})</Text>}
        </span>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => getRoleTag(role)
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '活跃' : '禁用'}
        </Tag>
      )
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (lastLogin: string) => lastLogin ? new Date(lastLogin).toLocaleString() : '从未登录'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Tooltip title="查看资料">
            <Button 
              type="text" 
              icon={<ProfileOutlined />} 
              onClick={() => handleViewUserProfile(record.id)} 
            />
          </Tooltip>
          <Tooltip title="编辑用户">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditUser(record)} 
            />
          </Tooltip>
          <Tooltip title="删除用户">
            <Popconfirm
              title="确定要删除这个用户吗？"
              onConfirm={() => handleDeleteUser(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="user-management">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={2}>用户管理</Title>
          <Space>
            <Input
              placeholder="搜索用户..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => handleSearch(e.target.value)}
              style={{ width: 200 }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddUser}
            >
              添加用户
            </Button>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="全部用户" key="all" />
          <TabPane tab="管理员" key="admin" />
          <TabPane tab="教师" key="teacher" />
          <TabPane tab="学生" key="student" />
        </Tabs>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Spin size="large">
              <div style={{ padding: '30px', background: '#f0f2f5', borderRadius: '4px' }}>
                加载用户数据...
              </div>
            </Spin>
          </div>
        ) : filteredUsers.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty 
            description={
              searchText ? "没有找到匹配的用户" : "暂无用户数据"
            }
            style={{ margin: '40px 0' }}
          />
        )}
      </Card>

      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={confirmLoading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ role: 'student', isActive: true }}
        >
          {editingUser && (
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>
          )}
          
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="firstName"
            label="名"
            rules={[{ required: true, message: '请输入名' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="lastName"
            label="姓"
            rules={[{ required: true, message: '请输入姓' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="displayName"
            label="显示名称"
          >
            <Input placeholder="可选" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Option value="admin">管理员</Option>
              <Option value="teacher">教师</Option>
              <Option value="student">学生</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="isActive"
            label="状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="活跃" unCheckedChildren="禁用" />
          </Form.Item>
          
          {!editingUser && (
            <>
              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码长度至少为6个字符' }
                ]}
              >
                <Input.Password />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
            </>
          )}
          
          <Form.Item
            name="avatar"
            label="头像"
          >
            <Upload
              action="/api/uploads/avatar"
              listType="picture"
              maxCount={1}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('只能上传图片文件!');
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error('图片大小不能超过2MB!');
                }
                return isImage && isLt2M;
              }}
            >
              <Button icon={<UploadOutlined />}>上传头像</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement; 