import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Tag, 
  Typography, 
  Space, 
  Progress, 
  Button, 
  Tabs, 
  Empty, 
  Spin, 
  Alert, 
  Statistic, 
  Row, 
  Col, 
  Avatar,
  Badge,
  Divider,
  Tooltip,
  Calendar,
  Modal
} from 'antd';
import { 
  TrophyFilled, 
  GlobalOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  AimOutlined, 
  GiftOutlined,
  FireFilled,
  CrownOutlined,
  StarOutlined,
  RocketOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  BookOutlined,
  FileOutlined,
  ReadOutlined, 
  ThunderboltOutlined
} from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { useAppContext } from '../contexts/AppContext';
import dashboardService from '../services/dashboardService';
import type { Dayjs } from 'dayjs';

const { Text, Title, Paragraph } = Typography;

// 学习挑战赛接口
interface LearningCompetition {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  participants: number;
  ranking?: number;
  prize: string;
  category: string;
  status: 'upcoming' | 'active' | 'completed';
  progress?: number;
  rules?: string;
  organizer?: string;
  levels?: string[];
  badges?: {name: string; image: string}[];
  leaderboard?: {userId: string; name: string; score: number; rank: number}[];
  tasks?: {id: string; title: string; completed: boolean; points: number}[];
}

// 每日挑战接口
interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'study' | 'quiz' | 'reading' | 'practice' | 'social';
  difficulty: 'easy' | 'medium' | 'hard';
  pointsReward: number;
  progress: number;
  completed: boolean;
  expiresAt: string;
}

