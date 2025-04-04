import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Tabs, 
  Button, 
  Empty, 
  Spin, 
  Space, 
  Typography, 
  Divider, 
  List,
  message,
  Select,
  Input,
  Badge,
  Radio,
  Tooltip
} from 'antd';
import { 
  DeleteOutlined, 
  CheckOutlined, 
  ReloadOutlined,
  FilterOutlined,
  SearchOutlined,
  PlusOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined
} from '@ant-design/icons';
import { INotification } from '../components/NotificationItem';
import notificationService from '../services/notificationService';
import NotificationItem from '../components/NotificationItem';
import './NotificationPage.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const NotificationPage: React.FC = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterImportance, setFilterImportance] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [selectedNotification, setSelectedNotification] = useState<INotification | null>(null);

  // 加载通知数据
  const loadNotifications = async () => {
    try {
      setLoading(true);
      // 直接使用已定义的notificationService实例
      const response = await notificationService.getNotifications();
      
      // 处理新的返回格式，可能是 {data: [...]} 或直接是数组
      const notificationsData = response.data || response;
      
      if (Array.isArray(notificationsData)) {
        setNotifications(notificationsData);
      } else {
        console.error('获取到的通知数据格式不正确:', response);
        setNotifications([]);
      }
    } catch (error) {
      console.error('加载通知失败:', error);
      message.error('加载通知失败');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // 处理通知点击
  const handleNotificationClick = (notification: INotification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  // 标记通知为已读
  const handleMarkAsRead = async (id: string) => {
    try {
      // 直接使用已定义的notificationService实例
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(item => 
          item.id === id ? { ...item, read: true } : item
        )
      );
      if (selectedNotification?.id === id) {
        setSelectedNotification(prev => prev ? { ...prev, read: true } : null);
      }
    } catch (error) {
      console.error('标记通知已读失败:', error);
      message.error('标记通知已读失败');
    }
  };

  // 标记所有通知为已读
  const handleMarkAllAsRead = async () => {
    try {
      // 直接使用已定义的notificationService实例
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(item => ({ ...item, read: true })));
      if (selectedNotification) {
        setSelectedNotification({ ...selectedNotification, read: true });
      }
      message.success('所有通知已标记为已读');
    } catch (error) {
      console.error('标记所有通知已读失败:', error);
      message.error('标记所有通知已读失败');
    }
  };

  // 删除通知
  const handleDeleteNotification = async (id: string) => {
    try {
      // 直接使用已定义的notificationService实例
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(item => item.id !== id));
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
      message.success('通知已删除');
    } catch (error) {
      console.error('删除通知失败:', error);
      message.error('删除通知失败');
    }
  };

  // 删除所有通知
  const handleDeleteAllNotifications = async () => {
    try {
      // 直接使用已定义的notificationService实例
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setSelectedNotification(null);
      message.success('所有通知已删除');
    } catch (error) {
      console.error('删除所有通知失败:', error);
      message.error('删除所有通知失败');
    }
  };

  // 过滤和排序通知
  const getFilteredAndSortedNotifications = (): INotification[] => {
    // 确保 notifications 是数组
    if (!Array.isArray(notifications)) {
      console.warn('通知数据不是数组:', notifications);
      return [];
    }
    
    let filtered = [...notifications];

    // 按类型过滤
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // 按重要性过滤
    if (filterImportance !== 'all') {
      filtered = filtered.filter(item => item.importance === filterImportance);
    }

    // 按已读状态过滤（基于标签页）
    if (activeTab === 'unread') {
      filtered = filtered.filter(item => !item.read);
    } else if (activeTab === 'read') {
      filtered = filtered.filter(item => item.read);
    }

    // 搜索过滤
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filtered = filtered.filter(
        item => 
          item.title.toLowerCase().includes(lowerSearchText) || 
          item.content.toLowerCase().includes(lowerSearchText) ||
          (item.category && item.category.toLowerCase().includes(lowerSearchText)) ||
          (item.sender && item.sender.name.toLowerCase().includes(lowerSearchText))
      );
    }

    // 排序
    filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return filtered;
  };

  const filteredNotifications = getFilteredAndSortedNotifications();
  // 确保在计算未读数量时 notifications 是数组
  const unreadCount = Array.isArray(notifications) ? notifications.filter(item => !item.read).length : 0;

  return (
    <div className="notification-page">
      <div className="notification-page-header">
        <Title heading={4}>通知中心</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={loadNotifications}
            loading={loading}
          >
            刷新
          </Button>
          <Button 
            icon={<CheckOutlined />} 
            onClick={handleMarkAllAsRead}
            disabled={!Array.isArray(notifications) || unreadCount === 0}
          >
            全部已读
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={handleDeleteAllNotifications}
            disabled={!Array.isArray(notifications) || notifications.length === 0}
          >
            清空通知
          </Button>
        </Space>
      </div>

      <div className="notification-page-toolbar">
        <div className="notification-search">
          <Search
            placeholder="搜索通知..."
            onSearch={value => setSearchText(value)}
            style={{ width: 250 }}
            allowClear
          />
        </div>
        <Space className="notification-filters">
          <Select 
            value={filterType} 
            onChange={value => setFilterType(value)}
            style={{ width: 120 }}
          >
            <Option value="all">所有类型</Option>
            <Option value="system">系统</Option>
            <Option value="message">消息</Option>
            <Option value="alert">警告</Option>
          </Select>
          <Select 
            value={filterImportance} 
            onChange={value => setFilterImportance(value)}
            style={{ width: 120 }}
          >
            <Option value="all">所有重要性</Option>
            <Option value="high">重要</Option>
            <Option value="medium">一般</Option>
            <Option value="low">普通</Option>
          </Select>
          <Radio.Group 
            value={sortOrder} 
            onChange={e => setSortOrder(e.target.value)}
            buttonStyle="solid"
            size="small"
          >
            <Tooltip title="最新的优先">
              <Radio.Button value="newest"><SortDescendingOutlined /></Radio.Button>
            </Tooltip>
            <Tooltip title="最早的优先">
              <Radio.Button value="oldest"><SortAscendingOutlined /></Radio.Button>
            </Tooltip>
          </Radio.Group>
        </Space>
      </div>

      <Card className="notification-page-content">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'all',
              label: `全部通知 (${Array.isArray(notifications) ? notifications.length : 0})`,
              children: null
            },
            {
              key: 'unread',
              label: <Badge count={unreadCount} size="small">未读通知</Badge>,
              children: null
            },
            {
              key: 'read',
              label: '已读通知',
              children: null
            }
          ]}
        />

        <div className="notification-list-container">
          {loading ? (
            <div className="loading-container">
              <Spin>
                <div style={{ padding: '50px 0', textAlign: 'center' }}>
                  <p>加载通知中...</p>
                </div>
              </Spin>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description={searchText ? "没有找到匹配的通知" : "暂无通知"} 
            />
          ) : (
            <div className="notification-split-view">
              <div className="notification-list-view">
                <List>
                  {filteredNotifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDeleteNotification}
                      onClick={handleNotificationClick}
                    />
                  ))}
                </List>
                {Array.isArray(notifications) && notifications.length > 20 && (
                  <div className="notification-load-more">
                    <Button type="link" block>加载更多</Button>
                  </div>
                )}
              </div>
              
              {selectedNotification && (
                <div className="notification-detail-view">
                  <Card 
                    title={selectedNotification.title}
                    extra={
                      <Space>
                        {!selectedNotification.read && (
                          <Button 
                            size="small" 
                            icon={<CheckOutlined />} 
                            onClick={() => handleMarkAsRead(selectedNotification.id)}
                          >
                            标记已读
                          </Button>
                        )}
                        <Button 
                          size="small" 
                          danger 
                          icon={<DeleteOutlined />} 
                          onClick={() => handleDeleteNotification(selectedNotification.id)}
                        >
                          删除
                        </Button>
                      </Space>
                    }
                  >
                    <div className="notification-detail-meta">
                      <Space wrap>
                        {selectedNotification.sender && (
                          <Text type="secondary">发送人: {selectedNotification.sender.name}</Text>
                        )}
                        <Text type="secondary">
                          时间: {new Date(selectedNotification.timestamp).toLocaleString()}
                        </Text>
                        {selectedNotification.category && (
                          <Text type="secondary">类别: {selectedNotification.category}</Text>
                        )}
                        <Text type="secondary">
                          类型: {
                            selectedNotification.type === 'system' ? '系统' : 
                            selectedNotification.type === 'message' ? '消息' : '警告'
                          }
                        </Text>
                        {selectedNotification.importance && (
                          <Text type="secondary">
                            重要性: {
                              selectedNotification.importance === 'high' ? '重要' : 
                              selectedNotification.importance === 'medium' ? '一般' : '普通'
                            }
                          </Text>
                        )}
                      </Space>
                    </div>
                    <Divider />
                    <div className="notification-detail-content">
                      {selectedNotification.content}
                    </div>
                    {selectedNotification.link && (
                      <div className="notification-detail-actions">
                        <Button type="primary" href={selectedNotification.link}>
                          查看详情
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default NotificationPage; 
