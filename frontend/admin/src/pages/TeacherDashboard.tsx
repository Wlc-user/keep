import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Button, Avatar, Typography, Space, Divider, Calendar, Badge, Spin } from 'antd';
import { 
  BookOutlined, 
  TeamOutlined, 
  ClockCircleOutlined, 
  FileOutlined,
  CheckCircleOutlined,
  BellOutlined,
  VideoCameraOutlined,
  CloseCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { Dayjs } from 'dayjs';
import dashboardService from '../services/dashboardService';
import { useAppContext } from '../contexts/AppContext';

const { Title, Text, Paragraph } = Typography;

const TeacherDashboard: React.FC = () => {
  const { user } = useAppContext();
  const [teacher, setTeacher] = useState<any>({});
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取数据
  useEffect(() => {
    const fetchTeacherData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 获取当前登录教师信息
        setTeacher(user || {});
        
        // 获取教师统计数据
        const statsData = await dashboardService.getStatistics('teacher');
        setStatistics(statsData);
        
        // 获取教师课程
        const coursesData = await dashboardService.getRecentActivities('teacherCourses', 5);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        
        // 获取作业情况
        const assignmentsData = await dashboardService.getRecentActivities('teacherAssignments', 5);
        setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
        
        // 获取通知
        const notificationsData = await dashboardService.getRecentActivities('notifications', 5);
        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
        
        // 获取日程
        // 这里假设backend返回的日程格式符合我们的要求
        const scheduleData = await dashboardService.getChartData('teacherSchedule');
        setSchedule(Array.isArray(scheduleData.events) ? scheduleData.events : []);
      } catch (err) {
        console.error('获取教师仪表盘数据失败:', err);
        setError('获取数据失败，请稍后重试');
        
        // 设置一些默认数据以便UI能够正确渲染
        setCourses([]);
        setAssignments([]);
        setNotifications([]);
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) {
      fetchTeacherData();
    }
  }, [user]);

  // 日历数据处理
  const getListData = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayEvents = schedule.filter(item => item.date === dateStr);
    return dayEvents.map(event => ({
      type: event.type || 'success',
      content: event.content || event.title
    }));
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status="success" text={<Text ellipsis style={{ fontSize: '12px' }}>{item.content}</Text>} />
          </li>
        ))}
      </ul>
    );
  };

  // 错误状态
  if (error) {
    return (
      <div>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="danger" style={{ fontSize: 16 }}>{error}</Text>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" onClick={() => window.location.reload()}>
                重新加载
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card loading={loading}>
            <Space align="start" size="large">
              <Avatar size={64} icon={<UserOutlined />} src={teacher.avatar} />
              <div>
                <Title level={4}>{teacher.name}</Title>
                <Text>{teacher.title || '教师'} | {teacher.department || '未设置部门'}</Text>
                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                  {teacher.bio || '暂无个人简介'}
                </Paragraph>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic 
              title="我的课程" 
              value={statistics.totalCourses || courses.length} 
              prefix={<BookOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic 
              title="学生总数" 
              value={statistics.totalStudents || courses.reduce((acc: number, course: any) => acc + (course.students || 0), 0)} 
              prefix={<TeamOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic 
              title="待批改作业" 
              value={statistics.pendingAssignments || assignments.reduce((acc: number, assignment: any) => acc + ((assignment.total || 0) - (assignment.submitted || 0)), 0)} 
              prefix={<FileOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic 
              title="未读通知" 
              value={statistics.unreadNotifications || notifications.filter((n: any) => !n.read).length} 
              prefix={<BellOutlined />} 
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={16}>
          <Card title="我的课程" loading={loading}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin />
              </div>
            ) : courses.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={Array.isArray(courses) ? courses : []}
                renderItem={course => (
                  <List.Item
                    actions={[
                      <Button type="primary" icon={<VideoCameraOutlined />}>
                        开始上课
                      </Button>,
                      <Link to={`/teacher/courses/${course.id}`}>
                        <Button>查看详情</Button>
                      </Link>
                    ]}
                  >
                    <List.Item.Meta
                      title={<Link to={`/teacher/courses/${course.id}`}>{course.title}</Link>}
                      description={
                        <Space direction="vertical">
                          <Text>学生人数: {course.students}</Text>
                          <Text>课程进度: {course.progress}%</Text>
                          <Text>下次课程: {course.nextClass}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Text type="secondary">暂无课程数据</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="近期通知" loading={loading}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Spin />
              </div>
            ) : notifications.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={Array.isArray(notifications) ? notifications : []}
                renderItem={notification => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          {notification.title}
                          {!notification.read && <Badge status="processing" />}
                        </Space>
                      }
                      description={
                        <div>
                          <Text type="secondary">{notification.time}</Text>
                          <div>{notification.content}</div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Text type="secondary">暂无通知</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="待批改作业" loading={loading}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Spin />
              </div>
            ) : assignments.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={Array.isArray(assignments) ? assignments : []}
                renderItem={assignment => (
                  <List.Item
                    actions={[
                      <Link to={`/teacher/assignments/${assignment.id}`}>
                        <Button>批改作业</Button>
                      </Link>
                    ]}
                  >
                    <List.Item.Meta
                      title={assignment.title}
                      description={
                        <Space direction="vertical">
                          <Text>课程: {assignment.course}</Text>
                          <Text>提交情况: {assignment.submitted}/{assignment.total}</Text>
                          <Text>截止日期: {assignment.deadline}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Text type="secondary">暂无待批改作业</Text>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="课程日程" loading={loading}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Spin />
              </div>
            ) : (
              <Calendar fullscreen={false} cellRender={(current, info) => {
                if (info.type === 'date') return dateCellRender(current);
                return info.originNode;
              }} />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TeacherDashboard; 