import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Space, 
  Tabs, 
  Upload, 
  message, 
  Modal, 
  Form, 
  Input, 
  Select,
  Typography,
  Tooltip,
  Popconfirm,
  Row,
  Col,
  Divider,
  Badge,
  Progress,
  Empty,
  Tag,
  Alert
} from 'antd';
import { 
  UploadOutlined, 
  FileOutlined, 
  VideoCameraOutlined, 
  SoundOutlined, 
  PictureOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  PlusOutlined,
  NodeIndexOutlined,
  LinkOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileImageOutlined,
  FileUnknownOutlined,
  FileAddOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { UploadFile } from 'antd/lib/upload/interface';
import { useNavigate } from 'react-router-dom';
import KnowledgeGraphVisualization from '../components/KnowledgeGraphVisualization';
import knowledgeGraphService, { 
  KnowledgeGraph, 
  Resource, 
  LearningPath,
  KnowledgeNode,
  KnowledgeRelation
} from '../services/knowledgeGraphService';
import knowledgeGraphAlgorithm from '../utils/knowledgeGraphAlgorithm';
import KnowledgeGraphEditor from '../components/KnowledgeGraphEditor';
import KnowledgePathGenerator from '../components/KnowledgePathGenerator';
import { useAppContext } from '../contexts/AppContext';
import usePermission from '../hooks/usePermission';
import PageHeader from '../components/PageHeader';
import { formatFileSize } from '../utils/formatters';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Dragger } = Upload;

// 资源类型图标映射
const resourceTypeIcons = {
  document: <FileOutlined />,
  video: <VideoCameraOutlined />,
  audio: <SoundOutlined />,
  image: <PictureOutlined />,
  quiz: <QuestionCircleOutlined />
};

// 资源类型名称映射
const resourceTypeNames = {
  document: '文档',
  video: '视频',
  audio: '音频',
  image: '图片',
  quiz: '测验'
};

