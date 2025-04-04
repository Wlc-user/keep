import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Divider,
  List,
  Avatar,
  Input,
  Button,
  Space,
  Select,
  Timeline,
  Modal,
  Form,
  message,
  Skeleton,
  Tooltip,
  Row,
  Col,
  Badge
} from 'antd';
import {
  UserOutlined,
  CommentOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  BulbOutlined,
  BookOutlined,
  FileOutlined,
  SendOutlined,
  TeamOutlined,
  LikeOutlined,
  DislikeOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import * as feedbackService from '../services/feedbackService';
import * as userService from '../services/userService';
import { FeedbackDetail, FeedbackReply, LearningRecommendation, AddReplyDTO, UpdateStatusDTO, AssignFeedbackDTO, AddRecommendationDTO } from '../services/feedbackService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// 状态标签颜色映射
const statusColors: Record<string, string> = {
  'Pending': 'orange',
  'InProgress': 'processing',
  'Resolved': 'success',
  'Closed': 'default'
};

// 状态图标映射
const statusIcons: Record<string, React.ReactNode> = {
  'Pending': <ClockCircleOutlined />,
  'InProgress': <SyncOutlined spin />,
  'Resolved': <CheckCircleOutlined />,
  'Closed': <CloseCircleOutlined />
};

// 优先级标签颜色映射
const priorityColors: Record<string, string> = {
  'Low': '#8c8c8c',
  'Normal': '#1890ff',
  'High': '#faad14',
  'Urgent': '#f5222d'
};

// 推荐类型映射
const recommendationTypeMap: Record<string, string> = {
  'CourseReview': '课程复习',
  'SupplementaryMaterial': '补充材料',
  'RelatedMaterial': '相关材料',
  'TechnicalSupport': '技术支持',
  'PopularContent': '热门内容',
  'CourseProgress': '课程进度',
  'StudyHabit': '学习习惯',
  'StudyStrategy': '学习策略',
  'WeakPointImprovement': '薄弱点改进'
};

const FeedbackDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [recommendationForm] = Form.useForm();

  const [feedback, setFeedback] = useState<FeedbackDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [replyContent, setReplyContent] = useState<string>('');
  const [replyLoading, setReplyLoading] = useState<boolean>(false);
  const [markAsResolved, setMarkAsResolved] = useState<boolean>(false);
  
  const [statusModalVisible, setStatusModalVisible] = useState<boolean>(false);
  const [assignModalVisible, setAssignModalVisible] = useState<boolean>(false);
  const [recommendModalVisible, setRecommendModalVisible] = useState<boolean>(false);
  
  const [teachers, setTeachers] = useState<any[]>([]);
  const [statusOptions, setStatusOptions] = useState<any[]>([]);
  const [recommendationTypes, setRecommendationTypes] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadFeedbackDetail(parseInt(id));
      loadTeachers();
      loadStatusOptions();
      setRecommendationTypes([
        { value: 'CourseReview', label: '课程复习' },
        { value: 'SupplementaryMaterial', label: '补充材料' },
        { value: 'RelatedMaterial', label: '相关材料' },
        { value: 'TechnicalSupport', label: '技术支持' },
        { value: 'StudyHabit', label: '学习习惯' },
        { value: 'StudyStrategy', label: '学习策略' }
      ]);
    }
  }, [id]);

  // 加载反馈详情
  const loadFeedbackDetail = async (feedbackId: number) => {
    setLoading(true);
    try {
      const detail = await feedbackService.getFeedbackDetail(feedbackId);
      setFeedback(detail);
    } catch (error) {
      message.error('加载反馈详情失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 加载教师列表
  const loadTeachers = async () => {
    try {
      const response = await userService.getTeachers();
      setTeachers(response.map(teacher => ({
        label: teacher.displayName || `${teacher.firstName} ${teacher.lastName}`,
        value: teacher.id
      })));
    } catch (error) {
      message.error('加载教师列表失败');
      console.error(error);
    }
  };

  // 加载状态选项
  const loadStatusOptions = async () => {
    try {
      const statuses = await feedbackService.getFeedbackStatuses();
      setStatusOptions(statuses);
    } catch (error) {
      message.error('加载状态选项失败');
      console.error(error);
    }
  };

  // 提交回复
  const handleReply = async () => {
    if (!id || !replyContent.trim()) return;

    setReplyLoading(true);
    try {
      const replyDto: AddReplyDTO = {
        content: replyContent,
        markAsResolved
      };

      await feedbackService.addReply(parseInt(id), replyDto);
      setReplyContent('');
      setMarkAsResolved(false);
      message.success('回复成功');
      
      // 重新加载反馈详情
      loadFeedbackDetail(parseInt(id));
    } catch (error) {
      message.error('回复提交失败');
      console.error(error);
    } finally {
      setReplyLoading(false);
    }
  };

  // 更新状态
  const handleUpdateStatus = async () => {
    try {
      const values = await form.validateFields();
      const statusDto: UpdateStatusDTO = {
        status: values.status
      };

      await feedbackService.updateFeedbackStatus(parseInt(id!), statusDto);
      message.success('状态更新成功');
      setStatusModalVisible(false);
      
      // 重新加载反馈详情
      loadFeedbackDetail(parseInt(id!));
    } catch (error) {
      message.error('状态更新失败');
      console.error(error);
    }
  };

  // 分配反馈
  const handleAssign = async () => {
    try {
      const values = await assignForm.validateFields();
      const assignDto: AssignFeedbackDTO = {
        teacherId: values.teacherId
      };

      await feedbackService.assignFeedback(parseInt(id!), assignDto);
      message.success('反馈分配成功');
      setAssignModalVisible(false);
      
      // 重新加载反馈详情
      loadFeedbackDetail(parseInt(id!));
    } catch (error) {
      message.error('反馈分配失败');
      console.error(error);
    }
  };

  // 添加学习推荐
  const handleAddRecommendation = async () => {
    try {
      const values = await recommendationForm.validateFields();
      const recommendationDto: AddRecommendationDTO = {
        title: values.title,
        content: values.content,
        recommendationType: values.recommendationType,
        courseId: values.courseId,
        materialId: values.materialId,
        knowledgeNodeId: values.knowledgeNodeId
      };

      await feedbackService.addRecommendation(parseInt(id!), recommendationDto);
      message.success('学习推荐添加成功');
      setRecommendModalVisible(false);
      recommendationForm.resetFields();
      
      // 重新加载反馈详情
      loadFeedbackDetail(parseInt(id!));
    } catch (error) {
      message.error('添加推荐失败');
      console.error(error);
    }
  };

  // 渲染反馈基本信息
  const renderFeedbackInfo = () => {
    if (!feedback) return <Skeleton active />;

    return (
      <Card>
        <Descriptions title={feedback.title} bordered>
          <Descriptions.Item label="状态">
            <Tag icon={statusIcons[feedback.status]} color={statusColors[feedback.status]}>
              {statusOptions.find(s => s.value === feedback.status)?.label || feedback.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="优先级">
            <Badge color={priorityColors[feedback.priority]} text={feedback.priority} />
          </Descriptions.Item>
          <Descriptions.Item label="类型">
            {feedback.feedbackType}
          </Descriptions.Item>
          <Descriptions.Item label="学生" span={2}>
            <Space>
              <Avatar icon={<UserOutlined />} />
              {feedback.studentName}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(feedback.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="分配给" span={2}>
            {feedback.assignedToName ? (
              <Space>
                <Avatar icon={<UserOutlined />} />
                {feedback.assignedToName}
              </Space>
            ) : (
              <Text type="secondary">未分配</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="解决时间" span={3}>
            {feedback.resolvedAt ? new Date(feedback.resolvedAt).toLocaleString() : '未解决'}
          </Descriptions.Item>
          {feedback.courseName && (
            <Descriptions.Item label="关联课程" span={3}>
              <a onClick={() => navigate(`/courses/${feedback.courseId}`)}>
                {feedback.courseName}
              </a>
            </Descriptions.Item>
          )}
          {feedback.materialName && (
            <Descriptions.Item label="关联材料" span={3}>
              <a onClick={() => navigate(`/materials/${feedback.materialId}`)}>
                {feedback.materialName}
              </a>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="内容" span={3}>
            <Paragraph>{feedback.content}</Paragraph>
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Button
              type="primary"
              icon={<SyncOutlined />}
              onClick={() => setStatusModalVisible(true)}
            >
              更新状态
            </Button>
            <Button
              icon={<TeamOutlined />}
              onClick={() => setAssignModalVisible(true)}
            >
              分配反馈
            </Button>
            <Button
              icon={<BulbOutlined />}
              onClick={() => setRecommendModalVisible(true)}
              type="dashed"
            >
              添加学习推荐
            </Button>
          </Space>
        </div>
      </Card>
    );
  };

  // 渲染回复
  const renderReplies = () => {
    return feedback && feedback.replies && feedback.replies.length > 0 ? (
      <Timeline>
        {feedback.replies.map(reply => (
          <Timeline.Item
            key={reply.id}
            color={reply.isFromTeacher ? 'blue' : 'green'}
            dot={reply.isFromTeacher ? <UserOutlined /> : <UserOutlined />}
          >
            <Card bordered={false} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar icon={<UserOutlined />} style={{ marginRight: '12px' }} />
                <div style={{ flex: 1 }}>
                  <div>
                    <Space>
                      <Typography.Text strong>{reply.userName}</Typography.Text>
                      <Tag color={reply.isFromTeacher ? 'blue' : 'green'}>
                        {reply.isFromTeacher ? '教师' : '学生'}
                      </Tag>
                    </Space>
                  </div>
                  <Typography.Paragraph>{reply.content}</Typography.Paragraph>
                  <Typography.Text type="secondary">{new Date(reply.createdAt).toLocaleString()}</Typography.Text>
                </div>
              </div>
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>
    ) : (
      <Typography.Text type="secondary">暂无回复</Typography.Text>
    );
  };

  // 渲染学习推荐
  const renderRecommendations = () => {
    if (!feedback || feedback.recommendations.length === 0) return null;

    return (
      <Card title="学习推荐" style={{ marginTop: 16 }}>
        <List
          itemLayout="vertical"
          dataSource={feedback.recommendations}
          renderItem={item => (
            <List.Item
              key={item.id}
              actions={[
                <Space>
                  {item.isFromAI ? <Tag icon={<RobotOutlined />} color="purple">AI推荐</Tag> : 
                    <Tag icon={<UserOutlined />} color="blue">教师推荐</Tag>}
                  <Text type="secondary">{new Date(item.createdAt).toLocaleString()}</Text>
                </Space>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={item.isFromAI ? <RobotOutlined /> : <UserOutlined />} />}
                title={<Text strong>{item.title}</Text>}
                description={
                  <Space>
                    <Tag color="cyan">
                      {recommendationTypeMap[item.recommendationType] || item.recommendationType}
                    </Tag>
                    {item.teacherName && <Text type="secondary">推荐人: {item.teacherName}</Text>}
                  </Space>
                }
              />
              <Paragraph>{item.content}</Paragraph>
              {item.materialName && (
                <div>
                  <Divider style={{ margin: '8px 0' }} />
                  <Text strong>推荐材料:</Text>{' '}
                  <a onClick={() => navigate(`/materials/${item.materialId}`)}>
                    {item.materialName}
                  </a>
                </div>
              )}
              {item.courseName && (
                <div>
                  <Divider style={{ margin: '8px 0' }} />
                  <Text strong>推荐课程:</Text>{' '}
                  <a onClick={() => navigate(`/courses/${item.courseId}`)}>
                    {item.courseName}
                  </a>
                </div>
              )}
            </List.Item>
          )}
        />
      </Card>
    );
  };

  // 状态更新模态框
  const renderStatusModal = () => (
    <Modal
      title="更新反馈状态"
      open={statusModalVisible}
      onOk={handleUpdateStatus}
      onCancel={() => setStatusModalVisible(false)}
      okText="更新"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="status"
          label="选择状态"
          rules={[{ required: true, message: '请选择状态' }]}
          initialValue={feedback?.status}
        >
          <Select>
            {statusOptions.map(status => (
              <Option key={status.value} value={status.value}>
                <Space>
                  {statusIcons[status.value]}
                  {status.label}
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );

  // 分配反馈模态框
  const renderAssignModal = () => (
    <Modal
      title="分配反馈给教师"
      open={assignModalVisible}
      onOk={handleAssign}
      onCancel={() => setAssignModalVisible(false)}
      okText="分配"
      cancelText="取消"
    >
      <Form form={assignForm} layout="vertical">
        <Form.Item
          name="teacherId"
          label="选择教师"
          rules={[{ required: true, message: '请选择教师' }]}
          initialValue={feedback?.assignedToId}
        >
          <Select
            showSearch
            placeholder="搜索教师"
            optionFilterProp="label"
          >
            {teachers.map(teacher => (
              <Option key={teacher.value} value={teacher.value}>
                {teacher.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );

  // 添加推荐模态框
  const renderRecommendationModal = () => (
    <Modal
      title="添加学习推荐"
      open={recommendModalVisible}
      onOk={handleAddRecommendation}
      onCancel={() => setRecommendModalVisible(false)}
      okText="添加"
      cancelText="取消"
      width={600}
    >
      <Form form={recommendationForm} layout="vertical">
        <Form.Item
          name="title"
          label="推荐标题"
          rules={[{ required: true, message: '请输入推荐标题' }]}
        >
          <Input placeholder="例如：课程复习建议" />
        </Form.Item>
        <Form.Item
          name="recommendationType"
          label="推荐类型"
          rules={[{ required: true, message: '请选择推荐类型' }]}
        >
          <Select placeholder="选择推荐类型">
            {recommendationTypes.map(type => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="content"
          label="推荐内容"
          rules={[{ required: true, message: '请输入推荐内容' }]}
        >
          <TextArea rows={4} placeholder="详细的学习建议或资源推荐" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="courseId"
              label="推荐课程ID"
            >
              <Input placeholder="(可选) 课程ID" type="number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="materialId"
              label="推荐材料ID"
            >
              <Input placeholder="(可选) 材料ID" type="number" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );

  return (
    <div className="feedback-detail">
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate('/feedback')} icon={<CommentOutlined />}>
          返回列表
        </Button>
      </Space>

      {renderFeedbackInfo()}
      {renderReplies()}
      {renderRecommendations()}

      {renderStatusModal()}
      {renderAssignModal()}
      {renderRecommendationModal()}
    </div>
  );
};

export default FeedbackDetailPage; 