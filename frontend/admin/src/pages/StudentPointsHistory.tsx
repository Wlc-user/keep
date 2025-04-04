import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Space, 
  Progress, 
  Statistic, 
  Table, 
  Tag, 
  Button, 
  Tabs, 
  Empty, 
  Spin, 
  Alert,
  Avatar,
  Timeline,
  Tooltip,
  DatePicker,
  Divider,
  List,
  Badge
} from 'antd';
import { 
  FireOutlined, 
  TrophyOutlined, 
  RiseOutlined, 
  StarOutlined, 
  GiftOutlined, 
  HistoryOutlined,
  ArrowUpOutlined,
  QuestionCircleOutlined,
  CalendarOutlined,
  LikeOutlined,
  BookOutlined,
  FileOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  BarChartOutlined,
  FilterOutlined,
  DownloadOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Line } from '@ant-design/plots';
import PageHeader from '../components/PageHeader';
import { useAppContext } from '../contexts/AppContext';
import dashboardService from '../services/dashboardService';

const { Text, Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// 积分与等级接口
interface PointsSystem {
  currentPoints: number;
  totalPointsEarned: number;
  level: number;
  nextLevelPoints: number;
  rank: number;
  totalUsers: number;
  pointsToday: number;
  pointsThisWeek: number;
  pointsHistory: {
    date: string;
    points: number;
    source: string;
    details?: string;
    id: string;
    type: 'earned' | 'spent';
  }[];
  levelHistory?: {
    level: number;
    achievedDate: string;
    pointsRequired: number;
  }[];
  levelBenefits?: {
    level: number;
    benefits: string[];
  }[];
}

// 积分类型
interface PointsTransaction {
  id: string;
  date: string;
  points: number;
  source: string;
  details: string;
  type: 'earned' | 'spent';
  category: 'course' | 'assignment' | 'quiz' | 'challenge' | 'achievement' | 'activity' | 'reward' | 'purchase';
}

const StudentPointsHistory: React.FC = () => {
  const { user } = useAppContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pointsSystem, setPointsSystem] = useState<PointsSystem | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  
  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // 获取积分系统数据
        const pointsData = await dashboardService.getPointsSystem(user.id);
        setPointsSystem(pointsData || null);
        
        // 获取积分交易历史
        const transactionsData = await dashboardService.getPointsTransactions(user.id);
        setTransactions(transactionsData || []);
      } catch (error) {
        console.error('获取积分数据失败:', error);
        setError('无法加载积分数据，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // 获取交易类型颜色
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'earned':
        return '#52c41a';
      case 'spent':
        return '#ff4d4f';
      default:
        return '#1890ff';
    }
  };
  
  // 获取积分来源图标
  const getSourceIcon = (category: string) => {
    switch (category) {
      case 'course':
        return <BookOutlined />;
      case 'assignment':
        return <FileOutlined />;
      case 'quiz':
        return <QuestionCircleOutlined />;
      case 'challenge':
        return <ThunderboltOutlined />;
      case 'achievement':
        return <TrophyOutlined />;
      case 'activity':
        return <HistoryOutlined />;
      case 'reward':
        return <GiftOutlined />;
      case 'purchase':
        return <ShoppingOutlined />;
      default:
        return <StarOutlined />;
    }
  };
  
  // 处理日期范围变化
  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    setDateRange(dateStrings);
  };
  
  // 处理类别筛选变化
  const handleCategoryFilterChange = (category: string) => {
    if (categoryFilter.includes(category)) {
      setCategoryFilter(categoryFilter.filter(c => c !== category));
    } else {
      setCategoryFilter([...categoryFilter, category]);
    }
  };
  
  // 清除所有筛选
  const handleClearFilters = () => {
    setDateRange(null);
    setCategoryFilter([]);
    setActiveTab('all');
  };
  
  // 根据标签和筛选条件过滤交易
  const getFilteredTransactions = (): PointsTransaction[] => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    
    let filtered = [...transactions];
    
    // 根据标签过滤
    if (activeTab === 'earned') {
      filtered = filtered.filter(t => t.type === 'earned');
    } else if (activeTab === 'spent') {
      filtered = filtered.filter(t => t.type === 'spent');
    }
    
    // 根据类别过滤
    if (categoryFilter.length > 0) {
      filtered = filtered.filter(t => categoryFilter.includes(t.category));
    }
    
    // 根据日期范围过滤
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = new Date(dateRange[0]).getTime();
      const endDate = new Date(dateRange[1]).getTime();
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date).getTime();
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }
    
    return filtered;
  };
  
  // 表格列定义
  const columns: ColumnsType<PointsTransaction> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => new Date(text).toLocaleString(),
      sorter: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      defaultSortOrder: 'descend'
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => (
        <Tag icon={getSourceIcon(text)}>
          {text === 'course' ? '课程' :
          text === 'assignment' ? '作业' :
          text === 'quiz' ? '测验' :
          text === 'challenge' ? '挑战' :
          text === 'achievement' ? '成就' :
          text === 'activity' ? '活动' :
          text === 'reward' ? '奖励' :
          text === 'purchase' ? '购买' : text}
        </Tag>
      ),
      filters: [
        { text: '课程', value: 'course' },
        { text: '作业', value: 'assignment' },
        { text: '测验', value: 'quiz' },
        { text: '挑战', value: 'challenge' },
        { text: '成就', value: 'achievement' },
        { text: '活动', value: 'activity' },
        { text: '奖励', value: 'reward' },
        { text: '购买', value: 'purchase' }
      ],
      onFilter: (value, record) => record.category === value
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: '详情',
      dataIndex: 'details',
      key: 'details',
      render: (text: string) => <Text type="secondary">{text}</Text>
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      render: (points: number, record) => (
        <Text style={{ color: getTransactionTypeColor(record.type), fontWeight: 'bold' }}>
          {record.type === 'earned' ? '+' : '-'}{points}
        </Text>
      ),
      sorter: (a, b) => {
        const aValue = a.type === 'earned' ? a.points : -a.points;
        const bValue = b.type === 'earned' ? b.points : -b.points;
        return bValue - aValue;
      }
    }
  ];
  
  // 渲染等级和积分概览
  const renderPointsOverview = () => {
    if (!pointsSystem) return null;
    
    const levelProgressPercent = (pointsSystem.currentPoints / pointsSystem.nextLevelPoints) * 100;
    
    return (
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Avatar 
                size={100} 
                style={{ 
                  backgroundColor: '#1890ff',
                  margin: '0 auto 16px' 
                }}
              >
                <Text style={{ fontSize: 36, color: 'white' }}>LV{pointsSystem.level}</Text>
              </Avatar>
              <Progress
                percent={levelProgressPercent}
                strokeColor={{
                  '0%': '#1890ff',
                  '100%': '#52c41a',
                }}
                format={() => `${pointsSystem.currentPoints}/${pointsSystem.nextLevelPoints}`}
                status="active"
              />
              <div style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 14 }}>
                  距离下一等级还需 <Text strong style={{ color: '#1890ff' }}>{pointsSystem.nextLevelPoints - pointsSystem.currentPoints}</Text> 积分
                </Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card bordered={false}>
              <Statistic
                title="当前积分"
                value={pointsSystem.currentPoints}
                prefix={<FireOutlined style={{ color: '#fa541c' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ marginTop: 8 }}>
                <Badge color="#52c41a" text={
                  <Text>
                    今日获得: <Text strong style={{ color: '#52c41a' }}>{pointsSystem.pointsToday}</Text>
                  </Text>
                } />
              </div>
              <div style={{ marginTop: 4 }}>
                <Badge color="#1890ff" text={
                  <Text>
                    本周获得: <Text strong style={{ color: '#1890ff' }}>{pointsSystem.pointsThisWeek}</Text>
                  </Text>
                } />
              </div>
              <div style={{ marginTop: 4 }}>
                <Badge color="#722ed1" text={
                  <Text>
                    累计获得: <Text strong style={{ color: '#722ed1' }}>{pointsSystem.totalPointsEarned}</Text>
                  </Text>
                } />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card bordered={false}>
              <Statistic
                title="积分排名"
                value={pointsSystem.rank}
                suffix={`/ ${pointsSystem.totalUsers}`}
                prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
              <Row style={{ marginTop: 8 }} gutter={16}>
                <Col span={12}>
                  <Progress 
                    type="circle" 
                    percent={Math.round((1 - (pointsSystem.rank / pointsSystem.totalUsers)) * 100)} 
                    width={60}
                    format={() => `${Math.round((1 - (pointsSystem.rank / pointsSystem.totalUsers)) * 100)}%`}
                  />
                </Col>
                <Col span={12}>
                  <Text>超过了校内<Text strong style={{ color: '#faad14' }}>{Math.round((1 - (pointsSystem.rank / pointsSystem.totalUsers)) * 100)}%</Text>的同学</Text>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>
    );
  };
  
  // 渲染积分趋势图
  const renderPointsTrend = () => {
    if (!pointsSystem || !pointsSystem.pointsHistory || pointsSystem.pointsHistory.length === 0) {
      return (
        <Empty description="暂无积分历史数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      );
    }
    
    // 按日期分组积分
    const groupedByDate: Record<string, number> = {};
    pointsSystem.pointsHistory.forEach(history => {
      const date = history.date.split('T')[0];
      if (!groupedByDate[date]) {
        groupedByDate[date] = 0;
      }
      
      if (history.type === 'earned') {
        groupedByDate[date] += history.points;
      } else {
        groupedByDate[date] -= history.points;
      }
    });
    
    // 转换为图表数据并排序
    let chartData = Object.entries(groupedByDate).map(([date, points]) => ({
      date,
      points
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 如果数据不足，添加一些假数据点
    if (chartData.length < 7) {
      const lastDate = new Date(chartData.length > 0 ? chartData[chartData.length - 1].date : new Date());
      for (let i = chartData.length; i < 7; i++) {
        const newDate = new Date(lastDate);
        newDate.setDate(lastDate.getDate() + i);
        chartData.push({
          date: newDate.toISOString().split('T')[0],
          points: 0
        });
      }
    }
    
    // 计算累计积分
    let cumulativePoints = 0;
    const cumulativeData = chartData.map(item => {
      cumulativePoints += item.points;
      return {
        date: item.date,
        points: cumulativePoints
      };
    });
    
    const config = {
      data: chartData,
      xField: 'date',
      yField: 'points',
      point: {
        size: 5,
        shape: 'diamond',
      },
      label: {
        style: {
          fill: '#aaa',
        },
      },
      color: '#1890ff'
    };
    
    return (
      <Card title="积分趋势" style={{ marginBottom: 16 }}>
        <Tabs defaultActiveKey="daily">
          <TabPane tab="每日积分" key="daily">
            <Line {...config} />
          </TabPane>
          <TabPane tab="累计积分" key="cumulative">
            <Line {...{...config, data: cumulativeData}} />
          </TabPane>
        </Tabs>
      </Card>
    );
  };
  
  // 渲染积分交易历史
  const renderPointsHistory = () => {
    const filteredTransactions = getFilteredTransactions();
    
    if (filteredTransactions.length === 0) {
      return (
        <Empty 
          description={
            categoryFilter.length > 0 || dateRange ?
            "没有符合筛选条件的积分记录" :
            "暂无积分记录"
          } 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      );
    }
    
    const earnedPoints = filteredTransactions
      .filter(t => t.type === 'earned')
      .reduce((sum, t) => sum + t.points, 0);
      
    const spentPoints = filteredTransactions
      .filter(t => t.type === 'spent')
      .reduce((sum, t) => sum + t.points, 0);
    
    return (
      <>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size="large">
            <Statistic 
              title="获得积分" 
              value={earnedPoints}
              prefix="+"
              valueStyle={{ color: '#52c41a' }}
            />
            <Statistic 
              title="消耗积分" 
              value={spentPoints}
              prefix="-"
              valueStyle={{ color: '#ff4d4f' }}
            />
            <Statistic 
              title="净增积分" 
              value={earnedPoints - spentPoints}
              prefix={earnedPoints - spentPoints >= 0 ? "+" : ""}
              valueStyle={{ color: earnedPoints - spentPoints >= 0 ? '#52c41a' : '#ff4d4f' }}
            />
          </Space>
          <Button type="default" icon={<DownloadOutlined />}>
            导出记录
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </>
    );
  };
  
  // 渲染等级特权
  const renderLevelBenefits = () => {
    if (!pointsSystem || !pointsSystem.levelBenefits) {
      return null;
    }
    
    return (
      <Card title="等级特权" style={{ marginBottom: 16 }}>
        <List
          itemLayout="horizontal"
          dataSource={pointsSystem.levelBenefits}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    style={{ 
                      backgroundColor: item.level <= pointsSystem.level ? '#52c41a' : '#d9d9d9',
                      color: 'white'
                    }}
                  >
                    {item.level}
                  </Avatar>
                }
                title={`等级 ${item.level} 特权`}
                description={
                  <ul>
                    {item.benefits.map((benefit, index) => (
                      <li key={index}>
                        <Text 
                          type={item.level <= pointsSystem.level ? undefined : 'secondary'}
                          delete={item.level > pointsSystem.level}
                        >
                          {benefit}
                        </Text>
                      </li>
                    ))}
                  </ul>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    );
  };
  
  // 渲染等级历史
  const renderLevelHistory = () => {
    if (!pointsSystem || !pointsSystem.levelHistory || pointsSystem.levelHistory.length <= 1) {
      return null;
    }
    
    return (
      <Card title="等级历程" style={{ marginBottom: 16 }}>
        <Timeline mode="left">
          {pointsSystem.levelHistory.map((level, index) => (
            <Timeline.Item 
              key={index}
              color={index === 0 ? '#1890ff' : '#52c41a'}
              label={new Date(level.achievedDate).toLocaleDateString()}
            >
              <Text strong>{`达成等级 ${level.level}`}</Text>
              <div>
                <Text type="secondary">
                  {index < pointsSystem.levelHistory!.length - 1 ? 
                    `用时 ${Math.round((new Date(level.achievedDate).getTime() - new Date(pointsSystem.levelHistory![index + 1].achievedDate).getTime()) / (1000 * 60 * 60 * 24))} 天` : 
                    '开始积分之旅'
                  }
                </Text>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    );
  };
  
  if (error) {
    return (
      <Alert
        message="加载失败"
        description={error}
        type="error"
        showIcon
      />
    );
  }
  
  return (
    <div className="student-points-history">
      <PageHeader
        title="学习积分"
        subtitle="查看您的积分历史和等级进度"
      />
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>加载积分数据...</div>
        </div>
      ) : (
        <>
          {renderPointsOverview()}
          
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} md={16}>
              {renderPointsTrend()}
            </Col>
            <Col xs={24} md={8}>
              {renderLevelBenefits()}
            </Col>
          </Row>
          
          {renderLevelHistory()}
          
          <Card 
            title={
              <Space>
                <HistoryOutlined />
                <span>积分记录</span>
              </Space>
            }
            extra={
              <Space>
                <RangePicker onChange={handleDateRangeChange} />
                <Tooltip title="清除筛选">
                  <Button type="text" icon={<FilterOutlined />} onClick={handleClearFilters} />
                </Tooltip>
              </Space>
            }
          >
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="全部记录" key="all" />
              <TabPane tab="获得积分" key="earned" />
              <TabPane tab="消耗积分" key="spent" />
            </Tabs>
            
            <div style={{ marginBottom: 16 }}>
              <Space wrap>
                <Text>类别筛选:</Text>
                {['course', 'assignment', 'quiz', 'challenge', 'achievement', 'activity', 'reward', 'purchase'].map(category => (
                  <Tag.CheckableTag
                    key={category}
                    checked={categoryFilter.includes(category)}
                    onChange={() => handleCategoryFilterChange(category)}
                  >
                    {category === 'course' ? '课程' :
                    category === 'assignment' ? '作业' :
                    category === 'quiz' ? '测验' :
                    category === 'challenge' ? '挑战' :
                    category === 'achievement' ? '成就' :
                    category === 'activity' ? '活动' :
                    category === 'reward' ? '奖励' :
                    category === 'purchase' ? '购买' : category}
                  </Tag.CheckableTag>
                ))}
              </Space>
            </div>
            
            {renderPointsHistory()}
          </Card>
        </>
      )}
    </div>
  );
};

export default StudentPointsHistory; 