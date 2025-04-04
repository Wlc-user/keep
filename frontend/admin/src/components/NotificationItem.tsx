import React from 'react';
import { Avatar, Badge, Button, List, Space, Tag, Typography } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined, ExclamationCircleOutlined, InfoCircleOutlined, LikeOutlined } from '@ant-design/icons';
import { formatTimestamp } from '../utils/dateUtils';
import './NotificationItem.css';

const { Text } = Typography;

export interface INotification {
  id: string;
  title: string;
  content: string;
  type: 'system' | 'course' | 'homework' | 'exam' | 'material' | 'progress' | 'facility';
  isRead: boolean;
  createdAt: string;
  sender?: string;
  category?: string;
  importance?: 'high' | 'medium' | 'low';
  link?: string;
}

export interface NotificationItemProps {
  notification: INotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: INotification) => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'system':
      return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    case 'message':
      return <BellOutlined style={{ color: '#52c41a' }} />;
    case 'alert':
      return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
    default:
      return <BellOutlined style={{ color: '#1890ff' }} />;
  }
};

const getImportanceTag = (importance?: string) => {
  if (!importance) return null;
  
  const colors: Record<string, string> = {
    high: 'red',
    medium: 'orange',
    low: 'blue'
  };
  
  return (
    <Tag color={colors[importance] || 'blue'} style={{ marginLeft: 8 }}>
      {importance === 'high' ? '重要' : importance === 'medium' ? '一般' : '普通'}
    </Tag>
  );
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}) => {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (onClick) {
      onClick(notification);
    }
  };

  return (
    <List.Item
      className={`notification-item ${notification.isRead ? '' : 'notification-unread'}`}
      onClick={handleClick}
      actions={[
        <Button
          type="text"
          size="small"
          icon={<CheckOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead(notification.id);
          }}
          disabled={notification.isRead}
        >
          已读
        </Button>,
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
        >
          删除
        </Button>,
      ]}
    >
      <List.Item.Meta
        avatar={
          notification.sender ? (
            <Avatar src={notification.sender} />
          ) : (
            <Avatar icon={getTypeIcon(notification.type)} />
          )
        }
        title={
          <Space>
            {!notification.isRead && <Badge status="processing" />}
            <Text strong={!notification.isRead}>{notification.title}</Text>
            {getImportanceTag(notification.importance)}
          </Space>
        }
        description={
          <div>
            <div className="notification-content">{notification.content}</div>
            <div className="notification-meta">
              {notification.sender && (
                <Text type="secondary" style={{ marginRight: 8 }}>
                  {notification.sender}
                </Text>
              )}
              <Text type="secondary">{formatTimestamp(notification.createdAt)}</Text>
              {notification.category && (
                <Tag style={{ marginLeft: 8 }}>{notification.category}</Tag>
              )}
            </div>
          </div>
        }
      />
    </List.Item>
  );
};

export default NotificationItem; 