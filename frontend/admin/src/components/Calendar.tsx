import React, { useState, useEffect } from 'react';
import { Calendar as AntdCalendar, Badge, Select, Radio, Button, Tooltip, Popover, Typography, Space, Card } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  PlusOutlined, 
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  TagOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import type { CalendarMode } from 'antd/lib/calendar/generateCalendar';

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

export type EventType = 'success' | 'processing' | 'default' | 'error' | 'warning';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  type?: EventType;
  content?: string;
  location?: string;
  participants?: string[];
  tags?: string[];
  color?: string;
}

export interface EnhancedCalendarProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (date: Dayjs) => void;
  onPanelChange?: (date: Dayjs, mode: CalendarMode) => void;
  onAddEvent?: (date: Dayjs) => void;
  defaultDate?: Dayjs;
  defaultMode?: CalendarMode;
  showHeader?: boolean;
  showAddButton?: boolean;
  headerStyle?: React.CSSProperties;
  className?: string;
  style?: React.CSSProperties;
}

const CalendarContainer = styled.div`
  .ant-picker-calendar {
    background-color: var(--component-background, #ffffff);
    border-radius: 8px;
    overflow: hidden;
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      background-color: var(--component-background, #1f1f1f);
    }
  }
  
  .ant-picker-calendar-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color-split, #f0f0f0);
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      border-bottom: 1px solid var(--border-color-split, #303030);
    }
  }
  
  .ant-picker-cell {
    &:hover {
      .ant-picker-cell-inner {
        background-color: var(--item-hover-bg, #f5f5f5);
        
        /* 暗色模式适配 */
        [data-theme='dark'] & {
          background-color: var(--item-hover-bg, #262626);
        }
      }
    }
  }
  
  .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner {
    background-color: var(--primary-color, #1890ff);
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      background-color: var(--primary-color, #177ddc);
    }
  }
  
  .ant-picker-cell-today .ant-picker-cell-inner::before {
    border-color: var(--primary-color, #1890ff);
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      border-color: var(--primary-color, #177ddc);
    }
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const CalendarTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  h3 {
    margin: 0;
    font-size: 18px;
    color: var(--heading-color, #262626);
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      color: var(--heading-color, #e6e6e6);
    }
  }
`;

const CalendarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const CalendarNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EventList = styled.div`
  max-height: 80px;
  overflow-y: auto;
  margin-top: 4px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: var(--text-color-secondary, #595959);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

const EventItem = styled.div<{ color?: string }>`
  display: flex;
  align-items: center;
  padding: 2px 4px;
  margin-bottom: 2px;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: ${props => props.color ? `${props.color}20` : 'var(--item-hover-bg, #f5f5f5)'};
  border-left: 3px solid ${props => props.color || 'var(--primary-color, #1890ff)'};
  
  &:hover {
    background-color: ${props => props.color ? `${props.color}30` : 'var(--primary-color-bg, rgba(24, 144, 255, 0.1))'};
  }
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    background-color: ${props => props.color ? `${props.color}20` : 'var(--item-hover-bg, #262626)'};
    
    &:hover {
      background-color: ${props => props.color ? `${props.color}30` : 'var(--primary-color-bg, rgba(23, 125, 220, 0.1))'};
    }
  }
`;

const EventTitle = styled(Text)`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-color, #434343);
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--text-color, #d9d9d9);
  }
