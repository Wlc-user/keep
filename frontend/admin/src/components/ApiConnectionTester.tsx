import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Spin, 
  Result, 
  Typography, 
  Space, 
  Collapse, 
  Tag, 
  Input, 
  Form, 
  Alert,
  Badge,
  Divider 
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ApiOutlined, 
  UserOutlined, 
  InfoCircleOutlined,
  PlayCircleOutlined,
  LockOutlined
} from '@ant-design/icons';
import { testApiConnection, testLoginApi } from '../utils/apiConnectionTest';
import config from '../config/env';
import mockService from '../services/mockService';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
  details?: any;
}

const ApiConnectionTester: React.FC = () => {
  const [connectionResult, setConnectionResult] = useState<TestResult | null>(null);
  const [loginResult, setLoginResult] = useState<TestResult | null>(null);
  const [isConnectionTesting, setIsConnectionTesting] = useState<boolean>(false);
  const [isLoginTesting, setIsLoginTesting] = useState<boolean>(false);
  const [loginForm] = Form.useForm();
  
  // 初始化时检查配置
  useEffect(() => {
    console.log('模拟数据模式状态:', config.USE_MOCK_DATA ? '已启用' : '已禁用');
  }, []);

  const handleTestConnection = async () => {
    setIsConnectionTesting(true);
    setConnectionResult(null);
    
    try {
      if (config.USE_MOCK_DATA) {
        // 使用模拟数据的连接测试
        console.log('使用模拟数据进行API连接测试');
        // 添加一个模拟延迟，让用户体验更真实
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setConnectionResult({
          success: true,
          message: 'API连接测试成功 (模拟数据)',
          data: {
            status: 'ok',
            version: '1.0.0',
            uptime: '2小时45分钟',
            environment: 'development',
            timestamp: new Date().toISOString()
          }
        });
      } else {
        // 使用真实API的连接测试
        const result = await testApiConnection();
        setConnectionResult(result);
      }
    } catch (error: any) {
      setConnectionResult({
        success: false,
        message: '连接测试失败',
        error: error.message || '未知错误'
      });
    } finally {
      setIsConnectionTesting(false);
    }
  };

  const handleTestLogin = async (values: { username: string; password: string }) => {
    setIsLoginTesting(true);
    setLoginResult(null);
    
    try {
      if (config.USE_MOCK_DATA) {
        // 使用模拟数据的登录测试
        console.log('使用模拟数据进行登录测试');
        // 添加一个模拟延迟，让用户体验更真实
        await new Promise(resolve => setTimeout(resolve, 800));
        
        try {
          // 直接使用mockService.login
          const mockLoginData = await mockService.login(values.username, values.password);
          
          setLoginResult({
            success: true,
            message: '登录API测试成功 (模拟数据)',
            data: {
              token: mockLoginData.token,
              userId: mockLoginData.userId,
              username: mockLoginData.username,
              name: mockLoginData.name,
              role: mockLoginData.role
            }
          });
        } catch (mockError: any) {
          // 处理模拟登录的错误
          setLoginResult({
            success: false,
            message: '登录测试失败 (模拟数据)',
            error: mockError.message || '用户名或密码错误'
          });
        }
      } else {
        // 使用真实API的登录测试
        const result = await testLoginApi(values.username, values.password);
        setLoginResult(result);
      }
    } catch (error: any) {
      setLoginResult({
        success: false,
        message: '登录测试失败',
        error: error.message || '未知错误'
      });
    } finally {
      setIsLoginTesting(false);
    }
  };

  const renderConnectionStatus = () => {
    if (connectionResult === null) {
      return <Badge status="default" text="未测试" />;
    }
    
    return connectionResult.success 
      ? <Badge status="success" text="连接成功" /> 
      : <Badge status="error" text="连接失败" />;
  };

  const renderLoginStatus = () => {
    if (loginResult === null) {
      return <Badge status="default" text="未测试" />;
    }
    
    return loginResult.success 
      ? <Badge status="success" text="登录成功" /> 
      : <Badge status="error" text="登录失败" />;
  };

  const renderTestResult = (result: TestResult | null) => {
    if (!result) return null;

    return (
      <div style={{ marginTop: 16 }}>
        {result.success ? (
          <Result
            status="success"
            title="测试成功"
            subTitle={result.message}
            icon={<CheckCircleOutlined />}
            extra={
              <Collapse ghost>
                <Panel header="查看详细信息" key="1">
                  <pre style={{ 
                    background: '#f6f8fa', 
                    padding: 16, 
                    borderRadius: 4,
                    overflowX: 'auto' 
                  }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </Panel>
              </Collapse>
            }
          />
        ) : (
          <Result
            status="error"
            title="测试失败"
            subTitle={result.message}
            icon={<CloseCircleOutlined />}
            extra={
              <Collapse ghost>
                <Panel header="查看错误详情" key="1">
                  <div style={{ 
                    background: '#fff2f0', 
                    padding: 16, 
                    borderRadius: 4,
                    border: '1px solid #ffccc7',
                    overflowX: 'auto' 
                  }}>
                    <Text type="danger">
                      {result.error instanceof Object 
                        ? JSON.stringify(result.error, null, 2) 
                        : result.error || '未知错误'}
                    </Text>
                    {result.details && (
                      <div style={{ marginTop: 8 }}>
                        <Divider dashed />
                        <Paragraph>
                          <Text strong>详细信息：</Text>
                        </Paragraph>
                        <pre>
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </Panel>
              </Collapse>
            }
          />
        )}
      </div>
    );
  };

  return (
    <div className="api-connection-tester">
      {config.USE_MOCK_DATA && (
        <Alert
          message="注意：当前正在使用模拟数据"
          description="系统当前配置为使用模拟数据，API测试将显示模拟结果，不会真正连接到后端服务。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Card
        title={
          <Space>
            <ApiOutlined />
            <span>API连接测试</span>
          </Space>
        }
        variant="outlined"
        extra={renderConnectionStatus()}
        style={{ marginBottom: 24 }}
      >
        <Paragraph>
          测试与后端API的基本连接。{config.USE_MOCK_DATA ? '(当前为模拟数据模式)' : '这将验证服务器是否在线并正确响应请求。'}
        </Paragraph>
        
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={handleTestConnection}
          loading={isConnectionTesting}
        >
          测试API连接
        </Button>
        
        {isConnectionTesting && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
            <div style={{ marginTop: 16 }}>正在测试连接...</div>
          </div>
        )}
        
        {renderTestResult(connectionResult)}
      </Card>
      
      <Card
        title={
          <Space>
            <UserOutlined />
            <span>API登录测试</span>
          </Space>
        }
        variant="outlined"
        extra={renderLoginStatus()}
      >
        <Paragraph>
          测试用户登录API。{config.USE_MOCK_DATA ? '(当前为模拟数据模式)' : '这将验证身份验证系统是否正常工作。'}
        </Paragraph>
        
        <Form
          form={loginForm}
          onFinish={handleTestLogin}
          layout="vertical"
          initialValues={{ username: 'admin', password: 'admin123' }}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              prefix={<UserOutlined className="site-form-item-icon" />} 
              placeholder="用户名" 
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="密码" 
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoginTesting}
              icon={<PlayCircleOutlined />}
            >
              测试登录
            </Button>
          </Form.Item>
        </Form>
        
        {config.USE_MOCK_DATA && (
          <div style={{ marginTop: 8, marginBottom: 16 }}>
            <Text type="secondary">
              <InfoCircleOutlined style={{ marginRight: 8 }} />
              测试环境可用账户：admin / teacher / student，密码均为 admin123
            </Text>
          </div>
        )}
        
        {isLoginTesting && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
            <div style={{ marginTop: 16 }}>正在测试登录...</div>
          </div>
        )}
        
        {renderTestResult(loginResult)}
      </Card>
    </div>
  );
};

export default ApiConnectionTester; 