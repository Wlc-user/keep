import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tabs, 
  List, 
  Tag, 
  Button, 
  Tooltip, 
  Space, 
  Progress, 
  Empty, 
  Spin, 
  Statistic,
  Avatar,
  Calendar,
  Badge,
  Input,
  Divider,
  Alert,
  Steps
} from 'antd';
import { 
  BookOutlined, 
  ReadOutlined, 
  ClockCircleOutlined, 
  RocketOutlined, 
  StarOutlined,
  ScheduleOutlined,
  FileTextOutlined,
  EditOutlined,
  FileAddOutlined,
  PlayCircleOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  CompassOutlined,
  AimOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  LockOutlined,
  RightOutlined,
  FormOutlined,
  TeamOutlined,
  BulbOutlined
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import dashboardService from '../services/dashboardService';
import PageHeader from '../components/PageHeader';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Step } = Steps;

// 学习资源类型
interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'ebook' | 'course' | 'quiz' | 'exercise';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  author: string;
  thumbnail: string;
  url: string;
  tags: string[];
  rating: number;
  popularity: number;
  completionRate?: number;
  relevanceScore: number;
}

// 学习计划类型
interface LearningPlan {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  goal: string;
  progress: number;
  completed: boolean;
  tasks: {
    id: string;
    title: string;
    date: string;
    completed: boolean;
    importance: 'high' | 'medium' | 'low';
  }[];
}

// 学习路径类型
interface LearningPath {
  id: string;
  title: string;
  description: string;
  stages: {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    locked: boolean;
    resources: {
      id: string;
      title: string;
      type: 'video' | 'article' | 'quiz' | 'project';
      completed: boolean;
    }[];
  }[];
  progress: number;
}

// 学习笔记类型
interface StudyNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  courseId?: string;
  courseName?: string;
  tags: string[];
}

