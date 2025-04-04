import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, DatePicker, Divider, Typography, Space, Tabs, Empty } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  MessageOutlined, 
  SolutionOutlined,
  QuestionCircleOutlined,
  BugOutlined,
  SmileOutlined
} from '@ant-design/icons';
import { getFeedbackStatistics } from '../services/feedbackService';
import { Pie, Column } from '@ant-design/charts';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface StatisticsItem {
  label: string;
  count: number;
}

interface FeedbackStatisticsProps {
  className?: string;
  style?: React.CSSProperties;
}

// 反馈统计组件
const FeedbackStatistics: React.FC<FeedbackStatisticsProps> = ({ className, style }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [statistics, setStatistics] = useState<any>(null);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment]>([
    moment().subtract(30, 'days'),
    moment()
  ]);

  // 加载统计数据
  const loadStatistics = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      const response = await getFeedbackStatistics();
      setStatistics(response);
    } catch (error) {
      console.error('获取反馈统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadStatistics(
      dateRange[0].format('YYYY-MM-DD'),
      dateRange[1].format('YYYY-MM-DD')
    );
  }, []);

  // 日期范围变更
  const handleDateChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
      loadStatistics(
        dates[0].format('YYYY-MM-DD'),
        dates[1].format('YYYY-MM-DD')
      );
    }
  };

  // 渲染状态分布饼图
  const renderStatusPieChart = () => {
    if (!statistics || !statistics.statusStatistics) {
      return <Empty description="暂无数据" />;
    }

    const config = {
      data: statistics.statusStatistics,
      angleField: 'count',
      colorField: 'label',
      radius: 0.8,
      label: {
        type: 'outer',
        content: '{name}: {percentage}',
      },
      interactions: [{ type: 'element-active' }],
    };

    return <Pie {...config} />;
  };

  // 渲染类型分布饼图
  const renderTypePieChart = () => {
    if (!statistics || !statistics.typeStatistics) {
      return <Empty description="暂无数据" />;
    }

    const config = {
      data: statistics.typeStatistics,
      angleField: 'count',
      colorField: 'label',
      radius: 0.8,
      label: {
        type: 'outer',
        content: '{name}: {percentage}',
      },
      interactions: [{ type: 'element-active' }],
    };

    return <Pie {...config} />;
  };

  // 渲染优先级分布柱状图
  const renderPriorityColumnChart = () => {
    if (!statistics || !statistics.priorityStatistics) {
      return <Empty description="暂无数据" />;
    }

    const config = {
      data: statistics.priorityStatistics,
      xField: 'label',
      yField: 'count',
      label: {
        position: 'middle',
        style: {
          fill: '#FFFFFF',
          opacity: 0.6,
        },
      },
      meta: {
        label: {
          alias: '优先级',
        },
        count: {
          alias: '数量',
        },
      },
    };

    return <Column {...config} />;
  };

  return (
    <div className={className} style={style}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
            <Title level={4}>反馈统计数据</Title>
            <RangePicker
              value={dateRange}
              onChange={handleDateChange}
              allowClear={false}
            />
          </Space>

          <Spin spinning={loading}>
            {statistics ? (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="总反馈数"
                        value={statistics.totalCount}
                        prefix={<MessageOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="平均响应时间"
                        value={statistics.averageResponseTimeHours}
                        suffix="小时"
                        precision={1}
                        prefix={<ClockCircleOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="平均解决时间"
                        value={statistics.averageResolutionTimeHours}
                        suffix="小时"
                        precision={1}
                        prefix={<SolutionOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="满意度"
                        value={statistics.satisfactionRate}
                        suffix="%"
                        precision={1}
                        prefix={<SmileOutlined />}
                      />
                    </Card>
                  </Col>
                </Row>

                <Divider orientation="left">反馈详细分析</Divider>

                <Tabs defaultActiveKey="status">
                  <TabPane tab="状态分布" key="status">
                    <div style={{ height: 300 }}>
                      {renderStatusPieChart()}
                    </div>
                  </TabPane>
                  <TabPane tab="类型分布" key="type">
                    <div style={{ height: 300 }}>
                      {renderTypePieChart()}
                    </div>
                  </TabPane>
                  <TabPane tab="优先级分布" key="priority">
                    <div style={{ height: 300 }}>
                      {renderPriorityColumnChart()}
                    </div>
                  </TabPane>
                </Tabs>
              </>
            ) : (
              <Empty description="暂无统计数据" />
            )}
          </Spin>
        </Space>
      </Card>
    </div>
  );
};

export default FeedbackStatistics; 