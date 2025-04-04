import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  Divider, 
  Input, 
  Typography, 
  Space, 
  Collapse, 
  Spin, 
  List, 
  Tag, 
  message,
  Select,
  Form,
  Row,
  Col,
  Radio,
  Empty
} from 'antd';
import { 
  ApiOutlined, 
  SendOutlined, 
  ReloadOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  CodeOutlined,
  RightCircleOutlined
} from '@ant-design/icons';
import apiService from '../services/apiService';
import examService from '../services/examService';
import notificationService from '../services/notificationService';
import knowledgeGraphService from '../services/knowledgeGraphService';
import teacherGroupService from '../services/teacherGroupService';
import PageHeader from '../components/PageHeader';
import { useAppContext } from '../contexts/AppContext';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

interface TestResult {
  name: string;
  success: boolean;
  data?: any;
  error?: any;
  time: number;
}

interface ApiGroup {
  name: string;
  description: string;
  methods: ApiMethod[];
}

interface ApiMethod {
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  params?: Record<string, any>;
  body?: Record<string, any>;
  service: string;
  serviceMethod: string;
}

const ApiTestPage: React.FC = () => {
  const { user } = useAppContext();
  const [selectedGroup, setSelectedGroup] = useState<string>('notifications');
  const [selectedMethod, setSelectedMethod] = useState<ApiMethod | null>(null);
  const [customParams, setCustomParams] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const apiGroups: ApiGroup[] = [
    {
      name: 'notifications',
      description: '通知服务API',
      methods: [
        {
          name: '获取通知列表',
          description: '获取当前用户的通知列表',
          method: 'GET',
          path: '/notifications',
          params: { page: 1, pageSize: 10 },
          service: 'notificationService',
          serviceMethod: 'getNotifications'
        },
        {
          name: '获取未读通知数量',
          description: '获取当前用户的未读通知数量',
          method: 'GET',
          path: '/notifications/unread-count',
          service: 'notificationService',
          serviceMethod: 'getUnreadCount'
        },
        {
          name: '发送通知',
          description: '创建并发送新通知',
          method: 'POST',
          path: '/notifications',
          body: {
            title: '测试通知',
            content: '这是一条测试通知内容',
            type: 'info',
            importance: 'medium',
            category: 'system'
          },
          service: 'notificationService',
          serviceMethod: 'sendNotification'
        }
      ]
    },
    {
      name: 'exams',
      description: '考试服务API',
      methods: [
        {
          name: '获取考试列表',
          description: '获取考试列表，根据用户角色自动过滤',
          method: 'GET',
          path: '/exams',
          params: { page: 1, pageSize: 10 },
          service: 'examService',
          serviceMethod: 'getExams'
        },
        {
          name: '获取考试分析',
          description: '获取指定考试的整体分析数据',
          method: 'GET',
          path: '/exam-analytics/overall/:examId',
          params: { examId: '' },
          service: 'apiService',
          serviceMethod: 'exams.analytics.getOverall'
        }
      ]
    },
    {
      name: 'knowledgeGraph',
      description: '知识图谱API',
      methods: [
        {
          name: '获取知识图谱列表',
          description: '获取所有知识图谱',
          method: 'GET',
          path: '/knowledge-graphs',
          params: { page: 1, pageSize: 10 },
          service: 'knowledgeGraphService',
          serviceMethod: 'getKnowledgeGraphs'
        },
        {
          name: '获取学习路径',
          description: '获取指定知识图谱的学习路径',
          method: 'GET',
          path: '/learning-paths',
          params: { graphId: '', page: 1, pageSize: 10 },
          service: 'knowledgeGraphService',
          serviceMethod: 'getLearningPaths'
        }
      ]
    },
    {
      name: 'teacherGroups',
      description: '教师分组API',
      methods: [
        {
          name: '获取教师分组列表',
          description: '获取所有教师分组',
          method: 'GET',
          path: '/teacher-groups',
          params: { page: 1, pageSize: 10 },
          service: 'teacherGroupService',
          serviceMethod: 'getTeacherGroups'
        },
        {
          name: '获取分组活动',
          description: '获取指定分组的活动列表',
          method: 'GET',
          path: '/teacher-groups/:groupId/activities',
          params: { groupId: '', page: 1, pageSize: 10 },
          service: 'teacherGroupService',
          serviceMethod: 'getGroupActivities'
        }
      ]
    }
  ];

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value);
    setSelectedMethod(null);
    setCustomParams({});
  };

  const handleMethodSelect = (method: ApiMethod) => {
    setSelectedMethod(method);
    if (method.params) {
      setCustomParams(method.params);
    } else if (method.body) {
      setCustomParams(method.body);
    } else {
      setCustomParams({});
    }
  };

  const handleParamChange = (key: string, value: any) => {
    setCustomParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const executeTest = async () => {
    if (!selectedMethod) return;

    setLoading(true);
    const startTime = Date.now();

    try {
      let result;
      
      // 根据选择的服务和方法执行API调用
      switch (selectedMethod.service) {
        case 'notificationService':
          result = await executeNotificationService(selectedMethod.serviceMethod, customParams);
          break;
        case 'examService':
          result = await executeExamService(selectedMethod.serviceMethod, customParams);
          break;
        case 'knowledgeGraphService':
          result = await executeKnowledgeGraphService(selectedMethod.serviceMethod, customParams);
          break;
        case 'teacherGroupService':
          result = await executeTeacherGroupService(selectedMethod.serviceMethod, customParams);
          break;
        case 'apiService':
          result = await executeApiService(selectedMethod.serviceMethod, customParams);
          break;
        default:
          throw new Error(`未知的服务: ${selectedMethod.service}`);
      }

      const endTime = Date.now();
      
      // 添加测试结果
      setTestResults(prev => [
        {
          name: selectedMethod.name,
          success: true,
          data: result,
          time: endTime - startTime
        },
        ...prev
      ]);
      
      message.success('API测试成功');
    } catch (error) {
      const endTime = Date.now();
      console.error('API测试失败:', error);
      
      // 添加错误结果
      setTestResults(prev => [
        {
          name: selectedMethod.name,
          success: false,
          error,
          time: endTime - startTime
        },
        ...prev
      ]);
      
      message.error('API测试失败');
    } finally {
      setLoading(false);
    }
  };

  // 执行通知服务方法
  const executeNotificationService = async (method: string, params: any) => {
    switch (method) {
      case 'getNotifications':
        return await notificationService.getNotifications(params);
      case 'getUnreadCount':
        return await notificationService.getUnreadCount();
      case 'sendNotification':
        return await notificationService.sendNotification(params);
      default:
        throw new Error(`未知的通知服务方法: ${method}`);
    }
  };

  // 执行考试服务方法
  const executeExamService = async (method: string, params: any) => {
    switch (method) {
      case 'getExams':
        return await examService.getExams(params);
      default:
        throw new Error(`未知的考试服务方法: ${method}`);
    }
  };

  // 执行知识图谱服务方法
  const executeKnowledgeGraphService = async (method: string, params: any) => {
    switch (method) {
      case 'getKnowledgeGraphs':
        return await knowledgeGraphService.getKnowledgeGraphs(params);
      case 'getLearningPaths':
        return await knowledgeGraphService.getLearningPaths(params);
      default:
        throw new Error(`未知的知识图谱服务方法: ${method}`);
    }
  };

  // 执行教师分组服务方法
  const executeTeacherGroupService = async (method: string, params: any) => {
    switch (method) {
      case 'getTeacherGroups':
        return await teacherGroupService.getTeacherGroups(params);
      case 'getGroupActivities':
        const { groupId, ...queryParams } = params;
        return await teacherGroupService.getGroupActivities(groupId, queryParams);
      default:
        throw new Error(`未知的教师分组服务方法: ${method}`);
    }
  };

  // 执行API服务方法
  const executeApiService = async (methodPath: string, params: any) => {
    // 解析方法路径，例如 'exams.analytics.getOverall'
    const parts = methodPath.split('.');
    let service: any = apiService;
    
    // 遍历路径，获取嵌套的方法
    for (let i = 0; i < parts.length - 1; i++) {
      service = service[parts[i]];
      if (!service) {
        throw new Error(`未找到API服务路径: ${methodPath}`);
      }
    }
    
    // 执行最终方法
    const method = service[parts[parts.length - 1]];
    if (typeof method !== 'function') {
      throw new Error(`API方法不是一个函数: ${methodPath}`);
    }
    
    // 处理特殊参数
    if (methodPath === 'exams.analytics.getOverall') {
      return await method(params.examId);
    }
    
    return await method(params);
  };

  // 清除测试结果
  const clearResults = () => {
    setTestResults([]);
  };

  // 显示当前用户信息
  const userInfo = user ? (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Title level={5}>当前用户信息</Title>
      <Text>用户ID: {user.id}</Text><br />
      <Text>用户名: {user.username}</Text><br />
      <Text>角色: {user.role}</Text><br />
      <Text>名称: {user.name}</Text>
    </Card>
  ) : (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Text type="warning">未登录，某些API调用可能会失败</Text>
    </Card>
  );

  // 渲染API方法列表
  const renderApiMethods = () => {
    const group = apiGroups.find(g => g.name === selectedGroup);
    if (!group) return null;

    return (
      <List
        bordered
        dataSource={group.methods}
        renderItem={method => (
          <List.Item
            key={method.name}
            onClick={() => handleMethodSelect(method)}
            className={selectedMethod?.name === method.name ? 'selected-api-method' : ''}
            style={{ 
              cursor: 'pointer', 
              backgroundColor: selectedMethod?.name === method.name ? '#f0f5ff' : 'transparent',
              borderLeft: selectedMethod?.name === method.name ? '3px solid #1890ff' : 'none',
              paddingLeft: selectedMethod?.name === method.name ? 13 : 16
            }}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Tag color={getMethodColor(method.method)}>{method.method}</Tag>
                  <Text strong>{method.name}</Text>
                </Space>
              }
              description={
                <>
                  <Text type="secondary">{method.description}</Text><br />
                  <Text code>{method.path}</Text>
                </>
              }
            />
            <RightCircleOutlined />
          </List.Item>
        )}
      />
    );
  };

  // 获取HTTP方法对应的颜色
  const getMethodColor = (method: string): string => {
    switch (method) {
      case 'GET': return 'blue';
      case 'POST': return 'green';
      case 'PUT': return 'orange';
      case 'DELETE': return 'red';
      default: return 'default';
    }
  };

  // 渲染参数表单
  const renderParamsForm = () => {
    if (!selectedMethod) return null;

    const hasParams = selectedMethod.params && Object.keys(selectedMethod.params).length > 0;
    const hasBody = selectedMethod.body && Object.keys(selectedMethod.body).length > 0;

    if (!hasParams && !hasBody) {
      return <Text>无需参数</Text>;
    }

    const paramsToRender = hasParams ? selectedMethod.params : selectedMethod.body;

    return (
      <Form layout="vertical">
        {Object.entries(paramsToRender || {}).map(([key, value]) => (
          <Form.Item key={key} label={key} style={{ marginBottom: 12 }}>
            <Input
              value={customParams[key] || ''}
              onChange={(e) => handleParamChange(key, e.target.value)}
              placeholder={`${key}`}
            />
          </Form.Item>
        ))}
      </Form>
    );
  };

  // 渲染测试结果
  const renderTestResults = () => {
    if (testResults.length === 0) {
      return <Empty description="未执行任何测试" />;
    }

    return (
      <Collapse defaultActiveKey={['0']}>
        {testResults.map((result, index) => (
          <Panel
            key={index.toString()}
            header={
              <Space>
                {result.success ? (
                  <CheckCircleOutlined style={{ color: 'green' }} />
                ) : (
                  <CloseCircleOutlined style={{ color: 'red' }} />
                )}
                <Text strong>{result.name}</Text>
                <Tag color={result.success ? 'green' : 'red'}>
                  {result.success ? '成功' : '失败'}
                </Tag>
                <Text type="secondary">{result.time}ms</Text>
              </Space>
            }
          >
            <Card>
              {result.success ? (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f6f8fa', borderRadius: '4px', overflow: 'auto' }}>
                  <pre><code className="language-json" jsx="true">
                    {JSON.stringify(result.data, null, 2)}
                  </code></pre>
                </div>
              ) : (
                <pre style={{ maxHeight: 400, overflow: 'auto', color: 'red' }}>
                  {JSON.stringify(result.error, null, 2)}
                </pre>
              )}
            </Card>
          </Panel>
        ))}
      </Collapse>
    );
  };

  return (
    <div className="api-test-page">
      <PageHeader
        title="API测试"
        icon={<ApiOutlined />}
        description="测试各种API服务的连接状态和数据格式"
      />

      <Row gutter={16}>
        <Col span={24} lg={8}>
          <Card title="API服务" style={{ marginBottom: 16 }}>
            {userInfo}
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>选择API分组：</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={selectedGroup}
                onChange={handleGroupChange}
              >
                {apiGroups.map(group => (
                  <Option key={group.name} value={group.name}>
                    {group.description}
                  </Option>
                ))}
              </Select>
            </div>
            
            <Divider orientation="left">可用方法</Divider>
            {renderApiMethods()}
          </Card>
        </Col>
        
        <Col span={24} lg={16}>
          <Card
            title={
              selectedMethod ? (
                <Space>
                  <Tag color={getMethodColor(selectedMethod.method)}>{selectedMethod.method}</Tag>
                  <Text>{selectedMethod.name}</Text>
                  <Text code>{selectedMethod.path}</Text>
                </Space>
              ) : '选择API方法'
            }
            style={{ marginBottom: 16 }}
            extra={
              <Space>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={loading}
                  disabled={!selectedMethod}
                  onClick={executeTest}
                >
                  发送请求
                </Button>
              </Space>
            }
          >
            {selectedMethod ? (
              <>
                <Paragraph>{selectedMethod.description}</Paragraph>
                <Divider orientation="left">参数设置</Divider>
                {renderParamsForm()}
              </>
            ) : (
              <Empty description="请从左侧选择API方法" />
            )}
          </Card>
          
          <Card
            title="测试结果"
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={clearResults}
                disabled={testResults.length === 0}
              >
                清除结果
              </Button>
            }
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text>正在请求API...</Text>
                </div>
              </div>
            ) : (
              renderTestResults()
            )}
          </Card>
        </Col>
      </Row>
      
      <style jsx>{`
        .selected-api-method {
          transition: all 0.3s;
        }
      `}</style>
    </div>
  );
};

export default ApiTestPage; 