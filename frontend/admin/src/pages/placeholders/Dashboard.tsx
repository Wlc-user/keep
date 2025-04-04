import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Alert, List, Typography, Spin, Timeline, Tag } from 'antd';
import { UserOutlined, BookOutlined, ReadOutlined, FileOutlined, AuditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalMaterials: 0,
    pendingAssignments: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setStats({
        totalStudents: 342,
        totalTeachers: 28,
        totalCourses: 47,
        activeCourses: 23,
        totalMaterials: 156,
        pendingAssignments: 14
      });
      setRecentActivities([
        { type: 'user', content: '新学生注册: 张明', time: '刚刚' },
        { type: 'course', content: '课程更新: Web前端开发', time: '10分钟前' },
        { type: 'material', content: '新学习材料上传: React Hooks入门', time: '30分钟前' },
        { type: 'assignment', content: '新作业发布: JavaScript基础练习', time: '1小时前' },
        { type: 'feedback', content: '新反馈: 关于知识图谱功能的建议', time: '2小时前' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="dashboard">
      <Title level={2}>在线学习系统控制面板</Title>
      <Paragraph>欢迎来到在线学习系统管理平台。在这里您可以管理所有的学习内容和用户。</Paragraph>
      
      <Alert
        message="系统公告"
        description="我们的新版在线学习系统已经上线，目前正在连接到后端服务。如果发现任何问题，请及时反馈。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
      
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card>
              <Statistic
                title="学生总数"
                value={stats.totalStudents}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
              <div style={{ marginTop: 8 }}>
                <Link to="/admin/students">查看详情</Link>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card>
              <Statistic
                title="教师总数"
                value={stats.totalTeachers}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ marginTop: 8 }}>
                <Link to="/admin/teachers">查看详情</Link>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card>
              <Statistic
                title="课程总数"
                value={stats.totalCourses}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              <div style={{ marginTop: 8 }}>
                <Link to="/courses">查看详情</Link>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card>
              <Statistic
                title="活跃课程"
                value={stats.activeCourses}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#13c2c2' }}
              />
              <div style={{ marginTop: 8 }}>
                <Link to="/courses?status=active">查看详情</Link>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card>
              <Statistic
                title="学习材料"
                value={stats.totalMaterials}
                prefix={<FileOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
              <div style={{ marginTop: 8 }}>
                <Link to="/materials">查看详情</Link>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8} xl={4}>
            <Card>
              <Statistic
                title="待批改作业"
                value={stats.pendingAssignments}
                prefix={<AuditOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
              <div style={{ marginTop: 8 }}>
                <Link to="/exams/review">查看详情</Link>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} md={12}>
            <Card title="系统概览" style={{ height: 400 }}>
              <Paragraph>
                <Text strong>在线学习系统</Text>是一个综合性的教育管理平台，为学生、教师和管理员提供了丰富的功能。
              </Paragraph>
              <Paragraph>
                <ul>
                  <li><Text strong>用户管理</Text>：管理学生和教师账户</li>
                  <li><Text strong>课程管理</Text>：创建、编辑和安排课程</li>
                  <li><Text strong>学习内容</Text>：上传和组织学习材料</li>
                  <li><Text strong>知识图谱</Text>：可视化知识点和关联</li>
                  <li><Text strong>评估系统</Text>：管理作业、考试和成绩</li>
                  <li><Text strong>反馈系统</Text>：收集和处理用户反馈</li>
                </ul>
              </Paragraph>
              <Paragraph>
                <Text type="secondary">系统版本: 1.0.0 | 构建日期: 2025年4月1日</Text>
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="最近活动" style={{ height: 400, overflowY: 'auto' }}>
              <Timeline>
                {recentActivities.map((activity, index) => (
                  <Timeline.Item key={index}>
                    <p>
                      {activity.content} 
                      <Tag color="blue" style={{ marginLeft: 8 }}>{activity.time}</Tag>
                    </p>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard; 