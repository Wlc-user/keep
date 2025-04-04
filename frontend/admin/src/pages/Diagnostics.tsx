import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Typography, Tag, Spin, Result, Collapse, Alert, Space } from 'antd';
import { BugOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import diagnosticsService, { DiagnosticResult, ConnectionCheckResult } from '../services/diagnosticsService';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

// 诊断页面组件
const DiagnosticsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ConnectionCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 运行诊断
  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const diagnosticResults = await diagnosticsService.runConnectionDiagnostics();
      setResults(diagnosticResults);
    } catch (error) {
      console.error('运行诊断时出错:', error);
      setError(`运行诊断失败: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // 初始化时运行一次
  useEffect(() => {
    runDiagnostics();
  }, []);

  // 获取状态标签
  const getStatusTag = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Tag icon={<CheckCircleOutlined />} color="success">正常</Tag>;
      case 'warning':
        return <Tag icon={<WarningOutlined />} color="warning">警告</Tag>;
      case 'error':
        return <Tag icon={<CloseCircleOutlined />} color="error">错误</Tag>;
      default:
        return <Tag icon={<SyncOutlined spin />} color="processing">检查中</Tag>;
    }
  };

  // 格式化诊断结果
  const formatDiagnosticData = (results: ConnectionCheckResult) => {
    return [
      {
        key: 'api',
        name: 'API服务连接',
        status: results.api.status,
        statusDisplay: getStatusTag(results.api.status),
        message: results.api.message,
        details: results.api.details,
        timestamp: results.api.timestamp.toLocaleString()
      },
      {
        key: 'cors',
        name: 'CORS跨域配置',
        status: results.cors.status,
        statusDisplay: getStatusTag(results.cors.status),
        message: results.cors.message,
        details: results.cors.details,
        timestamp: results.cors.timestamp.toLocaleString()
      },
      {
        key: 'proxy',
        name: '前端代理设置',
        status: results.proxy.status,
        statusDisplay: getStatusTag(results.proxy.status),
        message: results.proxy.message,
        details: results.proxy.details,
        timestamp: results.proxy.timestamp.toLocaleString()
      },
      {
        key: 'auth',
        name: '身份验证状态',
        status: results.auth.status,
        statusDisplay: getStatusTag(results.auth.status),
        message: results.auth.message,
        details: results.auth.details,
        timestamp: results.auth.timestamp.toLocaleString()
      }
    ];
  };

  // 表格列定义
  const columns = [
    {
      title: '检查项',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'statusDisplay',
      key: 'statusDisplay',
      width: 100
    },
    {
      title: '结果',
      dataIndex: 'message',
      key: 'message'
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180
    }
  ];

  // 故障排除建议
  const getTroubleshootingTips = () => {
    if (!results) return null;
    
    const failedChecks = Object.entries(results)
      .filter(([key, value]) => key !== 'overall' && value.status === 'error')
      .map(([key]) => key);
    
    if (failedChecks.length === 0) return null;
    
    return (
      <Alert
        type="info"
        message="故障排除建议"
        description={
          <div>
            <Paragraph>
              根据诊断结果，以下项目可能需要检查：
            </Paragraph>
            <ul>
              {failedChecks.includes('api') && (
                <li>
                  <Text strong>API服务连接问题</Text>: 
                  <ul>
                    <li>确认API服务正在运行(端口5188)</li>
                    <li>检查防火墙设置是否阻止了连接</li>
                    <li>尝试重启API服务</li>
                  </ul>
                </li>
              )}
              {failedChecks.includes('cors') && (
                <li>
                  <Text strong>CORS跨域问题</Text>: 
                  <ul>
                    <li>检查API服务的CORS配置</li>
                    <li>确认前端域名已添加到CORS白名单</li>
                    <li>检查浏览器CORS插件是否干扰了请求</li>
                  </ul>
                </li>
              )}
              {failedChecks.includes('proxy') && (
                <li>
                  <Text strong>前端代理问题</Text>: 
                  <ul>
                    <li>检查vite.config.js中的代理配置</li>
                    <li>确认API地址配置正确</li>
                    <li>尝试重启前端开发服务器</li>
                  </ul>
                </li>
              )}
              {failedChecks.includes('auth') && (
                <li>
                  <Text strong>身份验证问题</Text>: 
                  <ul>
                    <li>检查token是否过期</li>
                    <li>尝试重新登录</li>
                    <li>检查API服务认证中间件配置</li>
                  </ul>
                </li>
              )}
            </ul>
          </div>
        }
      />
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <BugOutlined /> 系统诊断
      </Title>
      
      <Paragraph>
        此页面帮助您诊断系统连接问题。诊断工具会检查API服务连接、CORS配置、代理设置和身份验证状态。
      </Paragraph>
      
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>连接诊断</Title>
                <Button 
                  type="primary" 
                  icon={<SyncOutlined />} 
                  loading={loading}
                  onClick={runDiagnostics}
                >
                  重新检查
                </Button>
              </div>
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: '16px' }}>正在运行诊断检查...</div>
                </div>
              ) : error ? (
                <Result
                  status="error"
                  title="诊断失败"
                  subTitle={error}
                  extra={<Button type="primary" onClick={runDiagnostics}>重试</Button>}
                />
              ) : results ? (
                <>
                  <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                    <Result
                      icon={
                        results.overall.status === 'success' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                        results.overall.status === 'warning' ? <WarningOutlined style={{ color: '#faad14' }} /> :
                        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      }
                      title={
                        results.overall.status === 'success' ? '系统连接正常' :
                        results.overall.status === 'warning' ? '系统连接部分正常' :
                        '系统连接异常'
                      }
                      subTitle={results.overall.message}
                      status={results.overall.status as any}
                      style={{ padding: '24px 0' }}
                    />
                  </div>
                  
                  {getTroubleshootingTips()}
                  
                  <Table 
                    columns={columns} 
                    dataSource={formatDiagnosticData(results)} 
                    pagination={false}
                    expandable={{
                      expandedRowRender: record => (
                        <Collapse>
                          <Panel header="详细信息" key="1">
                            <pre style={{ maxHeight: '300px', overflow: 'auto' }}>
                              {JSON.stringify(record.details, null, 2)}
                            </pre>
                          </Panel>
                        </Collapse>
                      )
                    }}
                  />
                </>
              ) : null}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DiagnosticsPage; 