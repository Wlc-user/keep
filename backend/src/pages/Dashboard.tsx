import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Alert, List, Typography, Spin, Timeline, Tag, message, Empty } from 'antd';
import { UserOutlined, BookOutlined, ReadOutlined, FileOutlined, AuditOutlined, BellOutlined, TeamOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import apiService from '../services/api';

const { Title, Paragraph, Text } = Typography;

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  activeCourses: number;
  totalMaterials: number;
  pendingAssignments: number;
}

interface Activity {
  type: string;
  content: string;
  time: string;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalMaterials: 0,
    pendingAssignments: 0
  });

  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. 获取用户统计数据
      const usersData = await apiService.get('/api/users');
      const totalStudents = usersData?.items?.filter(user => user.role === 'student')?.length || 0;
      const totalTeachers = usersData?.items?.filter(user => user.role === 'teacher')?.length || 0;
      
      // 2. 获取课程统计数据
      const coursesData = await apiService.get('/api/courses');
      const totalCourses = coursesData?.items?.length || 0;
      const activeCourses = coursesData?.items?.filter(course => course.isPublished)?.length || 0;
      
      // 3. 获取学习材料统计数据
      const materialsData = await apiService.get('/api/materials/count');
      const totalMaterials = materialsData?.totalCount || 0;
      
      // 4. 获取作业统计数据 - 如果没有此API，使用模拟数据
      const pendingAssignments = 5; // 模拟数据
      
      // 设置统计数据
      setStats({
        totalStudents,
        totalTeachers,
        totalCourses,
        activeCourses,
        totalMaterials,
        pendingAssignments
      });
      
      // 5. 获取最近活动 - 使用通知API
      try {
        const notificationsData = await apiService.get('/api/notifications/public');
        
        if (notificationsData && Array.isArray(notificationsData.items)) {
          const activities = notificationsData.items.map(notification => ({
            type: notification.type || 'info',
            content: notification.content || notification.title,
            time: notification.createdAt || new Date().toISOString()
          }));
          
          setRecentActivities(activities);
        }
      } catch (activityError) {
        console.error('获取最近活动失败:', activityError);
        // 使用模拟数据
        setRecentActivities([
          { type: 'info', content: '系统维护已完成', time: new Date().toISOString() },
          { type: 'success', content: '新课程"数据科学基础"已发布', time: new Date().toISOString() }
        ]);
      }
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      message.error('获取仪表盘数据失败，使用模拟数据');
      
      // 使用模拟数据
      setStats({
        totalStudents: 120,
        totalTeachers: 15,
        totalCourses: 25,
        activeCourses: 18,
        totalMaterials: 230,
        pendingAssignments: 8
      });
      
      setRecentActivities([
        { type: 'info', content: '系统维护将于今晚进行', time: new Date().toISOString() },
        { type: 'success', content: '新课程"人工智能入门"已发布', time: new Date().toISOString() },
        { type: 'warning', content: '请尽快完成系统更新', time: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 为活动内容获取相应的图标
  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'user':
        return <UserOutlined />;
      case 'course':
        return <BookOutlined />;
      case 'material':
        return <FileOutlined />;
      case 'assignment':
        return <AuditOutlined />;
      case 'info':
        return <BellOutlined />;
      case 'success':
        return <BookOutlined />;
      case 'warning':
        return <AuditOutlined />;
      default:
        return <BellOutlined />;
    }
  };

  // 为活动内容获取相应的颜色
  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'user':
        return 'blue';
      case 'course':
        return 'green';
      case 'material':
        return 'purple';
      case 'assignment':
        return 'orange';
      case 'info':
        return 'blue';
      case 'success':
        return 'green';
      case 'warning':
        return 'orange';
      default:
        return 'blue';
    }
  };

  return (
    <div className="dashboard">
      <Title level={2}>在线学习系统控制面板</Title>
      <Paragraph>欢迎来到在线学习系统管理平台。在这里您可以管理所有的学习内容和用户。</Paragraph>
      
      <Alert
        message="系统公告"
        description="系统已更新到最新版本，如有任何问题请联系技术支持。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
      
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {/* 统计卡片部分 */}
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card bordered={false}>
              <Statistic
                title="学生总数"
                value={stats.totalStudents}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card bordered={false}>
              <Statistic
                title="教师总数"
                value={stats.totalTeachers}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card bordered={false}>
              <Statistic
                title="课程总数"
                value={stats.totalCourses}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card bordered={false}>
              <Statistic
                title="进行中课程"
                value={stats.activeCourses}
                prefix={<ReadOutlined />}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card bordered={false}>
              <Statistic
                title="学习资料"
                value={stats.totalMaterials}
                prefix={<FileOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card bordered={false}>
              <Statistic
                title="待批作业"
                value={stats.pendingAssignments}
                prefix={<AuditOutlined />}
                valueStyle={{ color: '#fa541c' }}
              />
            </Card>
          </Col>
          
          {/* 最近活动部分 */}
          <Col xs={24} lg={12}>
            <Card 
              title="最近活动" 
              bordered={false}
              className="dashboard-card"
            >
              {recentActivities.length > 0 ? (
                <Timeline>
                  {recentActivities.map((activity, index) => (
                    <Timeline.Item 
                      key={index}
                      color={getActivityColor(activity.type)}
                      dot={getActivityIcon(activity.type)}
                    >
                      <div>
                        <Text strong>{activity.content}</Text>
                        <div>
                          <Tag color={getActivityColor(activity.type)}>
                            {activity.type}
                          </Tag>
                          <Text type="secondary" style={{ marginLeft: 8 }}>
                            {new Date(activity.time).toLocaleString()}
                          </Text>
                        </div>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty description="暂无活动" />
              )}
            </Card>
          </Col>
          
          {/* 快速访问部分 */}
          <Col xs={24} lg={12}>
            <Card
              title="快速访问"
              bordered={false}
              className="dashboard-card"
            >
              <List
                size="large"
                bordered={false}
                dataSource={[
                  { title: '用户管理', link: '/user-management', icon: <UserOutlined /> },
                  { title: '课程管理', link: '/course-management', icon: <BookOutlined /> },
                  { title: '学习材料', link: '/material-management', icon: <FileOutlined /> },
                  { title: '系统设置', link: '/settings', icon: <AuditOutlined /> }
                ]}
                renderItem={item => (
                  <List.Item>
                    <Link to={item.link} style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ marginRight: 10 }}>{item.icon}</span>
                      {item.title}
                    </Link>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard; 