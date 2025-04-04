import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Typography, 
  Space, 
  Tabs, 
  Collapse, 
  Button, 
  Divider, 
  Row, 
  Col,
  Tree,
  message
} from 'antd';
import { 
  ApiOutlined, 
  CodeOutlined, 
  CopyOutlined, 
  FileTextOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
// 修改语法高亮导入方式
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015, docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs'; 

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

// 定义API端点接口
interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  params?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  requestBody?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  responseFields?: {
    name: string;
    type: string;
    description: string;
  }[];
  examples?: {
    request?: string;
    response?: string;
  };
}

// 定义API分类接口
interface ApiCategory {
  name: string;
  key: string;
  description: string;
  endpoints: ApiEndpoint[];
}

// API文档组件
const ApiDocumentation: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('notifications');
  
  // 复制代码到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        message.success('代码已复制到剪贴板');
      },
      () => {
        message.error('复制失败，请手动复制');
      }
    );
  };
  
  // 获取HTTP方法对应的颜色
  const getMethodColor = (method: string): string => {
    switch (method) {
      case 'GET':
        return '#52c41a';
      case 'POST':
        return '#1890ff';
      case 'PUT':
        return '#faad14';
      case 'DELETE':
        return '#f5222d';
      default:
        return '#d9d9d9';
    }
  };
  
  // 渲染参数表格
  const renderParamsTable = (params: any[] | undefined) => {
    if (!params || params.length === 0) {
      return <Text italic>无参数</Text>;
    }
    
    return (
      <Table 
        dataSource={params} 
        pagination={false}
        size="small"
        rowKey="name"
        columns={[
          {
            title: '参数名',
            dataIndex: 'name',
            key: 'name',
            width: 150,
            render: (text, record: any) => (
              <Text strong>
                {text}
                {record.required && <Text type="danger">*</Text>}
              </Text>
            )
          },
          {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: text => <Tag color="blue">{text}</Tag>
          },
          {
            title: '描述',
            dataIndex: 'description',
            key: 'description'
          }
        ]}
      />
    );
  };
  
  // 渲染响应字段表格
  const renderResponseTable = (fields: any[] | undefined) => {
    if (!fields || fields.length === 0) {
      return <Text italic>无返回字段</Text>;
    }
    
    return (
      <Table 
        dataSource={fields} 
        pagination={false}
        size="small"
        rowKey="name"
        columns={[
          {
            title: '字段名',
            dataIndex: 'name',
            key: 'name',
            width: 150,
            render: text => <Text strong>{text}</Text>
          },
          {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: text => <Tag color="blue">{text}</Tag>
          },
          {
            title: '描述',
            dataIndex: 'description',
            key: 'description'
          }
        ]}
      />
    );
  };

  // API分类数据
  const apiCategories: ApiCategory[] = [
    {
      name: '通知管理',
      key: 'notifications',
      description: '用于管理系统通知、用户消息的API接口',
      endpoints: [
        {
          method: 'GET',
          path: '/api/notifications',
          description: '获取当前用户的通知列表',
          params: [
            { name: 'page', type: 'number', required: false, description: '页码，默认为1' },
            { name: 'pageSize', type: 'number', required: false, description: '每页条数，默认为10' },
            { name: 'type', type: 'string', required: false, description: '通知类型，可选值：system, course, assignment' }
          ],
          responseFields: [
            { name: 'items', type: 'array', description: '通知数组' },
            { name: 'total', type: 'number', description: '总记录数' },
            { name: 'page', type: 'number', description: '当前页码' },
            { name: 'pageSize', type: 'number', description: '每页条数' }
          ],
          examples: {
            request: 'GET /api/notifications?page=1&pageSize=10&type=system',
            response: `{
  "code": 0,
  "success": true,
  "data": {
    "items": [
      {
        "id": "1",
        "title": "系统维护通知",
        "content": "系统将于2023年5月1日进行升级维护",
        "type": "system",
        "read": false,
        "createdAt": "2023-04-28T10:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}`
          }
        },
        {
          method: 'POST',
          path: '/api/notifications',
          description: '创建/发送新通知',
          requestBody: [
            { name: 'title', type: 'string', required: true, description: '通知标题' },
            { name: 'content', type: 'string', required: true, description: '通知内容' },
            { name: 'type', type: 'string', required: true, description: '通知类型' },
            { name: 'targetUsers', type: 'array', required: false, description: '目标用户IDs数组，不提供则发送给所有用户' }
          ],
          responseFields: [
            { name: 'id', type: 'string', description: '新创建的通知ID' },
            { name: 'success', type: 'boolean', description: '是否成功创建' }
          ],
          examples: {
            request: `POST /api/notifications
{
  "title": "新课程上线通知",
  "content": "新的JavaScript高级课程已经上线",
  "type": "course",
  "targetUsers": ["user1", "user2"]
}`,
            response: `{
  "code": 0,
  "success": true,
  "data": {
    "id": "12345",
    "success": true
  }
}`
          }
        },
        {
          method: 'PUT',
          path: '/api/notifications/:id/read',
          description: '将指定通知标记为已读',
          params: [
            { name: 'id', type: 'string', required: true, description: '通知ID' }
          ],
          responseFields: [
            { name: 'success', type: 'boolean', description: '操作是否成功' }
          ],
          examples: {
            request: 'PUT /api/notifications/12345/read',
            response: `{
  "code": 0,
  "success": true,
  "data": {
    "success": true
  }
}`
          }
        },
        {
          method: 'DELETE',
          path: '/api/notifications/:id',
          description: '删除指定通知',
          params: [
            { name: 'id', type: 'string', required: true, description: '通知ID' }
          ],
          responseFields: [
            { name: 'success', type: 'boolean', description: '操作是否成功' }
          ],
          examples: {
            request: 'DELETE /api/notifications/12345',
            response: `{
  "code": 0,
  "success": true,
  "data": {
    "success": true
  }
}`
          }
        }
      ]
    },
    {
      name: '考试管理',
      key: 'exams',
      description: '用于管理在线考试、试卷和考试结果的API接口',
      endpoints: [
        {
          method: 'GET',
          path: '/api/exams',
          description: '获取考试列表',
          params: [
            { name: 'page', type: 'number', required: false, description: '页码，默认为1' },
            { name: 'pageSize', type: 'number', required: false, description: '每页条数，默认为10' },
            { name: 'status', type: 'string', required: false, description: '考试状态，可选值：draft, published, active, ended' },
            { name: 'courseId', type: 'string', required: false, description: '课程ID' }
          ],
          responseFields: [
            { name: 'items', type: 'array', description: '考试数组' },
            { name: 'total', type: 'number', description: '总记录数' },
            { name: 'page', type: 'number', description: '当前页码' },
            { name: 'pageSize', type: 'number', description: '每页条数' }
          ],
          examples: {
            request: 'GET /api/exams?page=1&pageSize=10&status=active',
            response: `{
  "code": 0,
  "success": true,
  "data": {
    "items": [
      {
        "id": "1",
        "title": "JavaScript基础考试",
        "description": "测试JavaScript基础知识掌握情况",
        "status": "active",
        "startTime": "2023-05-10T09:00:00Z",
        "endTime": "2023-05-10T11:00:00Z",
        "duration": 120,
        "totalScore": 100,
        "questionCount": 20
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}`
          }
        },
        {
          method: 'GET',
          path: '/api/exams/:id',
          description: '获取考试详情',
          params: [
            { name: 'id', type: 'string', required: true, description: '考试ID' }
          ],
          responseFields: [
            { name: 'id', type: 'string', description: '考试ID' },
            { name: 'title', type: 'string', description: '考试标题' },
            { name: 'description', type: 'string', description: '考试描述' },
            { name: 'status', type: 'string', description: '考试状态' },
            { name: 'questions', type: 'array', description: '考试题目数组' }
          ],
          examples: {
            request: 'GET /api/exams/12345',
            response: `{
  "code": 0,
  "success": true,
  "data": {
    "id": "12345",
    "title": "JavaScript基础考试",
    "description": "测试JavaScript基础知识掌握情况",
    "status": "active",
    "startTime": "2023-05-10T09:00:00Z",
    "endTime": "2023-05-10T11:00:00Z",
    "duration": 120,
    "totalScore": 100,
    "questions": [
      {
        "id": "q1",
        "content": "JavaScript是一种解释型语言，这句话是否正确？",
        "type": "true_false",
        "options": ["正确", "错误"],
        "score": 5
      }
    ]
  }
}`
          }
        },
        {
          method: 'POST',
          path: '/api/exams',
          description: '创建新考试',
          requestBody: [
            { name: 'title', type: 'string', required: true, description: '考试标题' },
            { name: 'description', type: 'string', required: true, description: '考试描述' },
            { name: 'courseId', type: 'string', required: true, description: '关联的课程ID' },
            { name: 'questions', type: 'array', required: true, description: '考试题目数组' }
          ],
          responseFields: [
            { name: 'id', type: 'string', description: '新创建的考试ID' },
            { name: 'success', type: 'boolean', description: '是否成功创建' }
          ],
          examples: {
            request: `POST /api/exams
{
  "title": "JavaScript高级编程考试",
  "description": "测试JavaScript高级编程知识",
  "courseId": "course123",
  "startTime": "2023-06-01T09:00:00Z",
  "endTime": "2023-06-01T11:00:00Z",
  "duration": 120,
  "questions": [
    {
      "content": "解释闭包的概念及用途",
      "type": "essay",
      "score": 20
    }
  ]
}`,
            response: `{
  "code": 0,
  "success": true,
  "data": {
    "id": "exam789",
    "success": true
  }
}`
          }
        }
      ]
    }
  ];

  return (
    <div className="api-documentation-page">
      <PageHeader
        title="API文档"
        icon={<BookOutlined />}
        description="查看系统API接口文档，方便开发者集成与使用"
      />
      
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card title="API分类" bordered={false}>
            <Tree
              selectedKeys={[activeCategory]}
              onSelect={(selectedKeys) => {
                if (selectedKeys.length > 0) {
                  setActiveCategory(selectedKeys[0] as string);
                }
              }}
              treeData={apiCategories.map(category => ({
                title: category.name,
                key: category.key,
                icon: <ApiOutlined />
              }))}
            />
          </Card>
        </Col>
        
        <Col span={18}>
          {apiCategories.filter(cat => cat.key === activeCategory).map(category => (
            <Card key={category.key} bordered={false}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Title level={3}>{category.name}</Title>
                  <Paragraph>{category.description}</Paragraph>
                </div>
                
                <Divider />
                
                {category.endpoints.map((endpoint, index) => (
                  <Card 
                    key={`${endpoint.method}-${endpoint.path}-${index}`}
                    title={
                      <Space>
                        <Tag color={getMethodColor(endpoint.method)} style={{ width: 70, textAlign: 'center', fontWeight: 'bold' }}>
                          {endpoint.method}
                        </Tag>
                        <Text code style={{ fontSize: 16 }}>{endpoint.path}</Text>
                      </Space>
                    }
                    type="inner"
                    style={{ marginBottom: 16 }}
                  >
                    <Paragraph>{endpoint.description}</Paragraph>
                    
                    <Tabs defaultActiveKey="1">
                      <TabPane tab="请求参数" key="1">
                        <Title level={5}>路径/查询参数</Title>
                        {renderParamsTable(endpoint.params)}
                        
                        {endpoint.requestBody && (
                          <>
                            <Title level={5} style={{ marginTop: 16 }}>请求体</Title>
                            {renderParamsTable(endpoint.requestBody)}
                          </>
                        )}
                      </TabPane>
                      
                      <TabPane tab="响应字段" key="2">
                        {renderResponseTable(endpoint.responseFields)}
                      </TabPane>
                      
                      <TabPane tab="示例" key="3">
                        <Row gutter={[16, 16]}>
                          {endpoint.examples?.request && (
                            <Col span={endpoint.examples.response ? 12 : 24}>
                              <Title level={5}>请求示例</Title>
                              <div style={{ position: 'relative' }}>
                                <Button
                                  icon={<CopyOutlined />}
                                  size="small"
                                  type="text"
                                  style={{ position: 'absolute', right: 10, top: 10, zIndex: 1 }}
                                  onClick={() => copyToClipboard(endpoint.examples?.request || '')}
                                />
                                <SyntaxHighlighter language="http" style={vs2015} showLineNumbers>
                                  {endpoint.examples.request}
                                </SyntaxHighlighter>
                              </div>
                            </Col>
                          )}
                          
                          {endpoint.examples?.response && (
                            <Col span={endpoint.examples.request ? 12 : 24}>
                              <Title level={5}>响应示例</Title>
                              <div style={{ position: 'relative' }}>
                                <Button
                                  icon={<CopyOutlined />}
                                  size="small"
                                  type="text"
                                  style={{ position: 'absolute', right: 10, top: 10, zIndex: 1 }}
                                  onClick={() => copyToClipboard(endpoint.examples?.response || '')}
                                />
                                <SyntaxHighlighter language="json" style={vs2015} showLineNumbers>
                                  {endpoint.examples.response}
                                </SyntaxHighlighter>
                              </div>
                            </Col>
                          )}
                        </Row>
                      </TabPane>
                    </Tabs>
                  </Card>
                ))}
              </Space>
            </Card>
          ))}
        </Col>
      </Row>
    </div>
  );
};

export default ApiDocumentation; 