`;

const EventPopover = styled(Card)`
  width: 300px;
  border-radius: 8px;
  box-shadow: var(--box-shadow-base);
  
  .ant-card-head {
    min-height: auto;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color-split, #f0f0f0);
    
    /* 暗色模式适配 */
    [data-theme='dark'] & {
      border-bottom: 1px solid var(--border-color-split, #303030);
    }
  }
  
  .ant-card-body {
    padding: 16px;
  }
`;

const EventDetail = styled.div`
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const EventDetailIcon = styled.div`
  color: var(--text-color-secondary, #595959);
  font-size: 14px;
  margin-top: 2px;
  
  /* 暗色模式适配 */
  [data-theme='dark'] & {
    color: var(--text-color-secondary, #a6a6a6);
  }
`;

const EventDetailContent = styled.div`
  flex: 1;
`;

const EventTag = styled(Badge)`
  margin-right: 4px;
`;

/**
 * 增强的日历组件
 * 支持事件显示和多种视图模式
 */
const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({
  events = [],
  onEventClick,
  onDateSelect,
  onPanelChange,
  onAddEvent,
  defaultDate = dayjs(),
  defaultMode = 'month',
  showHeader = true,
  showAddButton = true,
  headerStyle,
  className,
  style,
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(defaultDate);
  const [mode, setMode] = useState<CalendarMode>(defaultMode);
  
  // 获取事件类型对应的状态
  const getEventStatus = (type?: EventType): 'success' | 'processing' | 'default' | 'error' | 'warning' => {
    switch (type) {
      case 'success':
        return 'success';
      case 'processing':
        return 'processing';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // 获取事件类型对应的颜色
  const getEventColor = (event: CalendarEvent): string => {
    if (event.color) {
      return event.color;
    }
    
    switch (event.type) {
      case 'success':
        return 'var(--success-color, #52c41a)';
      case 'processing':
        return 'var(--primary-color, #1890ff)';
      case 'error':
        return 'var(--error-color, #ff4d4f)';
      case 'warning':
        return 'var(--warning-color, #faad14)';
      default:
        return 'var(--primary-color, #1890ff)';
    }
  };
  
  // 格式化日期时间
  const formatDateTime = (date: Date | string, allDay?: boolean): string => {
    const dateObj = dayjs(date);
    return allDay ? dateObj.format('YYYY-MM-DD') : dateObj.format('YYYY-MM-DD HH:mm');
  };
  
  // 处理日期选择
  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
    
    if (onDateSelect) {
      onDateSelect(date);
    }
  };
  
  // 处理面板变化
  const handlePanelChange = (date: Dayjs, mode: CalendarMode) => {
    setSelectedDate(date);
    setMode(mode);
    
    if (onPanelChange) {
      onPanelChange(date, mode);
    }
  };
  
  // 处理添加事件
  const handleAddEvent = () => {
    if (onAddEvent) {
      onAddEvent(selectedDate);
    }
  };
  
  // 处理事件点击
  const handleEventClick = (event: CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
    }
  };
  
  // 渲染事件弹出框内容
  const renderEventPopoverContent = (event: CalendarEvent) => {
    return (
      <EventPopover
        title={event.title}
        size="small"
        bordered={false}
      >
        {event.content && (
          <Paragraph style={{ marginBottom: 16 }}>
            {event.content}
          </Paragraph>
        )}
        
        <EventDetail>
          <EventDetailIcon>
            <ClockCircleOutlined />
          </EventDetailIcon>
          <EventDetailContent>
            {event.allDay ? (
              <Text>全天</Text>
            ) : (
              <Text>
                {formatDateTime(event.start, false)}
                {event.end && ` 至 ${formatDateTime(event.end, false)}`}
              </Text>
            )}
          </EventDetailContent>
        </EventDetail>
        
        {event.location && (
          <EventDetail>
            <EventDetailIcon>
              <EnvironmentOutlined />
            </EventDetailIcon>
            <EventDetailContent>
              <Text>{event.location}</Text>
            </EventDetailContent>
          </EventDetail>
        )}
        
        {event.participants && event.participants.length > 0 && (
          <EventDetail>
            <EventDetailIcon>
              <TeamOutlined />
            </EventDetailIcon>
            <EventDetailContent>
              <Text>{event.participants.join(', ')}</Text>
            </EventDetailContent>
          </EventDetail>
        )}
        
        {event.tags && event.tags.length > 0 && (
          <EventDetail>
            <EventDetailIcon>
              <TagOutlined />
            </EventDetailIcon>
            <EventDetailContent>
              {event.tags.map(tag => (
                <EventTag key={tag} color={getEventColor(event)} text={tag} />
              ))}
            </EventDetailContent>
          </EventDetail>
        )}
      </EventPopover>
    );
  };
  
  // 渲染日期单元格
  const dateCellRender = (date: Dayjs) => {
    // 筛选当天的事件
    const dailyEvents = events.filter(event => {
      const eventStart = dayjs(event.start);
      const eventEnd = event.end ? dayjs(event.end) : eventStart;
      
      // 检查事件是否在当天
      return (
        (eventStart.isSame(date, 'day') || eventStart.isBefore(date, 'day')) &&
        (eventEnd.isSame(date, 'day') || eventEnd.isAfter(date, 'day'))
      );
    });
    
    if (dailyEvents.length === 0) {
      return null;
    }
    
    return (
      <EventList>
        {dailyEvents.map(event => (
          <Popover
            key={event.id}
            content={renderEventPopoverContent(event)}
            trigger="click"
            placement="right"
          >
            <EventItem 
              color={getEventColor(event)}
              onClick={() => handleEventClick(event)}
            >
              <Badge 
                status={getEventStatus(event.type)} 
                style={{ marginRight: 4 }} 
              />
              <EventTitle ellipsis>{event.title}</EventTitle>
            </EventItem>
          </Popover>
        ))}
      </EventList>
    );
  };
  
  // 渲染月份单元格
  const monthCellRender = (date: Dayjs) => {
    // 筛选当月的事件
    const monthlyEvents = events.filter(event => {
      const eventDate = dayjs(event.start);
      return eventDate.isSame(date, 'month');
    });
    
    if (monthlyEvents.length === 0) {
      return null;
    }
    
    return (
      <div>
        <Badge count={monthlyEvents.length} style={{ backgroundColor: 'var(--primary-color, #1890ff)' }} />
      </div>
    );
  };
  
  // 渲染日历头部
  const renderHeader = () => {
    if (!showHeader) {
      return null;
    }
    
    return (
      <CalendarHeader style={headerStyle}>
        <CalendarTitle>
          <CalendarOutlined />
          <h3>{selectedDate.format('YYYY年MM月')}</h3>
        </CalendarTitle>
        
        <CalendarActions>
          <CalendarNavigation>
            <Button 
              icon={<LeftOutlined />} 
              size="small"
              onClick={() => {
                const newDate = mode === 'month' 
                  ? selectedDate.subtract(1, 'month') 
                  : selectedDate.subtract(1, 'year');
                setSelectedDate(newDate);
                if (onPanelChange) {
                  onPanelChange(newDate, mode);
                }
              }}
            />
            
            <Button
              size="small"
              onClick={() => {
                const today = dayjs();
                setSelectedDate(today);
                if (onDateSelect) {
                  onDateSelect(today);
                }
              }}
            >
              今天
            </Button>
            
            <Button 
              icon={<RightOutlined />} 
              size="small"
              onClick={() => {
                const newDate = mode === 'month' 
                  ? selectedDate.add(1, 'month') 
                  : selectedDate.add(1, 'year');
                setSelectedDate(newDate);
                if (onPanelChange) {
                  onPanelChange(newDate, mode);
                }
              }}
            />
          </CalendarNavigation>
          
          <Radio.Group
            value={mode}
            onChange={e => {
              const newMode = e.target.value;
              setMode(newMode);
              if (onPanelChange) {
                onPanelChange(selectedDate, newMode);
              }
            }}
            size="small"
          >
            <Radio.Button value="month">月</Radio.Button>
            <Radio.Button value="year">年</Radio.Button>
          </Radio.Group>
          
          {showAddButton && (
            <Tooltip title="添加事件">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                size="small"
                onClick={handleAddEvent}
              />
            </Tooltip>
          )}
        </CalendarActions>
      </CalendarHeader>
    );
  };
  
  return (
    <CalendarContainer className={className} style={style}>
      {renderHeader()}
      
      <AntdCalendar
        value={selectedDate}
        mode={mode}
        onSelect={handleDateSelect}
        onPanelChange={handlePanelChange}
        dateCellRender={dateCellRender}
        monthCellRender={monthCellRender}
        locale={{ lang: { locale: 'zh-cn' } }}
      />
    </CalendarContainer>
  );
};

export default EnhancedCalendar; 