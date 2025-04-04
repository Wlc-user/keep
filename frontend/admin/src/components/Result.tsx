import React, { ReactNode } from 'react';
import { Result as AntdResult, Button, Typography, Space, Divider } from 'antd';
import { 
  CheckCircleFilled, 
  CloseCircleFilled, 
  ExclamationCircleFilled, 
  InfoCircleFilled,
  LoadingOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  HomeOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { ResultStatusType } from 'antd/lib/result';

const { Title, Paragraph, Text } = Typography;

export type ResultType = 'success' | 'error' | 'info' | 'warning' | 'loading' | '403' | '404' | '500';

export interface ResultAction {
  text: string;
  onClick?: () => void;
  href?: string;
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  icon?: ReactNode;
  danger?: boolean;
  ghost?: boolean;
  disabled?: boolean;
}

export interface EnhancedResultProps {
  type?: ResultType;
  title: string;
  subTitle?: string;
  description?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
  status?: ResultStatusType;
  primaryAction?: ResultAction;
  secondaryActions?: ResultAction[];
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showRetryButton?: boolean;
  onBack?: () => void;
  onHome?: () => void;
  onRetry?: () => void;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

const ResultContainer = styled.div`
  text-align: center;
  padding: 32px 16px;
  background-color: var(--component-background, #ffffff);
  border-radius: 8px;
  box-shadow: var(--box-shadow-card);
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    background-color: var(--component-background, #1f1f1f);
  }
`;

const ResultIcon = styled.div<{ type: ResultType }>`
  font-size: 72px;
  line-height: 72px;
  margin-bottom: 24px;
  color: ${props => {
    switch (props.type) {
      case 'success':
        return 'var(--success-color, #52c41a)';
      case 'error':
        return 'var(--error-color, #ff4d4f)';
      case 'warning':
        return 'var(--warning-color, #faad14)';
      case 'info':
        return 'var(--primary-color, #1890ff)';
      case 'loading':
        return 'var(--primary-color, #1890ff)';
      default:
        return 'var(--text-color-secondary, #595959)';
    }
  }};
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: ${props => {
      switch (props.type) {
        case 'success':
          return 'var(--success-color, #49aa19)';
        case 'error':
          return 'var(--error-color, #d32029)';
        case 'warning':
          return 'var(--warning-color, #d89614)';
        case 'info':
          return 'var(--primary-color, #177ddc)';
        case 'loading':
          return 'var(--primary-color, #177ddc)';
        default:
          return 'var(--text-color-secondary, #a6a6a6)';
      }
    }};
  }
`;

const ResultTitle = styled(Title)`
  color: var(--heading-color, #262626) !important;
  margin-bottom: 8px !important;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--heading-color, #e6e6e6) !important;
  }
`;

const ResultSubtitle = styled(Text)`
  color: var(--text-color-secondary, #595959);
  font-size: 16px;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--text-color-secondary, #a6a6a6);
  }
`;

const ResultDescription = styled.div`
  margin-top: 24px;
  margin-bottom: 24px;
  color: var(--text-color, #434343);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--text-color, #d9d9d9);
  }
`;

const ResultActions = styled.div`
  margin-top: 24px;
`;

const ResultContent = styled.div`
  margin-top: 24px;
  text-align: left;
  background-color: var(--item-hover-bg, #f5f5f5);
  padding: 16px;
  border-radius: 4px;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    background-color: var(--item-hover-bg, #262626);
  }
`;

/**
 * 增强的结果组件
 * 用于显示操作结果
 */
const EnhancedResult: React.FC<EnhancedResultProps> = ({
  type = 'info',
  title,
  subTitle,
  description,
  icon,
  extra,
  status,
  primaryAction,
  secondaryActions = [],
  showBackButton = false,
  showHomeButton = false,
  showRetryButton = false,
  onBack,
  onHome,
  onRetry,
  className,
  style,
  children,
}) => {
  // 获取图标
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return <CheckCircleFilled />;
      case 'error':
        return <CloseCircleFilled />;
      case 'warning':
        return <ExclamationCircleFilled />;
      case 'info':
        return <InfoCircleFilled />;
      case 'loading':
        return <LoadingOutlined />;
      default:
        return null;
    }
  };
  
  // 获取状态
  const getStatus = (): ResultStatusType => {
    if (status) return status;
    
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case '403':
        return '403';
      case '404':
        return '404';
      case '500':
        return '500';
      case 'loading':
      default:
        return 'info';
    }
  };
  
  // 处理返回
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };
  
  // 处理返回首页
  const handleHome = () => {
    if (onHome) {
      onHome();
    } else {
      window.location.href = '/';
    }
  };
  
  // 处理重试
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };
  
  // 渲染操作按钮
  const renderActions = () => {
    const actions = [];
    
    // 添加主要操作按钮
    if (primaryAction) {
      actions.push(
        <Button
          key="primary"
          type={primaryAction.type || 'primary'}
          onClick={primaryAction.onClick}
          href={primaryAction.href}
          icon={primaryAction.icon}
          danger={primaryAction.danger}
          ghost={primaryAction.ghost}
          disabled={primaryAction.disabled}
        >
          {primaryAction.text}
        </Button>
      );
    }
    
    // 添加次要操作按钮
    secondaryActions.forEach((action, index) => {
      actions.push(
        <Button
          key={`secondary-${index}`}
          type={action.type || 'default'}
          onClick={action.onClick}
          href={action.href}
          icon={action.icon}
          danger={action.danger}
          ghost={action.ghost}
          disabled={action.disabled}
        >
          {action.text}
        </Button>
      );
    });
    
    // 添加返回按钮
    if (showBackButton) {
      actions.push(
        <Button
          key="back"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
        >
          返回
        </Button>
      );
    }
    
    // 添加首页按钮
    if (showHomeButton) {
      actions.push(
        <Button
          key="home"
          icon={<HomeOutlined />}
          onClick={handleHome}
        >
          首页
        </Button>
      );
    }
    
    // 添加重试按钮
    if (showRetryButton) {
      actions.push(
        <Button
          key="retry"
          icon={<ReloadOutlined />}
          onClick={handleRetry}
        >
          重试
        </Button>
      );
    }
    
    return actions.length > 0 ? (
      <Space size="middle">
        {actions}
      </Space>
    ) : null;
  };
  
  // 使用自定义布局
  if (type === 'loading' || icon) {
    return (
      <ResultContainer className={className} style={style}>
        <ResultIcon type={type}>
          {getIcon()}
        </ResultIcon>
        
        <ResultTitle level={4}>{title}</ResultTitle>
        
        {subTitle && (
          <ResultSubtitle>{subTitle}</ResultSubtitle>
        )}
        
        {description && (
          <ResultDescription>
            {description}
          </ResultDescription>
        )}
        
        {children && (
          <ResultContent>
            {children}
          </ResultContent>
        )}
        
        <ResultActions>
          {renderActions()}
        </ResultActions>
        
        {extra && (
          <div style={{ marginTop: 24 }}>
            {extra}
          </div>
        )}
      </ResultContainer>
    );
  }
  
  // 使用Ant Design的Result组件
  return (
    <AntdResult
      status={getStatus()}
      title={title}
      subTitle={subTitle}
      extra={renderActions()}
      className={className}
      style={style}
    >
      {description && (
        <ResultDescription>
          {description}
        </ResultDescription>
      )}
      
      {children && (
        <ResultContent>
          {children}
        </ResultContent>
      )}
      
      {extra && (
        <div style={{ marginTop: 24 }}>
          {extra}
        </div>
      )}
    </AntdResult>
  );
};

export default EnhancedResult; 