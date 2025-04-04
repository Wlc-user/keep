import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Divider,
  Timeline,
  Form,
  Input,
  Select,
  Row,
  Col,
  Avatar,
  Upload,
  message,
  Tooltip,
  Badge,
  List,
  Skeleton,
  Descriptions,
  Alert
} from 'antd';
import {
  UserOutlined,
  CommentOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PaperClipOutlined,
  SendOutlined,
  UploadOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { useAppContext } from '../contexts/AppContext';
import * as feedbackService from '../services/feedbackService';
import { Feedback, FeedbackReply, FeedbackAttachment, LearningRecommendation } from '../services/feedbackService';

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

// 反馈类型标签颜色映射
const typeColors: Record<string, string> = {
  'LearningQuestion': 'blue',
  'TechnicalIssue': 'volcano',
  'ContentError': 'red',
  'Suggestion': 'green',
  'Other': 'default'
};

// 优先级标签颜色映射
const priorityColors: Record<string, string> = {
  'Low': '#8c8c8c',
  'Normal': '#1890ff',
  'High': '#faad14',
  'Urgent': '#f5222d'
};

const ContentCard = styled(Card)`
  margin-bottom: 20px;
`;

const ReplyCard = styled(Card)`
  margin-bottom: 20px;
  background-color: #f9f9f9;
  
  .ant-card-body {
    padding: 16px;
  }
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    background-color: rgba(255, 255, 255, 0.04);
  }
`;

const TimelineItem = styled(Timeline.Item)`
  .ant-timeline-item-content {
    margin-left: 12px;
    margin-bottom: 20px;
  }
`;

const AttachmentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #f5f5f5;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    background-color: rgba(255, 255, 255, 0.08);
    border-color: #434343;
  }
`;

const StatusHistoryItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const RecommendationCard = styled(Card)`
  margin-top: 16px;
  border-left: 4px solid #52c41a;
