import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, Tabs, Button, Space, Spin, Empty, Typography } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import NotificationItem, { INotification } from './NotificationItem';
import './NotificationCenter.css';

const { Text } = Typography;

export interface NotificationCenterProps {
  notifications: INotification[];
  loading?: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onNotificationClick?: (notification: INotification) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onDeleteAll,
  onLoadMore,
  onRefresh,
  onNotificationClick,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  // 计算未读消息数量
  const unreadCount = notifications.filter(n => !n.read).length;

  // 按照时间戳排序通知
  const sortedNotifications = [...notifications].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // 根据类型过滤通知
  const filterNotificationsByType = (type?: string): INotification[] => {
    if (!type || type === 'all') {
      return sortedNotifications;
    }
    return sortedNotifications.filter(n => n.type === type);
  };

  // 根据已读状态过滤通知
  const filterNotificationsByReadStatus = (read: boolean): INotification[] => {
    return sortedNotifications.filter(n => n.read === read);
  };

  // 渲染通知列表
  const renderNotificationList = (items: INotification[]) => {
    if (loading) {
      return (
        <div className="notification-loading">
          <Spin />
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无通知"
          className="notification-empty"
        />
      );
    }

    return (
      <div className="notification-list">
        {items.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
            onClick={onNotificationClick}
          />
        ))}
      </div>
    );
  };

  // 通知下拉菜单内容
  const notificationDropdownContent = (
    <div className="notification-dropdown">
      <div className="notification-header">
        <Text strong>通知中心</Text>
        <Space>
          <Button 
            type="text" 
            size="small"
            icon={<CheckOutlined />}
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            全部已读
          </Button>
          <Button 
            type="text" 
            size="small" 
            danger
            icon={<DeleteOutlined />}
            onClick={onDeleteAll}
            disabled={notifications.length === 0}
          >
            清空通知
          </Button>
        </Space>
      </div>
      <Tabs 
        activeKey={activeTab}
        onChange={setActiveTab}
        className="notification-tabs"
        items={[
          {
            key: 'all',
            label: `全部 (${notifications.length})`,
            children: renderNotificationList(filterNotificationsByType('all'))
          },
          {
            key: 'system',
            label: `系统 (${filterNotificationsByType('system').length})`,
            children: renderNotificationList(filterNotificationsByType('system'))
          },
          {
            key: 'message',
            label: `消息 (${filterNotificationsByType('message').length})`,
            children: renderNotificationList(filterNotificationsByType('message'))
          },
          {
            key: 'alert',
            label: `警告 (${filterNotificationsByType('alert').length})`,
            children: renderNotificationList(filterNotificationsByType('alert'))
          },
          {
            key: 'unread',
            label: `未读 (${unreadCount})`,
            children: renderNotificationList(filterNotificationsByReadStatus(false))
          }
        ]}
      />
      {onLoadMore && (
        <div className="notification-footer">
          <Button type="link" onClick={onLoadMore} block>
            加载更多
          </Button>
        </div>
      )}
      {onRefresh && (
        <div className="notification-footer">
          <Button type="link" onClick={onRefresh} block>
            刷新
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="notification-center">
      <Dropdown
        placement="bottomRight"
        trigger={['click']}
        open={open}
        onOpenChange={setOpen}
        overlayClassName="notification-dropdown-overlay"
        dropdownRender={() => notificationDropdownContent}
      >
        <Badge count={unreadCount} className="notification-badge">
          <Button 
            type="text" 
            icon={<BellOutlined />} 
            className="notification-button"
            aria-label="通知"
          />
        </Badge>
      </Dropdown>
    </div>
  );
};

export default NotificationCenter; 