import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Tag, Modal, Form, Space, Avatar, Card, message } from 'antd';
import { UserOutlined, SearchOutlined, PlusOutlined, EditOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';

const { Option } = Select;

// 教师状态枚举
enum TeacherStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

// 教师信息接口
interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  department: string;
  status: TeacherStatus;
  courses: number;
  students: number;
  createdAt: string;
  avatar?: string;
}

// 模拟数据
const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: '张教授',
    email: 'zhang@example.com',
    phone: '13800138001',
    title: '教授',
    department: '计算机科学',
    status: TeacherStatus.ACTIVE,
    courses: 5,
    students: 128,
    createdAt: '2023-01-15'
  },
  {
    id: '2',
    name: '李博士',
    email: 'li@example.com',
    phone: '13800138002',
    title: '副教授',
    department: '软件工程',
    status: TeacherStatus.ACTIVE,
    courses: 3,
    students: 96,
    createdAt: '2023-02-10'
  },
  {
    id: '3',
    name: '王讲师',
    email: 'wang@example.com',
    phone: '13800138003',
    title: '讲师',
    department: '人工智能',
    status: TeacherStatus.INACTIVE,
    courses: 2,
    students: 64,
    createdAt: '2023-01-20'
  },
  {
    id: '4',
    name: '赵老师',
    email: 'zhao@example.com',
    phone: '13800138004',
    title: '助教',
    department: '数据科学',
    status: TeacherStatus.PENDING,
    courses: 0,
    students: 0,
    createdAt: '2023-03-05'
  },
  {
    id: '5',
    name: '钱教授',
    email: 'qian@example.com',
    phone: '13800138005',
    title: '教授',
    department: '网络安全',
    status: TeacherStatus.ACTIVE,
    courses: 4,
    students: 112,
    createdAt: '2023-02-01'
  }
];

// 部门列表
const departments = ['计算机科学', '软件工程', '人工智能', '数据科学', '网络安全', '移动开发'];

// 职称列表
const titles = ['教授', '副教授', '讲师', '助教'];

