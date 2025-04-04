import React, { useState } from 'react';
import { Card, Button, Alert, Spin, Typography, Space, Divider, Table, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, ApiOutlined, DatabaseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { runAllTests, testBackendConnection, testDatabaseConnection, getSystemInfo } from '../utils/apiTest';

const { Title, Text, Paragraph } = Typography;

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

/**
 * 连接测试组件
 * 用于测试前后端连接状态
 */
const ConnectionTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [backendResult, setBackendResult] = useState<TestResult | null>(null);
  const [databaseResult, setDatabaseResult] = useState<TestResult | null>(null);
  const [systemInfo, setSystemInfo] = useState<TestResult | null>(null);
  
  // 测试后端连接
  const handleTestBackend = async () => {
    setLoading(true);
    setBackendResult(null);
    
    try {
      const result = await testBackendConnection();
      setBackendResult(result);
    } catch (error) {
      setBackendResult({
        success: false,
        message: '测试过程中发生错误',
        error
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 测试数据库连接
  const handleTestDatabase = async () => {
    setLoading(true);
    setDatabaseResult(null);
    
    try {
      const result = await testDatabaseConnection();
      setDatabaseResult(result);
    } catch (error) {
      setDatabaseResult({
        success: false,
        message: '测试过程中发生错误',
        error
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 获取系统信息
  const handleGetSystemInfo = async () => {
    setLoading(true);
    setSystemInfo(null);
    
    try {
      const result = await getSystemInfo();
      setSystemInfo(result);
    } catch (error) {
      setSystemInfo({
        success: false,
        message: '获取系统信息失败',
        error
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 运行所有测试
  const handleRunAllTests = async () => {
    setLoading(true);
    setBackendResult(null);
    setDatabaseResult(null);
    setSystemInfo(null);
    
    try {
      const results = await runAllTests();
      setBackendResult(results.backendConnection);
      setDatabaseResult(results.databaseConnection);
      setSystemInfo(results.systemInfo);
    } catch (error) {
      console.error('运行测试失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 渲染测试结果
  const renderTestResult = (result: TestResult | null, title: string, icon: React.ReactNode) => {
    if (!result) {
      return null;
    }
    
    return (
      <Alert
        type={result.success ? 'success' : 'error'}
        message={
          <Space>
            {icon}
            <Text strong>{title}</Text>
          </Space>
        }
        description={
          <>
            <Paragraph>{result.message}</Paragraph>
            {result.data && (
              <div style={{ marginTop: 8 }}>
                <Text strong>响应数据:</Text>
                <pre style={{ 
                  background: 'var(--component-background, #f5f5f5)', 
                  padding: 8, 
                  borderRadius: 4,
                  maxHeight: 200,
                  overflow: 'auto'
                }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
            {result.error && (
              <div style={{ marginTop: 8 }}>
                <Text strong type="danger">错误信息:</Text>
                <pre style={{ 
                  background: 'var(--component-background, #f5f5f5)', 
                  padding: 8, 
                  borderRadius: 4,
                  maxHeight: 200,
                  overflow: 'auto'
                }}>
                  {JSON.stringify(result.error, null, 2)}
                </pre>
              </div>
            )}
          </>
        }
        showIcon
      />
    );
  };
  
  // 渲染系统信息表格
  const renderSystemInfoTable = () => {
    if (!systemInfo || !systemInfo.success || !systemInfo.data) {
      return null;
    }
    
    const { data } = systemInfo;
    
    const columns = [
      {
        title: '属性',
        dataIndex: 'property',
        key: 'property',
        width: '30%',
      },
      {
        title: '值',
        dataIndex: 'value',
        key: 'value',
      },
    ];
    
    const dataSource = [
      {
        key: '1',
        property: '应用名称',
        value: data.applicationName,
      },
      {
        key: '2',
        property: '版本',
        value: data.version,
      },
      {
        key: '3',
        property: '环境',
        value: (
          <Tag color={data.environment === 'Development' ? 'blue' : data.environment === 'Production' ? 'green' : 'orange'}>
            {data.environment}
          </Tag>
        ),
      },
      {
        key: '4',
        property: '框架版本',
        value: data.frameworkVersion,
      },
      {
        key: '5',
        property: '操作系统',
        value: data.operatingSystem,
      },
      {
        key: '6',
        property: '服务器时间',
        value: new Date(data.serverTime).toLocaleString(),
      },
    ];
    
    return (
      <Table 
        columns={columns} 
        dataSource={dataSource} 
        pagination={false}
        size="small"
        bordered
      />
    );
  };
  
  return (
    <Card
      title={
        <Space>
          <SyncOutlined spin={loading} />
          <span>前后端连接测试</span>
        </Space>
      }
      extra={
        <Button 
          type="primary" 
          onClick={handleRunAllTests} 
          loading={loading}
        >
          运行所有测试
        </Button>
      }
    >
      <Spin spinning={loading}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Space align="center" style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<ApiOutlined />} 
                onClick={handleTestBackend}
                loading={loading}
              >
                测试后端连接
              </Button>
              <Text type="secondary">测试前端是否能够成功连接到后端API</Text>
            </Space>
            {renderTestResult(backendResult, '后端连接测试', <ApiOutlined />)}
          </div>
          
          <Divider />
          
          <div>
            <Space align="center" style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<DatabaseOutlined />} 
                onClick={handleTestDatabase}
                loading={loading}
              >
                测试数据库连接
              </Button>
              <Text type="secondary">测试后端是否能够成功连接到数据库</Text>
            </Space>
            {renderTestResult(databaseResult, '数据库连接测试', <DatabaseOutlined />)}
          </div>
          
          <Divider />
          
          <div>
            <Space align="center" style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<InfoCircleOutlined />} 
                onClick={handleGetSystemInfo}
                loading={loading}
              >
                获取系统信息
              </Button>
              <Text type="secondary">获取后端系统的详细信息</Text>
            </Space>
            {renderTestResult(systemInfo, '系统信息', <InfoCircleOutlined />)}
            {renderSystemInfoTable()}
          </div>
        </Space>
      </Spin>
    </Card>
  );
};

export default ConnectionTest; 