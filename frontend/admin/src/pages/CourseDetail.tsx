import React, { useState, useEffect } from 'react';
import { 
  Typography, Card, Spin, Row, Col, Descriptions, Tag, Avatar, Tabs, List, 
  Button, Divider, Statistic, Progress, Empty, Table, Space, Tooltip, message,
  Modal, Form, Input, Select, InputNumber, Switch
} from 'antd';
import { 
  BookOutlined, TeamOutlined, ReadOutlined, EditOutlined, 
  UserOutlined, PlusOutlined, DeleteOutlined, LinkOutlined,
  DownloadOutlined, UploadOutlined, FileTextOutlined
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiService from '../services/apiService';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  isFree: boolean;
  isPublished: boolean;
  imageUrl?: string;
  createdAt: string;
  publishedAt?: string;
  createdBy: string;
  teachers: Teacher[];
  lessons: Lesson[];
  enrollmentCount?: number;
}

interface Teacher {
  id: string;
  name: string;
  displayName?: string;
  avatarUrl?: string;
  isPrimary: boolean;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  contentType: string;
  durationMinutes?: number;
  isPublished: boolean;
}

interface Student {
  id: string;
  name: string;
  avatarUrl?: string;
  email: string;
  enrollmentDate: string;
  progress: number;
  lastActivityDate?: string;
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseDetails(id);
    }
  }, [id]);

  const fetchCourseDetails = async (courseId: string) => {
    setLoading(true);
    try {
      const response = await apiService.get(`/api/courses/${courseId}`);
      if (response) {
        setCourse(response);
      } else {
        message.error('获取课程详情失败');
      }
    } catch (error) {
      console.error('获取课程详情出错:', error);
      message.error('获取课程详情出错，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (courseId: string) => {
    setStudentsLoading(true);
    try {
      const response = await apiService.get(`/api/courses/${courseId}/students`);
      if (response && Array.isArray(response)) {
        setStudents(response);
      } else if (response && response.items && Array.isArray(response.items)) {
        setStudents(response.items);
      } else {
        message.error('获取学生列表格式不正确');
        // 使用模拟数据
        setStudents([
          {
            id: '1',
            name: '张三',
            email: 'zhangsan@example.com',
            enrollmentDate: '2023-01-15',
            progress: 75,
            lastActivityDate: '2023-04-20'
          },
          {
            id: '2',
            name: '李四',
            email: 'lisi@example.com',
            enrollmentDate: '2023-01-20',
            progress: 45,
            lastActivityDate: '2023-04-19'
          }
        ]);
      }
    } catch (error) {
      console.error('获取学生列表出错:', error);
      message.error('获取学生列表出错，请稍后重试');
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleEditCourse = () => {
    if (course) {
      form.setFieldsValue({
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        price: course.price,
        isFree: course.isFree,
        isPublished: course.isPublished
      });
      setEditModalVisible(true);
    }
  };

  const handleEditModalCancel = () => {
    setEditModalVisible(false);
  };

  const handleEditModalOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      if (id) {
        await apiService.put(`/api/courses/${id}`, values);
        message.success('课程已更新');
        fetchCourseDetails(id);
        setEditModalVisible(false);
      }
    } catch (error) {
      console.error('更新课程失败:', error);
      message.error('更新课程失败，请检查表单数据或稍后重试');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleTabChange = (activeKey: string) => {
    if (activeKey === 'students' && id && students.length === 0) {
      fetchStudents(id);
    }
  };

  const handleManageLessons = () => {
    if (id) {
      navigate(`/courses/${id}/lessons`);
    }
  };

  const handleManageTeachers = () => {
    if (id) {
      navigate(`/courses/${id}/teachers`);
    }
  };

  const studentColumns = [
    {
      title: '学生',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Student) => (
        <Space>
          <Avatar 
            src={record.avatarUrl} 
            icon={<UserOutlined />} 
          />
          <Link to={`/users/${record.id}`}>{text}</Link>
        </Space>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '注册日期',
      dataIndex: 'enrollmentDate',
      key: 'enrollmentDate',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: '学习进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      )
    },
    {
      title: '最后活动',
      dataIndex: 'lastActivityDate',
      key: 'lastActivityDate',
      render: (date?: string) => date ? new Date(date).toLocaleString() : '从未活动'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Student) => (
        <Space size="middle">
          <Tooltip title="查看学生资料">
            <Button 
              type="text" 
              icon={<UserOutlined />} 
              onClick={() => navigate(`/users/${record.id}`)} 
            />
          </Tooltip>
          <Tooltip title="查看学生学习记录">
            <Button 
              type="text" 
              icon={<FileTextOutlined />}
              onClick={() => navigate(`/students/${record.id}/progress`)} 
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Spin size="large">
          <div style={{ padding: '50px', background: '#f0f2f5', borderRadius: '4px' }}>
            正在加载课程详情...
          </div>
        </Spin>
      </div>
    );
  }

  if (!course) {
    return (
      <Empty
        description="未找到课程信息"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary" onClick={() => navigate('/courses')}>
          返回课程列表
        </Button>
      </Empty>
    );
  }

  return (
    <div className="course-detail">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <Title level={2}>{course.title}</Title>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={handleEditCourse}
          >
            编辑课程
          </Button>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Card 
              bordered={false} 
              style={{ height: '100%' }}
              cover={
                course.imageUrl ? (
                  <img 
                    alt={course.title} 
                    src={course.imageUrl} 
                    style={{ maxHeight: 300, objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    style={{ 
                      height: 200, 
                      background: '#f0f2f5', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center' 
                    }}
                  >
                    <BookOutlined style={{ fontSize: 64, color: '#1890ff' }} />
                  </div>
                )
              }
            >
              <Paragraph>{course.description}</Paragraph>
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ height: '100%' }}>
              <Descriptions title="课程信息" column={1}>
                <Descriptions.Item label="分类">{course.category}</Descriptions.Item>
                <Descriptions.Item label="级别">{course.level}</Descriptions.Item>
                <Descriptions.Item label="价格">
                  {course.isFree ? (
                    <Tag color="green">免费</Tag>
                  ) : (
                    <span>￥{course.price.toFixed(2)}</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={course.isPublished ? 'green' : 'orange'}>
                    {course.isPublished ? '已发布' : '草稿'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="创建日期">
                  {new Date(course.createdAt).toLocaleDateString()}
                </Descriptions.Item>
                {course.publishedAt && (
                  <Descriptions.Item label="发布日期">
                    {new Date(course.publishedAt).toLocaleDateString()}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="创建者">{course.createdBy}</Descriptions.Item>
              </Descriptions>

              <Divider />

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic 
                    title="学生数量" 
                    value={course.enrollmentCount || 0} 
                    prefix={<TeamOutlined />} 
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="课程内容" 
                    value={course.lessons?.length || 0} 
                    prefix={<ReadOutlined />} 
                    suffix="节" 
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="lessons" onChange={handleTabChange} style={{ marginTop: 24 }}>
          <TabPane tab="课程内容" key="lessons">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Title level={4}>课程章节</Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleManageLessons}
              >
                管理章节
              </Button>
            </div>
            
            {course.lessons && course.lessons.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={course.lessons.sort((a, b) => a.orderIndex - b.orderIndex)}
                renderItem={lesson => (
                  <List.Item
                    actions={[
                      <Button type="link" key="edit" onClick={() => navigate(`/courses/${id}/lessons/${lesson.id}`)}>
                        编辑
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<ReadOutlined />} />}
                      title={
                        <Space>
                          <span>{lesson.title}</span>
                          {!lesson.isPublished && <Tag color="orange">未发布</Tag>}
                        </Space>
                      }
                      description={
                        <div>
                          <div>{lesson.description}</div>
                          <div>
                            <Tag color="blue">{lesson.contentType}</Tag>
                            {lesson.durationMinutes && (
                              <Tag>{lesson.durationMinutes} 分钟</Tag>
                            )}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无课程内容" />
            )}
          </TabPane>
          
          <TabPane tab="教师信息" key="teachers">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Title level={4}>授课教师</Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleManageTeachers}
              >
                管理教师
              </Button>
            </div>
            
            {course.teachers && course.teachers.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={course.teachers}
                renderItem={teacher => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={teacher.avatarUrl} icon={<UserOutlined />} />}
                      title={
                        <Space>
                          <span>{teacher.name}</span>
                          {teacher.displayName && <Text type="secondary">({teacher.displayName})</Text>}
                          {teacher.isPrimary && <Tag color="green">主讲教师</Tag>}
                        </Space>
                      }
                      description="教师介绍信息"
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无教师信息" />
            )}
          </TabPane>
          
          <TabPane tab="学生列表" key="students">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Title level={4}>已注册学生</Title>
              <Space>
                <Button icon={<DownloadOutlined />}>导出学生列表</Button>
                <Button type="primary" icon={<PlusOutlined />}>添加学生</Button>
              </Space>
            </div>
            
            {studentsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <Spin size="large">
                  <div style={{ padding: '30px', background: '#f0f2f5', borderRadius: '4px' }}>
                    正在加载学生数据...
                  </div>
                </Spin>
              </div>
            ) : students.length > 0 ? (
              <Table 
                columns={studentColumns} 
                dataSource={students} 
                rowKey="id" 
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty description="暂无学生注册此课程" />
            )}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="编辑课程"
        open={editModalVisible}
        onCancel={handleEditModalCancel}
        onOk={handleEditModalOk}
        confirmLoading={confirmLoading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="课程名称"
            rules={[{ required: true, message: '请输入课程名称' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="课程描述"
            rules={[{ required: true, message: '请输入课程描述' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          
          <Form.Item
            name="category"
            label="课程分类"
            rules={[{ required: true, message: '请选择课程分类' }]}
          >
            <Select>
              <Option value="计算机科学">计算机科学</Option>
              <Option value="数学">数学</Option>
              <Option value="物理">物理</Option>
              <Option value="化学">化学</Option>
              <Option value="文学">文学</Option>
              <Option value="历史">历史</Option>
              <Option value="艺术">艺术</Option>
              <Option value="音乐">音乐</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="level"
            label="课程级别"
            rules={[{ required: true, message: '请选择课程级别' }]}
          >
            <Select>
              <Option value="beginner">初级</Option>
              <Option value="intermediate">中级</Option>
              <Option value="advanced">高级</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="isFree"
            label="是否免费"
            valuePropName="checked"
          >
            <Switch checkedChildren="免费" unCheckedChildren="收费" />
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.isFree !== currentValues.isFree}
          >
            {({ getFieldValue }) => 
              !getFieldValue('isFree') && (
                <Form.Item
                  name="price"
                  label="课程价格"
                  rules={[{ required: true, message: '请输入课程价格' }]}
                >
                  <InputNumber 
                    min={0} 
                    precision={2} 
                    style={{ width: '100%' }} 
                    formatter={value => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value ? value.replace(/￥\s?|(,*)/g, '') : ''}
                  />
                </Form.Item>
              )
            }
          </Form.Item>
          
          <Form.Item
            name="isPublished"
            label="发布状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="已发布" unCheckedChildren="草稿" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseDetail; 