const StudentCompetitions: React.FC = () => {
  const { user } = useAppContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [competitions, setCompetitions] = useState<LearningCompetition[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<LearningCompetition | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  
  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // 获取学习挑战赛数据
        const competitionsData = await dashboardService.getCompetitions();
        setCompetitions(competitionsData || []);
        
        // 获取每日挑战数据
        const challengesData = await dashboardService.getDailyChallenges();
        setDailyChallenges(challengesData || []);
      } catch (error) {
        console.error('获取挑战数据失败:', error);
        setError('无法加载挑战数据，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // 获取挑战赛状态标签
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag color="green">进行中</Tag>;
      case 'upcoming':
        return <Tag color="blue">即将开始</Tag>;
      case 'completed':
        return <Tag color="gray">已结束</Tag>;
      default:
        return null;
    }
  };
  
  // 获取分类颜色
  const getCategoryColor = (category: string) => {
    switch (category) {
      case '编程':
        return '#1890ff';
      case '语言':
        return '#52c41a';
      case '数学':
        return '#722ed1';
      case '科学':
        return '#fa541c';
      case '设计':
        return '#eb2f96';
      default:
        return '#1890ff';
    }
  };
  
  // 根据标签过滤挑战赛
  const getFilteredCompetitions = () => {
    if (!competitions || competitions.length === 0) {
      return [];
    }
    
    switch (activeTab) {
      case 'active':
        return competitions.filter(c => c.status === 'active');
      case 'upcoming':
        return competitions.filter(c => c.status === 'upcoming');
      case 'completed':
        return competitions.filter(c => c.status === 'completed');
      default:
        return competitions;
    }
  };
  
  // 处理查看挑战赛详情
  const handleViewCompetition = (competition: LearningCompetition) => {
    setSelectedCompetition(competition);
    setModalVisible(true);
  };
  
  // 关闭弹窗
  const handleCloseModal = () => {
    setModalVisible(false);
  };
  
  // 处理报名或继续挑战
  const handleJoinOrContinue = (competition: LearningCompetition) => {
    console.log('加入或继续挑战:', competition);
    // 这里可以添加报名或进入挑战的逻辑
  };
  
  // 渲染挑战赛列表
  const renderCompetitionsList = () => {
    const filteredCompetitions = getFilteredCompetitions();
    
    if (filteredCompetitions.length === 0) {
      return (
        <Empty 
          description={`没有${activeTab === 'active' ? '进行中' : activeTab === 'upcoming' ? '即将开始' : activeTab === 'completed' ? '已结束' : ''}的挑战赛`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }
    
    return (
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }}
        dataSource={filteredCompetitions}
        renderItem={competition => (
          <List.Item key={competition.id}>
            <Card
              hoverable
              style={{ height: '100%' }}
              cover={
                <div style={{ 
                  height: 120, 
                  background: `linear-gradient(to right, ${getCategoryColor(competition.category)}66, ${getCategoryColor(competition.category)}33)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrophyFilled style={{ fontSize: 48, color: getCategoryColor(competition.category) }} />
                </div>
              }
              actions={[
                <Button type="link" onClick={() => handleViewCompetition(competition)}>
                  查看详情
                </Button>,
                competition.status === 'upcoming' 
                  ? <Button type="primary" size="small" onClick={() => handleJoinOrContinue(competition)}>报名</Button>
                  : competition.status === 'active'
                    ? <Button type="primary" size="small" onClick={() => handleJoinOrContinue(competition)}>继续挑战</Button>
                    : <Button size="small" onClick={() => handleViewCompetition(competition)}>查看结果</Button>
              ]}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text strong style={{ fontSize: 16 }}>{competition.title}</Text>
                {getStatusTag(competition.status)}
              </div>
              
              <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 10, height: 40 }}>
                {competition.description}
              </Paragraph>
              
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Space>
                  <GlobalOutlined style={{ color: getCategoryColor(competition.category) }} />
                  <Text type="secondary">{competition.category}类</Text>
                </Space>
                
                <Space>
                  <TeamOutlined />
                  <Text type="secondary">{competition.participants}人参与</Text>
                </Space>
                
                <Space>
                  <CalendarOutlined />
                  <Text type="secondary">
                    {new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}
                  </Text>
                </Space>
                
                {competition.status === 'active' && competition.ranking && (
                  <Space>
                    <AimOutlined style={{ color: '#1890ff' }} />
                    <Text type="secondary">当前排名: <Text strong>{competition.ranking}</Text>/{competition.participants}</Text>
                  </Space>
                )}
                
                <Space>
                  <GiftOutlined style={{ color: '#eb2f96' }} />
                  <Text type="secondary">奖励: {competition.prize}</Text>
                </Space>
                
                {competition.status === 'active' && competition.progress !== undefined && (
                  <div style={{ marginTop: 8 }}>
                    <Progress percent={competition.progress} size="small" status="active" />
                  </div>
                )}
              </Space>
            </Card>
          </List.Item>
        )}
      />
    );
  };
  
  // 渲染每日挑战部分
  const renderDailyChallenges = () => {
    if (!dailyChallenges || dailyChallenges.length === 0) {
      return (
        <Empty description="没有可用的每日挑战" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      );
    }
    
    const completedChallenges = dailyChallenges.filter(c => c.completed);
    const overallProgress = Math.round(dailyChallenges.reduce((sum, challenge) => sum + challenge.progress, 0) / dailyChallenges.length);
    
    return (
      <Card 
        title={
          <Space>
            <FireFilled style={{ color: '#fa8c16' }} />
            <span>每日挑战</span>
          </Space>
        }
        extra={
          <Space>
            <Text>今日进度:</Text>
            <Progress type="circle" percent={overallProgress} size={30} />
            <Text>{completedChallenges.length}/{dailyChallenges.length}</Text>
          </Space>
        }
      >
        <List
          dataSource={dailyChallenges}
          renderItem={challenge => (
            <List.Item
              key={challenge.id}
              actions={[
                challenge.completed ? 
                  <Button type="text" icon={<CheckCircleOutlined />} disabled>已完成</Button> : 
                  <Button type="primary" ghost>继续</Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={
                      challenge.type === 'study' ? <BookOutlined /> :
                      challenge.type === 'quiz' ? <FileOutlined /> :
                      challenge.type === 'reading' ? <ReadOutlined /> :
                      challenge.type === 'practice' ? <ThunderboltOutlined /> :
                      <TeamOutlined />
                    } 
                    style={{ backgroundColor: challenge.difficulty === 'easy' ? '#52c41a' :
                      challenge.difficulty === 'medium' ? '#faad14' : '#f5222d' }}
                  />
                }
                title={
                  <Space>
                    <Text strong>{challenge.title}</Text>
                    <Tag color="blue">+{challenge.pointsReward}积分</Tag>
                    <Tag color={challenge.difficulty === 'easy' ? '#52c41a' :
                      challenge.difficulty === 'medium' ? '#faad14' : '#f5222d'}>
                      {challenge.difficulty === 'easy' ? '简单' : 
                       challenge.difficulty === 'medium' ? '中等' : '困难'}
                    </Tag>
                  </Space>
                }
                description={
                  <div>
                    <div>{challenge.description}</div>
                    <Progress percent={challenge.progress} size="small" style={{ marginTop: 8 }} />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      截止时间: {new Date(challenge.expiresAt).toLocaleString()}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    );
  };
  
  // 渲染挑战赛详情弹窗
  const renderCompetitionModal = () => {
    if (!selectedCompetition) return null;
    
    return (
      <Modal
        title={
          <Space>
            <TrophyFilled style={{ color: getCategoryColor(selectedCompetition.category) }} />
            {selectedCompetition.title}
            {getStatusTag(selectedCompetition.status)}
          </Space>
        }
        open={modalVisible}
        onCancel={handleCloseModal}
        width={800}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            关闭
          </Button>,
          selectedCompetition.status === 'upcoming' ? (
            <Button key="join" type="primary" onClick={() => handleJoinOrContinue(selectedCompetition)}>
              立即报名
            </Button>
          ) : selectedCompetition.status === 'active' ? (
            <Button key="continue" type="primary" onClick={() => handleJoinOrContinue(selectedCompetition)}>
              继续挑战
            </Button>
          ) : (
            <Button key="view" type="default" onClick={handleCloseModal}>
              查看证书
            </Button>
          )
        ]}
      >
        <Paragraph>{selectedCompetition.description}</Paragraph>
        
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Statistic 
              title="参与人数" 
              value={selectedCompetition.participants} 
              prefix={<TeamOutlined />} 
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title="类别"
              value={selectedCompetition.category}
              prefix={<GlobalOutlined style={{ color: getCategoryColor(selectedCompetition.category) }} />}
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title="奖励积分"
              value={parseInt(selectedCompetition.prize.replace(/[^0-9]/g, '')) || 0}
              suffix="积分"
              prefix={<GiftOutlined style={{ color: '#eb2f96' }} />}
            />
          </Col>
        </Row>
        
        <Divider orientation="left">挑战赛时间</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Text>开始时间: {new Date(selectedCompetition.startDate).toLocaleString()}</Text>
          </Col>
          <Col span={12}>
            <Text>结束时间: {new Date(selectedCompetition.endDate).toLocaleString()}</Text>
          </Col>
        </Row>
        
        {selectedCompetition.status === 'active' && selectedCompetition.progress !== undefined && (
          <>
            <Divider orientation="left">当前进度</Divider>
            <Row>
              <Col span={24}>
                <Progress percent={selectedCompetition.progress} status="active" />
              </Col>
            </Row>
          </>
        )}
        
        {selectedCompetition.ranking && (
          <>
            <Divider orientation="left">当前排名</Divider>
            <Row>
              <Col span={24}>
                <Space>
                  <AimOutlined style={{ color: '#1890ff' }} />
                  <Text>
                    您当前排名: <Text strong style={{ fontSize: 18 }}>{selectedCompetition.ranking}</Text> / {selectedCompetition.participants}
                  </Text>
                </Space>
              </Col>
            </Row>
          </>
        )}
        
        {selectedCompetition.rules && (
          <>
            <Divider orientation="left">挑战规则</Divider>
            <Paragraph>{selectedCompetition.rules}</Paragraph>
          </>
        )}
        
        {selectedCompetition.badges && selectedCompetition.badges.length > 0 && (
          <>
            <Divider orientation="left">可获得徽章</Divider>
            <Row gutter={[16, 16]}>
              {selectedCompetition.badges.map((badge, index) => (
                <Col key={index} span={6}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <Avatar size={64} src={badge.image} />
                    <div style={{ marginTop: 8 }}>{badge.name}</div>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
        
        {selectedCompetition.leaderboard && selectedCompetition.leaderboard.length > 0 && (
          <>
            <Divider orientation="left">排行榜</Divider>
            <List
              size="small"
              dataSource={selectedCompetition.leaderboard.slice(0, 5)}
              renderItem={(item, index) => (
                <List.Item
                  extra={<Text strong>{item.score}分</Text>}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: index < 3 ? ['#faad14', '#bfbfbf', '#cd7f32'][index] : '#1890ff' }}>
                        {index + 1}
                      </Avatar>
                    }
                    title={item.name}
                    description={`排名 #${item.rank}`}
                  />
                </List.Item>
              )}
            />
          </>
        )}
        
        {selectedCompetition.tasks && selectedCompetition.tasks.length > 0 && (
          <>
            <Divider orientation="left">挑战任务</Divider>
            <List
              size="small"
              dataSource={selectedCompetition.tasks}
              renderItem={(task) => (
                <List.Item
                  extra={<Tag color="blue">+{task.points}积分</Tag>}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar style={{ backgroundColor: task.completed ? '#52c41a' : '#d9d9d9' }}>
                        {task.completed ? <CheckCircleOutlined /> : (task.id.charCodeAt(0) % 10) + 1}
                      </Avatar>
                    }
                    title={task.title}
                    description={task.completed ? <Badge status="success" text="已完成" /> : <Badge status="processing" text="进行中" />}
                  />
                </List.Item>
              )}
            />
          </>
        )}
      </Modal>
    );
  };
  
  // 渲染挑战日历
  const renderChallengeCalendar = () => {
    // 获取特定日期的挑战数据，用于日历中显示
    const getListData = (value: Dayjs) => {
      // 这里应该根据日期获取该日期的挑战数据
      // 这里仅做示例
      const dateString = value.format('YYYY-MM-DD');
      if (dailyChallenges.some(c => new Date(c.expiresAt).toISOString().split('T')[0] === dateString)) {
        return [
          { type: 'success', content: '有每日挑战' },
        ];
      }
      if (competitions.some(c => 
        (new Date(c.startDate).toISOString().split('T')[0] === dateString) ||
        (new Date(c.endDate).toISOString().split('T')[0] === dateString)
      )) {
        return [
          { type: 'warning', content: '挑战赛重要日期' },
        ];
      }
      return [];
    };
    
    // 日历单元格渲染
    const dateCellRender = (value: Dayjs) => {
      const listData = getListData(value);
      return (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {listData.map((item, index) => (
            <li key={index}>
              <Badge status={item.type as any} text={item.content} />
            </li>
          ))}
        </ul>
      );
    };
    
    return (
      <Card title="挑战日历">
        <Calendar fullscreen={false} cellRender={(current, info) => {
          if (info.type === 'date') return dateCellRender(current);
          return info.originNode;
        }} />
      </Card>
    );
  };
  
  // 渲染挑战统计
  const renderChallengeStats = () => {
    const completedDaily = dailyChallenges.filter(c => c.completed).length;
    const totalPoints = dailyChallenges.reduce((sum, c) => sum + (c.completed ? c.pointsReward : 0), 0);
    const activeCompetitions = competitions.filter(c => c.status === 'active').length;
    
    return (
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="每日挑战完成"
              value={completedDaily}
              suffix={`/ ${dailyChallenges.length}`}
              valueStyle={{ color: '#52c41a' }}
              prefix={<FireFilled />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="获得积分"
              value={totalPoints}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<GiftOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="参与挑战赛"
              value={competitions.length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<TrophyFilled />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="进行中挑战赛"
              value={activeCompetitions}
              valueStyle={{ color: activeCompetitions > 0 ? '#eb2f96' : '#d9d9d9' }}
              prefix={<RocketOutlined />}
            />
          </Col>
        </Row>
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
    <div className="student-competitions">
      <PageHeader
        title="学习挑战"
        subtitle="参与各类学习挑战和竞赛，获得奖励和认可"
      />
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>加载挑战数据...</div>
        </div>
      ) : (
        <>
          {renderChallengeStats()}
          
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} md={16}>
              {renderDailyChallenges()}
            </Col>
            <Col xs={24} md={8}>
              {renderChallengeCalendar()}
            </Col>
          </Row>
          
          <Card
            title={
              <Space>
                <TrophyFilled style={{ color: '#faad14' }} />
                <span>学习挑战赛</span>
              </Space>
            }
            extra={
              <Space>
                <Button type="text" icon={<SearchOutlined />}>搜索</Button>
                <Button type="text" icon={<FilterOutlined />}>筛选</Button>
                <Button type="text" icon={<SortAscendingOutlined />}>排序</Button>
              </Space>
            }
          >
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
              {key: 'all', label: '全部挑战'},
              {key: 'active', label: '进行中'},
              {key: 'upcoming', label: '即将开始'},
              {key: 'completed', label: '已结束'}
            ]} />
            {renderCompetitionsList()}
          </Card>
          
          {renderCompetitionModal()}
        </>
      )}
    </div>
  );
};

export default StudentCompetitions; 