`;

interface FeedbackDetailProps {
  feedbackId: number;
  onStatusChange?: () => void;
}

/**
 * 反馈详情组件
 */
const FeedbackDetail: React.FC<FeedbackDetailProps> = ({
  feedbackId,
  onStatusChange,
}) => {
  const { user } = useAppContext();
  const isStaff = user?.role !== 'student';
  
  // 状态
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [replies, setReplies] = useState<FeedbackReply[]>([]);
  const [attachments, setAttachments] = useState<FeedbackAttachment[]>([]);
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [priorities, setPriorities] = useState<any[]>([]);
  const [replyFormVisible, setReplyFormVisible] = useState<boolean>(false);
  const [replyLoading, setReplyLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<any[]>([]);
  
  // 表单
  const [replyForm] = Form.useForm();
  const [statusForm] = Form.useForm();
  
  useEffect(() => {
    loadFeedback();
    loadStatuses();
    loadPriorities();
  }, [feedbackId]);
  
  // 加载反馈详情
  const loadFeedback = async () => {
    setLoading(true);
    try {
      const data = await feedbackService.getFeedbackById(feedbackId);
      setFeedback(data);
      setReplies(data.replies || []);
      setAttachments(data.attachments || []);
      setRecommendations(data.recommendations || []);
    } catch (error) {
      message.error('加载反馈详情失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // 加载状态选项
  const loadStatuses = async () => {
    try {
      const data = await feedbackService.getFeedbackStatuses();
      setStatuses(data);
    } catch (error) {
      console.error('加载状态选项失败', error);
    }
  };
  
  // 加载优先级选项
  const loadPriorities = async () => {
    try {
      const data = await feedbackService.getFeedbackPriorities();
      setPriorities(data);
    } catch (error) {
      console.error('加载优先级选项失败', error);
    }
  };
  
  // 提交回复
  const handleReplySubmit = async (values: any) => {
    setReplyLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', values.content);
      formData.append('isInternal', values.isInternal ? 'true' : 'false');
      
      // 附件上传
      fileList.forEach(file => {
        formData.append('attachments', file.originFileObj);
      });
      
      await feedbackService.replyToFeedback(feedbackId, formData);
      message.success('回复成功');
      replyForm.resetFields();
      setFileList([]);
      setReplyFormVisible(false);
      loadFeedback();
    } catch (error) {
      message.error('提交回复失败');
      console.error(error);
    } finally {
      setReplyLoading(false);
    }
  };
  
  // 更新状态
  const updateStatus = async (status: string) => {
    try {
      await feedbackService.updateFeedbackStatus(feedbackId, status);
      message.success('状态更新成功');
      loadFeedback();
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      message.error('更新状态失败');
      console.error(error);
    }
  };
  
  // 更新优先级
  const updatePriority = async (priority: string) => {
    try {
      await feedbackService.updateFeedbackPriority(feedbackId, priority);
      message.success('优先级更新成功');
      loadFeedback();
    } catch (error) {
      message.error('更新优先级失败');
      console.error(error);
    }
  };
  
  // 获取反馈类型标签
  const getFeedbackTypeTag = (type: string) => {
    const typeText = {
      'LearningQuestion': '学习问题',
      'TechnicalIssue': '技术问题',
      'ContentError': '内容错误',
      'Suggestion': '功能建议',
      'Other': '其他'
    }[type] || type;

    return (
      <Tag color={typeColors[type] || 'default'}>
        {typeText}
      </Tag>
    );
  };
  
  // 获取状态标签
  const getStatusTag = (status: string) => {
    const statusText = {
      'Pending': '待处理',
      'InProgress': '处理中',
      'Resolved': '已解决',
      'Closed': '已关闭'
    }[status] || status;

    return (
      <Tag icon={statusIcons[status]} color={statusColors[status] || 'default'}>
        {statusText}
      </Tag>
    );
  };
  
  // 下载附件
  const downloadAttachment = async (id: number, filename: string) => {
    try {
      await feedbackService.downloadAttachment(id);
      message.success(`正在下载: ${filename}`);
    } catch (error) {
      message.error('下载附件失败');
      console.error(error);
    }
  };
  
  if (loading) {
    return (
      <ContentCard>
        <Skeleton active avatar paragraph={{ rows: 4 }} />
      </ContentCard>
    );
  }
  
  if (!feedback) {
    return (
      <Alert
        message="反馈不存在"
        description="无法加载反馈信息，该反馈可能已被删除或您没有权限查看。"
        type="error"
        showIcon
      />
    );
  }
  
  return (
    <div className="feedback-detail">
      <ContentCard>
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            {getFeedbackTypeTag(feedback.feedbackType)}
            {getStatusTag(feedback.status)}
            <Tag color={priorityColors[feedback.priority]}>
              {feedback.priority}
            </Tag>
            {feedback.resourceUrl && (
              <Tag icon={<PaperClipOutlined />} color="blue">
                关联资源
              </Tag>
            )}
          </Space>
        </div>
        
        <Title level={4}>{feedback.title}</Title>
        
        <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }} style={{ marginBottom: 16 }}>
          <Descriptions.Item label="提交人">
            <Space>
              <Avatar size="small" icon={<UserOutlined />} />
              {feedback.studentName}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="提交时间">
            {new Date(feedback.createdAt).toLocaleString()}
          </Descriptions.Item>
          {feedback.resourceUrl && (
            <Descriptions.Item label="关联资源">
              <a href={feedback.resourceUrl} target="_blank" rel="noopener noreferrer">
                <EyeOutlined /> 查看资源
              </a>
            </Descriptions.Item>
          )}
        </Descriptions>
        
        <Divider style={{ margin: '12px 0' }} />
        
        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
          {feedback.content}
        </Paragraph>
        
        {attachments.length > 0 && (
          <>
            <Divider orientation="left" plain>附件</Divider>
            <AttachmentList>
              {attachments.map(attachment => (
                <AttachmentItem key={attachment.id}>
                  <PaperClipOutlined style={{ marginRight: 8 }} />
                  <Tooltip title={`${attachment.fileName} (${attachment.fileSize / 1024} KB)`}>
                    <Text ellipsis style={{ maxWidth: 200 }}>{attachment.fileName}</Text>
                  </Tooltip>
                  <Button 
                    type="link" 
                    icon={<DownloadOutlined />}
                    onClick={() => downloadAttachment(attachment.id, attachment.fileName)}
                  />
                </AttachmentItem>
              ))}
            </AttachmentList>
          </>
        )}
      </ContentCard>
      
      {/* 学习建议 */}
      {recommendations.length > 0 && (
        <RecommendationCard title="学习建议">
          <List
            itemLayout="horizontal"
            dataSource={recommendations}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<InfoCircleOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                  title={item.title}
                  description={
                    <>
                      <div>{item.description}</div>
                      {item.resourceUrl && (
                        <Button type="link" href={item.resourceUrl} target="_blank" style={{ paddingLeft: 0 }}>
                          查看相关资源
                        </Button>
                      )}
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </RecommendationCard>
      )}
      
      {/* 教师/管理员操作区 */}
      {isStaff && (
        <Card style={{ marginBottom: 20 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form form={statusForm} layout="vertical" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Form.Item 
                  label="更新状态" 
                  style={{ flex: 1, marginBottom: 0 }}
                  name="status"
                  initialValue={feedback.status}
                >
                  <Select onChange={updateStatus}>
                    {statuses.map(status => (
                      <Option key={status.value} value={status.value}>
                        {status.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form layout="vertical" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Form.Item 
                  label="设置优先级" 
                  style={{ flex: 1, marginBottom: 0 }}
                  initialValue={feedback.priority}
                >
                  <Select onChange={updatePriority}>
                    {priorities.map(priority => (
                      <Option key={priority.value} value={priority.value}>
                        {priority.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </Col>
            <Col xs={24} sm={24} md={8} lg={12} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
              <Button 
                type="primary" 
                icon={<CommentOutlined />}
                onClick={() => setReplyFormVisible(!replyFormVisible)}
              >
                {replyFormVisible ? '取消回复' : '回复反馈'}
              </Button>
            </Col>
          </Row>
          
          {/* 回复表单 */}
          {replyFormVisible && (
            <div style={{ marginTop: 16 }}>
              <Form
                form={replyForm}
                onFinish={handleReplySubmit}
                layout="vertical"
              >
                <Form.Item
                  name="content"
                  rules={[{ required: true, message: '请输入回复内容' }]}
                >
                  <TextArea rows={4} placeholder="输入回复内容..." />
                </Form.Item>
                
                <Form.Item name="attachments" valuePropName="fileList">
                  <Upload
                    listType="picture"
                    fileList={fileList}
                    beforeUpload={() => false}
                    onChange={({ fileList }) => setFileList(fileList)}
                    multiple
                  >
                    <Button icon={<UploadOutlined />}>添加附件</Button>
                  </Upload>
                </Form.Item>
                
                <Form.Item name="isInternal" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Select 
                    placeholder="回复类型" 
                    style={{ width: 200 }}
                    defaultValue={false}
                  >
                    <Option value={false}>公开回复（学生可见）</Option>
                    <Option value={true}>内部备注（仅教师可见）</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item style={{ marginTop: 16 }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={replyLoading}
                    icon={<SendOutlined />}
                  >
                    提交回复
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}
        </Card>
      )}
      
      {/* 状态历史 */}
      {feedback.statusHistory && feedback.statusHistory.length > 0 && (
        <ContentCard title="状态更新历史" size="small">
          <Timeline>
            {feedback.statusHistory.map((history, index) => (
              <Timeline.Item 
                key={index}
                color={statusColors[history.status] || 'blue'}
                dot={statusIcons[history.status]}
              >
                <StatusHistoryItem>
                  <Space direction="vertical" size={0}>
                    <Text strong>{getStatusTag(history.status)}</Text>
                    <Text type="secondary">
                      <HistoryOutlined style={{ marginRight: 4 }} />
                      {new Date(history.updatedAt).toLocaleString()}
                    </Text>
                    {history.updatedBy && (
                      <Text type="secondary">
                        <UserOutlined style={{ marginRight: 4 }} />
                        由 {history.updatedBy} 更新
                      </Text>
                    )}
                    {history.comments && (
                      <Text>{history.comments}</Text>
                    )}
                  </Space>
                </StatusHistoryItem>
              </Timeline.Item>
            ))}
          </Timeline>
        </ContentCard>
      )}
      
      {/* 回复列表 */}
      <ContentCard title={`回复记录 (${replies.length})`} size="small">
        {replies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Text type="secondary">暂无回复</Text>
          </div>
        ) : (
          <Timeline>
            {replies.map(reply => (
              <TimelineItem key={reply.id}>
                <ReplyCard
                  size="small"
                  style={{ 
                    backgroundColor: reply.isInternal ? '#fffbe6' : '#f6ffed',
                    borderLeft: `3px solid ${reply.isInternal ? '#faad14' : '#52c41a'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Avatar 
                      icon={<UserOutlined />} 
                      style={{ 
                        backgroundColor: reply.userRole === 'student' ? '#1890ff' : '#52c41a',
                        marginRight: '12px'
                      }} 
                    />
                    <div style={{ flex: 1 }}>
                      <div>
                        <Space>
                          <Text strong>{reply.userName}</Text>
                          <Text type="secondary">{reply.userRole === 'teacher' ? '教师' : reply.userRole === 'admin' ? '管理员' : '学生'}</Text>
                          {reply.isInternal && (
                            <Badge count="内部备注" style={{ backgroundColor: '#faad14' }} />
                          )}
                        </Space>
                      </div>
                      <div style={{ margin: '8px 0' }}>
                        <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                          {reply.content}
                        </Paragraph>
                        
                        {reply.attachments && reply.attachments.length > 0 && (
                          <AttachmentList>
                            {reply.attachments.map(attachment => (
                              <AttachmentItem key={attachment.id}>
                                <PaperClipOutlined style={{ marginRight: 8 }} />
                                <Tooltip title={`${attachment.fileName} (${attachment.fileSize / 1024} KB)`}>
                                  <Text ellipsis style={{ maxWidth: 200 }}>{attachment.fileName}</Text>
                                </Tooltip>
                                <Button 
                                  type="link" 
                                  icon={<DownloadOutlined />}
                                  onClick={() => downloadAttachment(attachment.id, attachment.fileName)}
                                />
                              </AttachmentItem>
                            ))}
                          </AttachmentList>
                        )}
                      </div>
                      <div>
                        <Tooltip title={new Date(reply.createdAt).toLocaleString()}>
                          <Text type="secondary">{new Date(reply.createdAt).toLocaleString()}</Text>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </ReplyCard>
              </TimelineItem>
            ))}
          </Timeline>
        )}
        
        {/* 学生简单回复框 */}
        {!isStaff && (
          <div style={{ marginTop: 20 }}>
            <Form
              form={replyForm}
              onFinish={handleReplySubmit}
              layout="vertical"
            >
              <Form.Item
                name="content"
                rules={[{ required: true, message: '请输入回复内容' }]}
              >
                <TextArea rows={4} placeholder="输入回复内容..." />
              </Form.Item>
              
              <Form.Item name="attachments" valuePropName="fileList">
                <Upload
                  listType="picture"
                  fileList={fileList}
                  beforeUpload={() => false}
                  onChange={({ fileList }) => setFileList(fileList)}
                  multiple
                >
                  <Button icon={<UploadOutlined />}>添加附件</Button>
                </Upload>
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={replyLoading}
                  icon={<SendOutlined />}
                >
                  提交回复
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </ContentCard>
    </div>
  );
};

export default FeedbackDetail; 