import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Space, 
  Input, 
  Form, 
  Select, 
  Typography, 
  Tag, 
  Divider, 
  Collapse, 
  Spin, 
  Alert, 
  Badge,
  Tabs,
  Result
} from 'antd';
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ApiOutlined,
  DatabaseOutlined,
  SettingOutlined,
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { testApiConnection, testLoginApi, testCourseListApi, testStudentEvaluationApi, 
  testClassEvaluationApi, testKnowledgeGraphApi, testMaterialApi, testUserManagementApi, 
  testNotificationApi, testSystemSettingsApi, testReportApi, testApiEndpoints,
  testApiPerformance, checkApiVersion, validateApiConfig, testFileUpload, 
  testDatabaseConnection, testCacheSystem, testApiPermissions, testBatchOperation } from '../utils/apiConnectionTest';
import { checkReactVersion, singletonReact } from '../utils/reactUtils';
import config from '../config/env';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

// 使用单例 React 实例
const React2 = singletonReact;

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

const ApiTestPage: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [endpointResults, setEndpointResults] = useState<TestResult[]>([]);
  const [performanceResults, setPerformanceResults] = useState<TestResult[]>([]);
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [loginForm] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [activeKey, setActiveKey] = useState<string[]>(['1']);
  
  // 组件加载时检查 React 版本
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      checkReactVersion();
    }
  }, []);

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setCurrentTest('API连接测试');
    setIsLoading(true);
    
    try {
      const result = await testApiConnection();
      
      if (result.success) {
        setConnectionStatus('success');
        addTestResult(result);
      } else {
        setConnectionStatus('error');
        addTestResult(result);
      }
    } catch (error: any) {
      setConnectionStatus('error');
      addTestResult({
        success: false,
        message: '测试过程中发生错误',
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async () => {
    try {
      setIsLoading(true);
      setCurrentTest('登录API测试');
      
      const values = await loginForm.validateFields();
      
      const result = await testLoginApi(values.username, values.password);
      addTestResult(result);
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      
      addTestResult({
        success: false,
        message: '登录测试过程中发生错误',
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runTest = async (testName: string, testFunction: () => Promise<TestResult>) => {
    setIsLoading(true);
    setCurrentTest(testName);
    
    try {
      const result = await testFunction();
      addTestResult(result);
    } catch (error: any) {
      addTestResult({
        success: false,
        message: `${testName}过程中发生错误`,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEndpoints = async () => {
    setIsLoading(true);
    setCurrentTest('API端点批量测试');
    
    try {
      const results = await testApiEndpoints();
      setEndpointResults(results);
    } catch (error: any) {
      addTestResult({
        success: false,
        message: 'API端点测试过程中发生错误',
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPerformance = async () => {
    setIsLoading(true);
    setCurrentTest('API性能测试');
    
    try {
      const results = await testApiPerformance();
      setPerformanceResults(results);
    } catch (error: any) {
      addTestResult({
        success: false,
        message: 'API性能测试过程中发生错误',
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTestResult = useCallback((result: TestResult) => {
    setTestResults(prev => [result, ...prev]);
  }, []);

  const renderTestResults = useCallback(() => {
    const columns = [
      {
        title: '状态',
        dataIndex: 'success',
        key: 'success',
        render: (success: boolean) => (
          success ? 
            <Tag icon={<CheckCircleOutlined />} color="success">成功</Tag> : 
            <Tag icon={<CloseCircleOutlined />} color="error">失败</Tag>
        )
      },
      {
        title: '测试名称',
        dataIndex: 'message',
        key: 'message',
      },
      {
        title: '详情',
        key: 'details',
        render: (_, record: TestResult) => (
          <Collapse ghost>
            <Panel header="查看详情" key="1">
              {record.success ? (
                <pre>{JSON.stringify(record.data, null, 2)}</pre>
              ) : (
                <pre style={{ color: 'red' }}>{JSON.stringify(record.error, null, 2)}</pre>
              )}
            </Panel>
          </Collapse>
        ),
      },
      {
        title: '时间',
        key: 'time',
        render: () => (
          <span>{new Date().toLocaleTimeString()}</span>
        ),
      },
    ];

    return (
      <Table 
        dataSource={testResults.map((item, index) => ({ ...item, key: index }))} 
        columns={columns} 
        pagination={{ pageSize: 5 }}
      />
    );
  }, [testResults]);

  const renderEndpointResults = useCallback(() => {
    const columns = [
      {
        title: '状态',
        dataIndex: 'success',
        key: 'success',
        render: (success: boolean) => (
          success ? 
            <Tag icon={<CheckCircleOutlined />} color="success">成功</Tag> : 
            <Tag icon={<CloseCircleOutlined />} color="error">失败</Tag>
        )
      },
      {
        title: '端点',
        dataIndex: 'message',
        key: 'message',
      },
      {
        title: '详情',
        key: 'details',
        render: (_, record: TestResult) => (
          <Collapse ghost>
            <Panel header="查看详情" key="1">
              {record.success ? (
                <pre>{JSON.stringify(record.data, null, 2)}</pre>
              ) : (
                <pre style={{ color: 'red' }}>{JSON.stringify(record.error, null, 2)}</pre>
              )}
            </Panel>
          </Collapse>
        ),
      }
    ];

    return (
      <Table 
        dataSource={endpointResults.map((item, index) => ({ ...item, key: index }))} 
        columns={columns} 
        pagination={{ pageSize: 10 }}
      />
    );
  }, [endpointResults]);

  const renderPerformanceResults = useCallback(() => {
    const columns = [
      {
        title: '状态',
        dataIndex: 'success',
        key: 'success',
        render: (success: boolean) => (
          success ? 
            <Tag icon={<CheckCircleOutlined />} color="success">成功</Tag> : 
            <Tag icon={<CloseCircleOutlined />} color="error">失败</Tag>
        )
      },
      {
        title: '端点',
        dataIndex: 'message',
        key: 'message',
      },
      {
        title: '响应时间',
        key: 'responseTime',
        render: (_, record: TestResult) => (
          record.success ? (
            <span>{record.data?.responseTime}</span>
          ) : (
            <Tag color="error">测试失败</Tag>
          )
        ),
      },
      {
        title: '性能评估',
        key: 'status',
        render: (_, record: TestResult) => {
          if (!record.success) return <Tag color="error">测试失败</Tag>;
          
          const status = record.data?.status;
          if (status === '良好') return <Tag color="success">良好</Tag>;
          if (status === '一般') return <Tag color="warning">一般</Tag>;
          return <Tag color="error">较慢</Tag>;
        },
      }
    ];

    return (
      <Table 
        dataSource={performanceResults.map((item, index) => ({ ...item, key: index }))} 
        columns={columns} 
        pagination={{ pageSize: 5 }}
      />
    );
  }, [performanceResults]);

  const renderConnectionStatus = useCallback(() => {
    switch (connectionStatus) {
      case 'idle':
        return <Badge status="default" text="未测试" />;
      case 'testing':
        return <Badge status="processing" text="测试中..." />;
      case 'success':
        return <Badge status="success" text="连接成功" />;
      case 'error':
        return <Badge status="error" text="连接失败" />;
      default:
        return null;
    }
  }, [connectionStatus]);

  // 基础测试内容
  const renderBasicTestContent = () => (
    <>
      <Card variant="outlined" style={{ marginBottom: 16 }}>
        <Title level={5}>API 连接测试</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />} 
            onClick={handleTestConnection}
            loading={connectionStatus === 'testing'}
          >
            测试连接
          </Button>
          <div>状态：{renderConnectionStatus()}</div>
          {connectionStatus !== 'idle' && (
            <Alert
              message={connectionStatus === 'success' ? '连接成功' : '连接失败'}
              type={connectionStatus === 'success' ? 'success' : 'error'}
              showIcon
            />
          )}
        </Space>
      </Card>
      
      <Card variant="outlined" style={{ marginBottom: 16 }}>
        <Title level={5}>API 登录测试</Title>
        <Form
          form={loginForm}
          layout="vertical"
          onFinish={handleTestLogin}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={isLoading && currentTest === '登录API测试'}
            >
              测试登录
            </Button>
          </Form.Item>
        </Form>
        
        {config.USE_MOCK_DATA && (
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              开发模式下可用账户：admin / teacher / student，密码：admin123
            </Text>
          </div>
        )}
      </Card>
    </>
  );

  // API功能测试内容
  const renderApiTestContent = () => (
    <Card variant="outlined" style={{ marginBottom: 16 }}>
      <Title level={5}>功能模块测试</Title>
      <Divider orientation="left">课程管理</Divider>
      <Space wrap>
        <Button 
          icon={<BookOutlined />} 
          onClick={() => runTest('课程列表API测试', testCourseListApi)}
          loading={isLoading && currentTest === '课程列表API测试'}
        >
          测试课程列表
        </Button>
        <Button 
          icon={<BookOutlined />}
          onClick={() => runTest('学生评估API测试', testStudentEvaluationApi)}
          loading={isLoading && currentTest === '学生评估API测试'}
        >
          测试学生评估
        </Button>
        <Button 
          icon={<BookOutlined />}
          onClick={() => runTest('班级评估API测试', testClassEvaluationApi)}
          loading={isLoading && currentTest === '班级评估API测试'}
        >
          测试班级评估
        </Button>
      </Space>
      
      <Divider orientation="left">用户与资源</Divider>
      <Space wrap>
        <Button 
          icon={<UserOutlined />}
          onClick={() => runTest('用户管理API测试', testUserManagementApi)}
          loading={isLoading && currentTest === '用户管理API测试'}
        >
          测试用户管理
        </Button>
        <Button 
          icon={<ApiOutlined />}
          onClick={() => runTest('素材管理API测试', testMaterialApi)}
          loading={isLoading && currentTest === '素材管理API测试'}
        >
          测试素材管理
        </Button>
        <Button 
          icon={<ApiOutlined />}
          onClick={() => runTest('知识图谱API测试', testKnowledgeGraphApi)}
          loading={isLoading && currentTest === '知识图谱API测试'}
        >
          测试知识图谱
        </Button>
      </Space>
      
      <Divider orientation="left">系统功能</Divider>
      <Space wrap>
        <Button 
          icon={<ClockCircleOutlined />}
          onClick={() => runTest('通知API测试', testNotificationApi)}
          loading={isLoading && currentTest === '通知API测试'}
        >
          测试通知系统
        </Button>
        <Button 
          icon={<SettingOutlined />}
          onClick={() => runTest('系统设置API测试', testSystemSettingsApi)}
          loading={isLoading && currentTest === '系统设置API测试'}
        >
          测试系统设置
        </Button>
        <Button 
          icon={<DatabaseOutlined />}
          onClick={() => runTest('数据库连接测试', testDatabaseConnection)}
          loading={isLoading && currentTest === '数据库连接测试'}
        >
          测试数据库连接
        </Button>
      </Space>
    </Card>
  );

  // 性能测试内容
  const renderPerformanceTestContent = () => (
    <>
      <Card variant="outlined" style={{ marginBottom: 16 }}>
        <Title level={5}>批量测试</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<RocketOutlined />}
            onClick={handleTestEndpoints}
            loading={isLoading && currentTest === 'API端点批量测试'}
          >
            测试所有API端点
          </Button>
          <Button 
            icon={<ExperimentOutlined />}
            onClick={handleTestPerformance}
            loading={isLoading && currentTest === 'API性能测试'}
          >
            测试API性能
          </Button>
        </Space>
      </Card>
        
      {endpointResults.length > 0 && (
        <Card variant="outlined" style={{ marginBottom: 16 }}>
          <Title level={5}>端点测试结果</Title>
          {renderEndpointResults()}
        </Card>
      )}
      
      {performanceResults.length > 0 && (
        <Card variant="outlined" style={{ marginBottom: 16 }}>
          <Title level={5}>性能测试结果</Title>
          {renderPerformanceResults()}
        </Card>
      )}
    </>
  );

  // 定义选项卡内容
  const tabItems = [
    {
      key: 'basic',
      label: '基础测试',
      children: renderBasicTestContent()
    },
    {
      key: 'api',
      label: '接口测试',
      children: renderApiTestContent()
    },
    {
      key: 'performance',
      label: '性能测试',
      children: renderPerformanceTestContent()
    }
  ];

  return (
    <div>
      <PageHeader
        title="API 测试"
        breadcrumb={[
          { title: '首页', path: '/' },
          { title: 'API 测试' }
        ]}
      />
      
      {config.USE_MOCK_DATA && (
        <Alert
          message="开发模式：当前使用模拟数据"
          description="在开发环境中，系统将在API调用失败时自动使用模拟数据。测试结果可能不完全反映真实后端状态。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Tabs 
        items={tabItems}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        style={{ marginBottom: 16 }}
      />
      
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin>
            <div style={{ padding: '30px 50px' }}>
              <p>正在执行: {currentTest}</p>
            </div>
          </Spin>
        </div>
      )}
      
      <Card variant="outlined">
        <Title level={5}>测试结果</Title>
        {renderTestResults()}
      </Card>
    </div>
  );
};

export default ApiTestPage; 