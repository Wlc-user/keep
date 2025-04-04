import React, { useState, useEffect, ReactNode } from 'react';
import { Tour as AntdTour, Button, Typography, Space, Divider } from 'antd';
import { 
  CloseOutlined, 
  LeftOutlined, 
  RightOutlined, 
  CheckOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { TourProps as AntdTourProps } from 'antd/lib/tour';

const { Title, Paragraph, Text } = Typography;

export interface TourStep {
  title: string;
  description: ReactNode;
  target: string | HTMLElement | null;
  placement?: 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';
  image?: string;
  mask?: boolean;
  nextButtonText?: string;
  prevButtonText?: string;
  skipButtonText?: string;
  finishButtonText?: string;
  icon?: ReactNode;
}

export interface TourProps {
  steps: TourStep[];
  open?: boolean;
  onClose?: () => void;
  onFinish?: () => void;
  onChange?: (current: number) => void;
  current?: number;
  defaultCurrent?: number;
  mask?: boolean;
  arrow?: boolean;
  zIndex?: number;
  closable?: boolean;
  showSkip?: boolean;
  showIndicators?: boolean;
  indicatorType?: 'dot' | 'number' | 'progress';
  className?: string;
  style?: React.CSSProperties;
  tourKey?: string;
  autoStart?: boolean;
  startDelay?: number;
}

const StyledTour = styled(AntdTour)`
  .ant-tour-content {
    border-radius: 8px;
    box-shadow: var(--box-shadow-base);
  }
  
  .ant-tour-arrow {
    color: var(--component-background, #ffffff);
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      color: var(--component-background, #1f1f1f);
    }
  }
  
  .ant-tour-header {
    padding: 16px 16px 8px;
  }
  
  .ant-tour-title {
    color: var(--heading-color, #262626);
    font-weight: 600;
    font-size: 16px;
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      color: var(--heading-color, #e6e6e6);
    }
  }
  
  .ant-tour-description {
    color: var(--text-color, #434343);
    font-size: 14px;
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      color: var(--text-color, #d9d9d9);
    }
  }
  
  .ant-tour-footer {
    padding: 8px 16px 16px;
    border-top: none;
  }
  
  .ant-tour-close {
    color: var(--text-color-secondary, #595959);
    
    &:hover {
      color: var(--text-color, #434343);
    }
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      color: var(--text-color-secondary, #a6a6a6);
      
      &:hover {
        color: var(--text-color, #d9d9d9);
      }
    }
  }
`;

const TourImage = styled.img`
  width: 100%;
  border-radius: 4px;
  margin: 8px 0;
  max-height: 200px;
  object-fit: cover;
`;

const TourIndicators = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
`;

const TourDot = styled.div<{ active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 0 4px;
  background-color: ${props => props.active 
    ? 'var(--primary-color, #1890ff)' 
    : 'var(--border-color, #d9d9d9)'};
  transition: all 0.3s;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    background-color: ${props => props.active 
      ? 'var(--primary-color, #177ddc)' 
      : 'var(--border-color, #434343)'};
  }
`;

const TourProgress = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const TourProgressText = styled(Text)`
  font-size: 14px;
  color: var(--text-color-secondary, #595959);
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--text-color-secondary, #a6a6a6);
  }
`;

const TourIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-color-bg, rgba(24, 144, 255, 0.1));
  color: var(--primary-color, #1890ff);
  margin-right: 8px;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    background-color: var(--primary-color-bg, rgba(23, 125, 220, 0.1));
    color: var(--primary-color, #177ddc);
  }
`;

const TourHeader = styled.div`
  display: flex;
  align-items: center;
`;

/**
 * 引导组件
 * 用于为新用户提供功能引导
 */
const Tour: React.FC<TourProps> = ({
  steps,
  open = false,
  onClose,
  onFinish,
  onChange,
  current,
  defaultCurrent = 0,
  mask = true,
  arrow = true,
  zIndex = 1000,
  closable = true,
  showSkip = true,
  showIndicators = true,
  indicatorType = 'dot',
  className,
  style,
  tourKey,
  autoStart = false,
  startDelay = 1000,
}) => {
  const [isOpen, setIsOpen] = useState(open);
  const [currentStep, setCurrentStep] = useState(current || defaultCurrent);
  
  // 处理自动启动
  useEffect(() => {
    if (autoStart && tourKey) {
      const hasSeenTour = localStorage.getItem(`tour_${tourKey}`);
      
      if (!hasSeenTour) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, startDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [autoStart, tourKey, startDelay]);
  
  // 同步外部open状态
  useEffect(() => {
    setIsOpen(open);
  }, [open]);
  
  // 同步外部current状态
  useEffect(() => {
    if (current !== undefined) {
      setCurrentStep(current);
    }
  }, [current]);
  
  // 处理关闭
  const handleClose = () => {
    setIsOpen(false);
    
    if (onClose) {
      onClose();
    }
    
    // 记录已完成的引导
    if (tourKey) {
      localStorage.setItem(`tour_${tourKey}`, 'true');
    }
  };
  
  // 处理完成
  const handleFinish = () => {
    setIsOpen(false);
    
    if (onFinish) {
      onFinish();
    }
    
    // 记录已完成的引导
    if (tourKey) {
      localStorage.setItem(`tour_${tourKey}`, 'true');
    }
  };
  
  // 处理步骤变化
  const handleChange = (current: number) => {
    setCurrentStep(current);
    
    if (onChange) {
      onChange(current);
    }
  };
  
  // 渲染指示器
  const renderIndicators = () => {
    if (!showIndicators) return null;
    
    if (indicatorType === 'dot') {
      return (
        <TourIndicators>
          {steps.map((_, index) => (
            <TourDot key={index} active={index === currentStep} />
          ))}
        </TourIndicators>
      );
    }
    
    if (indicatorType === 'number' || indicatorType === 'progress') {
      return (
        <TourProgress>
          <TourProgressText>
            {currentStep + 1} / {steps.length}
          </TourProgressText>
        </TourProgress>
      );
    }
    
    return null;
  };
  
  // 转换步骤为Antd Tour格式
  const transformSteps = steps.map((step, index) => {
    const isLast = index === steps.length - 1;
    const isFirst = index === 0;
    
    return {
      title: (
        <TourHeader>
          {step.icon ? (
            <TourIcon>{step.icon}</TourIcon>
          ) : (
            <TourIcon><InfoCircleOutlined /></TourIcon>
          )}
          <span>{step.title}</span>
        </TourHeader>
      ),
      description: (
        <>
          <div>{step.description}</div>
          {step.image && <TourImage src={step.image} alt={step.title} />}
          {renderIndicators()}
        </>
      ),
      target: step.target,
      placement: step.placement,
      mask: step.mask !== undefined ? step.mask : mask,
      nextButtonProps: {
        children: step.nextButtonText || (isLast ? '完成' : '下一步'),
      },
      prevButtonProps: {
        children: step.prevButtonText || '上一步',
      },
    };
  });
  
  return (
    <StyledTour
      open={isOpen}
      onClose={handleClose}
      onFinish={handleFinish}
      onChange={handleChange}
      current={currentStep}
      steps={transformSteps}
      mask={mask}
      arrow={arrow}
      zIndex={zIndex}
      type="primary"
      rootClassName={className}
      style={style}
      indicatorsRender={() => null} // 使用自定义指示器
    />
  );
};

export default Tour; 