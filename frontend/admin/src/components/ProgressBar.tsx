import React from 'react';
import { Progress, Typography, Tooltip } from 'antd';
import { 
  CheckCircleFilled, 
  CloseCircleFilled, 
  InfoCircleFilled, 
  WarningFilled 
} from '@ant-design/icons';
import styled from 'styled-components';

const { Text } = Typography;

export type ProgressStatus = 'normal' | 'success' | 'exception' | 'warning' | 'active';
export type ProgressSize = 'small' | 'default' | 'large';

interface ProgressBarProps {
  percent: number;
  status?: ProgressStatus;
  size?: ProgressSize;
  showInfo?: boolean;
  format?: (percent: number) => React.ReactNode;
  width?: number | string;
  strokeWidth?: number;
  strokeColor?: string | { from: string; to: string } | string[];
  trailColor?: string;
  title?: string;
  description?: string;
  target?: number;
  showTarget?: boolean;
  animated?: boolean;
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
  type?: 'line' | 'circle' | 'dashboard';
  steps?: number;
  className?: string;
  style?: React.CSSProperties;
}

const ProgressContainer = styled.div<{ labelPosition: string }>`
  display: flex;
  flex-direction: ${props => 
    props.labelPosition === 'top' || props.labelPosition === 'bottom' 
      ? 'column' 
      : 'row'
  };
  align-items: ${props => 
    props.labelPosition === 'top' || props.labelPosition === 'bottom' 
      ? 'flex-start' 
      : 'center'
  };
  gap: ${props => 
    props.labelPosition === 'top' || props.labelPosition === 'bottom' 
      ? '8px' 
      : '16px'
  };
  
  ${props => props.labelPosition === 'bottom' && `
    flex-direction: column-reverse;
  `}
  
  ${props => props.labelPosition === 'right' && `
    flex-direction: row-reverse;
  `}
`;

const ProgressWrapper = styled.div<{ width: number | string }>`
  width: ${props => typeof props.width === 'number' ? `${props.width}px` : props.width};
`;

const ProgressInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProgressTitle = styled(Text)`
  font-weight: 500;
  color: var(--heading-color, #262626);
  font-size: 14px;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--heading-color, #e6e6e6);
  }
`;

const ProgressDescription = styled(Text)`
  color: var(--text-color-secondary, #595959);
  font-size: 12px;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--text-color-secondary, #a6a6a6);
  }
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
`;

const ProgressValue = styled(Text)<{ status: ProgressStatus }>`
  font-weight: 500;
  font-size: 13px;
  color: ${props => {
    switch (props.status) {
      case 'success':
        return 'var(--success-color, #52c41a)';
      case 'exception':
        return 'var(--error-color, #ff4d4f)';
      case 'warning':
        return 'var(--warning-color, #faad14)';
      default:
        return 'var(--heading-color, #262626)';
    }
  }};
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: ${props => {
      switch (props.status) {
        case 'success':
          return 'var(--success-color, #49aa19)';
        case 'exception':
          return 'var(--error-color, #d32029)';
        case 'warning':
          return 'var(--warning-color, #d89614)';
        default:
          return 'var(--heading-color, #e6e6e6)';
      }
    }};
  }
`;

const ProgressTarget = styled(Text)`
  font-size: 12px;
  color: var(--text-color-secondary, #595959);
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--text-color-secondary, #a6a6a6);
  }
`;

const StyledProgress = styled(Progress)<{ size: ProgressSize }>`
  .ant-progress-text {
    color: var(--heading-color, #262626);
    font-weight: 500;
    font-size: ${props => props.size === 'small' ? '12px' : props.size === 'large' ? '16px' : '14px'};
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      color: var(--heading-color, #e6e6e6);
    }
  }
  
  .ant-progress-bg {
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
  
  /* 调整不同尺寸的样式 */
  ${props => props.size === 'small' && `
    .ant-progress-outer {
      font-size: 12px;
    }
    
    .ant-progress-text {
      font-size: 12px;
    }
  `}
  
  ${props => props.size === 'large' && `
    .ant-progress-outer {
      font-size: 16px;
    }
    
    .ant-progress-text {
      font-size: 16px;
    }
  `}
`;

/**
 * 增强的进度条组件
 * 用于显示更丰富的进度信息
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  status = 'normal',
  size = 'default',
  showInfo = true,
  format,
  width = '100%',
  strokeWidth,
  strokeColor,
  trailColor,
  title,
  description,
  target,
  showTarget = false,
  animated = false,
  labelPosition = 'top',
  type = 'line',
  steps,
  className,
  style,
}) => {
  // 自定义格式化函数
  const customFormat = (percent: number) => {
    if (format) {
      return format(percent);
    }
    
    // 默认格式化
    const icon = status === 'success' ? (
      <CheckCircleFilled style={{ color: 'var(--success-color, #52c41a)' }} />
    ) : status === 'exception' ? (
      <CloseCircleFilled style={{ color: 'var(--error-color, #ff4d4f)' }} />
    ) : status === 'warning' ? (
      <WarningFilled style={{ color: 'var(--warning-color, #faad14)' }} />
    ) : percent >= 100 ? (
      <CheckCircleFilled style={{ color: 'var(--success-color, #52c41a)' }} />
    ) : (
      `${percent}%`
    );
    
    return icon;
  };
  
  // 获取进度条状态颜色
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'var(--success-color, #52c41a)';
      case 'exception':
        return 'var(--error-color, #ff4d4f)';
      case 'warning':
        return 'var(--warning-color, #faad14)';
      default:
        return strokeColor || 'var(--primary-color, #1890ff)';
    }
  };
  
  // 渲染进度条
  const renderProgress = () => {
    return (
      <StyledProgress
        percent={percent}
        status={status === 'warning' ? 'normal' : status}
        size={size}
        showInfo={showInfo}
        format={customFormat}
        strokeWidth={strokeWidth}
        strokeColor={strokeColor || getStatusColor()}
        trailColor={trailColor}
        type={type}
        steps={steps}
        strokeLinecap="round"
      />
    );
  };
  
  // 如果没有标题和描述，只渲染进度条
  if (!title && !description && !showTarget) {
    return (
      <ProgressWrapper width={width} className={className} style={style}>
        {renderProgress()}
      </ProgressWrapper>
    );
  }
  
  return (
    <ProgressContainer labelPosition={labelPosition} className={className} style={style}>
      {(title || description) && (
        <ProgressInfo>
          {title && <ProgressTitle>{title}</ProgressTitle>}
          {description && <ProgressDescription>{description}</ProgressDescription>}
        </ProgressInfo>
      )}
      
      <ProgressWrapper width={width}>
        {renderProgress()}
        
        {showTarget && target !== undefined && (
          <ProgressStats>
            <ProgressValue status={status}>
              {percent}%
            </ProgressValue>
            <Tooltip title="目标值">
              <ProgressTarget>
                目标: {target}%
              </ProgressTarget>
            </Tooltip>
          </ProgressStats>
        )}
      </ProgressWrapper>
    </ProgressContainer>
  );
};

export default ProgressBar; 