import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Form, 
  Input, 
  Select, 
  message, 
  Tabs, 
  Modal, 
  Tag, 
  Divider,
  Typography,
  Row,
  Col,
  List,
  Avatar,
  Checkbox,
  InputNumber,
  Tooltip,
  Steps,
  Radio,
  Spin
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  SaveOutlined, 
  NodeIndexOutlined,
  RightOutlined,
  LeftOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  DragOutlined
} from '@ant-design/icons';
import { KnowledgeGraph, KnowledgeNode, KnowledgeRelation, LearningPath } from '../services/knowledgeGraphService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Step } = Steps;

interface KnowledgePathGeneratorProps {
  graph: KnowledgeGraph;
  onSave: (path: LearningPath) => void;
  onCancel?: () => void;
  existingPaths?: LearningPath[];
}

const KnowledgePathGenerator: React.FC<KnowledgePathGeneratorProps> = ({
  graph,
  onSave,
  onCancel,
  existingPaths = []
}) => {
  // 状态
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [pathType, setPathType] = useState<'auto' | 'manual' | 'existing'>('auto');
  const [difficulty, setDifficulty] = useState<'basic' | 'intermediate' | 'advanced'>('basic');
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [pathTitle, setPathTitle] = useState<string>('');
  const [pathDescription, setPathDescription] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<number>(60);
  const [generatingPath, setGeneratingPath] = useState<boolean>(false);
  const [suggestedNodes, setSuggestedNodes] = useState<KnowledgeNode[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [filterType, setFilterType] = useState<string[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState<string[]>([]);
  const [selectedExistingPath, setSelectedExistingPath] = useState<string | null>(null);
  const [orderedNodes, setOrderedNodes] = useState<KnowledgeNode[]>([]);

  // 当选择的节点变化时，更新有序节点列表
  useEffect(() => {
    const nodes = selectedNodes.map(id => 
      graph.nodes.find(node => node.id === id)
    ).filter(Boolean) as KnowledgeNode[];
    
    setOrderedNodes(nodes);
  }, [selectedNodes, graph.nodes]);

  // 处理步骤变化
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  // 处理下一步
  const handleNext = () => {
    if (currentStep === 0 && pathType === 'auto') {
      // 自动生成路径
      generatePath();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  // 处理上一步
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  // 自动生成路径
  const generatePath = () => {
    setGeneratingPath(true);
    
    // 模拟生成路径的过程
    setTimeout(() => {
      // 根据难度选择节点
      const filteredNodes = graph.nodes.filter(node => {
        if (difficulty === 'basic') {
          return node.difficulty === 'basic';
        } else if (difficulty === 'intermediate') {
          return node.difficulty === 'basic' || node.difficulty === 'intermediate';
        } else {
          return true; // 高级路径包含所有难度的节点
        }
      });
      
      // 按照依赖关系排序节点
      const sortedNodes = sortNodesByDependency(filteredNodes);
      
      // 选择适当数量的节点
      const nodeCount = difficulty === 'basic' ? 5 : difficulty === 'intermediate' ? 8 : 12;
      const selectedNodeIds = sortedNodes.slice(0, nodeCount).map(node => node.id);
      
      // 设置路径标题和描述
      setPathTitle(`${difficulty === 'basic' ? '基础' : difficulty === 'intermediate' ? '中级' : '高级'}学习路径`);
      setPathDescription(`自动生成的${difficulty === 'basic' ? '基础' : difficulty === 'intermediate' ? '中级' : '高级'}学习路径，包含${selectedNodeIds.length}个知识点。`);
      
      // 设置选中的节点
      setSelectedNodes(selectedNodeIds);
      
      // 设置预计学习时间
      setEstimatedTime(nodeCount * 15); // 每个节点平均15分钟
      
      setGeneratingPath(false);
      setCurrentStep(currentStep + 1);
    }, 1500);
  };

  // 根据依赖关系排序节点
  const sortNodesByDependency = (nodes: KnowledgeNode[]): KnowledgeNode[] => {
    // 创建节点依赖图
    const dependencyGraph: Record<string, string[]> = {};
    const nodeMap: Record<string, KnowledgeNode> = {};
    
    // 初始化
    nodes.forEach(node => {
      dependencyGraph[node.id] = [];
      nodeMap[node.id] = node;
    });
    
    // 添加依赖关系
    graph.relations.forEach(relation => {
      if (relation.type === 'prerequisite' && nodeMap[relation.sourceId] && nodeMap[relation.targetId]) {
        dependencyGraph[relation.targetId].push(relation.sourceId);
      }
    });
    
    // 拓扑排序
    const visited = new Set<string>();
    const temp = new Set<string>();
    const result: KnowledgeNode[] = [];
    
    const visit = (nodeId: string) => {
      if (temp.has(nodeId)) {
        // 检测到循环依赖，跳过
        return;
      }
      
      if (visited.has(nodeId)) {
        return;
      }
      
      temp.add(nodeId);
      
      // 访问所有依赖
      dependencyGraph[nodeId].forEach(depId => {
        visit(depId);
      });
      
      temp.delete(nodeId);
      visited.add(nodeId);
      
      if (nodeMap[nodeId]) {
        result.push(nodeMap[nodeId]);
      }
    };
    
    // 对每个节点进行拓扑排序
    Object.keys(dependencyGraph).forEach(nodeId => {
      if (!visited.has(nodeId)) {
        visit(nodeId);
      }
    });
    
    // 反转结果，因为我们需要从依赖最少的节点开始
    return result.reverse();
  };

  // 处理节点选择变化
  const handleNodeSelectionChange = (nodeId: string, checked: boolean) => {
    if (checked) {
      setSelectedNodes([...selectedNodes, nodeId]);
    } else {
      setSelectedNodes(selectedNodes.filter(id => id !== nodeId));
    }
  };

  // 处理现有路径选择
  const handleExistingPathSelect = (pathId: string) => {
    const path = existingPaths.find(p => p.id === pathId);
    if (path) {
      setSelectedExistingPath(pathId);
      setPathTitle(`${path.title} (复制)`)
      setPathDescription(path.description);
      setSelectedNodes([...path.nodes]);
      setEstimatedTime(path.estimatedTime);
      setDifficulty(path.difficulty);
    }
  };

  // 处理拖放排序
  const handleDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }
    
    const items = Array.from(orderedNodes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setOrderedNodes(items);
    setSelectedNodes(items.map(node => node.id));
  };

  // 保存路径
  const handleSavePath = () => {
    if (!pathTitle) {
      message.error('请输入路径标题');
      return;
    }
    
    if (selectedNodes.length === 0) {
      message.error('请至少选择一个知识点');
      return;
    }
    
    const newPath: LearningPath = {
      id: `path_${Date.now()}`,
      title: pathTitle,
      description: pathDescription,
      nodes: selectedNodes,
      difficulty,
      estimatedTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSave(newPath);
    message.success('学习路径已保存');
  };

  // 获取节点类型标签
  const getNodeTypeTag = (type: string) => {
    const typeColors: Record<string, string> = {
      concept: '#1890ff',
      fact: '#52c41a',
      principle: '#722ed1',
      procedure: '#fa8c16'
    };
    
    const typeNames: Record<string, string> = {
      concept: '概念',
      fact: '事实',
      principle: '原理',
      procedure: '过程'
    };
    
    return (
      <Tag color={typeColors[type] || '#1890ff'}>
        {typeNames[type] || type}
      </Tag>
    );
  };

  // 获取难度标签
  const getDifficultyTag = (difficulty: string) => {
    const difficultyColors: Record<string, string> = {
      basic: '#52c41a',
      intermediate: '#fa8c16',
      advanced: '#f5222d'
    };
    
    const difficultyNames: Record<string, string> = {
      basic: '基础',
      intermediate: '中级',
      advanced: '高级'
    };
    
    return (
      <Tag color={difficultyColors[difficulty] || '#1890ff'}>
        {difficultyNames[difficulty] || difficulty}
      </Tag>
    );
  };

  // 过滤节点
  const filteredNodes = graph.nodes.filter(node => {
    // 搜索文本过滤
    const textMatch = searchText
      ? node.title.toLowerCase().includes(searchText.toLowerCase()) ||
        node.description.toLowerCase().includes(searchText.toLowerCase()) ||
        (node.content && node.content.toLowerCase().includes(searchText.toLowerCase())) ||
        (node.keywords && node.keywords.some(k => k.toLowerCase().includes(searchText.toLowerCase())))
      : true;
    
    // 类型过滤
    const typeMatch = filterType.length > 0
      ? filterType.includes(node.type)
      : true;
    
    // 难度过滤
    const difficultyMatch = filterDifficulty.length > 0
      ? filterDifficulty.includes(node.difficulty)
      : true;
    
    return textMatch && typeMatch && difficultyMatch;
  });

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="path-type-selection">
            <Title level={4}>选择路径生成方式</Title>
            <Paragraph>
              请选择如何创建学习路径。您可以自动生成路径、手动选择知识点，或基于现有路径创建。
            </Paragraph>
            
            <Radio.Group 
              value={pathType} 
              onChange={e => setPathType(e.target.value)}
              style={{ marginBottom: 24 }}
            >
              <Space direction="vertical">
                <Radio value="auto">
                  <Space>
                    <Text strong>自动生成路径</Text>
                    <Text type="secondary">系统根据知识点依赖关系自动生成最优学习路径</Text>
                  </Space>
                </Radio>
                <Radio value="manual">
                  <Space>
                    <Text strong>手动创建路径</Text>
                    <Text type="secondary">手动选择知识点并排序，创建自定义学习路径</Text>
                  </Space>
                </Radio>
                {existingPaths.length > 0 && (
                  <Radio value="existing">
                    <Space>
                      <Text strong>基于现有路径</Text>
                      <Text type="secondary">复制并修改现有学习路径</Text>
                    </Space>
                  </Radio>
                )}
              </Space>
            </Radio.Group>
            
            {pathType === 'auto' && (
              <div className="auto-path-options">
                <Title level={5}>选择路径难度</Title>
                <Radio.Group 
                  value={difficulty} 
                  onChange={e => setDifficulty(e.target.value)}
                  style={{ marginBottom: 16 }}
                >
                  <Radio.Button value="basic">基础</Radio.Button>
                  <Radio.Button value="intermediate">中级</Radio.Button>
                  <Radio.Button value="advanced">高级</Radio.Button>
                </Radio.Group>
                <Paragraph type="secondary">
                  <InfoCircleOutlined style={{ marginRight: 8 }} />
                  基础路径包含约5个基础知识点，中级路径包含约8个基础和中级知识点，高级路径包含约12个各难度知识点。
                </Paragraph>
              </div>
            )}
            
            {pathType === 'existing' && existingPaths.length > 0 && (
              <div className="existing-path-selection">
                <Title level={5}>选择现有路径</Title>
                <List
                  dataSource={existingPaths}
                  renderItem={path => (
                    <List.Item
                      key={path.id}
                      onClick={() => handleExistingPathSelect(path.id)}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedExistingPath === path.id ? '#f0f5ff' : 'transparent',
                        padding: '8px 16px',
                        borderRadius: '4px'
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            icon={<NodeIndexOutlined />} 
                            style={{ 
                              backgroundColor: path.difficulty === 'basic' 
                                ? '#52c41a' 
                                : path.difficulty === 'intermediate' 
                                  ? '#fa8c16' 
                                  : '#f5222d' 
                            }} 
                          />
                        }
                        title={
                          <Space>
                            <Text strong>{path.title}</Text>
                            {getDifficultyTag(path.difficulty)}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">{path.description}</Text>
                            <Text type="secondary">知识点数量: {path.nodes.length} | 预计学习时间: {path.estimatedTime}分钟</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
        );
      
      case 1:
        return (
          <div className="node-selection">
            <Title level={4}>选择知识点</Title>
            <Paragraph>
              {pathType === 'auto' 
                ? '系统已根据您选择的难度自动选择了以下知识点。您可以根据需要调整选择。' 
                : '请从知识图谱中选择要包含在学习路径中的知识点。'}
            </Paragraph>
            
            <Row gutter={16}>
              <Col span={12}>
                <Card 
                  title="可选知识点" 
                  extra={
                    <Space>
                      <Input.Search
                        placeholder="搜索知识点..."
                        allowClear
                        style={{ width: 200 }}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                      />
                      <Select
                        mode="multiple"
                        placeholder="类型过滤"
                        style={{ width: 150 }}
                        value={filterType}
                        onChange={setFilterType}
                        allowClear
                      >
                        <Option value="concept">概念</Option>
                        <Option value="fact">事实</Option>
                        <Option value="principle">原理</Option>
                        <Option value="procedure">过程</Option>
                      </Select>
                    </Space>
                  }
                  style={{ height: '500px', overflowY: 'auto' }}
                >
                  <List
                    dataSource={filteredNodes}
                    renderItem={node => (
                      <List.Item
                        key={node.id}
                        actions={[
                          <Checkbox
                            checked={selectedNodes.includes(node.id)}
                            onChange={e => handleNodeSelectionChange(node.id, e.target.checked)}
                          />
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <Space>
                              <Text strong>{node.title}</Text>
                              {getNodeTypeTag(node.type)}
                              {getDifficultyTag(node.difficulty)}
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size={0}>
                              <Text type="secondary">{node.description}</Text>
                              <Space>
                                <Tag color="#108ee9">学分: {node.credit}</Tag>
                                <Tag color="#87d068">年级: {node.grade}</Tag>
                              </Space>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              
              <Col span={12}>
                <Card 
                  title={
                    <Space>
                      <span>已选知识点</span>
                      <Tag color="#108ee9">{selectedNodes.length}个</Tag>
                    </Space>
                  }
                  extra={
                    <Button 
                      type="link" 
                      icon={<DeleteOutlined />} 
                      onClick={() => setSelectedNodes([])}
                      disabled={selectedNodes.length === 0}
                    >
                      清空
                    </Button>
                  }
                  style={{ height: '500px', overflowY: 'auto' }}
                >
                  {selectedNodes.length > 0 ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="droppable">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {orderedNodes.map((node, index) => (
                              <Draggable key={node.id} draggableId={node.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      marginBottom: 8,
                                      padding: 8,
                                      border: '1px solid #f0f0f0',
                                      borderRadius: 4,
                                      backgroundColor: '#fff'
                                    }}
                                  >
                                    <Space align="start" style={{ width: '100%' }}>
                                      <Avatar>{index + 1}</Avatar>
                                      <div style={{ flex: 1 }}>
                                        <Space>
                                          <Text strong>{node.title}</Text>
                                          {getNodeTypeTag(node.type)}
                                          {getDifficultyTag(node.difficulty)}
                                        </Space>
                                        <div>
                                          <Text type="secondary">{node.description}</Text>
                                        </div>
                                      </div>
                                      <Button 
                                        type="text" 
                                        icon={<DeleteOutlined />} 
                                        onClick={() => handleNodeSelectionChange(node.id, false)}
                                      />
                                    </Space>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                      <Text type="secondary">尚未选择知识点</Text>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        );
      
      case 2:
        return (
          <div className="path-details">
            <Title level={4}>设置路径详情</Title>
            <Paragraph>
              请为您的学习路径设置标题、描述和预计学习时间。
            </Paragraph>
            
            <Form layout="vertical">
              <Form.Item
                label="路径标题"
                required
                tooltip="学习路径的名称，例如'人工智能基础学习路径'"
              >
                <Input 
                  value={pathTitle} 
                  onChange={e => setPathTitle(e.target.value)} 
                  placeholder="输入路径标题"
                />
              </Form.Item>
              
              <Form.Item
                label="路径描述"
                tooltip="对学习路径的简要描述，包括学习目标和适用人群"
              >
                <TextArea 
                  value={pathDescription} 
                  onChange={e => setPathDescription(e.target.value)} 
                  placeholder="输入路径描述"
                  rows={4}
                />
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="难度级别"
                    required
                    tooltip="学习路径的整体难度级别"
                  >
                    <Select 
                      value={difficulty} 
                      onChange={value => setDifficulty(value)}
                    >
                      <Option value="basic">基础</Option>
                      <Option value="intermediate">中级</Option>
                      <Option value="advanced">高级</Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    label="预计学习时间(分钟)"
                    required
                    tooltip="完成整个学习路径所需的估计时间(分钟)"
                  >
                    <InputNumber 
                      value={estimatedTime} 
                      onChange={value => setEstimatedTime(value as number)} 
                      min={1}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            
            <Divider />
            
            <Title level={5}>路径预览</Title>
            <Card>
              <div style={{ marginBottom: 16 }}>
                <Space>
                  <Title level={4} style={{ margin: 0 }}>{pathTitle || '(未命名路径)'}</Title>
                  {getDifficultyTag(difficulty)}
                  <Tag color="#108ee9">预计时间: {estimatedTime}分钟</Tag>
                </Space>
              </div>
              
              <Paragraph>{pathDescription || '(无描述)'}</Paragraph>
              
              <div style={{ marginTop: 16 }}>
                <Title level={5}>包含的知识点 ({selectedNodes.length})</Title>
                <List
                  dataSource={orderedNodes}
                  renderItem={(node, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar>{index + 1}</Avatar>}
                        title={
                          <Space>
                            <Text strong>{node.title}</Text>
                            {getNodeTypeTag(node.type)}
                            {getDifficultyTag(node.difficulty)}
                          </Space>
                        }
                        description={node.description}
                      />
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="knowledge-path-generator">
      <Card>
        <Steps current={currentStep} onChange={handleStepChange}>
          <Step title="选择方式" description="选择路径生成方式" />
          <Step title="选择知识点" description="选择并排序知识点" />
          <Step title="设置详情" description="设置路径信息" />
        </Steps>
        
        <div style={{ marginTop: 24, minHeight: 400 }}>
          {generatingPath ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text>正在生成学习路径...</Text>
              </div>
            </div>
          ) : (
            renderStepContent()
          )}
        </div>
        
        <Divider />
        
        <div style={{ textAlign: 'right' }}>
          <Space>
            {onCancel && (
              <Button onClick={onCancel}>取消</Button>
            )}
            
            {currentStep > 0 && (
              <Button icon={<LeftOutlined />} onClick={handlePrevious}>
                上一步
              </Button>
            )}
            
            {currentStep < 2 && (
              <Button 
                type="primary" 
                icon={<RightOutlined />} 
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && pathType === 'existing' && !selectedExistingPath) ||
                  generatingPath
                }
              >
                下一步
              </Button>
            )}
            
            {currentStep === 2 && (
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSavePath}
                disabled={!pathTitle || selectedNodes.length === 0}
              >
                保存路径
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default KnowledgePathGenerator; 