import React, { ReactNode } from 'react';
import { Tooltip as AntdTooltip, Typography, Space, Button } from 'antd';
import { InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Text, Link } = Typography;

export type TooltipType = 'info' | 'help' | 'warning' | 'error' | 'success';

interface EnhancedTooltipProps {
  title?: ReactNode;
  content?: ReactNode;
  type?: TooltipType;
  icon?: ReactNode;
  showIcon?: boolean;
  iconSize?: number;
  maxWidth?: number;
  link?: {
    text: string;
    url: string;
  };
  action?: {
    text: string;
    onClick: () => void;
  };
  children?: ReactNode;
  placement?: 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';
  className?: string;
  style?: React.CSSProperties;
}

const TooltipIcon = styled.span<{ type: TooltipType }>`
  color: ${props => {
    switch (props.type) {
      case 'info':
        return 'var(--primary-color, #1890ff)';
      case 'help':
        return 'var(--primary-color, #1890ff)';
      case 'warning':
        return 'var(--warning-color, #faad14)';
      case 'error':
        return 'var(--error-color, #ff4d4f)';
      case 'success':
        return 'var(--success-color, #52c41a)';
      default:
        return 'var(--primary-color, #1890ff)';
    }
  }};
  cursor: help;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    opacity: 0.85;
  }
`;

const TooltipContainer = styled.div`
  max-width: ${(props: { maxWidth: number }) => props.maxWidth}px;
`;

const TooltipTitle = styled(Text)`
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
  color: #fff;
  font-size: 14px;
`;

const TooltipContent = styled(Text)`
  display: block;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  line-height: 1.5;
`;

const TooltipFooter = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TooltipLink = styled(Link)`
  color: rgba(255, 255, 255, 0.85);
  text-decoration: underline;
  font-size: 13px;
  
  &:hover {
    color: #fff;
  }
`;

const TooltipButton = styled(Button)`
  padding: 0 8px;
  height: 22px;
  font-size: 12px;
  background-color: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
    color: #fff;
  }
`;

/**
 * 增强的工具提示组件
 * 用于显示更丰富的提示信息
 */
const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  title,
  content,
  type = 'info',
  icon,
  showIcon = true,
  iconSize = 16,
  maxWidth = 300,
  link,
  action,
  children,
  placement = 'top',
  className,
  style,
}) => {
  // 根据类型获取默认图标
  const getDefaultIcon = () => {
    switch (type) {
      case 'help':
        return <QuestionCircleOutlined style={{ fontSize: iconSize }} />;
      case 'info':
      case 'warning':
      case 'error':
      case 'success':
      default:
        return <InfoCircleOutlined style={{ fontSize: iconSize }} />;
    }
  };
  
  // 渲染工具提示内容
  const renderTooltipContent = () => {
    return (
      <TooltipContainer maxWidth={maxWidth}>
        {title && <TooltipTitle>{title}</TooltipTitle>}
        {content && <TooltipContent>{content}</TooltipContent>}
        
        {(link || action) && (
          <TooltipFooter>
            {link && (
              <TooltipLink href={link.url} target="_blank" rel="noopener noreferrer">
                {link.text}
              </TooltipLink>
            )}
            
            {action && (
              <TooltipButton type="text" size="small" onClick={action.onClick}>
                {action.text}
              </TooltipButton>
            )}
          </TooltipFooter>
        )}
      </TooltipContainer>
    );
  };
  
  // 如果有子元素，则将工具提示应用于子元素
  if (children) {
    return (
      <AntdTooltip
        title={renderTooltipContent()}
        placement={placement}
        overlayClassName={className}
        overlayStyle={style}
        color={
          type === 'info' ? 'var(--primary-color, #1890ff)' :
          type === 'help' ? 'var(--primary-color, #1890ff)' :
          type === 'warning' ? 'var(--warning-color, #faad14)' :
          type === 'error' ? 'var(--error-color, #ff4d4f)' :
          type === 'success' ? 'var(--success-color, #52c41a)' :
          'var(--primary-color, #1890ff)'
        }
      >
        {children}
      </AntdTooltip>
    );
  }
  
  // 否则，显示图标并将工具提示应用于图标
  return (
    <AntdTooltip
      title={renderTooltipContent()}
      placement={placement}
      overlayClassName={className}
      overlayStyle={style}
      color={
        type === 'info' ? 'var(--primary-color, #1890ff)' :
        type === 'help' ? 'var(--primary-color, #1890ff)' :
        type === 'warning' ? 'var(--warning-color, #faad14)' :
        type === 'error' ? 'var(--error-color, #ff4d4f)' :
        type === 'success' ? 'var(--success-color, #52c41a)' :
        'var(--primary-color, #1890ff)'
      }
    >
      {showIcon && (
        <TooltipIcon type={type}>
          {icon || getDefaultIcon()}
        </TooltipIcon>
      )}
    </AntdTooltip>
  );
};

export default EnhancedTooltip; 