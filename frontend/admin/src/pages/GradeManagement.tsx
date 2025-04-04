import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select,
  DatePicker, Space, Popconfirm, Tag, Typography, Spin,
  Empty, Tabs, message, InputNumber, Row, Col, Statistic
} from 'antd';
import {
  EditOutlined, DeleteOutlined, DownloadOutlined,
  UploadOutlined, FilterOutlined, SortAscendingOutlined,
  UserOutlined, BookOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import apiService from '../services/apiService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;

interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  examId: string;
  examName: string;
  score: number;
  totalScore: number;
  passingScore: number;
  isPassed: boolean;
  submittedAt: string;
  gradedAt: string;
  gradedBy: string;
  comments?: string;
}

const GradeManagement: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [courses, setCourses] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [currentGrade, setCurrentGrade] = useState<Grade | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchGrades();
    fetchCourses();
    fetchExams();
    fetchStudents();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/api/grades');
      if (Array.isArray(response)) {
        setGrades(response);
      } else if (response && response.items && Array.isArray(response.items)) {
        setGrades(response.items);
      } else {
        message.error('获取成绩数据格式不正确');
      }
    } catch (error) {
      console.error('获取成绩列表失败:', error);
      message.error('获取成绩列表失败');
      // 模拟数据，实际应用中应该移除
      setGrades([
        {
          id: '1',
          studentId: 'S101',
          studentName: '张三',
          courseId: 'C101',
          courseName: '计算机科学基础',
          examId: 'E101',
          examName: '期中考试 - 计算机科学基础',
          score: 85,
          totalScore: 100,
          passingScore: 60,
          isPassed: true,
          submittedAt: '2023-10-15T10:45:00',
          gradedAt: '2023-10-16T13:30:00',
          gradedBy: '李老师'
        },
        {
          id: '2',
          studentId: 'S102',
          studentName: '李四',
          courseId: 'C101',
          courseName: '计算机科学基础',
          examId: 'E101',
          examName: '期中考试 - 计算机科学基础',
          score: 72,
          totalScore: 100,
          passingScore: 60,
          isPassed: true,
          submittedAt: '2023-10-15T10:50:00',
          gradedAt: '2023-10-16T14:15:00',
          gradedBy: '李老师'
        },
        {
          id: '3',
          studentId: 'S103',
          studentName: '王五',
          courseId: 'C101',
          courseName: '计算机科学基础',
          examId: 'E101',
          examName: '期中考试 - 计算机科学基础',
          score: 45,
          totalScore: 100,
          passingScore: 60,
          isPassed: false,
          submittedAt: '2023-10-15T10:55:00',
          gradedAt: '2023-10-16T15:00:00',
          gradedBy: '李老师',
          comments: '需要复习基础概念'
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
      // 模拟数据
      setCourses([
        { id: 'C101', title: '计算机科学基础' },
        { id: 'C102', title: 'Web开发实践' }
      ]);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await apiService.get('/api/exams');
      if (Array.isArray(response)) {
        setExams(response);
      } else if (response && response.items && Array.isArray(response.items)) {
        setExams(response.items);
      }
    } catch (error) {
      console.error('获取考试列表失败:', error);
      // 模拟数据
      setExams([
        { id: 'E101', title: '期中考试 - 计算机科学基础' },
        { id: 'E102', title: '期末考试 - Web开发实践' }
      ]);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await apiService.get('/api/users?role=student');
      if (Array.isArray(response)) {
        setStudents(response);
      } else if (response && response.items && Array.isArray(response.items)) {
        setStudents(response.items);
      }
    } catch (error) {
      console.error('获取学生列表失败:', error);
      // 模拟数据
      setStudents([
        { id: 'S101', name: '张三' },
        { id: 'S102', name: '李四' },
        { id: 'S103', name: '王五' }
      ]);
    }
  };

  const handleEdit = (grade: Grade) => {
    setCurrentGrade(grade);
    form.setFieldsValue({
      studentId: grade.studentId,
      examId: grade.examId,
      score: grade.score,
      comments: grade.comments
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.delete(`/api/grades/${id}`);
      message.success('成绩记录已删除');
      fetchGrades();
    } catch (error) {
      console.error('删除成绩记录失败:', error);
      message.error('删除成绩记录失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      if (currentGrade) {
        await apiService.put(`/api/grades/${currentGrade.id}`, values);
        message.success('成绩已更新');
      } else {
        await apiService.post('/api/grades', values);
        message.success('成绩已添加');
      }

      setModalVisible(false);
      fetchGrades();
    } catch (error) {
      console.error('保存成绩失败:', error);
      message.error('保存成绩失败');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 计算统计信息
  const calculateStatistics = () => {
    if (grades.length === 0) return { avgScore: 0, passRate: 0, maxScore: 0, minScore: 0 };
    
    const scores = grades.map(g => g.score);
    const passedCount = grades.filter(g => g.isPassed).length;
    
    return {
      avgScore: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
      passRate: ((passedCount / grades.length) * 100).toFixed(1),
      maxScore: Math.max(...scores),
      minScore: Math.min(...scores)
    };
  };

  const { avgScore, passRate, maxScore, minScore } = calculateStatistics();

  const columns = [
    {
      title: '学生',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: '课程',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: '考试',
      dataIndex: 'examName',
      key: 'examName',
    },
    {
      title: '成绩',
      dataIndex: 'score',
      key: 'score',
      sorter: (a: Grade, b: Grade) => a.score - b.score,
      render: (score: number, record: Grade) => (
        <Text style={{ color: record.isPassed ? '#52c41a' : '#f5222d' }}>
          {score} / {record.totalScore}
        </Text>
      )
    },
    {
      title: '状态',
      key: 'isPassed',
      dataIndex: 'isPassed',
      render: (isPassed: boolean) => (
        <Tag color={isPassed ? 'success' : 'error'}>
          {isPassed ? '通过' : '未通过'}
        </Tag>
      )
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '批阅人',
      dataIndex: 'gradedBy',
      key: 'gradedBy',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Grade) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)} 
          />
          <Popconfirm
            title="确定要删除这条成绩记录吗？"
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

  const filteredGrades = grades.filter(grade => {
    // 标签页过滤
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'passed' && grade.isPassed) ||
      (activeTab === 'failed' && !grade.isPassed);
    
    // 搜索文本过滤
    const matchesSearch = 
      !searchText || 
      grade.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
      grade.courseName.toLowerCase().includes(searchText.toLowerCase()) ||
      grade.examName.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  return (
    <div className="grade-management">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={2}>成绩管理</Title>
          <Space>
            <Button icon={<UploadOutlined />}>
              批量导入
            </Button>
            <Button icon={<DownloadOutlined />}>
              导出成绩
            </Button>
          </Space>
        </div>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic 
                title="平均分" 
                value={avgScore} 
                suffix={`/ 100`}
                precision={1}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="通过率" 
                value={passRate} 
                suffix="%" 
                precision={1}
                valueStyle={{ color: Number(passRate) >= 60 ? '#3f8600' : '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="最高分" value={maxScore} suffix={`/ 100`} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="最低分" value={minScore} suffix={`/ 100`} />
            </Card>
          </Col>
        </Row>

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="全部成绩" key="all" />
            <TabPane tab="通过" key="passed" />
            <TabPane tab="未通过" key="failed" />
          </Tabs>
          
          <Search
            placeholder="搜索学生、课程或考试"
            style={{ width: 300 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Spin size="large" tip="加载中..." />
          </div>
        ) : filteredGrades.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredGrades}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty description="暂无成绩数据" />
        )}
      </Card>

      {/* 编辑成绩模态框 */}
      <Modal
        title="编辑成绩"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        confirmLoading={confirmLoading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="studentId"
            label="学生"
            rules={[{ required: true, message: '请选择学生' }]}
          >
            <Select disabled={!!currentGrade}>
              {students.map(student => (
                <Option key={student.id} value={student.id}>{student.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="examId"
            label="考试"
            rules={[{ required: true, message: '请选择考试' }]}
          >
            <Select disabled={!!currentGrade}>
              {exams.map(exam => (
                <Option key={exam.id} value={exam.id}>{exam.title}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="score"
            label="成绩"
            rules={[{ required: true, message: '请输入成绩' }]}
          >
            <InputNumber min={0} max={currentGrade?.totalScore || 100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="comments"
            label="批阅评语"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GradeManagement; 