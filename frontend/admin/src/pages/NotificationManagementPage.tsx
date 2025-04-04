import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tabs, 
  Modal, 
  message, 
  Tag, 
  Typography, 
  Tooltip, 
  Popconfirm,
  Row,
  Col,
  Badge
} from 'antd';
import {
  NotificationOutlined,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  SendOutlined,
  ExclamationCircleOutlined,
  LinkOutlined
} from '@ant-design/icons';
import moment from 'moment';
import usePermission from '../hooks/usePermission';
import notificationService from '../services/notificationService';
import NotificationPublisher from '../components/NotificationPublisher';
import PageHeader from '../components/PageHeader';

const { TabPane } = Tabs;
const { Text, Title } = Typography;

// 瀹氫箟Tab椤圭洰
const tabItems = [
  { key: 'all', label: '鍏ㄩ儴閫氱煡' },
  { key: 'info', label: '鏅€氭秷鎭? },
  { key: 'success', label: '鎴愬姛娑堟伅' },
  { key: 'warning', label: '璀﹀憡娑堟伅' },
  { key: 'error', label: '閿欒娑堟伅' }
];

const NotificationManagementPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [publishModalVisible, setPublishModalVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { isAdmin, isTeacher } = usePermission();
  // 直接使用已导入的notificationService实例，不需要重新创建实例
  // const notificationInstance = new notificationService();

  // 鏉冮檺妫€鏌?- 鍙湁鏁欏笀鍜岀鐞嗗憳鍙互璁块棶姝ら〉闈?
  if (!isAdmin && !isTeacher) {
    return (
      <Card>
        <Text type="danger">鎮ㄦ病鏈夋潈闄愯闂椤甸潰</Text>
      </Card>
    );
  }

  // 鍔犺浇閫氱煡鏁版嵁
  const loadNotifications = async (page = 1, pageSize = 10, type?: string) => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({
        page,
        pageSize,
        type
      });

      if (response && response.data) {
        setNotifications(response.data);
        setPagination({
          ...pagination,
          current: page,
          total: response.total || 0,
        });
      }
    } catch (error) {
      console.error('鍔犺浇閫氱煡澶辫触:', error);
      message.error('鍔犺浇閫氱煡澶辫触锛岃閲嶈瘯');
    } finally {
      setLoading(false);
    }
  };

  // 棣栨鍔犺浇
  useEffect(() => {
    loadNotifications();
  }, []);

  // 鏍囩鍒囨崲
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    loadNotifications(1, pagination.pageSize, key !== 'all' ? key : undefined);
  };

  // 琛ㄦ牸鍒嗛〉鍙樺寲
  const handleTableChange = (pagination: any) => {
    loadNotifications(
      pagination.current,
      pagination.pageSize,
      activeTab !== 'all' ? activeTab : undefined
    );
  };

  // 鍒犻櫎閫氱煡
  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      message.success('鍒犻櫎閫氱煡鎴愬姛');
      loadNotifications(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('鍒犻櫎閫氱煡澶辫触:', error);
      message.error('鍒犻櫎閫氱煡澶辫触锛岃閲嶈瘯');
    }
  };

  // 鍙戝竷閫氱煡鎴愬姛鍚庣殑鍥炶皟
  const handlePublishSuccess = () => {
    setPublishModalVisible(false);
    loadNotifications();
    message.success('閫氱煡鍙戝竷鎴愬姛');
  };

  // 娓叉煋閫氱煡绫诲瀷鏍囩
  const renderTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string, text: string }> = {
      info: { color: 'blue', text: '鏅€氭秷鎭? },
      success: { color: 'green', text: '鎴愬姛娑堟伅' },
      warning: { color: 'orange', text: '璀﹀憡娑堟伅' },
      error: { color: 'red', text: '閿欒娑堟伅' },
    };

    const typeInfo = typeMap[type] || { color: 'default', text: '鏈煡绫诲瀷' };
    return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
  };

  // 娓叉煋閲嶈鎬ф爣绛?
  const renderImportanceTag = (importance: string) => {
    const importanceMap: Record<string, { color: string, text: string }> = {
      low: { color: 'default', text: '鏅€? },
      medium: { color: 'blue', text: '涓€鑸? },
      high: { color: 'red', text: '閲嶈' },
    };

    const importanceInfo = importanceMap[importance] || { color: 'default', text: '鏈煡' };
    return <Tag color={importanceInfo.color}>{importanceInfo.text}</Tag>;
  };

  // 琛ㄦ牸鍒楀畾涔?
  const columns = [
    {
      title: '閫氱煡鏍囬',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <Space>
          {record.importance === 'high' && (
            <Badge dot color="red" />
          )}
          <Text strong={record.importance === 'high'}>
            {text}
          </Text>
          {record.link && (
            <Tooltip title="鍖呭惈閾炬帴">
              <LinkOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '鍐呭',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: '30%',
      render: (text: string) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 300 }}>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: '绫诲瀷',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: renderTypeTag,
    },
    {
      title: '閲嶈绋嬪害',
      dataIndex: 'importance',
      key: 'importance',
      width: 100,
      render: renderImportanceTag,
    },
    {
      title: '鍒嗙被',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => {
        const categoryMap: Record<string, string> = {
          system: '绯荤粺閫氱煡',
          course: '璇剧▼閫氱煡',
          assignment: '浣滀笟閫氱煡',
          evaluation: '璇勪及閫氱煡',
          activity: '娲诲姩閫氱煡',
        };

        return categoryMap[category] || category;
      },
    },
    {
      title: '鍙戝竷鑰?,
      dataIndex: ['sender', 'name'],
      key: 'sender',
      width: 120,
    },
    {
      title: '鍙戝竷鏃堕棿',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (timestamp: number) => moment(timestamp).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '鎿嶄綔',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="缂栬緫">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                // 缂栬緫閫氱煡鍔熻兘 - 寰呭疄鐜?
                message.info('缂栬緫閫氱煡鍔熻兘姝ｅ湪寮€鍙戜腑');
              }}
            />
          </Tooltip>
          <Tooltip title="鍒犻櫎">
            <Popconfirm
              title="纭畾瑕佸垹闄よ繖鏉￠€氱煡鍚楋紵"
              onConfirm={() => handleDeleteNotification(record.id)}
              okText="纭畾"
              cancelText="鍙栨秷"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="notification-management-page">
      <PageHeader
        title="閫氱煡绠＄悊"
        subtitle="绠＄悊鍜屽彂甯冪郴缁熷唴鐨勯€氱煡娑堟伅"
        icon={<NotificationOutlined />}
      />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            extra={
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => setPublishModalVisible(true)}
              >
                鍙戝竷鏂伴€氱煡
              </Button>
            }
          >
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              items={tabItems}
            />

            <Table
              columns={columns}
              dataSource={notifications}
              rowKey="id"
              loading={loading}
              pagination={pagination}
              onChange={handleTableChange}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={<><SendOutlined /> 鍙戝竷鏂伴€氱煡</>}
        open={publishModalVisible}
        onCancel={() => setPublishModalVisible(false)}
        footer={null}
        width={700}
      >
        <NotificationPublisher onSuccess={handlePublishSuccess} />
      </Modal>
    </div>
  );
};

export default NotificationManagementPage; 