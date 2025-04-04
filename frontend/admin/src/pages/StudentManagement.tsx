import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Card, Tag, Dropdown, Menu, Typography, Modal, Form, Select, message, Avatar } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, UserAddOutlined, MoreOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getUserAvatarPlaceholderImage, handleImageError } from '../utils/imageUtils';
import apiService from '../services/api';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

interface Student {
  id: string;
  name: string;
  username: string;
  email: string;
  enrolledCourses: number;
  status: string;
  lastLogin?: string;
  avatar?: string;
}

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();

  // 获取学生数据
  const fetchStudents = async () => {
    setLoading(true);
    try {
      // 尝试不同的API路径获取学生数据
      console.log('尝试获取学生数据...');
      
      // 尝试方法1: 使用推荐的API路径
      let studentsData: any = null;
      
      try {
        // 先尝试 /api/students 路径
        studentsData = await apiService.get('/api/students');
        console.log('通过 /api/students 获取数据成功');
      } catch (error) {
        console.log('/api/students 路径不可用，尝试其他路径');
        
        // 尝试方法2: 使用 /api/users 路径，筛选学生角色
        try {
          studentsData = await apiService.get('/api/users?role=student');
          console.log('通过 /api/users?role=student 获取数据成功');
        } catch (userError) {
          console.log('/api/users 路径不可用，尝试其他路径');
          
          // 尝试方法3: 使用其他可能的路径
          try {
            studentsData = await apiService.get('/students');
            console.log('通过 /students 获取数据成功');
          } catch (altPathError) {
            console.log('所有API路径尝试失败，将使用模拟数据');
            throw new Error('无法从任何API路径获取学生数据');
          }
        }
      }
      
      // 处理获取到的数据
      if (studentsData) {
        if (Array.isArray(studentsData)) {
          // 处理API返回的数组数据
          const formattedStudents = studentsData.map(formatStudentData);
          setStudents(formattedStudents);
        } else if (studentsData.items && Array.isArray(studentsData.items)) {
          // 处理包装在items字段中的数据格式
          const formattedStudents = studentsData.items.map(formatStudentData);
          setStudents(formattedStudents);
        } else {
          // 数据格式不符合预期
          console.warn('API返回的数据格式不符合预期，将使用模拟数据');
          useMockStudentData();
        }
      } else {
        console.warn('未能获取到学生数据，将使用模拟数据');
        useMockStudentData();
      }
    } catch (error) {
      console.error('获取学生数据失败:', error);
      
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
      
      message.info('已切换到模拟数据模式');
      useMockStudentData();
    } finally {
      setLoading(false);
    }
  };

  // 格式化学生数据
  const formatStudentData = (item: any): Student => ({
    id: item.id?.toString() || '',
    name: item.name || item.fullName || '',
    username: item.username || '',
    email: item.email || '',
    enrolledCourses: item.enrolledCourses || item.courseCount || 0,
    status: item.status || (item.isActive ? 'active' : 'inactive'),
    lastLogin: item.lastLogin ? new Date(item.lastLogin).toLocaleDateString() : '从未登录',
    avatar: item.avatar || item.profileImage || getUserAvatarPlaceholderImage(item.id, item.name || '')
  });

  // 使用模拟学生数据
  const useMockStudentData = () => {
    const mockStudents: Student[] = Array(20).fill(0).map((_, index) => {
      const isActive = Math.random() > 0.2;
      const lastLogin = index % 3 === 0 ? '从未登录' : `${Math.ceil(Math.random() * 30)}天前`;
      const name = `学生${index + 1}`;
      const username = `student${index + 1}`;
      
      return {
        id: `stu-${index + 1}`,
        name: name,
        username: username,
        email: `${username}@example.com`,
        enrolledCourses: Math.floor(Math.random() * 8),
        status: isActive ? 'active' : 'inactive',
        lastLogin: lastLogin,
        // 使用在线占位图作为头像
        avatar: getUserAvatarPlaceholderImage(`stu-${index + 1}`, name)
      };
    });
    setStudents(mockStudents);
    message.info('已加载模拟学生数据');
  };

  // 初始化加载数据
  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    form.setFieldsValue(student);
    setModalVisible(true);
  };

  const handleDeleteStudent = (studentId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '您确定要删除这名学生吗？此操作不可撤销。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setStudents(students.filter(student => student.id !== studentId));
        message.success('学生已删除');
      }
    });
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingStudent) {
        // 编辑现有学生
        setStudents(students.map(student => 
          student.id === editingStudent.id ? { ...student, ...values } : student
        ));
        message.success('学生信息已更新');
      } else {
        // 添加新学生
        const newStudent: Student = {
          id: `stu-${Date.now()}`,
          name: values.name,
          username: values.username,
          email: values.email,
          enrolledCourses: 0,
          status: values.status,
          lastLogin: '从未登录'
        };
        setStudents([...students, newStudent]);
        message.success('学生已添加');
      }
      setModalVisible(false);
    });
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchText.toLowerCase()) ||
    student.username.toLowerCase().includes(searchText.toLowerCase()) ||
    student.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar: string | undefined, record: Student) => (
        <Avatar 
          src={avatar} 
          icon={<UserOutlined />} 
          alt={record.name}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => handleImageError(e, getUserAvatarPlaceholderImage(record.id, record.name))}
        />
      )
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Student) => (
        <Link to={`/admin/students/${record.id}`}>{text}</Link>
      )
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '已选课程',
      dataIndex: 'enrolledCourses',
      key: 'enrolledCourses',
      sorter: (a: Student, b: Student) => a.enrolledCourses - b.enrolledCourses,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活跃' : '未激活'}
        </Tag>
      ),
      filters: [
        { text: '活跃', value: 'active' },
        { text: '未激活', value: 'inactive' },
      ],
      onFilter: (value: any, record: Student) => record.status === value,
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Student) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditStudent(record)} 
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteStudent(record.id)} 
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="student-management">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={2}>学生管理</Title>
          <Space>
            <Input
              placeholder="搜索学生..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => handleSearch(e.target.value)}
              style={{ width: 200 }}
            />
            <Button 
              type="primary" 
              icon={<UserAddOutlined />} 
              onClick={handleAddStudent}
            >
              添加学生
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingStudent ? '编辑学生' : '添加学生'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
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
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="active">活跃</Option>
              <Option value="inactive">未激活</Option>
            </Select>
          </Form.Item>
          {!editingStudent && (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[{ required: true, message: '请输入初始密码' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default StudentManagement; 