const KnowledgeGraphManagement: React.FC = () => {
  const navigate = useNavigate();
  // 状态
  const [activeTab, setActiveTab] = useState<string>('resources');
  const [resources, setResources] = useState<Resource[]>([]);
  const [graphs, setGraphs] = useState<KnowledgeGraph[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [selectedGraph, setSelectedGraph] = useState<KnowledgeGraph | null>(null);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>(false);
  const [graphModalVisible, setGraphModalVisible] = useState<boolean>(false);
  const [pathModalVisible, setPathModalVisible] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [graphForm] = Form.useForm();
  const [pathForm] = Form.useForm();
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [editorVisible, setEditorVisible] = useState<boolean>(false);
  const [pathGeneratorVisible, setPathGeneratorVisible] = useState<boolean>(false);
  const [editingGraph, setEditingGraph] = useState<KnowledgeGraph | null>(null);
  const { isAdmin, isTeacher } = usePermission();
  const { user } = useAppContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // 加载数据
  useEffect(() => {
    loadResources();
    loadGraphs();
  }, []);

  // 加载资源
  const loadResources = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockResources: Resource[] = [
        {
          id: '1',
          name: '人工智能基础教材.pdf',
          type: 'pdf',
          path: '/uploads/ai_basics.pdf',
          size: 5 * 1024 * 1024,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user?.name || '管理员',
          metadata: {
            pageCount: 120,
            extractedText: true
          }
        },
        {
          id: '2',
          name: '数据结构课程大纲.docx',
          type: 'docx',
          path: '/uploads/data_structures.docx',
          size: 2 * 1024 * 1024,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user?.name || '管理员',
          metadata: {
            pageCount: 15,
            wordCount: 5000
          }
        },
        {
          id: '3',
          name: '学生成绩数据.csv',
          type: 'csv',
          path: '/uploads/student_grades.csv',
          size: 500 * 1024,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user?.name || '管理员',
          metadata: {
            rowCount: 200,
            columnCount: 10
          }
        }
      ];
      
      setResources(mockResources);
      setLoading(false);
    } catch (error) {
      console.error('加载资源失败:', error);
      message.error('加载资源失败');
      setLoading(false);
    }
  };

  // 加载知识图谱
  const loadGraphs = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockGraph = knowledgeGraphAlgorithm.simulateGraphExtraction(resources);
      const mockPaths = knowledgeGraphAlgorithm.generateLearningPaths(mockGraph);
      
      setGraphs([mockGraph]);
      setLearningPaths(mockPaths);
      setLoading(false);
    } catch (error) {
      console.error('加载知识图谱失败:', error);
      message.error('加载知识图谱失败');
      setLoading(false);
    }
  };

  // 处理资源选择
  const handleResourceSelect = (selectedRowKeys: React.Key[]) => {
    setSelectedResources(selectedRowKeys as string[]);
  };

  // 处理资源上传
  const handleResourceUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);
      
      // 模拟上传API调用
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      message.success(`资源 ${file.name} 上传成功`);
      loadResources(); // 重新加载资源列表
    } catch (error) {
      console.error('上传错误:', error);
      message.error('上传过程中发生错误');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  // 处理从资源生成知识图谱
  const handleGenerateFromResources = async () => {
    if (selectedResources.length === 0) {
      message.warning('请至少选择一个资源');
      return;
    }
    
    setLoading(true);
    message.loading('正在从所选资源生成知识图谱...', 0);
    
    try {
      // 模拟生成图谱
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      message.success('知识图谱生成成功');
      loadGraphs(); // 重新加载图谱列表
      setActiveTab('graphs'); // 切换到图谱标签页
    } catch (error) {
      console.error('生成图谱失败:', error);
      message.error('生成图谱失败');
    } finally {
      setLoading(false);
      message.destroy();
    }
  };

  // 处理查看知识图谱
  const handleViewGraph = (graph: KnowledgeGraph) => {
    setSelectedGraph(graph);
    setHighlightedNodes([]);
    setHighlightedPath([]);
    setActiveTab('visualization');
    
    // 添加导航到知识图谱详情页面
    navigate(`/knowledge-graph/${graph.id}`);
  };

  // 处理删除知识图谱
  const handleDeleteGraph = async (id: string) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGraphs(graphs.filter(graph => graph.id !== id));
      if (selectedGraph?.id === id) {
        setSelectedGraph(null);
      }
      
      message.success('图谱已删除');
    } catch (error) {
      console.error('删除图谱失败:', error);
      message.error('删除图谱失败');
    }
  };

  // 处理查看学习路径
  const handleViewPath = (path: LearningPath) => {
    setSelectedPath(path);
    setHighlightedPath(path.nodes);
    setActiveTab('visualization');
  };

  // 处理删除学习路径
  const handleDeletePath = (pathId: string) => {
    setLearningPaths(learningPaths.filter(path => path.id !== pathId));
    
    if (selectedPath && selectedPath.id === pathId) {
      setSelectedPath(null);
      setHighlightedPath([]);
    }
    
    message.success('学习路径删除成功');
  };

  // 处理节点点击
  const handleNodeClick = (node: KnowledgeNode) => {
    setHighlightedNodes([node.id]);
  };

  // 处理关系点击
  const handleRelationClick = (relation: KnowledgeRelation) => {
    setHighlightedPath([relation.sourceId, relation.targetId]);
  };

  // 处理创建知识图谱
  const handleCreateGraph = () => {
    graphForm.resetFields();
    setGraphModalVisible(true);
  };

  // 处理创建学习路径
  const handleCreatePath = () => {
    if (!selectedGraph) {
      message.warning('请先选择一个知识图谱');
      return;
    }
    
    pathForm.resetFields();
    setPathModalVisible(true);
  };

  // 处理知识图谱表单提交
  const handleGraphFormSubmit = async () => {
    try {
      const values = await graphForm.validateFields();
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newGraph: KnowledgeGraph = {
        id: `graph_${Date.now()}`,
        name: values.name,
        description: values.description,
        subject: values.subject,
        nodes: [],
        relations: [],
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: user?.id || 'admin',
          version: 1,
          nodeCount: 0,
          relationCount: 0
        }
      };
      
      setGraphs([...graphs, newGraph]);
      setGraphModalVisible(false);
      message.success('新图谱创建成功');
    } catch (error) {
      console.error('创建图谱失败:', error);
    }
  };

  // 处理学习路径表单提交
  const handlePathFormSubmit = () => {
    if (!selectedGraph) return;
    
    pathForm.validateFields().then(values => {
      // 创建新学习路径
      const newPath: LearningPath = {
        id: `path_${Date.now()}`,
        title: values.title,
        description: values.description,
        nodes: [],
        difficulty: values.difficulty,
        estimatedTime: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setLearningPaths([...learningPaths, newPath]);
      setPathModalVisible(false);
      message.success('学习路径创建成功');
    });
  };

  // 处理编辑知识图谱
  const handleEditGraph = (graph: KnowledgeGraph) => {
    setEditingGraph(graph);
    setEditorVisible(true);
  };

  // 处理生成学习路径
  const handleGeneratePath = (graph: KnowledgeGraph) => {
    setEditingGraph(graph);
    setPathGeneratorVisible(true);
  };

  // 处理保存知识图谱
  const handleSaveGraph = (updatedGraph: KnowledgeGraph) => {
    // 更新图谱列表
    const updatedGraphs = graphs.map(g => 
      g.id === updatedGraph.id ? updatedGraph : g
    );
    setGraphs(updatedGraphs);
    
    // 如果是当前选中的图谱，也更新它
    if (selectedGraph && selectedGraph.id === updatedGraph.id) {
      setSelectedGraph(updatedGraph);
    }
    
    setEditorVisible(false);
    message.success('知识图谱已保存');
  };

  // 处理保存学习路径
  const handleSavePath = (newPath: LearningPath) => {
    // 添加到路径列表
    setLearningPaths([...learningPaths, newPath]);
    setPathGeneratorVisible(false);
    message.success('学习路径已保存');
  };

  // 处理知识图谱采用
  const handleApplyGraph = (graphId: string) => {
    // 仅教师和管理员可以采用知识图谱
    if (!isAdmin && !isTeacher) {
      message.error('您没有权限采用知识图谱');
      return;
    }

    try {
      // 模拟API调用
      message.success('知识图谱已成功采用');
      // TODO: 实际API调用
    } catch (error) {
      console.error('采用知识图谱失败:', error);
      message.error('采用知识图谱失败');
    }
  };

  // 获取文件类型对应的颜色
  const getTypeColor = (type: string) => {
    const typeColorMap: Record<string, string> = {
      pdf: 'red',
      docx: 'blue',
      xlsx: 'green',
      csv: 'orange',
      jpg: 'purple',
      png: 'purple',
      jpeg: 'purple',
      svg: 'geekblue',
      txt: 'cyan',
      pptx: 'magenta',
      json: 'gold',
      xml: 'lime'
    };
    
    return typeColorMap[type] || 'default';
  };

  // 资源表格列
  const resourceColumns = [
    {
      title: '资源名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Resource) => (
        <Space>
          {record.type === 'pdf' && <FileTextOutlined style={{ color: '#f5222d' }} />}
          {record.type === 'docx' && <FileTextOutlined style={{ color: '#1890ff' }} />}
          {record.type === 'xlsx' && <FileExcelOutlined style={{ color: '#52c41a' }} />}
          {record.type === 'csv' && <FileExcelOutlined style={{ color: '#faad14' }} />}
          {['jpg', 'png', 'jpeg', 'svg'].includes(record.type) && <PictureOutlined style={{ color: '#722ed1' }} />}
          <Text>{text}</Text>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => <Tag color={getTypeColor(type)}>{type.toUpperCase()}</Tag>
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size: number) => formatFileSize(size)
    },
    {
      title: '上传时间',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      width: 180,
      render: (time: string) => new Date(time).toLocaleString('zh-CN')
    },
    {
      title: '上传者',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: Resource) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => message.info('预览功能开发中')}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => message.info('删除功能开发中')}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 知识图谱表格列
  const graphColumns = [
    {
      title: '图谱名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: '学科',
      dataIndex: 'subject',
      key: 'subject',
      width: 120
    },
    {
      title: '节点数',
      dataIndex: 'metadata.nodeCount',
      key: 'nodeCount',
      width: 100
    },
    {
      title: '关系数',
      dataIndex: 'metadata.relationCount',
      key: 'relationCount',
      width: 100
    },
    {
      title: '创建时间',
      dataIndex: 'metadata.createdAt',
      key: 'createdAt',
      width: 180,
      render: (time: string) => new Date(time).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: KnowledgeGraph) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewGraph(record)}
            title="查看"
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteGraph(record.id)}
            title="删除"
          />
        </Space>
      )
    }
  ];

  // 学习路径表格列
  const pathColumns = [
    {
      title: '路径名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty: string) => {
        const colors = {
          basic: 'success',
          intermediate: 'warning',
          advanced: 'error'
        };
        const labels = {
          basic: '基础',
          intermediate: '中级',
          advanced: '高级'
        };
        return (
          <Badge 
            status={colors[difficulty as keyof typeof colors] as any} 
            text={labels[difficulty as keyof typeof labels]} 
          />
        );
      }
    },
    {
      title: '知识点数量',
      dataIndex: 'nodes',
      key: 'nodes',
      render: (nodes: string[]) => nodes.length
    },
    {
      title: '预计学习时间',
      dataIndex: 'estimatedTime',
      key: 'estimatedTime',
      render: (time: number) => `${time} 分钟`
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: LearningPath) => (
        <Space>
          <Button type="primary" onClick={() => handleViewPath(record)}>
            查看
          </Button>
          <Button onClick={() => {
            // 导出学习路径
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(record));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `${record.title}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
          }}>
            导出
          </Button>
          <Popconfirm
            title="确定要删除这个学习路径吗？"
            onConfirm={() => handleDeletePath(record.id)}
          >
            <Button danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 渲染创建图谱表单
  const renderCreateGraphForm = () => (
    <Modal
      title="创建新知识图谱"
      open={graphModalVisible}
      onCancel={() => setGraphModalVisible(false)}
      onOk={handleGraphFormSubmit}
      okText="创建"
      cancelText="取消"
    >
      <Form form={graphForm} layout="vertical">
        <Form.Item
          name="name"
          label="图谱名称"
          rules={[{ required: true, message: '请输入图谱名称' }]}
        >
          <Input placeholder="输入知识图谱名称" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="描述"
        >
          <Input.TextArea placeholder="描述此知识图谱的用途和内容" rows={3} />
        </Form.Item>
        
        <Form.Item
          name="subject"
          label="学科"
          rules={[{ required: true, message: '请选择学科' }]}
        >
          <Select placeholder="选择学科领域">
            <Option value="mathematics">数学</Option>
            <Option value="physics">物理</Option>
            <Option value="chemistry">化学</Option>
            <Option value="biology">生物</Option>
            <Option value="computer_science">计算机科学</Option>
            <Option value="literature">文学</Option>
            <Option value="history">历史</Option>
            <Option value="geography">地理</Option>
            <Option value="other">其他</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <div className="knowledge-graph-management-page">
      <PageHeader
        title="知识图谱管理"
        icon={<NodeIndexOutlined />}
        description="管理知识图谱，从文档和结构化数据中提取知识"
      />
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
      >
        <TabPane 
          tab={<span><FileTextOutlined />资源管理</span>}
          key="resources"
        >
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <Dragger
                name="file"
                multiple={false}
                showUploadList={false}
                beforeUpload={(file) => {
                  handleResourceUpload(file);
                  return false;
                }}
                disabled={uploading}
                style={{ display: 'none' }}
                id="resource-upload"
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件上传</p>
              </Dragger>
              <Button 
                type="primary" 
                icon={<UploadOutlined />}
                onClick={() => document.getElementById('resource-upload')?.click()}
                loading={uploading}
              >
                上传资源
              </Button>
              <Button
                type="primary"
                icon={<NodeIndexOutlined />}
                onClick={handleGenerateFromResources}
                disabled={selectedResources.length === 0}
              >
                从资源生成图谱
              </Button>
            </Space>
            
            {uploading && (
              <div style={{ marginBottom: 16 }}>
                <Progress percent={Math.round(uploadProgress)} status="active" />
              </div>
            )}
            
            {selectedResources.length > 0 && (
              <Alert
                message={`已选择 ${selectedResources.length} 个资源`}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
            
            <Table
              rowSelection={{
                selectedRowKeys: selectedResources,
                onChange: (selectedRowKeys) => {
                  setSelectedResources(selectedRowKeys as string[]);
                }
              }}
              columns={resourceColumns}
              dataSource={resources.map(r => ({ ...r, key: r.id }))}
              pagination={{ pageSize: 10 }}
              loading={loading}
            />
          </Card>
        </TabPane>
        
        <TabPane 
          tab={<span><NodeIndexOutlined />知识图谱</span>}
          key="graphs"
        >
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<FileAddOutlined />}
                onClick={handleCreateGraph}
              >
                创建新图谱
              </Button>
            </Space>
            
            <Table
              columns={graphColumns}
              dataSource={graphs.map(g => ({ ...g, key: g.id }))}
              pagination={{ pageSize: 10 }}
              loading={loading}
              onRow={(record) => ({
                onClick: () => handleViewGraph(record),
                style: { cursor: 'pointer' }
              })}
            />
          </Card>
        </TabPane>
        
        <TabPane 
          tab={<span><EyeOutlined />可视化</span>}
          key="visualization"
        >
          {selectedGraph ? (
            <KnowledgeGraphVisualization 
              graph={selectedGraph}
              isLoading={loading}
            />
          ) : (
            <Card>
              <Empty description="请选择一个知识图谱查看" />
            </Card>
          )}
        </TabPane>
      </Tabs>
      
      {renderCreateGraphForm()}
    </div>
  );
};

export default KnowledgeGraphManagement; 