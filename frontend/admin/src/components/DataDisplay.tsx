import React, { ReactNode } from 'react';
import { Card, Typography, Tooltip, Statistic, Row, Col, Divider } from 'antd';
import { 
  InfoCircleOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined 
} from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text } = Typography;

export interface DataItem {
  key: string;
  title: string;
  value: number | string;
  precision?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  icon?: ReactNode;
  color?: string;
  tooltip?: string;
  trend?: 'up' | 'down' | 'none';
  trendValue?: number;
  trendPercent?: number;
  trendText?: string;
  trendColor?: string;
  loading?: boolean;
  formatter?: (value: number | string) => ReactNode;
}

export interface DataDisplayProps {
  title?: string;
  subTitle?: string;
  tooltip?: string;
  data: DataItem[];
  loading?: boolean;
  columns?: 1 | 2 | 3 | 4 | 6;
  variant?: 'outlined' | 'default';
  size?: 'default' | 'small' | 'large';
  extra?: ReactNode;
  footer?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const StyledCard = styled(Card)<{ $size: string }>`
  .ant-card-head {
    min-height: ${props => props.$size === 'small' ? '36px' : props.$size === 'large' ? '64px' : '48px'};
    padding: ${props => props.$size === 'small' ? '0 12px' : props.$size === 'large' ? '0 24px' : '0 16px'};
  }
  
  .ant-card-head-title {
    padding: ${props => props.$size === 'small' ? '8px 0' : props.$size === 'large' ? '16px 0' : '12px 0'};
    font-size: ${props => props.$size === 'small' ? '14px' : props.$size === 'large' ? '18px' : '16px'};
  }
  
  .ant-card-extra {
    padding: ${props => props.$size === 'small' ? '8px 0' : props.$size === 'large' ? '16px 0' : '12px 0'};
  }
  
  .ant-card-body {
    padding: ${props => props.$size === 'small' ? '12px' : props.$size === 'large' ? '24px' : '16px'};
  }
`;

const DataItemCard = styled(Card)<{ $color?: string; $size: string }>`
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  
  ${props => props.$color && `
    border-top: 3px solid ${props.$color};
  `}
  
  &:hover {
    box-shadow: var(--box-shadow-card);
    transform: translateY(-2px);
  }
  
  .ant-card-body {
    padding: ${props => props.$size === 'small' ? '12px' : props.$size === 'large' ? '24px' : '16px'};
  }
`;

const DataItemTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const DataItemTitleText = styled(Text)`
  color: var(--text-color-secondary, #595959);
  font-size: 14px;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--text-color-secondary, #a6a6a6);
  }
`;

const DataItemIcon = styled.div<{ $color?: string }>`
  font-size: 16px;
  color: ${props => props.$color || 'var(--primary-color, #1890ff)'};
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    opacity: 0.85;
  }
`;

const DataItemValue = styled(Title)<{ $color?: string; $size: string }>`
  margin: 0 !important;
  color: ${props => props.$color || 'var(--heading-color, #262626)'} !important;
  font-size: ${props => props.$size === 'small' ? '20px' : props.$size === 'large' ? '32px' : '24px'} !important;
  line-height: 1.2 !important;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: ${props => props.$color || 'var(--heading-color, #e6e6e6)'} !important;
  }
`;

const DataItemTrend = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
`;

const TrendIcon = styled.span<{ $trend: 'up' | 'down' | 'none'; $color?: string }>`
  margin-right: 4px;
  color: ${props => {
    if (props.$color) return props.$color;
    return props.$trend === 'up' 
      ? 'var(--success-color, #52c41a)' 
      : props.$trend === 'down' 
        ? 'var(--error-color, #ff4d4f)' 
        : 'var(--text-color-secondary, #595959)';
  }};
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: ${props => {
      if (props.$color) return props.$color;
      return props.$trend === 'up' 
        ? 'var(--success-color, #49aa19)' 
        : props.$trend === 'down' 
          ? 'var(--error-color, #d32029)' 
          : 'var(--text-color-secondary, #a6a6a6)';
    }};
  }