const StudentLearningCenter: React.FC = () => {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState('resources');
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [resourceFilter, setResourceFilter] = useState<string>('recommended');
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // 获取学习资源推荐
        const resourcesData = await dashboardService.getLearningCenterActivities('recommendedResources', 10);
        setResources(resourcesData || []);
        
        // 获取学习计划
        const plansData = await dashboardService.getLearningCenterActivities('learningPlans', 5);
        setPlans(plansData || []);
        
        // 获取学习路径
        const pathsData = await dashboardService.getLearningCenterActivities('learningPaths', 3);
        setPaths(pathsData || []);
        
        // 获取学习笔记
        const notesData = await dashboardService.getLearningCenterActivities('studyNotes', 10);
        setNotes(notesData || []);
      } catch (error) {
        console.error('获取学习中心数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // 根据选择过滤学习资源
  const getFilteredResources = () => {
    if (!resources || resources.length === 0) return [];
    
    switch (resourceFilter) {
      case 'recommended':
        return [...resources].sort((a, b) => b.relevanceScore - a.relevanceScore);
      case 'popular':
        return [...resources].sort((a, b) => b.popularity - a.popularity);
      case 'rated':
        return [...resources].sort((a, b) => b.rating - a.rating);
      case 'latest':
        return [...resources];
      default:
        return resources;
    }
  };

  // 获取资源类型图标
  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircleOutlined />;
      case 'article':
        return <FileTextOutlined />;
      case 'ebook':
        return <BookOutlined />;
      case 'course':
        return <ReadOutlined />;
      case 'quiz':
        return <FormOutlined />;
      case 'exercise':
        return <ExperimentOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  // 获取资源类型标签颜色
  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'blue';
      case 'article':
        return 'green';
      case 'ebook':
        return 'purple';
      case 'course':
        return 'magenta';
      case 'quiz':
        return 'orange';
      case 'exercise':
        return 'cyan';
      default:
        return 'default';
    }
  };

  // 获取难度级别标签
  const getDifficultyTag = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Tag color="success">初级</Tag>;
      case 'intermediate':
        return <Tag color="warning">中级</Tag>;
      case 'advanced':
        return <Tag color="error">高级</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  // 日历日期单元格渲染
  const dateCellRender = (value: Dayjs) => {
    const date = value.format('YYYY-MM-DD');
    const dayTasks = plans.flatMap(plan => 
      plan.tasks.filter(task => task.date === date)
    );
    
    return (
      <ul className="events" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayTasks.map(task => (
          <li key={task.id}>
            <Badge 
              status={task.completed ? 'success' : task.importance === 'high' ? 'error' : 'processing'} 
              text={<Text ellipsis style={{ width: '100%' }}>{task.title}</Text>} 
            />
          </li>
        ))}
      </ul>
    );
  };

  // 处理笔记保存
  const handleSaveNote = () => {
    if (!noteTitle.trim()) {
      alert('请输入笔记标题');
      return;
    }
    
    if (editingNoteId) {
      // 更新现有笔记
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === editingNoteId 
            ? {
                ...note,
                title: noteTitle,
                content: noteContent,
                updatedAt: new Date().toISOString()
              }
            : note
        )
      );
    } else {
      // 创建新笔记
      const newNote: StudyNote = {
        id: `note-${Date.now()}`,
        title: noteTitle,
        content: noteContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: []
      };
      
      setNotes(prevNotes => [newNote, ...prevNotes]);
    }
    
    // 重置表单
    setNoteTitle('');
    setNoteContent('');
    setEditingNoteId(null);
  };

  // 处理编辑笔记
  const handleEditNote = (note: StudyNote) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
  };

  // 处理删除笔记
  const handleDeleteNote = (noteId: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
    
    if (editingNoteId === noteId) {
      setEditingNoteId(null);
      setNoteTitle('');
      setNoteContent('');
    }
  };

  // 渲染学习资源推荐
  const renderLearningResources = () => {
    return (
      <div className="learning-resources">
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4}>学习资源</Title>
          <Space>
            <Button 
              type={resourceFilter === 'recommended' ? 'primary' : 'default'} 
              onClick={() => setResourceFilter('recommended')}
            >
              推荐
            </Button>
            <Button 
              type={resourceFilter === 'popular' ? 'primary' : 'default'} 
              onClick={() => setResourceFilter('popular')}
            >
              热门
            </Button>
            <Button 
              type={resourceFilter === 'rated' ? 'primary' : 'default'} 
              onClick={() => setResourceFilter('rated')}
            >
              高评分
            </Button>
            <Button 
              type={resourceFilter === 'latest' ? 'primary' : 'default'} 
              onClick={() => setResourceFilter('latest')}
            >
              最新
            </Button>
          </Space>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin />
          </div>
        ) : resources.length > 0 ? (
          <List
            itemLayout="vertical"
            dataSource={getFilteredResources()}
            renderItem={resource => (
              <List.Item
                key={resource.id}
                actions={[
                  <Space>
                    <ClockCircleOutlined /> {resource.duration}分钟
                  </Space>,
                  <Space>
                    <StarOutlined /> {resource.rating.toFixed(1)}
                  </Space>,
                  resource.completionRate !== undefined && (
                    <Space>
                      <CheckCircleOutlined /> 
                      {`${resource.completionRate}%完成`}
                    </Space>
                  )
                ]}
                extra={
                  <Link to={resource.url}>
                    <Button type="primary" icon={<RightOutlined />}>
                      开始学习
                    </Button>
                  </Link>
                }
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      size={60} 
                      shape="square" 
                      src={resource.thumbnail} 
                      icon={getResourceTypeIcon(resource.type)} 
                    />
                  }
                  title={
                    <Space>
                      <Link to={resource.url}>{resource.title}</Link>
                      <Tag color={getResourceTypeColor(resource.type)}>
                        {getResourceTypeIcon(resource.type)} {resource.type === 'video' ? '视频' : 
                          resource.type === 'article' ? '文章' : 
                          resource.type === 'ebook' ? '电子书' : 
                          resource.type === 'course' ? '课程' : 
                          resource.type === 'quiz' ? '测验' : 
                          resource.type === 'exercise' ? '练习' : resource.type}
                      </Tag>
                      {getDifficultyTag(resource.difficulty)}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">作者: {resource.author}</Text>
                      <div>
                        {resource.tags.map(tag => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </div>
                    </Space>
                  }
                />
                <Paragraph ellipsis={{ rows: 2 }}>
                  {resource.description}
                </Paragraph>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无学习资源推荐" />
        )}
      </div>
    );
  };

  // 渲染学习计划
  const renderLearningPlans = () => {
    return (
      <div className="learning-plans">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Card title={<Space><ScheduleOutlined /> 我的学习计划</Space>}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin />
                </div>
              ) : plans.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={plans}
                  renderItem={plan => (
                    <List.Item
                      key={plan.id}
                      actions={[
                        <Text>开始: {plan.startDate}</Text>,
                        <Text>结束: {plan.endDate}</Text>,
                        <Button
                          type="link"
                          onClick={() => alert(`编辑计划: ${plan.title}`)}
                        >
                          编辑
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <Text strong>{plan.title}</Text>
                            {plan.completed ? (
                              <Tag color="success">已完成</Tag>
                            ) : (
                              <Tag color="processing">进行中</Tag>
                            )}
                          </Space>
                        }
                        description={<Text>{plan.goal}</Text>}
                      />
                      <div style={{ marginTop: 12 }}>
                        <Progress percent={plan.progress} />
                        <Divider style={{ margin: '12px 0' }} />
                        <List
                          size="small"
                          dataSource={plan.tasks.slice(0, 3)}
                          renderItem={task => (
                            <List.Item
                              actions={[
                                <Button
                                  type="text"
                                  icon={task.completed ? <CheckCircleOutlined style={{color: '#52c41a'}} /> : <ClockCircleOutlined />}
                                  onClick={() => alert(`标记任务: ${task.title}`)}
                                />
                              ]}
                            >
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Badge 
                                  status={
                                    task.completed ? 'success' : 
                                    task.importance === 'high' ? 'error' : 
                                    task.importance === 'medium' ? 'warning' : 
                                    'default'
                                  } 
                                />
                                <Text 
                                  style={{ 
                                    marginLeft: 8,
                                    textDecoration: task.completed ? 'line-through' : 'none',
                                    opacity: task.completed ? 0.5 : 1
                                  }}
                                >
                                  {task.title} - {task.date}
                                </Text>
                              </div>
                            </List.Item>
                          )}
                        />
                        {plan.tasks.length > 3 && (
                          <div style={{ textAlign: 'center', marginTop: 8 }}>
                            <Button type="link">查看更多任务 ({plan.tasks.length - 3})</Button>
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无学习计划" />
              )}
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title={<Space><CalendarOutlined /> 日程安排</Space>}>
              <Calendar 
                fullscreen={false} 
                cellRender={dateCellRender} 
              />
            </Card>
          </Col>
        </Row>
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card>
              <Button 
                type="primary" 
                icon={<FileAddOutlined />} 
                onClick={() => alert('创建新学习计划')}
                block
              >
                创建新学习计划
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // 渲染学习路径
  const renderLearningPaths = () => {
    return (
      <div className="learning-paths">
        <Row gutter={[16, 16]}>
          {loading ? (
            <Col span={24}>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin />
              </div>
            </Col>
          ) : paths.length > 0 ? (
            paths.map(path => (
              <Col xs={24} sm={24} md={24} lg={24} key={path.id}>
                <Card
                  title={
                    <Space>
                      <CompassOutlined />
                      <span>{path.title}</span>
                    </Space>
                  }
                >
                  <Paragraph>{path.description}</Paragraph>
                  <Progress 
                    percent={path.progress} 
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                  <div style={{ margin: '20px 0' }}>
                    <Steps
                      direction="vertical"
                      current={path.stages.findIndex(stage => !stage.completed)}
                      style={{ maxWidth: '100%' }}
                    >
                      {path.stages.map(stage => (
                        <Step
                          key={stage.id}
                          title={
                            <Space>
                              {stage.title}
                              {stage.locked && <LockOutlined />}
                            </Space>
                          }
                          description={
                            <div>
                              <Paragraph>{stage.description}</Paragraph>
                              <div style={{ marginTop: 8 }}>
                                {stage.resources.map(resource => (
                                  <Tag 
                                    icon={
                                      resource.completed 
                                        ? <CheckCircleOutlined /> 
                                        : getResourceTypeIcon(resource.type)
                                    } 
                                    color={resource.completed ? 'success' : 'default'}
                                    key={resource.id}
                                    style={{ margin: '2px 4px' }}
                                  >
                                    {resource.title}
                                  </Tag>
                                ))}
                              </div>
                              {!stage.locked && (
                                <Button 
                                  type="link" 
                                  style={{ paddingLeft: 0 }}
                                  onClick={() => alert(`继续学习: ${stage.title}`)}
                                >
                                  {stage.completed ? '复习' : '开始学习'} <RightOutlined />
                                </Button>
                              )}
                            </div>
                          }
                          status={
                            stage.completed 
                              ? 'finish' 
                              : stage.locked 
                                ? 'wait' 
                                : 'process'
                          }
                        />
                      ))}
                    </Steps>
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Empty description="暂无学习路径" />
            </Col>
          )}
        </Row>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button 
            type="primary" 
            icon={<CompassOutlined />} 
            onClick={() => alert('发现更多学习路径')}
          >
            发现更多学习路径
          </Button>
        </div>
      </div>
    );
  };

  // 渲染学习笔记
  const renderStudyNotes = () => {
    return (
      <div className="study-notes">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <FormOutlined />
                  <span>{editingNoteId ? '编辑笔记' : '新建笔记'}</span>
                </Space>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input 
                  placeholder="笔记标题" 
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                />
                <TextArea
                  placeholder="在此输入笔记内容..."
                  rows={6}
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                />
                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  {editingNoteId && (
                    <Button 
                      style={{ marginRight: 8 }}
                      onClick={() => {
                        setEditingNoteId(null);
                        setNoteTitle('');
                        setNoteContent('');
                      }}
                    >
                      取消
                    </Button>
                  )}
                  <Button 
                    type="primary" 
                    onClick={handleSaveNote}
                    disabled={!noteTitle.trim()}
                  >
                    {editingNoteId ? '更新笔记' : '保存笔记'}
                  </Button>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <ReadOutlined />
                  <span>我的笔记</span>
                </Space>
              }
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin />
                </div>
              ) : notes.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={notes}
                  renderItem={note => (
                    <List.Item
                      key={note.id}
                      actions={[
                        <Button 
                          type="text" 
                          icon={<EditOutlined />} 
                          onClick={() => handleEditNote(note)}
                        >
                          编辑
                        </Button>,
                        <Button 
                          type="text" 
                          danger
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          删除
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={note.title}
                        description={
                          <Space split={<Divider type="vertical" />}>
                            <Text type="secondary">更新于: {new Date(note.updatedAt).toLocaleDateString()}</Text>
                            {note.courseName && (
                              <Text type="secondary">课程: {note.courseName}</Text>
                            )}
                          </Space>
                        }
                      />
                      <div style={{ marginTop: 8 }}>
                        <Paragraph ellipsis={{ rows: 3 }}>
                          {note.content}
                        </Paragraph>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无笔记" />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // 渲染学习小组与协作功能
  const renderStudyGroups = () => {
    return (
      <div className="study-groups">
        <Alert
          message="学习小组功能即将推出"
          description="学习小组和协作功能正在开发中，请期待后续更新。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Card title={<Space><TeamOutlined /> 学习小组与协作</Space>}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <BulbOutlined style={{ fontSize: 48, color: '#faad14' }} />
                  <Title level={4}>创建学习小组</Title>
                  <Paragraph>创建您自己的学习小组，邀请同学一起学习</Paragraph>
                  <Button type="primary" disabled>即将推出</Button>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <TeamOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                  <Title level={4}>加入学习小组</Title>
                  <Paragraph>加入已有的学习小组，与同学们一起进步</Paragraph>
                  <Button type="primary" disabled>即将推出</Button>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <RocketOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                  <Title level={4}>协作学习工具</Title>
                  <Paragraph>使用协作工具提升小组学习效率</Paragraph>
                  <Button type="primary" disabled>即将推出</Button>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    );
  };

  return (
    <div className="student-learning-center">
      <PageHeader 
        title="学习中心" 
        subtitle="个性化学习资源、计划和进度管理" 
      />
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
        tabBarStyle={{ marginBottom: 16 }}
      >
        <TabPane 
          tab={<Space><BookOutlined />学习资源</Space>} 
          key="resources"
        >
          {renderLearningResources()}
        </TabPane>
        <TabPane 
          tab={<Space><ScheduleOutlined />学习计划</Space>} 
          key="plans"
        >
          {renderLearningPlans()}
        </TabPane>
        <TabPane 
          tab={<Space><CompassOutlined />学习路径</Space>} 
          key="paths"
        >
          {renderLearningPaths()}
        </TabPane>
        <TabPane 
          tab={<Space><FormOutlined />学习笔记</Space>} 
          key="notes"
        >
          {renderStudyNotes()}
        </TabPane>
        <TabPane 
          tab={<Space><TeamOutlined />学习小组</Space>} 
          key="groups"
        >
          {renderStudyGroups()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default StudentLearningCenter; 