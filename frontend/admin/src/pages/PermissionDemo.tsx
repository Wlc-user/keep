import React, { useState } from 'react';
import { Card, Typography, Space, Tabs, Button, Tag, Select, Row, Col, Divider, Table, Alert, Radio, Descriptions } from 'antd';
import { UserOutlined, KeyOutlined, LockOutlined, UnlockOutlined, CheckCircleOutlined, CloseCircleOutlined, SettingOutlined, TeamOutlined, BookOutlined } from '@ant-design/icons';
import usePermission from '../hooks/usePermission';
import PermissionGuard from '../components/PermissionGuard';
import { UserRole } from '../contexts/AppContext';
import { useAppContext } from '../contexts/AppContext';
import { Permissions, ModulePermissions } from '../utils/permissionUtils';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const PermissionDemo: React.FC = () => {
  const { user, login } = useAppContext();
  const { permissions, modules, menuVisibility, userRole } = usePermission();
  const [activeRole, setActiveRole] = useState<UserRole>(user?.role || 'student');

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    
    // 模拟用户角色切换
    const mockUser = {
      id: user?.id || '1',
      username: role,
      name: role === 'admin' ? '管理员' : role === 'teacher' ? '教师' : '学生',
      role
    };
    
    login(mockUser);
    
    // 保存到 localStorage
    localStorage.setItem('user', JSON.stringify(mockUser));
    console.log(`已切换到角色: ${role}`);
  };

  const getPermissionTag = (isGranted: boolean) => {
    return isGranted ? 
      <Tag color="success" icon={<CheckCircleOutlined />}>允许</Tag> : 
      <Tag color="error" icon={<CloseCircleOutlined />}>拒绝</Tag>;
  };

  const permissionGroupData = [
    {
      key: 'dashboard',
      name: '仪表盘',
      permissions: [
        { key: 'view', name: '查看', hasPermission: permissions.dashboard.view },
        { key: 'manage', name: '管理', hasPermission: permissions.dashboard.manage },
        { key: 'studentFeatures', name: '学生功能', hasPermission: permissions.dashboard.studentFeatures },
        { key: 'teacherFeatures', name: '教师功能', hasPermission: permissions.dashboard.teacherFeatures },
        { key: 'adminFeatures', name: '管理员功能', hasPermission: permissions.dashboard.adminFeatures },
      ]
    },
    {
      key: 'courses',
      name: '课程',
      permissions: [
        { key: 'view', name: '查看', hasPermission: permissions.courses.view },
        { key: 'manage', name: '管理', hasPermission: permissions.courses.manage },
        { key: 'create', name: '创建', hasPermission: permissions.courses.create },
        { key: 'delete', name: '删除', hasPermission: permissions.courses.delete },
        { key: 'teach', name: '教学', hasPermission: permissions.courses.teach },
        { key: 'enroll', name: '注册', hasPermission: permissions.courses.enroll },
      ]
    },
    {
      key: 'studentFeatures',
      name: '学生功能',
      permissions: [
        { key: 'learningProgress', name: '学习进度', hasPermission: permissions.studentFeatures.learningProgress },
        { key: 'achievements', name: '成就', hasPermission: permissions.studentFeatures.achievements },
        { key: 'competitions', name: '竞赛', hasPermission: permissions.studentFeatures.competitions },
        { key: 'challenges', name: '挑战', hasPermission: permissions.studentFeatures.challenges },
        { key: 'studyPartners', name: '学习伙伴', hasPermission: permissions.studentFeatures.studyPartners },
      ]
    },
    {
      key: 'teacherFeatures',
      name: '教师功能',
      permissions: [
        { key: 'classManagement', name: '班级管理', hasPermission: permissions.teacherFeatures.classManagement },
        { key: 'studentAssessment', name: '学生评估', hasPermission: permissions.teacherFeatures.studentAssessment },
        { key: 'grading', name: '评分', hasPermission: permissions.teacherFeatures.grading },
        { key: 'courseAnalytics', name: '课程分析', hasPermission: permissions.teacherFeatures.courseAnalytics },
      ]
    },
  ];

  const moduleData = Object.keys(ModulePermissions).map(key => ({
    key,
    name: key,
    hasPermission: modules[key]
  }));

  const menuData = Object.keys(menuVisibility).map(key => ({
    key,
    name: key,
    visible: menuVisibility[key as keyof typeof menuVisibility]
  }));

  return (
    <div>
      <Title level={2}>权限系统演示</Title>
      <Paragraph>
        这个页面允许你测试权限系统的工作原理，包括角色权限、功能模块权限和菜单可见性。
      </Paragraph>

      <Alert
        message="权限系统说明"
        description={
          <div>
            <Paragraph>
              本系统采用基于角色的访问控制(RBAC)模型，定义了三个角色：
            </Paragraph>
            <ul>
              <li><Text strong>管理员(admin)</Text>：最高权限，可以访问所有功能</li>
              <li><Text strong>教师(teacher)</Text>：教学相关权限，可以管理课程、作业等</li>
              <li><Text strong>学生(student)</Text>：学习相关权限，可以参与课程、提交作业等</li>
            </ul>
            <Paragraph>
              可以通过下方的角色切换来测试不同角色的权限表现。
            </Paragraph>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card title="当前用户信息" style={{ marginBottom: 24 }}>
        <Descriptions bordered>
          <Descriptions.Item label="用户ID">{user?.id || '-'}</Descriptions.Item>
          <Descriptions.Item label="用户名">{user?.username || '-'}</Descriptions.Item>
          <Descriptions.Item label="姓名">{user?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="角色">
            <Tag color="blue">{user?.role || '-'}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      
      <Card title="角色切换" style={{ marginBottom: 24 }}>
        <Space>
          <Text>选择角色：</Text>
          <Radio.Group value={activeRole} onChange={e => handleRoleChange(e.target.value)}>
            <Radio.Button value="admin">管理员</Radio.Button>
            <Radio.Button value="teacher">教师</Radio.Button>
            <Radio.Button value="student">学生</Radio.Button>
          </Radio.Group>
        </Space>
      </Card>

      <Tabs defaultActiveKey="1">
        <TabPane tab="权限组详情" key="1">
          <Card>
            {permissionGroupData.map(group => (
              <div key={group.key} style={{ marginBottom: 16 }}>
                <Title level={4}>{group.name}</Title>
                <Row gutter={[16, 16]}>
                  {group.permissions.map(perm => (
                    <Col key={perm.key} xs={24} sm={12} md={8} lg={6}>
                      <Card size="small" title={perm.name}>
                        {getPermissionTag(perm.hasPermission)}
                      </Card>
                    </Col>
                  ))}
                </Row>
                <Divider />
              </div>
            ))}
          </Card>
        </TabPane>

        <TabPane tab="模块权限" key="2">
          <Card>
            <Table
              dataSource={moduleData}
              columns={[
                {
                  title: '模块名称',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: '是否有权限',
                  dataIndex: 'hasPermission',
                  key: 'hasPermission',
                  render: (hasPermission) => getPermissionTag(hasPermission),
                },
              ]}
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane tab="菜单可见性" key="3">
          <Card>
            <Table
              dataSource={menuData}
              columns={[
                {
                  title: '菜单项',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: '是否可见',
                  dataIndex: 'visible',
                  key: 'visible',
                  render: (visible) => getPermissionTag(visible),
                },
              ]}
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane tab="权限组件演示" key="4">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card title="仅管理员可见">
                <PermissionGuard allowedRoles={['admin']}>
                  <div style={{ padding: '20px', background: '#f0f2f5', borderRadius: '4px' }}>
                    <Space>
                      <SettingOutlined />
                      <Text>这里是管理员专有内容</Text>
                    </Space>
                  </div>
                </PermissionGuard>
              </Card>
            </Col>
            
            <Col span={8}>
              <Card title="教师或管理员可见">
                <PermissionGuard allowedRoles={['admin', 'teacher']}>
                  <div style={{ padding: '20px', background: '#f0f2f5', borderRadius: '4px' }}>
                    <Space>
                      <TeamOutlined />
                      <Text>这里是教学相关内容</Text>
                    </Space>
                  </div>
                </PermissionGuard>
              </Card>
            </Col>
            
            <Col span={8}>
              <Card title="仅学生可见">
                <PermissionGuard allowedRoles={['student']}>
                  <div style={{ padding: '20px', background: '#f0f2f5', borderRadius: '4px' }}>
                    <Space>
                      <BookOutlined />
                      <Text>这里是学生专有内容</Text>
                    </Space>
                  </div>
                </PermissionGuard>
              </Card>
            </Col>
          </Row>
          
          <Divider />
          
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="基于权限点控制">
                <PermissionGuard requiredPermission={['courses.manage']}>
                  <div style={{ padding: '20px', background: '#f0f2f5', borderRadius: '4px' }}>
                    <Text>你有管理课程的权限</Text>
                  </div>
                </PermissionGuard>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card title="基于模块控制">
                <PermissionGuard requiredModule="STUDENT_LEARNING_PROGRESS">
                  <div style={{ padding: '20px', background: '#f0f2f5', borderRadius: '4px' }}>
                    <Text>你有访问学习进度模块的权限</Text>
                  </div>
                </PermissionGuard>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default PermissionDemo;