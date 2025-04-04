import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select,
  DatePicker, Space, Popconfirm, Tag, Typography, Spin,
  Empty, Tabs, message
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import apiService from '../services/apiService';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface Exam {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalPoints: number;
  passingPoints: number;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const ExamManagement: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [courses, setCourses] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/api/exams');
      if (Array.isArray(response)) {
        setExams(response);
      } else if (response && response.items && Array.isArray(response.items)) {
        setExams(response.items);
      } else {
        message.error('获取考试数据格式不正确');
      }
    } catch (error) {
      console.error('获取考试列表失败:', error);
      message.error('获取考试列表失败');
      // 模拟数据，实际应用中应该移除
      setExams([
        {
          id: '1',
          title: '期中考试 - 计算机科学基础',
          description: '计算机科学基础课程的期中考试，涵盖算法、数据结构和计算机组成原理',
          courseId: '101',
          courseName: '计算机科学基础',
          startTime: '2023-10-15T09:00:00',
          endTime: '2023-10-15T11:00:00',
          duration: 120,
          totalPoints: 100,
          passingPoints: 60,
          status: 'published',
          createdBy: 'admin',
          createdAt: '2023-09-20T14:00:00',
          updatedAt: '2023-09-25T10:30:00'
        },
        {
          id: '2',
          title: '期末考试 - Web开发实践',
          description: 'Web开发课程的期末考试，包括HTML/CSS/JavaScript和后端开发',
          courseId: '102',
          courseName: 'Web开发实践',
          startTime: '2023-12-20T14:00:00',
          endTime: '2023-12-20T17:00:00',
          duration: 180,
          totalPoints: 150,
          passingPoints: 90,
          status: 'draft',
          createdBy: 'admin',
          createdAt: '2023-11-15T09:30:00',
          updatedAt: '2023-11-18T16:45:00'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await apiService.get('/api/courses');
      if (Array.isArray(response)) {
        setCourses(response);
      } else if (response && response.items && Array.isArray(response.items)) {
        setCourses(response.items);
      }
    } catch (error) {
      console.error('获取课程列表失败:', error);
      // 模拟数据，实际应用中应该移除
      setCourses([
        { id: '101', title: '计算机科学基础' },
        { id: '102', title: 'Web开发实践' },
        { id: '103', title: '数据库系统' }
      ]);
    }
  };

  const handleCreate = () => {
    form.resetFields();
    setCurrentExam(null);
    setModalVisible(true);
  };

  const handleEdit = (exam: Exam) => {
    setCurrentExam(exam);
    form.setFieldsValue({
      title: exam.title,
      description: exam.description,
      courseId: exam.courseId,
      timeRange: [
        new Date(exam.startTime),
        new Date(exam.endTime)
      ],
      duration: exam.duration,
      totalPoints: exam.totalPoints,
      passingPoints: exam.passingPoints,
      status: exam.status
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.delete(`/api/exams/${id}`);
      message.success('考试已删除');
      fetchExams();
    } catch (error) {
      console.error('删除考试失败:', error);
      message.error('删除考试失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      const [startTime, endTime] = values.timeRange;
      const examData = {
        ...values,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        timeRange: undefined,
      };

      if (currentExam) {
        await apiService.put(`/api/exams/${currentExam.id}`, examData);
        message.success('考试已更新');
      } else {
        await apiService.post('/api/exams', examData);
        message.success('考试已创建');
      }

      setModalVisible(false);
      fetchExams();
    } catch (error) {
      console.error('保存考试失败:', error);
      message.error('保存考试失败');
    } finally {
      setConfirmLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return <Tag color="default">草稿</Tag>;
      case 'published':
        return <Tag color="green">已发布</Tag>;
      case 'ongoing':
        return <Tag color="blue">进行中</Tag>;
      case 'completed':
        return <Tag color="purple">已结束</Tag>;
      case 'cancelled':
        return <Tag color="red">已取消</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Exam) => (
        <a onClick={() => handleEdit(record)}>{text}</a>
      )
    },
    {
      title: '课程',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '时长(分钟)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: '总分',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Exam) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => message.info('查看考试详情功能开发中')} 
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)} 
          />
          <Popconfirm
            title="确定要删除这个考试吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredExams = exams.filter(exam => {
    switch (activeTab) {
      case 'draft':
        return exam.status === 'draft';
      case 'published':
        return exam.status === 'published';
      case 'ongoing':
        return exam.status === 'ongoing';
      case 'completed':
        return exam.status === 'completed';
      default:
        return true;
    }
  });

  return (
    <div className="exam-management">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={2}>考试管理</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            创建考试
          </Button>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="全部考试" key="all" />
          <TabPane tab="草稿" key="draft" />
          <TabPane tab="已发布" key="published" />
          <TabPane tab="进行中" key="ongoing" />
          <TabPane tab="已结束" key="completed" />
        </Tabs>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Spin size="large" tip="加载中..." />
          </div>
        ) : filteredExams.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredExams}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty description="暂无考试数据" />
        )}
      </Card>

      {/* 创建/编辑考试模态框 */}
      <Modal
        title={currentExam ? '编辑考试' : '创建考试'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={confirmLoading}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'draft',
            duration: 60,
            totalPoints: 100,
            passingPoints: 60
          }}
        >
          <Form.Item
            name="title"
            label="考试标题"
            rules={[{ required: true, message: '请输入考试标题' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="考试描述"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="courseId"
            label="关联课程"
            rules={[{ required: true, message: '请选择关联课程' }]}
          >
            <Select>
              {courses.map(course => (
                <Option key={course.id} value={course.id}>{course.title}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="考试时间范围"
            rules={[{ required: true, message: '请选择考试时间范围' }]}
          >
            <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="duration"
            label="考试时长(分钟)"
            rules={[{ required: true, message: '请输入考试时长' }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="totalPoints"
            label="总分"
            rules={[{ required: true, message: '请输入考试总分' }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="passingPoints"
            label="及格分数"
            rules={[{ required: true, message: '请输入及格分数' }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择考试状态' }]}
          >
            <Select>
              <Option value="draft">草稿</Option>
              <Option value="published">已发布</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamManagement; 