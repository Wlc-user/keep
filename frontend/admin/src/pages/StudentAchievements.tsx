import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  List, 
  Avatar, 
  Typography, 
  Tag, 
  Space, 
  Progress, 
  Badge, 
  Statistic, 
  Tabs, 
  Empty, 
  Row, 
  Col, 
  Spin, 
  Alert,
  Button,
  Divider
} from 'antd';
import { 
  TrophyOutlined, 
  StarOutlined, 
  CheckCircleOutlined, 
  HistoryOutlined, 
  FireOutlined, 
  RocketOutlined,
  CrownOutlined,
  GiftOutlined,
  BookOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  RadarChartOutlined
} from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { useAppContext } from '../contexts/AppContext';
import dashboardService from '../services/dashboardService';

const { Text, Title, Paragraph } = Typography;
const { TabPane } = Tabs;

// 定义成就类型
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  date?: string;
  type: 'daily' | 'weekly' | 'course' | 'skill' | 'special';
  unlocked: boolean;
  points?: number; // 成就奖励积分
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'; // 成就稀有度
  unlockedBy?: string; // 解锁条件
  relatedAchievements?: string[]; // 相关联的成就ID
}

const StudentAchievements: React.FC = () => {
  const { user } = useAppContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    unlocked: number;
    byCategory: Record<string, {total: number, unlocked: number}>;
    byRarity: Record<string, {total: number, unlocked: number}>;
    recentUnlocked: Achievement[];
  }>({
    total: 0,
    unlocked: 0,
    byCategory: {},
    byRarity: {},
    recentUnlocked: []
  });
  const [activeTab, setActiveTab] = useState<string>('all');

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // 从dashboardService中获取成就数据
        const achievementsData = await dashboardService.getStudentAchievements();
        setAchievements(achievementsData || []);
        
        // 计算成就统计数据
        calculateStats(achievementsData);
      } catch (error) {
        console.error('获取成就数据失败:', error);
        setError('无法加载成就数据，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // 计算成就统计信息
  const calculateStats = (achievementsData: Achievement[]) => {
    if (!achievementsData || achievementsData.length === 0) return;
    
    const unlockedAchievements = achievementsData.filter(a => a.unlocked);
    
    // 按类别统计
    const byCategory: Record<string, {total: number, unlocked: number}> = {};
    achievementsData.forEach(achievement => {
      if (!byCategory[achievement.type]) {
        byCategory[achievement.type] = {total: 0, unlocked: 0};
      }
      byCategory[achievement.type].total++;
      if (achievement.unlocked) {
        byCategory[achievement.type].unlocked++;
      }
    });
    
    // 按稀有度统计
    const byRarity: Record<string, {total: number, unlocked: number}> = {};
    achievementsData.forEach(achievement => {
      const rarity = achievement.rarity || 'common';
      if (!byRarity[rarity]) {
        byRarity[rarity] = {total: 0, unlocked: 0};
      }
      byRarity[rarity].total++;
      if (achievement.unlocked) {
        byRarity[rarity].unlocked++;
      }
    });
    
    // 最近解锁的成就
    const recentUnlocked = unlockedAchievements
      .filter(a => a.date)
      .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
      .slice(0, 5);
    
    setStats({
      total: achievementsData.length,
      unlocked: unlockedAchievements.length,
      byCategory,
      byRarity,
      recentUnlocked
    });
  };

  // 获取成就类型文本
  const getTypeText = (type: string) => {
    switch (type) {
      case 'daily': return '每日成就';
      case 'weekly': return '每周成就';
      case 'course': return '课程成就';
      case 'skill': return '技能成就';
      case 'special': return '特殊成就';
      default: return '成就';
    }
  };
  
  // 获取成就类型颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return '#52c41a';
      case 'weekly': return '#1890ff';
      case 'course': return '#722ed1';
      case 'skill': return '#fa541c';
      case 'special': return '#eb2f96';
      default: return '#1890ff';
    }
  };

  // 获取成就稀有度颜色
  const getRarityColor = (rarity: string = 'common') => {
    switch (rarity) {
      case 'common': return '#91d5ff'; // 普通
      case 'uncommon': return '#52c41a'; // 不常见
      case 'rare': return '#1890ff'; // 稀有
      case 'epic': return '#722ed1'; // 史诗
      case 'legendary': return '#fa8c16'; // 传说
      default: return '#91d5ff';
    }
  };

  // 获取成就图标
  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'daily': return <HistoryOutlined />;
      case 'weekly': return <FireOutlined />;
      case 'course': return <BookOutlined />;
      case 'skill': return <ExperimentOutlined />;
      case 'special': return <StarOutlined />;
      default: return <TrophyOutlined />;
    }
  };

  // 渲染成就概览统计
  const renderAchievementStats = () => {
    return (
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Statistic 
              title="成就总数"
              value={stats.total}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic 
              title="已解锁成就"
              value={stats.unlocked}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic 
              title="解锁比例"
              value={stats.total ? Math.round((stats.unlocked / stats.total) * 100) : 0}
              suffix="%"
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#fa541c' }}
            />
            <Progress 
              percent={stats.total ? Math.round((stats.unlocked / stats.total) * 100) : 0} 
              status="active"
              strokeColor={{
                '0%': '#1890ff',
                '100%': '#52c41a',
              }}
            />
          </Col>
        </Row>
      </Card>
    );
  };

  // 渲染最近解锁的成就
  const renderRecentUnlocked = () => {
    if (!stats.recentUnlocked || stats.recentUnlocked.length === 0) {
      return (
        <Empty description="还没有解锁任何成就" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      );
    }
    
    return (
      <List
        dataSource={stats.recentUnlocked}
        renderItem={achievement => (
          <List.Item key={achievement.id}>
            <List.Item.Meta
              avatar={
                <Avatar 
                  style={{ 
                    backgroundColor: getTypeColor(achievement.type),
                    color: 'white'
                  }}
                  icon={getAchievementIcon(achievement.type)}
                />
              }
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <Text strong>{achievement.title}</Text>
                    <Tag color={getTypeColor(achievement.type)}>
                      {getTypeText(achievement.type)}
                    </Tag>
                    {achievement.rarity && (
                      <Tag color={getRarityColor(achievement.rarity)}>
                        {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                      </Tag>
                    )}
                  </Space>
                  <Badge count="已解锁" style={{ backgroundColor: '#52c41a' }} />
                </div>
              }
              description={
                <div>
                  <Text type="secondary">{achievement.description}</Text>
                  {achievement.date && (
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        获得时间: {new Date(achievement.date).toLocaleDateString()}
                      </Text>
                    </div>
                  )}
                  {achievement.points && (
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        奖励积分: <Text strong style={{ color: '#fa8c16' }}>{achievement.points}</Text>
                      </Text>
                    </div>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  // 根据标签过滤成就
  const getFilteredAchievements = () => {
    if (!achievements || achievements.length === 0) {
      return [];
    }
    
    switch (activeTab) {
      case 'unlocked':
        return achievements.filter(a => a.unlocked);
      case 'locked':
        return achievements.filter(a => !a.unlocked);
      case 'daily':
      case 'weekly':
      case 'course':
      case 'skill':
      case 'special':
        return achievements.filter(a => a.type === activeTab);
      default:
        return achievements;
    }
  };

  // 渲染成就列表
  const renderAchievementList = () => {
    const filteredAchievements = getFilteredAchievements();
    
    if (filteredAchievements.length === 0) {
      return (
        <Empty description={`没有${activeTab === 'unlocked' ? '已解锁' : activeTab === 'locked' ? '未解锁' : activeTab}成就`} />
      );
    }
    
    return (
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }}
        dataSource={filteredAchievements}
        renderItem={achievement => (
          <List.Item key={achievement.id}>
            <Card
              hoverable
              style={{ marginBottom: 16, height: '100%' }}
              actions={[
                <Button type="link" icon={<StarOutlined />}>详情</Button>
              ]}
            >
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Avatar 
                  size={64}
                  style={{ 
                    backgroundColor: achievement.unlocked ? getTypeColor(achievement.type) : '#d9d9d9',
                    color: 'white'
                  }}
                  icon={getAchievementIcon(achievement.type)}
                />
                {achievement.unlocked && (
                  <div style={{ marginTop: 8 }}>
                    <Badge count="已解锁" style={{ backgroundColor: '#52c41a' }} />
                  </div>
                )}
              </div>
              
              <Title level={5} style={{ textAlign: 'center', marginBottom: 8 }}>
                {achievement.title}
              </Title>
              
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <Space>
                  <Tag color={getTypeColor(achievement.type)}>
                    {getTypeText(achievement.type)}
                  </Tag>
                  {achievement.rarity && (
                    <Tag color={getRarityColor(achievement.rarity)}>
                      {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                    </Tag>
                  )}
                </Space>
              </div>
              
              <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 16 }}>
                {achievement.description}
              </Paragraph>
              
              {!achievement.unlocked && (
                <div>
                  <Progress 
                    percent={achievement.progress} 
                    size="small"
                    status="active"
                  />
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
                    完成条件: {achievement.unlockedBy || '未知'}
                  </Text>
                </div>
              )}
              
              {achievement.unlocked && achievement.date && (
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
                  获得时间: {new Date(achievement.date).toLocaleDateString()}
                </Text>
              )}
              
              {achievement.points && (
                <div style={{ marginTop: 8, textAlign: 'center' }}>
                  <Tag color="orange" icon={<GiftOutlined />}>
                    +{achievement.points} 积分
                  </Tag>
                </div>
              )}
            </Card>
          </List.Item>
        )}
      />
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
    <div className="student-achievements">
      <PageHeader
        title="我的成就"
        subtitle="跟踪您的学习成就和进度"
      />
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>加载成就数据...</div>
        </div>
      ) : (
        <>
          {renderAchievementStats()}
          
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} md={8}>
              <Card title="最近解锁成就" style={{ height: '100%' }}>
                {renderRecentUnlocked()}
              </Card>
            </Col>
            <Col xs={24} md={16}>
              <Card title="成就分类统计" style={{ height: '100%' }}>
                <Row gutter={[16, 16]}>
                  {Object.entries(stats.byCategory).map(([type, data]) => (
                    <Col xs={12} sm={8} md={8} key={type}>
                      <Card size="small" bordered>
                        <Statistic
                          title={getTypeText(type)}
                          value={data.unlocked}
                          suffix={`/ ${data.total}`}
                          valueStyle={{ color: getTypeColor(type) }}
                        />
                        <Progress 
                          percent={Math.round((data.unlocked / data.total) * 100)} 
                          size="small" 
                          strokeColor={getTypeColor(type)}
                        />
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>
          
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="全部成就" key="all" />
              <TabPane tab="已解锁" key="unlocked" />
              <TabPane tab="未解锁" key="locked" />
              <TabPane tab="每日成就" key="daily" />
              <TabPane tab="每周成就" key="weekly" />
              <TabPane tab="课程成就" key="course" />
              <TabPane tab="技能成就" key="skill" />
              <TabPane tab="特殊成就" key="special" />
            </Tabs>
            {renderAchievementList()}
          </Card>
        </>
      )}
    </div>
  );
};

export default StudentAchievements; 