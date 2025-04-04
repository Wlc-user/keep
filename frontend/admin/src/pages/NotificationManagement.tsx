import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker, 
  message, Space, Popconfirm, Tag, Typography, Badge, Tabs, Spin,
  Empty, Switch, Divider, Radio, Tooltip
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SendOutlined,
  BellOutlined, SearchOutlined, EyeOutlined, ClockCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import apiService from '../services/apiService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  priority: string;
  targetAudience: string;
  createdAt: string;
  publishedAt: string;
  expiresAt: string;
  createdBy: string;
  readCount: number;
}

const NotificationManagement: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/api/notifications');
      if (Array.isArray(response)) {
        setNotifications(response);
      } else if (response && response.items && Array.isArray(response.items)) {
        setNotifications(response.items);
      } else {
        message.error('获取通知数据格式不正确');
      }
    } catch (error) {
      console.error('获取通知列表失败:', error);
      message.error('获取通知列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    form.resetFields();
    setCurrentNotification(null);
    setEditMode(false);
    setModalVisible(true);
  };

  const handleEdit = (notification: Notification) => {
    setCurrentNotification(notification);
    setEditMode(true);
    form.setFieldsValue({
      title: notification.title,
      content: notification.content,
      type: notification.type,
      priority: notification.priority,
      targetAudience: notification.targetAudience,
      status: notification.status,
      expiresAt: notification.expiresAt ? moment(notification.expiresAt) : undefined
    });
    setModalVisible(true);
  };

  const handleView = (notification: Notification) => {
    setCurrentNotification(notification);
    setDetailModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.delete(`/api/notifications/${id}`);
      message.success('通知已删除');
      fetchNotifications();
    } catch (error) {
      console.error('删除通知失败:', error);
      message.error('删除通知失败');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await apiService.post(`/api/notifications/${id}/publish`);
      message.success('通知已发布');
      fetchNotifications();
    } catch (error) {
      console.error('发布通知失败:', error);
      message.error('发布通知失败');
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      const notificationData = {
        ...values,
        expiresAt: values.expiresAt ? values.expiresAt.format('YYYY-MM-DD HH:mm:ss') : null
      };

      if (editMode && currentNotification) {
        await apiService.put(`/api/notifications/${currentNotification.id}`, notificationData);
        message.success('通知已更新');
      } else {
        await apiService.post('/api/notifications', notificationData);
        message.success('通知已创建');
      }

      setModalVisible(false);
      fetchNotifications();
    } catch (error) {
      console.error('保存通知失败:', error);
      message.error('保存通知失败');
    } finally {
      setConfirmLoading(false);
    }
  };

  const getNotificationTypeTag = (type: string) => {
    switch (type.toLowerCase()) {
      case 'system':
        return <Tag color="blue">系统通知</Tag>;
      case 'course':
        return <Tag color="green">课程通知</Tag>;
      case 'exam':
        return <Tag color="purple">考试通知</Tag>;
      case 'event':
        return <Tag color="cyan">活动通知</Tag>;
      case 'maintenance':
        return <Tag color="orange">维护通知</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };

  const getStatusTag = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return <Tag color="default">草稿</Tag>;
      case 'published':
        return <Tag color="green">已发布</Tag>;
      case 'scheduled':
        return <Tag color="blue">计划中</Tag>;
      case 'expired':
        return <Tag color="gray">已过期</Tag>;
      case 'cancelled':
        return <Tag color="red">已取消</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getPriorityTag = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return (
          <Tag color="red">
            <Space>
              <ExclamationCircleOutlined />
              高优先级
            </Space>
          </Tag>
        );
      case 'medium':
        return <Tag color="orange">中优先级</Tag>;
      case 'low':
        return <Tag color="green">低优先级</Tag>;
      default:
        return <Tag>{priority}</Tag>;
    }
  };

  const getAudienceTag = (audience: string) => {
    switch (audience.toLowerCase()) {
      case 'all':
        return <Tag color="blue">所有用户</Tag>;
      case 'students':
        return <Tag color="green">学生</Tag>;
      case 'teachers':
        return <Tag color="purple">教师</Tag>;
      case 'admins':
        return <Tag color="red">管理员</Tag>;
      default:
        return <Tag>{audience}</Tag>;
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Notification) => (
        <Space>
          {record.priority === 'high' && (
            <ExclamationCircleOutlined style={{ color: '#f5222d' }} />
          )}
          <a onClick={() => handleView(record)}>{text}</a>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getNotificationTypeTag(type)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => getPriorityTag(priority)
    },
    {
      title: '目标受众',
      dataIndex: 'targetAudience',
      key: 'targetAudience',
      render: (audience: string) => getAudienceTag(audience)
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => moment(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '有效期至',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string) => date ? moment(date).format('YYYY-MM-DD HH:mm') : '永久'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Notification) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleView(record)} 
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)} 
              disabled={record.status === 'expired'}
            />
          </Tooltip>
          {record.status === 'draft' && (
            <Tooltip title="发布">
              <Button 
                type="text" 
                icon={<SendOutlined />} 
                onClick={() => handlePublish(record.id)} 
              />
            </Tooltip>
          )}
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这条通知吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'draft':
        return notification.status === 'draft';
      case 'published':
        return notification.status === 'published';
      case 'scheduled':
        return notification.status === 'scheduled';
      case 'expired':
        return notification.status === 'expired';
      default:
        return true;
    }
  });

  return (
    <div className="notification-management">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={2}>通知管理</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            创建通知
          </Button>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="全部通知" key="all" />
          <TabPane 
            tab={
              <Badge count={notifications.filter(n => n.status === 'draft').length} overflowCount={99} size="small">
                <span>草稿</span>
              </Badge>
            } 
            key="draft" 
          />
          <TabPane 
            tab={
              <Badge count={notifications.filter(n => n.status === 'published').length} overflowCount={99} size="small">
                <span>已发布</span>
              </Badge>
            } 
            key="published" 
          />
          <TabPane 
            tab={
              <Badge count={notifications.filter(n => n.status === 'scheduled').length} overflowCount={99} size="small">
                <span>计划中</span>
              </Badge>
            } 
            key="scheduled" 
          />
          <TabPane 
            tab={
              <Badge count={notifications.filter(n => n.status === 'expired').length} overflowCount={99} size="small">
                <span>已过期</span>
              </Badge>
            } 
            key="expired" 
          />
        </Tabs>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <Spin size="large">
              <div style={{ padding: '30px', background: '#f0f2f5', borderRadius: '4px' }}>
                加载通知数据...
              </div>
            </Spin>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredNotifications}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty 
            description="暂无通知数据" 
            style={{ margin: '40px 0' }}
          />
        )}
      </Card>

      {/* 创建/编辑通知模态框 */}
      <Modal
        title={editMode ? '编辑通知' : '创建通知'}
        open={modalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        confirmLoading={confirmLoading}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 'system',
            priority: 'medium',
            targetAudience: 'all',
            status: 'draft'
          }}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入通知标题' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入通知内容' }]}
          >
            <TextArea rows={6} />
          </Form.Item>

          <Form.Item
            name="type"
            label="通知类型"
            rules={[{ required: true, message: '请选择通知类型' }]}
          >
            <Select>
              <Option value="system">系统通知</Option>
              <Option value="course">课程通知</Option>
              <Option value="exam">考试通知</Option>
              <Option value="event">活动通知</Option>
              <Option value="maintenance">维护通知</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Radio.Group>
              <Radio value="low">低</Radio>
              <Radio value="medium">中</Radio>
              <Radio value="high">高</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="targetAudience"
            label="目标受众"
            rules={[{ required: true, message: '请选择目标受众' }]}
          >
            <Select>
              <Option value="all">所有用户</Option>
              <Option value="students">学生</Option>
              <Option value="teachers">教师</Option>
              <Option value="admins">管理员</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="draft">草稿</Option>
              <Option value="published">发布</Option>
              <Option value="scheduled">计划发布</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="expiresAt"
            label="过期时间"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
              placeholder="选择过期时间（可选）"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 通知详情模态框 */}
      <Modal
        title="通知详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          currentNotification && currentNotification.status !== 'expired' && (
            <Button
              key="edit"
              type="primary"
              onClick={() => {
                setDetailModalVisible(false);
                if (currentNotification) {
                  handleEdit(currentNotification);
                }
              }}
            >
              编辑
            </Button>
          )
        ]}
        width={600}
      >
        {currentNotification && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Space>
                {getPriorityTag(currentNotification.priority)}
                {getNotificationTypeTag(currentNotification.type)}
                {getStatusTag(currentNotification.status)}
              </Space>
            </div>
            
            <Title level={4}>{currentNotification.title}</Title>
            
            <div style={{ marginBottom: 24 }}>
              <Text type="secondary">
                创建于: {moment(currentNotification.createdAt).format('YYYY-MM-DD HH:mm')}
                {currentNotification.publishedAt && (
                  <>, 发布于: {moment(currentNotification.publishedAt).format('YYYY-MM-DD HH:mm')}</>
                )}
                {currentNotification.expiresAt && (
                  <>, 有效期至: {moment(currentNotification.expiresAt).format('YYYY-MM-DD HH:mm')}</>
                )}
              </Text>
            </div>
            
            <Divider />
            
            <div style={{ whiteSpace: 'pre-wrap', marginBottom: 16 }}>
              {currentNotification.content}
            </div>
            
            <Divider />
            
            <div>
              <Space>
                <Text>目标受众:</Text>
                {getAudienceTag(currentNotification.targetAudience)}
              </Space>
            </div>
            
            <div style={{ marginTop: 8 }}>
              <Text>阅读人数: {currentNotification.readCount || 0}</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NotificationManagement; 