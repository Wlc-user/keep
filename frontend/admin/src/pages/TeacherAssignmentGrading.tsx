import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Descriptions,
  Table, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Form, 
  InputNumber, 
  Modal,
  message,
  Spin,
  Avatar,
  Tabs,
  Collapse,
  Divider,
  Alert,
  List,
  Badge
} from 'antd';
import { 
  UserOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  WarningOutlined,
  FileOutlined,
  DownloadOutlined,
  SendOutlined,
  LeftOutlined,
  RollbackOutlined,
  ExclamationCircleOutlined,
  TagOutlined,
  FileMarkdownOutlined,
  CommentOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import assignmentService, { 
  Assignment, 
  Submission, 
  SubmissionStatus,
  SubmissionComment
} from '../services/assignmentService';
import { useAppContext } from '../contexts/AppContext';
import PageHeader from '../components/PageHeader';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;
const { TabPane } = Tabs;

// 定义批改选项卡的类型
type GradingTab = 'all' | 'pending' | 'graded' | 'late';

const TeacherAssignmentGrading: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { user } = useAppContext();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradingForm] = Form.useForm();
  const [commentForm] = Form.useForm();
  const [gradingModalVisible, setGradingModalVisible] = useState<boolean>(false);
  const [commentModalVisible, setCommentModalVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<GradingTab>('all');
  const [batchGradingVisible, setBatchGradingVisible] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchGradingForm] = Form.useForm();
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // 获取作业详情和提交列表
  useEffect(() => {
    const fetchData = async () => {
      if (!assignmentId) return;
      
      setLoading(true);
      try {
        // 获取作业详情
        const assignmentData = await assignmentService.getAssignmentDetail(assignmentId);
        setAssignment(assignmentData);
        
        // 获取提交列表
        const submissionsData = await assignmentService.getSubmissionsByAssignment(assignmentId);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error('获取作业数据失败:', error);
        message.error('获取作业数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [assignmentId]);
  
  // 打开评分对话框
  const handleOpenGrading = (submission: Submission) => {
    setSelectedSubmission(submission);
    
    // 如果已经评分，填充表单数据
    if (submission.status === SubmissionStatus.GRADED && submission.grade !== undefined) {
      gradingForm.setFieldsValue({
        grade: submission.grade,
        feedback: submission.feedback || ''
      });
    } else {
      gradingForm.resetFields();
    }
    
    setGradingModalVisible(true);
  };
  
  // 提交评分
  const handleSubmitGrading = async () => {
    if (!selectedSubmission) return;
    
    try {
      const values = await gradingForm.validateFields();
      setSubmitting(true);
      
      const result = await assignmentService.gradeSubmission(
        selectedSubmission.id, 
        { 
          grade: values.grade, 
          feedback: values.feedback 
        }
      );
      
      // 更新数据
      setSubmissions(prev => 
        prev.map(item => 
          item.id === selectedSubmission.id ? 
            { 
              ...item, 
              grade: values.grade, 
              feedback: values.feedback,
              status: SubmissionStatus.GRADED,
              gradedBy: user?.name || '当前教师',
              gradedAt: new Date().toISOString()
            } : 
            item
        )
      );
      
      setGradingModalVisible(false);
      message.success('评分成功');
    } catch (error) {
      console.error('评分失败:', error);
      message.error('评分失败');
    } finally {
      setSubmitting(false);
    }
  };
  
  // 打开评论对话框
  const handleOpenComment = (submission: Submission) => {
    setSelectedSubmission(submission);
    commentForm.resetFields();
    setCommentModalVisible(true);
  };
  
  // 提交评论
  const handleSubmitComment = async () => {
    if (!selectedSubmission) return;
    
    try {
      const values = await commentForm.validateFields();
      setSubmitting(true);
      
      const comment: Partial<SubmissionComment> = {
        authorId: user?.id || 'current-teacher',
        authorName: user?.name || '当前教师',
        authorRole: 'teacher',
        content: values.content,
        createdAt: new Date().toISOString()
      };
      
      // 调用API添加评论
      await assignmentService.addComment(selectedSubmission.id, comment);
      
      // 更新数据
      setSubmissions(prev => 
        prev.map(item => 
          item.id === selectedSubmission.id ? 
            { 
              ...item, 
              comments: [...(item.comments || []), comment as SubmissionComment]
            } : 
            item
        )
      );
      
      setCommentModalVisible(false);
      message.success('评论已添加');
    } catch (error) {
      console.error('添加评论失败:', error);
      message.error('添加评论失败');
    } finally {
      setSubmitting(false);
    }
  };
  
  // 处理批量评分
  const handleBatchGrading = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请至少选择一个提交');
      return;
    }
    
    const pendingSubmissions = submissions.filter(
      item => selectedRowKeys.includes(item.id) && item.status !== SubmissionStatus.GRADED
    );
    
    if (pendingSubmissions.length === 0) {
      message.warning('所选提交都已评分');
      return;
    }
    
    batchGradingForm.resetFields();
    setBatchGradingVisible(true);
  };
  
  // 提交批量评分
  const handleSubmitBatchGrading = async () => {
    try {
      const values = await batchGradingForm.validateFields();
      setSubmitting(true);
      
      // 获取待评分的提交ID
      const submissionIds = submissions
        .filter(item => 
          selectedRowKeys.includes(item.id) && 
          item.status !== SubmissionStatus.GRADED
        )
        .map(item => item.id);
      
      if (submissionIds.length === 0) {
        message.warning('没有需要评分的提交');
        setBatchGradingVisible(false);
        setSubmitting(false);
        return;
      }
      
      // 调用批量评分API
      await assignmentService.batchGradeSubmissions(
        submissionIds, 
        { 
          grade: values.grade, 
          feedback: values.feedback 
        }
      );
      
      // 更新数据
      setSubmissions(prev => 
        prev.map(item => 
          submissionIds.includes(item.id) ? 
            { 
              ...item, 
              grade: values.grade, 
              feedback: values.feedback,
              status: SubmissionStatus.GRADED,
              gradedBy: user?.name || '当前教师',
              gradedAt: new Date().toISOString()
            } : 
            item
        )
      );
      
      setBatchGradingVisible(false);
      setSelectedRowKeys([]);
      message.success(`成功评分 ${submissionIds.length} 个提交`);
    } catch (error) {
      console.error('批量评分失败:', error);
      message.error('批量评分失败');
    } finally {
      setSubmitting(false);
    }
  };
  
  // 返回到作业列表
  const handleBack = () => {
    navigate('/teacher/assignments');
  };
  
  // 根据状态过滤提交列表
  const filteredSubmissions = (() => {
    if (activeTab === 'all') return submissions;
    
    return submissions.filter(item => {
      switch (activeTab) {
        case 'pending':
          return item.status === SubmissionStatus.SUBMITTED || item.status === SubmissionStatus.PENDING;
        case 'graded':
          return item.status === SubmissionStatus.GRADED;
        case 'late':
          return item.isLate;
        default:
          return true;
      }
    });
  })();
  
  // 获取提交状态标签
  const getStatusTag = (status: SubmissionStatus, isLate: boolean) => {
    if (isLate && status !== SubmissionStatus.GRADED) {
      return <Tag color="red" icon={<WarningOutlined />}>逾期提交</Tag>;
    }
    
    switch (status) {
      case SubmissionStatus.GRADED:
        return <Tag color="success" icon={<CheckCircleOutlined />}>已评分</Tag>;
      case SubmissionStatus.SUBMITTED:
        return <Tag color="processing" icon={<ClockCircleOutlined />}>待评分</Tag>;
      case SubmissionStatus.PENDING:
        return <Tag color="default" icon={<ClockCircleOutlined />}>未提交</Tag>;
      case SubmissionStatus.LATE:
        return <Tag color="red" icon={<WarningOutlined />}>逾期</Tag>;
      case SubmissionStatus.REJECTED:
        return <Tag color="error" icon={<CloseCircleOutlined />}>已拒绝</Tag>;
      default:
        return null;
    }
  };
  
  // 表格列定义
  const columns = [
    {
      title: '学生',
      key: 'student',
      render: (record: Submission) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <Text>{record.studentName}</Text>
          <Text type="secondary">{record.studentId}</Text>
        </Space>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'submissionDate',
      key: 'submissionDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '状态',
      key: 'status',
      render: (record: Submission) => getStatusTag(record.status, record.isLate),
    },
    {
      title: '评分',
      key: 'grade',
      render: (record: Submission) => (
        record.status === SubmissionStatus.GRADED ? (
          <Space>
            <Text strong>{record.grade}</Text>
            <Text type="secondary">/ {assignment?.totalPoints}</Text>
          </Space>
        ) : (
          <Text type="secondary">未评分</Text>
        )
      ),
    },
    {
      title: '批改时间',
      key: 'gradedAt',
      render: (record: Submission) => (
        record.gradedAt ? dayjs(record.gradedAt).format('YYYY-MM-DD HH:mm') : '-'
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: Submission) => (
        <Space>
          <Button 
            type="primary" 
            onClick={() => handleOpenGrading(record)}
          >
            {record.status === SubmissionStatus.GRADED ? '修改评分' : '评分'}
          </Button>
          <Button onClick={() => handleOpenComment(record)}>
            评论
          </Button>
        </Space>
      ),
    },
  ];
  
  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };
  
  // 加载状态
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载作业数据中...</div>
      </div>
    );
  }
  
  // 作业不存在
  if (!assignment) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Result
          status="warning"
          title="找不到作业"
          subTitle="该作业不存在或已被删除"
          extra={
            <Button type="primary" onClick={handleBack}>
              返回作业列表
            </Button>
          }
        />
      </div>
    );
  }
  
  return (
    <div className="teacher-assignment-grading-page">
      <PageHeader
        title="作业批改"
        subtitle={assignment.title}
        onBack={handleBack}
        extra={
          <Space>
            <Button 
              type="primary" 
              onClick={handleBatchGrading}
              disabled={selectedRowKeys.length === 0}
            >
              批量评分
            </Button>
          </Space>
        }
      />

      <Card>
        <Descriptions title="作业信息" column={{ xs: 1, sm: 2, md: 3 }} bordered>
          <Descriptions.Item label="课程">{assignment.courseName}</Descriptions.Item>
          <Descriptions.Item label="总分">{assignment.totalPoints}</Descriptions.Item>
          <Descriptions.Item label="开始时间">{assignment.startDate}</Descriptions.Item>
          <Descriptions.Item label="截止时间">{assignment.endDate}</Descriptions.Item>
          <Descriptions.Item label="提交情况">
            {assignment.submissionCount} / {assignment.totalStudents}
          </Descriptions.Item>
          <Descriptions.Item label="批改进度">
            {assignment.gradedCount} / {assignment.submissionCount}
          </Descriptions.Item>
        </Descriptions>
        
        <Divider />
        
        <div className="assignment-description">
          <Title level={5}>作业说明</Title>
          <Paragraph>{assignment.description}</Paragraph>
          
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Text strong>附件：</Text>
              <List
                size="small"
                dataSource={assignment.attachments}
                renderItem={item => (
                  <List.Item>
                    <Space>
                      <FileOutlined />
                      <Text>{item}</Text>
                      <Button type="link" icon={<DownloadOutlined />} size="small">
                        下载
                      </Button>
                    </Space>
                  </List.Item>
                )}
              />
            </div>
          )}
          
          {assignment.gradingCriteria && (
            <div style={{ marginTop: 16 }}>
              <Alert
                message="评分标准"
                description={assignment.gradingCriteria}
                type="info"
                showIcon
              />
            </div>
          )}
        </div>
      </Card>
      
      <Card style={{ marginTop: 16 }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={value => setActiveTab(value as GradingTab)}
          tabBarExtraContent={
            <div>
              <Text>已选择: {selectedRowKeys.length}</Text>
            </div>
          }
        >
          <TabPane 
            tab={
              <span>全部提交 ({submissions.length})</span>
            } 
            key="all" 
          />
          <TabPane 
            tab={
              <span>
                待评分 ({submissions.filter(item => 
                  item.status === SubmissionStatus.SUBMITTED || 
                  item.status === SubmissionStatus.PENDING
                ).length})
              </span>
            } 
            key="pending" 
          />
          <TabPane 
            tab={
              <span>
                已评分 ({submissions.filter(item => 
                  item.status === SubmissionStatus.GRADED
                ).length})
              </span>
            } 
            key="graded" 
          />
          <TabPane 
            tab={
              <span>
                逾期提交 ({submissions.filter(item => 
                  item.isLate
                ).length})
              </span>
            } 
            key="late" 
          />
        </Tabs>
        
        <Table
          rowSelection={rowSelection}
          dataSource={filteredSubmissions}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      {/* 评分对话框 */}
      <Modal
        title={selectedSubmission?.status === SubmissionStatus.GRADED ? '修改评分' : '评分'}
        open={gradingModalVisible}
        onOk={handleSubmitGrading}
        onCancel={() => setGradingModalVisible(false)}
        confirmLoading={submitting}
        width={800}
      >
        {selectedSubmission && (
          <div>
            <Collapse defaultActiveKey={['1']} style={{ marginBottom: 16 }}>
              <Panel header="学生提交内容" key="1">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>提交时间：</Text>
                    <Text>{dayjs(selectedSubmission.submissionDate).format('YYYY-MM-DD HH:mm')}</Text>
                    {selectedSubmission.isLate && (
                      <Tag color="red" style={{ marginLeft: 8 }}>逾期提交</Tag>
                    )}
                  </div>
                  
                  {selectedSubmission.resubmissionCount > 0 && (
                    <div>
                      <Text strong>重新提交次数：</Text>
                      <Text>{selectedSubmission.resubmissionCount}</Text>
                    </div>
                  )}
                  
                  <div>
                    <Text strong>提交内容：</Text>
                    <div style={{ 
                      border: '1px solid #d9d9d9', 
                      borderRadius: 4, 
                      padding: 16, 
                      marginTop: 8,
                      backgroundColor: '#f5f5f5'
                    }}>
                      <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedSubmission.content}
                      </Paragraph>
                    </div>
                  </div>
                  
                  {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                    <div>
                      <Text strong>附件：</Text>
                      <List
                        size="small"
                        dataSource={selectedSubmission.attachments}
                        renderItem={item => (
                          <List.Item>
                            <Space>
                              <FileOutlined />
                              <Text>{item}</Text>
                              <Button type="link" icon={<DownloadOutlined />} size="small">
                                下载
                              </Button>
                            </Space>
                          </List.Item>
                        )}
                      />
                    </div>
                  )}
                </Space>
              </Panel>
              
              {selectedSubmission.comments && selectedSubmission.comments.length > 0 && (
                <Panel header="交流记录" key="2">
                  <List
                    itemLayout="horizontal"
                    dataSource={selectedSubmission.comments}
                    renderItem={comment => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar icon={<UserOutlined />} style={{ 
                              backgroundColor: comment.authorRole === 'teacher' ? '#1890ff' : '#52c41a' 
                            }} />
                          }
                          title={
                            <Space>
                              <Text strong>{comment.authorName}</Text>
                              <Text type="secondary">
                                {comment.authorRole === 'teacher' ? '(教师)' : '(学生)'}
                              </Text>
                              <Text type="secondary">
                                {dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}
                              </Text>
                            </Space>
                          }
                          description={comment.content}
                        />
                      </List.Item>
                    )}
                  />
                </Panel>
              )}
            </Collapse>
            
            <Form
              form={gradingForm}
              layout="vertical"
            >
              <Form.Item
                name="grade"
                label="分数"
                rules={[
                  { required: true, message: '请输入分数' },
                  { 
                    type: 'number', 
                    min: 0, 
                    max: assignment.totalPoints, 
                    message: `分数必须在0到${assignment.totalPoints}之间` 
                  }
                ]}
              >
                <InputNumber 
                  min={0} 
                  max={assignment.totalPoints} 
                  style={{ width: '100%' }} 
                />
              </Form.Item>
              
              <Form.Item
                name="feedback"
                label="评语"
              >
                <TextArea 
                  rows={4} 
                  placeholder="请输入评语，对学生的作业进行点评" 
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
      
      {/* 评论对话框 */}
      <Modal
        title="添加评论"
        open={commentModalVisible}
        onOk={handleSubmitComment}
        onCancel={() => setCommentModalVisible(false)}
        confirmLoading={submitting}
      >
        {selectedSubmission && (
          <Form
            form={commentForm}
            layout="vertical"
          >
            <Form.Item
              name="content"
              label="评论内容"
              rules={[{ required: true, message: '请输入评论内容' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="请输入评论内容" 
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
      
      {/* 批量评分对话框 */}
      <Modal
        title="批量评分"
        open={batchGradingVisible}
        onOk={handleSubmitBatchGrading}
        onCancel={() => setBatchGradingVisible(false)}
        confirmLoading={submitting}
      >
        <Alert
          message="批量评分提示"
          description={`您选择了 ${selectedRowKeys.length} 个提交进行批量评分，其中 ${
            submissions.filter(item => 
              selectedRowKeys.includes(item.id) && 
              item.status !== SubmissionStatus.GRADED
            ).length
          } 个提交将被评分。已评分的提交将不受影响。`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form
          form={batchGradingForm}
          layout="vertical"
        >
          <Form.Item
            name="grade"
            label="分数"
            rules={[
              { required: true, message: '请输入分数' },
              { 
                type: 'number', 
                min: 0, 
                max: assignment.totalPoints, 
                message: `分数必须在0到${assignment.totalPoints}之间` 
              }
            ]}
          >
            <InputNumber 
              min={0} 
              max={assignment.totalPoints} 
              style={{ width: '100%' }} 
            />
          </Form.Item>
          
          <Form.Item
            name="feedback"
            label="统一评语"
          >
            <TextArea 
              rows={4} 
              placeholder="请输入统一评语，将应用于所有选中的提交" 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherAssignmentGrading;

// 结果组件（模拟antd中的Result组件）
const Result: React.FC<{
  status: 'success' | 'error' | 'info' | 'warning';
  title: React.ReactNode;
  subTitle?: React.ReactNode;
  extra?: React.ReactNode;
}> = ({ status, title, subTitle, extra }) => {
  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ fontSize: 72, color: '#f5222d' }} />;
      case 'info':
        return <InfoCircleOutlined style={{ fontSize: 72, color: '#1890ff' }} />;
      case 'warning':
        return <ExclamationCircleOutlined style={{ fontSize: 72, color: '#faad14' }} />;
      default:
        return null;
    }
  };
  
  return (
    <div style={{ textAlign: 'center' }}>
      {getIcon()}
      <Title level={3} style={{ marginTop: 16 }}>{title}</Title>
      {subTitle && <Text type="secondary">{subTitle}</Text>}
      {extra && <div style={{ marginTop: 24 }}>{extra}</div>}
    </div>
  );
};

// 缺失的图标组件定义
const CloseCircleOutlined = ExclamationCircleOutlined;
const InfoCircleOutlined = ExclamationCircleOutlined; 