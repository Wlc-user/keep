import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Card, Tag, Dropdown, Menu, Typography, Modal, Form, Select, message, Avatar } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, UserAddOutlined, MoreOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

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

  // 模拟加载学生数据
  useEffect(() => {
    setTimeout(() => {
      const mockStudents: Student[] = Array(20).fill(0).map((_, index) => ({
        id: `stu-${index + 1}`,
        name: `学生${index + 1}`,
        username: `student${index + 1}`,
        email: `student${index + 1}@example.com`,
        enrolledCourses: Math.floor(Math.random() * 8),
        status: Math.random() > 0.2 ? 'active' : 'inactive',
        lastLogin: index % 3 === 0 ? '从未登录' : `${Math.ceil(Math.random() * 30)}天前`,
        avatar: index % 5 === 0 ? undefined : `/assets/avatar/student${(index % 10) + 1}.png`
      }));
      setStudents(mockStudents);
      setLoading(false);
    }, 1000);
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
      onFilter: (value: string, record: Student) => record.status === value,
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