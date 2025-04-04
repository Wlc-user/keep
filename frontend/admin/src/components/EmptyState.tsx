import React from 'react';
import { Empty, Button, Typography, Space, Card } from 'antd';
import styled from 'styled-components';
import { 
  FileSearchOutlined, 
  PlusOutlined, 
  ReloadOutlined, 
  FilterOutlined,
  InboxOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

export type EmptyStateType = 'default' | 'search' | 'filter' | 'create' | 'data' | 'custom';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  image?: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  size?: 'small' | 'default' | 'large';
  variant?: 'outlined' | 'default';
}

const EmptyContainer = styled.div<{ $size: string; $bordered: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.$size === 'small' ? '16px' : props.$size === 'large' ? '48px' : '32px'};
  text-align: center;
  background-color: var(--component-background, #ffffff);
  border-radius: 8px;
  transition: background-color 0.3s ease;
  
  ${props => props.$bordered && `
    border: 1px dashed var(--border-color, #d9d9d9);
  `}
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    background-color: var(--component-background, #1f1f1f);
    ${props => props.$bordered && `
      border: 1px dashed var(--border-color, #434343);
    `}
  }
`;

const EmptyTitle = styled(Title)<{ $size: string }>`
  margin-top: 16px !important;
  margin-bottom: 8px !important;
  font-size: ${props => props.$size === 'small' ? '16px' : props.$size === 'large' ? '24px' : '20px'} !important;
  color: var(--heading-color, #262626) !important;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--heading-color, #e6e6e6) !important;
  }
`;

const EmptyDescription = styled(Text)<{ $size: string }>`
  font-size: ${props => props.$size === 'small' ? '12px' : props.$size === 'large' ? '16px' : '14px'};
  color: var(--text-color-secondary, #595959) !important;
  max-width: 300px;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--text-color-secondary, #a6a6a6) !important;
  }
`;

const ActionContainer = styled.div`
  margin-top: 24px;
  display: flex;
  gap: 12px;
`;

const CustomIcon = styled.div<{ $size: string }>`
  font-size: ${props => props.$size === 'small' ? '32px' : props.$size === 'large' ? '64px' : '48px'};
  color: var(--primary-color, #1890ff);
  opacity: 0.8;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    opacity: 0.6;
  }
`;

/**
 * 空状态组件
 * 用于显示没有数据时的友好提示
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'default',
  title,
  description,
  icon,
  image,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  size = 'default',
  variant = 'default',
}) => {
  // 根据类型设置默认值
  const getDefaultProps = () => {
    switch (type) {
      case 'search':
        return {
          title: title || '未找到匹配结果',
          description: description || '尝试使用不同的关键词或筛选条件',
          icon: icon || <FileSearchOutlined />,
          actionText: actionText || '清除搜索',
        };
      case 'filter':
        return {
          title: title || '没有符合条件的数据',
          description: description || '尝试调整筛选条件以查看更多结果',
          icon: icon || <FilterOutlined />,
          actionText: actionText || '清除筛选',
        };
      case 'create':
        return {
          title: title || '开始创建',
          description: description || '现在还没有数据，点击下方按钮创建第一条数据',
          icon: icon || <PlusOutlined />,
          actionText: actionText || '创建',
        };
      case 'data':
        return {
          title: title || '暂无数据',
          description: description || '数据将在稍后显示',
          icon: icon || <InboxOutlined />,
          actionText: actionText || '刷新',
        };
      case 'custom':
        return {
          title: title || '自定义空状态',
          description: description || '根据需要自定义此空状态',
          icon: icon,
          actionText: actionText,
        };
      default:
        return {
          title: title || '暂无数据',
          description: description || '没有可显示的数据',
          icon: icon || <InboxOutlined />,
          actionText: actionText || '刷新',
        };
    }
  };

  const defaultProps = getDefaultProps();
  const finalTitle = title || defaultProps.title;
  const finalDescription = description || defaultProps.description;
  const finalIcon = icon || defaultProps.icon;
  const finalActionText = actionText || defaultProps.actionText;

  // 根据尺寸调整样式
  const contentStyle: React.CSSProperties = {
    padding: size === 'small' ? '12px' : size === 'large' ? '48px' : '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: size === 'small' ? '32px' : size === 'large' ? '64px' : '48px',
    color: 'var(--primary-color, #1890ff)',
    marginBottom: size === 'small' ? '8px' : '16px',
  };

  // 渲染内容
  const content = (
    <div style={{ textAlign: 'center', ...contentStyle }}>
      {image ? (
        <img src={image} alt="empty" style={{ maxWidth: '100%', height: 'auto', marginBottom: 16 }} />
      ) : (
        <div style={{ marginBottom: 16 }}>
          {finalIcon && <div style={iconStyle}>{finalIcon}</div>}
          {!finalIcon && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={false} />}
        </div>
      )}
      
      {finalTitle && (
        <Title level={size === 'small' ? 5 : size === 'large' ? 3 : 4} style={{ marginTop: 0 }}>
          {finalTitle}
        </Title>
      )}
      
      {finalDescription && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 16, maxWidth: '80%' }}>
          {finalDescription}
        </Text>
      )}
      
      {(finalActionText || secondaryActionText) && (
        <Space style={{ marginTop: 16 }}>
          {finalActionText && onAction && (
            <Button type="primary" onClick={onAction}>
              {finalActionText}
            </Button>
          )}
          
          {secondaryActionText && onSecondaryAction && (
            <Button onClick={onSecondaryAction}>
              {secondaryActionText}
            </Button>
          )}
        </Space>
      )}
    </div>
  );

  // 如果需要边框，则包装在Card中
  if (variant === 'outlined') {
    return <Card style={{ textAlign: 'center' }}>{content}</Card>;
  }

  return content;
};

export default EmptyState; 