`;

const TrendValue = styled(Text)<{ $trend: 'up' | 'down' | 'none'; $color?: string }>`
  color: ${props => {
    if (props.$color) return props.$color;
    return props.$trend === 'up' 
      ? 'var(--success-color, #52c41a)' 
      : props.$trend === 'down' 
        ? 'var(--error-color, #ff4d4f)' 
        : 'var(--text-color-secondary, #595959)';
  }};
  margin-right: 8px;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: ${props => {
      if (props.$color) return props.$color;
      return props.$trend === 'up' 
        ? 'var(--success-color, #49aa19)' 
        : props.$trend === 'down' 
          ? 'var(--error-color, #d32029)' 
          : 'var(--text-color-secondary, #a6a6a6)';
    }};
  }
`;

const TrendText = styled(Text)`
  color: var(--text-color-secondary, #595959);
  font-size: 12px;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--text-color-secondary, #a6a6a6);
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
`;

const CardTitleText = styled(Text)`
  margin-right: 8px;
  font-weight: 500;
`;

const CardSubTitle = styled(Text)`
  color: var(--text-color-secondary, #595959);
  font-size: 14px;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--text-color-secondary, #a6a6a6);
  }
`;

/**
 * 数据展示组件
 * 用于以卡片形式展示关键数据指标
 */
const DataDisplay: React.FC<DataDisplayProps> = ({
  title,
  subTitle,
  tooltip,
  data,
  loading = false,
  columns = 4,
  variant = 'default',
  size = 'default',
  extra,
  footer,
  className,
  style,
}) => {
  // 计算每个数据项的栅格宽度
  const getColSpan = () => {
    return 24 / columns;
  };
  
  // 渲染标题
  const renderTitle = () => {
    if (!title) return null;
    
    return (
      <CardTitle>
        <CardTitleText>{title}</CardTitleText>
        {tooltip && (
          <Tooltip title={tooltip}>
            <InfoCircleOutlined style={{ color: 'var(--text-color-secondary, #595959)' }} />
          </Tooltip>
        )}
      </CardTitle>
    );
  };
  
  // 渲染数据项
  const renderDataItem = (item: DataItem) => {
    return (
      <DataItemCard 
        $size={size}
        $color={item.color}
        loading={item.loading !== undefined ? item.loading : loading}
      >
        <DataItemTitle>
          <DataItemTitleText>{item.title}</DataItemTitleText>
          {item.icon && (
            <DataItemIcon $color={item.color}>
              {item.icon}
            </DataItemIcon>
          )}
          {item.tooltip && (
            <Tooltip title={item.tooltip}>
              <InfoCircleOutlined style={{ color: 'var(--text-color-secondary, #595959)', marginLeft: 4 }} />
            </Tooltip>
          )}
        </DataItemTitle>
        
        <DataItemValue 
          level={4} 
          $color={item.color}
          $size={size}
        >
          {item.prefix}
          {item.formatter ? item.formatter(item.value) : item.value}
          {item.suffix}
        </DataItemValue>
        
        {(item.trend || item.trendText) && (
          <DataItemTrend>
            {item.trend && item.trend !== 'none' && (
              <TrendIcon 
                $trend={item.trend} 
                $color={item.trendColor}
              >
                {item.trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              </TrendIcon>
            )}
            
            {item.trendValue !== undefined && (
              <TrendValue 
                $trend={item.trend || 'none'} 
                $color={item.trendColor}
              >
                {item.trendValue}
                {item.trendPercent !== undefined && `${item.trendPercent}%`}
              </TrendValue>
            )}
            
            {item.trendText && (
              <TrendText>{item.trendText}</TrendText>
            )}
          </DataItemTrend>
        )}
      </DataItemCard>
    );
  };
  
  return (
    <Card
      title={renderTitle()}
      loading={loading}
      extra={extra}
      style={style}
      className={className}
      size={size}
      variant={variant}
      footer={footer && <div style={{ padding: '8px 0' }}>{footer}</div>}
    >
      {subTitle && (
        <CardSubTitle>{subTitle}</CardSubTitle>
      )}
      
      <Row gutter={[16, 16]} style={{ marginTop: subTitle ? 16 : 0 }}>
        {data.map(item => (
          <Col key={item.key} xs={24} sm={12} md={getColSpan()}>
            {renderDataItem(item)}
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default DataDisplay; 