const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<TeacherStatus | ''>('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // 模拟获取教师数据
  useEffect(() => {
    setLoading(true);
    // 模拟API请求延迟
    const timer = setTimeout(() => {
      setTeachers(mockTeachers);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // 处理添加教师
  const handleAddTeacher = () => {
    setEditingTeacher(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 处理编辑教师
  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    form.setFieldsValue({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      title: teacher.title,
      department: teacher.department,
      status: teacher.status
    });
    setModalVisible(true);
  };

  // 处理禁用/启用教师
  const handleToggleStatus = (teacher: Teacher) => {
    const newStatus = teacher.status === TeacherStatus.ACTIVE 
      ? TeacherStatus.INACTIVE 
      : TeacherStatus.ACTIVE;
    
    Modal.confirm({
      title: `确认${newStatus === TeacherStatus.ACTIVE ? '启用' : '禁用'}教师`,
      content: `确定要${newStatus === TeacherStatus.ACTIVE ? '启用' : '禁用'}教师 "${teacher.name}" 吗？`,
      onOk() {
        // 这里应该调用API更新教师状态
        const updatedTeachers = teachers.map(item => {
          if (item.id === teacher.id) {
            return { ...item, status: newStatus };
          }
          return item;
        });
        
        setTeachers(updatedTeachers);
        message.success(`教师${newStatus === TeacherStatus.ACTIVE ? '启用' : '禁用'}成功`);
      }
    });
  };

  // 处理审核教师
  const handleApproveTeacher = (teacher: Teacher) => {
    Modal.confirm({
      title: '确认审核通过',
      content: `确定要审核通过教师 "${teacher.name}" 的申请吗？`,
      onOk() {
        // 这里应该调用API更新教师状态
        const updatedTeachers = teachers.map(item => {
          if (item.id === teacher.id) {
            return { ...item, status: TeacherStatus.ACTIVE };
          }
          return item;
        });
        
        setTeachers(updatedTeachers);
        message.success('教师审核通过成功');
      }
    });
  };

  // 处理表单提交
  const handleModalOk = () => {
    form.validateFields().then(values => {
      // 这里应该调用API保存教师信息
      if (editingTeacher) {
        // 更新教师
        const updatedTeachers = teachers.map(item => {
          if (item.id === editingTeacher.id) {
            return { ...item, ...values };
          }
          return item;
        });
        
        setTeachers(updatedTeachers);
        message.success('教师信息更新成功');
      } else {
        // 添加教师
        const newTeacher: Teacher = {
          id: `${teachers.length + 1}`,
          ...values,
          courses: 0,
          students: 0,
          createdAt: new Date().toISOString().split('T')[0]
        };
        
        setTeachers([...teachers, newTeacher]);
        message.success('教师添加成功');
      }
      
      setModalVisible(false);
    });
  };

  // 获取状态标签
  const getStatusTag = (status: TeacherStatus) => {
    switch (status) {
      case TeacherStatus.ACTIVE:
        return <Tag color="success">已启用</Tag>;
      case TeacherStatus.INACTIVE:
        return <Tag color="error">已禁用</Tag>;
      case TeacherStatus.PENDING:
        return <Tag color="processing">待审核</Tag>;
      default:
        return null;
    }
  };

  // 过滤教师数据
  const getFilteredTeachers = () => {
    return teachers.filter(teacher => {
      const matchesSearch = searchText 
        ? teacher.name.includes(searchText) || 
          teacher.email.includes(searchText) || 
          teacher.department.includes(searchText)
        : true;
      
      const matchesStatus = statusFilter 
        ? teacher.status === statusFilter
        : true;
      
      const matchesDepartment = departmentFilter 
        ? teacher.department === departmentFilter
        : true;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Teacher) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          {text}
        </Space>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '职称',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '所属部门',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: TeacherStatus) => getStatusTag(status)
    },
    {
      title: '课程数',
      dataIndex: 'courses',
      key: 'courses'
    },
    {
      title: '学生数',
      dataIndex: 'students',
      key: 'students'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Teacher) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditTeacher(record)}
          />
          {record.status === TeacherStatus.PENDING ? (
            <Button 
              type="text" 
              icon={<CheckCircleOutlined />} 
              style={{ color: '#52c41a' }}
              onClick={() => handleApproveTeacher(record)}
            />
          ) : (
            <Button 
              type="text" 
              icon={<StopOutlined />} 
              danger={record.status === TeacherStatus.ACTIVE}
              style={{ color: record.status === TeacherStatus.INACTIVE ? '#52c41a' : undefined }}
              onClick={() => handleToggleStatus(record)}
            />
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        title="教师管理" 
        subtitle="管理系统中的教师信息" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddTeacher}
          >
            添加教师
          </Button>
        }
      />

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="搜索教师"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="状态筛选"
            style={{ width: 120 }}
            value={statusFilter}
            onChange={value => setStatusFilter(value)}
            allowClear
          >
            <Option value={TeacherStatus.ACTIVE}>已启用</Option>
            <Option value={TeacherStatus.INACTIVE}>已禁用</Option>
            <Option value={TeacherStatus.PENDING}>待审核</Option>
          </Select>
          <Select
            placeholder="部门筛选"
            style={{ width: 150 }}
            value={departmentFilter}
            onChange={value => setDepartmentFilter(value)}
            allowClear
          >
            {departments.map(dept => (
              <Option key={dept} value={dept}>{dept}</Option>
            ))}
          </Select>
        </Space>
      </Card>

      <Card>
        <Table 
          dataSource={getFilteredTeachers()} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条记录`
          }}
        />
      </Card>

      <Modal
        title={editingTeacher ? '编辑教师' : '添加教师'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入教师姓名' }]}
          >
            <Input placeholder="请输入教师姓名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入教师邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入教师邮箱" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="电话"
            rules={[{ required: true, message: '请输入教师电话' }]}
          >
            <Input placeholder="请输入教师电话" />
          </Form.Item>
          <Form.Item
            name="title"
            label="职称"
            rules={[{ required: true, message: '请选择教师职称' }]}
          >
            <Select placeholder="请选择教师职称">
              {titles.map(title => (
                <Option key={title} value={title}>{title}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="department"
            label="所属部门"
            rules={[{ required: true, message: '请选择所属部门' }]}
          >
            <Select placeholder="请选择所属部门">
              {departments.map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>
          </Form.Item>
          {editingTeacher && (
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择教师状态' }]}
            >
              <Select placeholder="请选择教师状态">
                <Option value={TeacherStatus.ACTIVE}>已启用</Option>
                <Option value={TeacherStatus.INACTIVE}>已禁用</Option>
                <Option value={TeacherStatus.PENDING}>待审核</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherManagement; 