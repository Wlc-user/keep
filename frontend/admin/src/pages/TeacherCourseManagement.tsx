import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Upload, 
  message,
  Tooltip,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  UploadOutlined,
  TeamOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// 课程状态类型
type CourseStatus = 'draft' | 'published' | 'archived';

// 课程接口
interface Course {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  schedule: string;
  category: string;
  status: CourseStatus;
  enrolledStudents: number;
  progress: number;
  createdAt: string;
}

// 模拟课程数据
const mockCourses: Course[] = [
  {
    id: '1',
    title: '人工智能导论',
    description: '本课程介绍人工智能的基本概念、发展历史、核心技术和应用领域。',
    coverImage: 'https://via.placeholder.com/300x150?text=AI+Introduction',
    startDate: '2023-03-01',
    endDate: '2023-06-30',
    schedule: '每周三 14:00-15:30',
    category: '计算机科学',
    status: 'published',
    enrolledStudents: 45,
    progress: 60,
    createdAt: '2023-02-15'
  },
  {
    id: '2',
    title: '机器学习基础',
    description: '本课程介绍机器学习的基本原理、常用算法和实践应用。',
    coverImage: 'https://via.placeholder.com/300x150?text=Machine+Learning',
    startDate: '2023-03-02',
    endDate: '2023-07-01',
    schedule: '每周四 10:00-11:30',
    category: '计算机科学',
    status: 'published',
    enrolledStudents: 38,
    progress: 55,
    createdAt: '2023-02-16'
  },
  {
    id: '3',
    title: '深度学习实践',
    description: '本课程介绍深度学习的核心概念、常用模型和实际应用案例。',
    coverImage: 'https://via.placeholder.com/300x150?text=Deep+Learning',
    startDate: '2023-03-03',
    endDate: '2023-07-02',
    schedule: '每周五 15:30-17:00',
    category: '计算机科学',
    status: 'draft',
    enrolledStudents: 0,
    progress: 0,
    createdAt: '2023-02-20'
  },
  {
    id: '4',
    title: '数据挖掘技术',
    description: '本课程介绍数据挖掘的基本概念、常用技术和实际应用。',
    coverImage: 'https://via.placeholder.com/300x150?text=Data+Mining',
    startDate: '2023-03-06',
    endDate: '2023-07-05',
    schedule: '每周一 09:00-10:30',
    category: '数据科学',
    status: 'published',
    enrolledStudents: 42,
    progress: 40,
    createdAt: '2023-02-18'
  },
  {
    id: '5',
    title: '计算机视觉',
    description: '本课程介绍计算机视觉的基本原理、算法和应用。',
    coverImage: 'https://via.placeholder.com/300x150?text=Computer+Vision',
    startDate: '2023-03-07',
    endDate: '2023-07-06',
    schedule: '每周二 13:30-15:00',
    category: '计算机科学',
    status: 'archived',
    enrolledStudents: 35,
    progress: 100,
    createdAt: '2023-01-10'
  }
];

// 模拟课程分类
const courseCategories = [
  '计算机科学',
  '数据科学',
  '人工智能',
  '软件工程',
  '网络安全',
  '云计算',
  '大数据',
  '物联网'
];

const TeacherCourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 获取课程列表
  useEffect(() => {
    setLoading(true);
    // 模拟API请求
    setTimeout(() => {
      setCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, []);

  // 获取课程统计数据
  const getStatistics = () => {
    return {
      total: courses.length,
      published: courses.filter(c => c.status === 'published').length,
      draft: courses.filter(c => c.status === 'draft').length,
      archived: courses.filter(c => c.status === 'archived').length,
      students: courses.reduce((acc, c) => acc + c.enrolledStudents, 0)
    };
  };

  // 打开创建/编辑课程模态框
  const showModal = (course?: Course) => {
    setEditingCourse(course || null);
    
    if (course) {
      form.setFieldsValue({
        ...course,
        dateRange: [dayjs(course.startDate), dayjs(course.endDate)]
      });
      
      // 设置封面图片
      if (course.coverImage) {
        setFileList([
          {
            uid: '-1',
            name: 'cover.png',
            status: 'done',
            url: course.coverImage,
          }
        ]);
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
    
    setModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setModalVisible(false);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      // 处理日期范围
      const [startDate, endDate] = values.dateRange;
      
      // 构建课程对象
      const courseData = {
        ...values,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        coverImage: fileList.length > 0 ? fileList[0].url || fileList[0].thumbUrl : '',
      };
      
      // 模拟API请求
      setTimeout(() => {
        if (editingCourse) {
          // 更新课程
          const updatedCourses = courses.map(c => 
            c.id === editingCourse.id ? { ...c, ...courseData } : c
          );
          setCourses(updatedCourses);
          message.success('课程更新成功');
        } else {
          // 创建课程
          const newCourse: Course = {
            id: `${Date.now()}`,
            ...courseData,
            enrolledStudents: 0,
            progress: 0,
            createdAt: new Date().toISOString().split('T')[0]
          };
          setCourses([...courses, newCourse]);
          message.success('课程创建成功');
        }
        
        setConfirmLoading(false);
        setModalVisible(false);
      }, 1000);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 删除课程
  const handleDelete = (id: string) => {
    setLoading(true);
    // 模拟API请求
    setTimeout(() => {
      const updatedCourses = courses.filter(c => c.id !== id);
      setCourses(updatedCourses);
      setLoading(false);
      message.success('课程删除成功');
    }, 1000);
  };

  // 查看课程详情
  const handleView = (id: string) => {
    navigate(`/teacher/courses/${id}`);
  };

  // 更改课程状态
  const handleStatusChange = (id: string, status: CourseStatus) => {
    const updatedCourses = courses.map(c => 
      c.id === id ? { ...c, status } : c
    );
    setCourses(updatedCourses);
    message.success(`课程状态已更改为${status === 'published' ? '已发布' : status === 'draft' ? '草稿' : '已归档'}`);
  };

  // 上传前检查文件
  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传JPG/PNG格式的图片!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  // 处理上传变化
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 获取状态标签
  const getStatusTag = (status: CourseStatus) => {
    switch (status) {
      case 'published':
        return <Tag color="success">已发布</Tag>;
      case 'draft':
        return <Tag color="warning">草稿</Tag>;
      case 'archived':
        return <Tag color="default">已归档</Tag>;
      default:
        return null;
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '课程名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Course) => (
        <Space>
          <img 
            src={record.coverImage || 'https://via.placeholder.com/50x50'} 
            alt={text} 
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
          />
          <Link to={`/teacher/courses/${record.id}`}>{text}</Link>
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '开课时间',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: '结课时间',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: '学生数',
      dataIndex: 'enrolledStudents',
      key: 'enrolledStudents',
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => `${progress}%`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: CourseStatus) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Course) => (
        <Space size="middle">
          <Tooltip title="查看">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleView(record.id)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => showModal(record)}
            />
          </Tooltip>
          {record.status !== 'published' && (
            <Tooltip title="发布">
              <Button 
                type="text" 
                icon={<CheckCircleOutlined />} 
                onClick={() => handleStatusChange(record.id, 'published')}
              />
            </Tooltip>
          )}
          {record.status === 'published' && (
            <Tooltip title="归档">
              <Button 
                type="text" 
                icon={<ClockCircleOutlined />} 
                onClick={() => handleStatusChange(record.id, 'archived')}
              />
            </Tooltip>
          )}
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个课程吗?"
              onConfirm={() => handleDelete(record.id)}
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

  const stats = getStatistics();

  return (
    <div>
      <Title level={2}>我的课程</Title>
      <Text type="secondary">管理您创建的所有课程</Text>
      
      <Row gutter={16} style={{ marginTop: 24, marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="总课程数" 
              value={stats.total} 
              prefix={<BookOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="已发布课程" 
              value={stats.published} 
              prefix={<CheckCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="草稿课程" 
              value={stats.draft} 
              prefix={<EditOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="总学生数" 
              value={stats.students} 
              prefix={<TeamOutlined />} 
            />
          </Card>
        </Col>
      </Row>
      
      <Card
        title="课程列表"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal()}
          >
            创建课程
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={courses} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      <Modal
        title={editingCourse ? '编辑课程' : '创建课程'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'draft'
          }}
        >
          <Form.Item
            name="title"
            label="课程名称"
            rules={[{ required: true, message: '请输入课程名称' }]}
          >
            <Input placeholder="请输入课程名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="课程描述"
            rules={[{ required: true, message: '请输入课程描述' }]}
          >
            <TextArea rows={4} placeholder="请输入课程描述" />
          </Form.Item>
          
          <Form.Item
            name="category"
            label="课程分类"
            rules={[{ required: true, message: '请选择课程分类' }]}
          >
            <Select placeholder="请选择课程分类">
              {courseCategories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="dateRange"
            label="课程时间"
            rules={[{ required: true, message: '请选择课程开始和结束时间' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="schedule"
            label="上课时间"
            rules={[{ required: true, message: '请输入上课时间' }]}
          >
            <Input placeholder="例如：每周三 14:00-15:30" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="课程状态"
            rules={[{ required: true, message: '请选择课程状态' }]}
          >
            <Select>
              <Option value="draft">草稿</Option>
              <Option value="published">发布</Option>
              <Option value="archived">归档</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="课程封面"
            name="coverImage"
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              maxCount={1}
            >
              {fileList.length < 1 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherCourseManagement; 