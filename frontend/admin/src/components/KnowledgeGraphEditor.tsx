import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Form, 
  Input, 
  Select, 
  Popconfirm, 
  message, 
  Tabs, 
  Modal, 
  Tooltip, 
  Tag, 
  Divider,
  InputNumber,
  Switch,
  Typography,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  SaveOutlined, 
  UndoOutlined,
  NodeIndexOutlined,
  LinkOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { KnowledgeGraph, KnowledgeNode, KnowledgeRelation } from '../services/knowledgeGraphService';
import KnowledgeGraphVisualization from './KnowledgeGraphVisualization';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface KnowledgeGraphEditorProps {
  graph: KnowledgeGraph;
  onSave: (graph: KnowledgeGraph) => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

const KnowledgeGraphEditor: React.FC<KnowledgeGraphEditorProps> = ({
  graph,
  onSave,
  onCancel,
  readOnly = false
}) => {
  // 状态
  const [editedGraph, setEditedGraph] = useState<KnowledgeGraph>(graph);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedRelationId, setSelectedRelationId] = useState<string | null>(null);
  const [nodeModalVisible, setNodeModalVisible] = useState<boolean>(false);
  const [relationModalVisible, setRelationModalVisible] = useState<boolean>(false);
  const [nodeForm] = Form.useForm();
  const [relationForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>('nodes');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [filterType, setFilterType] = useState<string[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState<string[]>([]);

  // 当图谱数据变化时更新编辑状态
  useEffect(() => {
    setEditedGraph(graph);
  }, [graph]);

  // 处理节点点击
  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNodeId(node.id);
    setSelectedRelationId(null);
    setHighlightedNodes([node.id]);
    
    // 高亮与该节点相关的关系
    const relatedRelations = editedGraph.relations.filter(
      rel => rel.sourceId === node.id || rel.targetId === node.id
    );
    
    const relatedNodeIds = new Set<string>();
    relatedRelations.forEach(rel => {
      relatedNodeIds.add(rel.sourceId);
      relatedNodeIds.add(rel.targetId);
    });
    
    setHighlightedPath(Array.from(relatedNodeIds));
  };

  // 处理关系点击
  const handleRelationClick = (relation: KnowledgeRelation) => {
    setSelectedRelationId(relation.id);
    setSelectedNodeId(null);
    setHighlightedPath([relation.sourceId, relation.targetId]);
  };

  // 添加新节点
  const handleAddNode = () => {
    nodeForm.resetFields();
    setSelectedNodeId(null);
    setIsEditing(false);
    setNodeModalVisible(true);
  };

  // 编辑节点
  const handleEditNode = (nodeId: string) => {
    const node = editedGraph.nodes.find(n => n.id === nodeId);
    if (node) {
      nodeForm.setFieldsValue({
        title: node.title,
        description: node.description,
        content: node.content,
        type: node.type,
        difficulty: node.difficulty,
        credit: node.credit,
        grade: node.grade,
        keywords: node.keywords ? node.keywords.join(', ') : '',
        isKeyNode: node.isKeyNode || false
      });
      setSelectedNodeId(nodeId);
      setIsEditing(true);
      setNodeModalVisible(true);
    }
  };

  // 删除节点
  const handleDeleteNode = (nodeId: string) => {
    // 删除节点
    const updatedNodes = editedGraph.nodes.filter(node => node.id !== nodeId);
    
    // 删除与该节点相关的所有关系
    const updatedRelations = editedGraph.relations.filter(
      relation => relation.sourceId !== nodeId && relation.targetId !== nodeId
    );
    
    setEditedGraph({
      ...editedGraph,
      nodes: updatedNodes,
      relations: updatedRelations
    });
    
    message.success('知识点已删除');
  };

  // 保存节点
  const handleSaveNode = (values: any) => {
    const keywords = values.keywords
      ? values.keywords.split(',').map((k: string) => k.trim())
      : [];
    
    if (isEditing && selectedNodeId) {
      // 更新现有节点
      const updatedNodes = editedGraph.nodes.map(node => {
        if (node.id === selectedNodeId) {
          return {
            ...node,
            title: values.title,
            description: values.description,
            content: values.content,
            type: values.type,
            difficulty: values.difficulty,
            credit: values.credit,
            grade: values.grade,
            keywords,
            isKeyNode: values.isKeyNode,
            updatedAt: new Date().toISOString()
          };
        }
        return node;
      });
      
      setEditedGraph({
        ...editedGraph,
        nodes: updatedNodes
      });
      
      message.success('知识点已更新');
    } else {
      // 创建新节点
      const newNode: KnowledgeNode = {
        id: `node_${Date.now()}`,
        title: values.title,
        description: values.description,
        content: values.content,
        type: values.type,
        difficulty: values.difficulty,
        credit: values.credit,
        grade: values.grade,
        sourceId: editedGraph.id,
        sourceType: 'document',
        keywords,
        isKeyNode: values.isKeyNode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setEditedGraph({
        ...editedGraph,
        nodes: [...editedGraph.nodes, newNode]
      });
      
      message.success('知识点已添加');
    }
    
    setNodeModalVisible(false);
  };

  // 添加新关系
  const handleAddRelation = () => {
    relationForm.resetFields();
    setSelectedRelationId(null);
    setIsEditing(false);
    setRelationModalVisible(true);
  };

  // 编辑关系
  const handleEditRelation = (relationId: string) => {
    const relation = editedGraph.relations.find(r => r.id === relationId);
    if (relation) {
      relationForm.setFieldsValue({
        sourceId: relation.sourceId,
        targetId: relation.targetId,
        type: relation.type,
        strength: relation.strength,
        description: relation.description
      });
      setSelectedRelationId(relationId);
      setIsEditing(true);
      setRelationModalVisible(true);
    }
  };

  // 删除关系
  const handleDeleteRelation = (relationId: string) => {
    const updatedRelations = editedGraph.relations.filter(
      relation => relation.id !== relationId
    );
    
    setEditedGraph({
      ...editedGraph,
      relations: updatedRelations
    });
    
    message.success('关系已删除');
  };

  // 保存关系
  const handleSaveRelation = (values: any) => {
    if (isEditing && selectedRelationId) {
      // 更新现有关系
      const updatedRelations = editedGraph.relations.map(relation => {
        if (relation.id === selectedRelationId) {
          return {
            ...relation,
            sourceId: values.sourceId,
            targetId: values.targetId,
            type: values.type,
            strength: values.strength,
            description: values.description,
            updatedAt: new Date().toISOString()
          };
        }
        return relation;
      });
      
      setEditedGraph({
        ...editedGraph,
        relations: updatedRelations
      });
      
      message.success('关系已更新');
    } else {
      // 创建新关系
      const newRelation: KnowledgeRelation = {
        id: `relation_${Date.now()}`,
        sourceId: values.sourceId,
        targetId: values.targetId,
        type: values.type,
        strength: values.strength,
        description: values.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setEditedGraph({
        ...editedGraph,
        relations: [...editedGraph.relations, newRelation]
      });
      
      message.success('关系已添加');
    }
    
    setRelationModalVisible(false);
  };

  // 保存图谱
  const handleSaveGraph = () => {
    onSave(editedGraph);
    message.success('知识图谱已保存');
  };

  // 取消编辑
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // 过滤节点
  const filteredNodes = editedGraph.nodes.filter(node => {
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

  // 获取关系类型标签
  const getRelationTypeTag = (type: string) => {
    const typeColors: Record<string, string> = {
      prerequisite: '#fa8c16',
      related: '#722ed1',
      part_of: '#1890ff',
      leads_to: '#52c41a',
      precedes: '#13c2c2',
      follows: '#eb2f96'
    };
    
    const typeNames: Record<string, string> = {
      prerequisite: '先决条件',
      related: '相关',
      part_of: '组成部分',
      leads_to: '引导至',
      precedes: '先于',
      follows: '后于'
    };
    
    return (
      <Tag color={typeColors[type] || '#1890ff'}>
        {typeNames[type] || type}
      </Tag>
    );
  };

  return (
    <div className="knowledge-graph-editor">
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space style={{ marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>
              {readOnly ? '知识图谱查看' : '知识图谱编辑'}
            </Title>
            <Text type="secondary">{editedGraph.title}</Text>
          </Space>
          
          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col span={16}>
              <Input.Search
                placeholder="搜索知识点..."
                allowClear
                enterButton
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={8}>
              <Space>
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
                
                <Select
                  mode="multiple"
                  placeholder="难度过滤"
                  style={{ width: 150 }}
                  value={filterDifficulty}
                  onChange={setFilterDifficulty}
                  allowClear
                >
                  <Option value="basic">基础</Option>
                  <Option value="intermediate">中级</Option>
                  <Option value="advanced">高级</Option>
                </Select>
              </Space>
            </Col>
          </Row>
        </div>
        
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="知识点" key="nodes">
            <div style={{ marginBottom: 16 }}>
              {!readOnly && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddNode}
                >
                  添加知识点
                </Button>
              )}
            </div>
            
            <div className="node-list">
              {filteredNodes.length > 0 ? (
                filteredNodes.map(node => (
                  <Card 
                    key={node.id} 
                    size="small" 
                    style={{ marginBottom: 8 }}
                    title={
                      <Space>
                        <Text strong>{node.title}</Text>
                        {getNodeTypeTag(node.type)}
                        {getDifficultyTag(node.difficulty)}
                        {node.isKeyNode && <Tag color="#f50">关键节点</Tag>}
                      </Space>
                    }
                    extra={
                      <Space>
                        <Button 
                          type="text" 
                          icon={<InfoCircleOutlined />} 
                          onClick={() => handleNodeClick(node)}
                        />
                        {!readOnly && (
                          <>
                            <Button 
                              type="text" 
                              icon={<EditOutlined />} 
                              onClick={() => handleEditNode(node.id)}
                            />
                            <Popconfirm
                              title="确定要删除这个知识点吗？"
                              onConfirm={() => handleDeleteNode(node.id)}
                              okText="确定"
                              cancelText="取消"
                            >
                              <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />} 
                              />
                            </Popconfirm>
                          </>
                        )}
                      </Space>
                    }
                  >
                    <Paragraph ellipsis={{ rows: 2 }}>
                      {node.description}
                    </Paragraph>
                    <div>
                      <Space>
                        <Tag color="#108ee9">学分: {node.credit}</Tag>
                        <Tag color="#87d068">年级: {node.grade}</Tag>
                        {node.keywords && node.keywords.length > 0 && (
                          <span>
                            关键词: {node.keywords.map(k => (
                              <Tag key={k}>{k}</Tag>
                            ))}
                          </span>
                        )}
                      </Space>
                    </div>
                  </Card>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Text type="secondary">没有找到匹配的知识点</Text>
                </div>
              )}
            </div>
          </TabPane>
          
          <TabPane tab="关系" key="relations">
            <div style={{ marginBottom: 16 }}>
              {!readOnly && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddRelation}
                >
                  添加关系
                </Button>
              )}
            </div>
            
            <div className="relation-list">
              {editedGraph.relations.length > 0 ? (
                editedGraph.relations.map(relation => {
                  const sourceNode = editedGraph.nodes.find(n => n.id === relation.sourceId);
                  const targetNode = editedGraph.nodes.find(n => n.id === relation.targetId);
                  
                  return (
                    <Card 
                      key={relation.id} 
                      size="small" 
                      style={{ marginBottom: 8 }}
                      title={
                        <Space>
                          <Text strong>{sourceNode?.title || '未知节点'}</Text>
                          {getRelationTypeTag(relation.type)}
                          <Text strong>{targetNode?.title || '未知节点'}</Text>
                        </Space>
                      }
                      extra={
                        <Space>
                          <Button 
                            type="text" 
                            icon={<InfoCircleOutlined />} 
                            onClick={() => handleRelationClick(relation)}
                          />
                          {!readOnly && (
                            <>
                              <Button 
                                type="text" 
                                icon={<EditOutlined />} 
                                onClick={() => handleEditRelation(relation.id)}
                              />
                              <Popconfirm
                                title="确定要删除这个关系吗？"
                                onConfirm={() => handleDeleteRelation(relation.id)}
                                okText="确定"
                                cancelText="取消"
                              >
                                <Button 
                                  type="text" 
                                  danger 
                                  icon={<DeleteOutlined />} 
                                />
                              </Popconfirm>
                            </>
                          )}
                        </Space>
                      }
                    >
                      <div>
                        <Space>
                          <Tag color="#2db7f5">强度: {relation.strength}</Tag>
                          {relation.description && (
                            <Text type="secondary">{relation.description}</Text>
                          )}
                        </Space>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Text type="secondary">没有关系数据</Text>
                </div>
              )}
            </div>
          </TabPane>
          
          <TabPane tab="可视化" key="visualization">
            <KnowledgeGraphVisualization
              graph={editedGraph}
              highlightedNodes={highlightedNodes}
              highlightedPath={highlightedPath}
              onNodeClick={handleNodeClick}
              onRelationClick={handleRelationClick}
              height={600}
            />
          </TabPane>
        </Tabs>
        
        <Divider />
        
        <div style={{ textAlign: 'right' }}>
          <Space>
            {!readOnly && (
              <>
                <Button onClick={handleCancel}>取消</Button>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  onClick={handleSaveGraph}
                >
                  保存知识图谱
                </Button>
              </>
            )}
            {readOnly && onCancel && (
              <Button onClick={handleCancel}>返回</Button>
            )}
          </Space>
        </div>
      </Card>
      
      {/* 节点编辑模态框 */}
      <Modal
        title={isEditing ? '编辑知识点' : '添加知识点'}
        open={nodeModalVisible}
        onCancel={() => setNodeModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={nodeForm}
          layout="vertical"
          onFinish={handleSaveNode}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="title"
                label="标题"
                rules={[{ required: true, message: '请输入知识点标题' }]}
              >
                <Input placeholder="知识点标题" />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="isKeyNode"
                label="关键节点"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入知识点描述' }]}
          >
            <TextArea rows={2} placeholder="知识点简短描述" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="内容"
          >
            <TextArea rows={4} placeholder="知识点详细内容" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="type"
                label="类型"
                rules={[{ required: true, message: '请选择知识点类型' }]}
              >
                <Select placeholder="选择类型">
                  <Option value="concept">概念</Option>
                  <Option value="fact">事实</Option>
                  <Option value="principle">原理</Option>
                  <Option value="procedure">过程</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="difficulty"
                label="难度"
                rules={[{ required: true, message: '请选择难度级别' }]}
              >
                <Select placeholder="选择难度">
                  <Option value="basic">基础</Option>
                  <Option value="intermediate">中级</Option>
                  <Option value="advanced">高级</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="grade"
                label="适用年级"
                rules={[{ required: true, message: '请选择适用年级' }]}
              >
                <Select placeholder="选择年级">
                  <Option value={1}>大一</Option>
                  <Option value={2}>大二</Option>
                  <Option value={3}>大三</Option>
                  <Option value={4}>大四</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="credit"
                label="学分"
                rules={[{ required: true, message: '请输入学分' }]}
              >
                <InputNumber min={0} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="keywords"
                label="关键词"
                tooltip="多个关键词用逗号分隔"
              >
                <Input placeholder="关键词1, 关键词2, ..." />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setNodeModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 关系编辑模态框 */}
      <Modal
        title={isEditing ? '编辑关系' : '添加关系'}
        open={relationModalVisible}
        onCancel={() => setRelationModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={relationForm}
          layout="vertical"
          onFinish={handleSaveRelation}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sourceId"
                label="源知识点"
                rules={[{ required: true, message: '请选择源知识点' }]}
              >
                <Select placeholder="选择源知识点">
                  {editedGraph.nodes.map(node => (
                    <Option key={node.id} value={node.id}>
                      {node.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="targetId"
                label="目标知识点"
                rules={[{ required: true, message: '请选择目标知识点' }]}
              >
                <Select placeholder="选择目标知识点">
                  {editedGraph.nodes.map(node => (
                    <Option key={node.id} value={node.id}>
                      {node.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="关系类型"
                rules={[{ required: true, message: '请选择关系类型' }]}
              >
                <Select placeholder="选择关系类型">
                  <Option value="prerequisite">先决条件</Option>
                  <Option value="related">相关</Option>
                  <Option value="part_of">组成部分</Option>
                  <Option value="leads_to">引导至</Option>
                  <Option value="precedes">先于</Option>
                  <Option value="follows">后于</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="strength"
                label="关系强度"
                rules={[{ required: true, message: '请输入关系强度' }]}
                tooltip="0-1之间的值，表示关系的强度或重要性"
              >
                <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="关系描述"
          >
            <TextArea rows={2} placeholder="关系的详细描述" />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setRelationModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgeGraphEditor; 