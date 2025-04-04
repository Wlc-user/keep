import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, Button, Modal, Form, Input, Select, message, Tabs,
  Table, Space, Popconfirm, Spin, Typography, Tag, Tooltip
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, 
  NodeIndexOutlined, LinkOutlined, SearchOutlined
} from '@ant-design/icons';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import apiService from '../services/apiService';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface KnowledgeNode {
  id: string;
  name: string;
  type: string;
  description?: string;
  category?: string;
  level?: number;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  description?: string;
  weight?: number;
  createdAt: string;
  updatedAt: string;
}

const nodeTypes = [
  { value: 'concept', label: '概念' },
  { value: 'topic', label: '主题' },
  { value: 'skill', label: '技能' },
  { value: 'knowledge', label: '知识点' },
  { value: 'unit', label: '单元' },
  { value: 'course', label: '课程' }
];

const relationTypes = [
  { value: 'prerequisite', label: '前置关系' },
  { value: 'includes', label: '包含关系' },
  { value: 'related', label: '相关关系' },
  { value: 'extends', label: '扩展关系' },
  { value: 'equivalent', label: '等价关系' }
];

const KnowledgeGraph: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [knowledgeNodes, setKnowledgeNodes] = useState<KnowledgeNode[]>([]);
  const [knowledgeRelations, setKnowledgeRelations] = useState<KnowledgeRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [nodeModalVisible, setNodeModalVisible] = useState(false);
  const [relationModalVisible, setRelationModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState<KnowledgeNode | null>(null);
  const [editingRelation, setEditingRelation] = useState<KnowledgeRelation | null>(null);
  const [activeTab, setActiveTab] = useState('graph');
  const [nodeForm] = Form.useForm();
  const [relationForm] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取知识点
      const nodesResponse = await apiService.get('/api/knowledge/nodes');
      if (Array.isArray(nodesResponse)) {
        setKnowledgeNodes(nodesResponse);
      } else if (nodesResponse && nodesResponse.items && Array.isArray(nodesResponse.items)) {
        setKnowledgeNodes(nodesResponse.items);
      }
      
      // 获取关系
      const relationsResponse = await apiService.get('/api/knowledge/relations');
      if (Array.isArray(relationsResponse)) {
        setKnowledgeRelations(relationsResponse);
      } else if (relationsResponse && relationsResponse.items && Array.isArray(relationsResponse.items)) {
        setKnowledgeRelations(relationsResponse.items);
      }
      
      // 构建图形数据
      buildGraphData(nodesResponse, relationsResponse);
    } catch (error) {
      console.error('获取知识图谱数据失败:', error);
      message.error('获取知识图谱数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const buildGraphData = (nodes: KnowledgeNode[], relations: KnowledgeRelation[]) => {
    if (!Array.isArray(nodes) || !Array.isArray(relations)) {
      return;
    }

    // 创建节点
    const reactFlowNodes = nodes.map((node, index) => ({
      id: node.id,
      data: { 
        label: node.name,
        type: node.type,
        description: node.description 
      },
      position: { x: 100 + Math.random() * 500, y: 100 + Math.random() * 400 },
      style: {
        background: getNodeColor(node.type),
        color: '#fff',
        border: '1px solid #222138',
        borderRadius: '8px',
        width: 150,
        padding: 10,
      },
    }));

    // 创建边
    const reactFlowEdges = relations.map((relation) => ({
      id: relation.id,
      source: relation.sourceId,
      target: relation.targetId,
      label: relation.type,
      style: { stroke: getEdgeColor(relation.type) },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
      },
      data: { 
        description: relation.description,
        weight: relation.weight
      }
    }));

    setNodes(reactFlowNodes);
    setEdges(reactFlowEdges);
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'concept': return '#6495ED';
      case 'topic': return '#FF7F50';
      case 'skill': return '#32CD32';
      case 'knowledge': return '#9370DB';
      case 'unit': return '#FF69B4';
      case 'course': return '#20B2AA';
      default: return '#888888';
    }
  };

  const getEdgeColor = (type: string) => {
    switch (type) {
      case 'prerequisite': return '#FF4500';
      case 'includes': return '#4169E1';
      case 'related': return '#32CD32';
      case 'extends': return '#9932CC';
      case 'equivalent': return '#FF8C00';
      default: return '#888888';
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
    [setEdges]
  );

  // 创建节点
  const handleAddNode = () => {
    nodeForm.resetFields();
    setEditingNode(null);
    setNodeModalVisible(true);
  };

  // 编辑节点
  const handleEditNode = (node: KnowledgeNode) => {
    setEditingNode(node);
    nodeForm.setFieldsValue({
      name: node.name,
      type: node.type,
      description: node.description,
      category: node.category,
      level: node.level
    });
    setNodeModalVisible(true);
  };

  // 删除节点
  const handleDeleteNode = async (id: string) => {
    try {
      await apiService.delete(`/api/knowledge/nodes/${id}`);
      message.success('知识点已删除');
      fetchData();
    } catch (error) {
      console.error('删除知识点失败:', error);
      message.error('删除知识点失败，请稍后重试');
    }
  };

  // 提交节点表单
  const handleNodeSubmit = async () => {
    try {
      const values = await nodeForm.validateFields();
      setConfirmLoading(true);

      if (editingNode) {
        // 更新节点
        await apiService.put(`/api/knowledge/nodes/${editingNode.id}`, values);
        message.success('知识点已更新');
      } else {
        // 创建节点
        await apiService.post('/api/knowledge/nodes', values);
        message.success('知识点已创建');
      }

      setNodeModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('保存知识点失败:', error);
      message.error('保存知识点失败，请稍后重试');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 创建关系
  const handleAddRelation = () => {
    relationForm.resetFields();
    setEditingRelation(null);
    setRelationModalVisible(true);
  };

  // 编辑关系
  const handleEditRelation = (relation: KnowledgeRelation) => {
    setEditingRelation(relation);
    relationForm.setFieldsValue({
      sourceId: relation.sourceId,
      targetId: relation.targetId,
      type: relation.type,
      description: relation.description,
      weight: relation.weight
    });
    setRelationModalVisible(true);
  };

  // 删除关系
  const handleDeleteRelation = async (id: string) => {
    try {
      await apiService.delete(`/api/knowledge/relations/${id}`);
      message.success('关系已删除');
      fetchData();
    } catch (error) {
      console.error('删除关系失败:', error);
      message.error('删除关系失败，请稍后重试');
    }
  };

  // 提交关系表单
  const handleRelationSubmit = async () => {
    try {
      const values = await relationForm.validateFields();
      setConfirmLoading(true);

      if (editingRelation) {
        // 更新关系
        await apiService.put(`/api/knowledge/relations/${editingRelation.id}`, values);
        message.success('关系已更新');
      } else {
        // 创建关系
        await apiService.post('/api/knowledge/relations', values);
        message.success('关系已创建');
      }

      setRelationModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('保存关系失败:', error);
      message.error('保存关系失败，请稍后重试');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 节点表格列
  const nodeColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getNodeColor(type)}>
          {nodeTypes.find(t => t.value === type)?.label || type}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: KnowledgeNode) => (
        <Space>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditNode(record)} 
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个知识点吗？"
              onConfirm={() => handleDeleteNode(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 关系表格列
  const relationColumns = [
    {
      title: '源节点',
      dataIndex: 'sourceId',
      key: 'sourceId',
      render: (sourceId: string) => {
        const node = knowledgeNodes.find(n => n.id === sourceId);
        return node ? node.name : sourceId;
      },
    },
    {
      title: '目标节点',
      dataIndex: 'targetId',
      key: 'targetId',
      render: (targetId: string) => {
        const node = knowledgeNodes.find(n => n.id === targetId);
        return node ? node.name : targetId;
      },
    },
    {
      title: '关系类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getEdgeColor(type)}>
          {relationTypes.find(t => t.value === type)?.label || type}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: KnowledgeRelation) => (
        <Space>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditRelation(record)} 
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要删除这个关系吗？"
              onConfirm={() => handleDeleteRelation(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="knowledge-graph-container">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={2}>知识图谱管理</Title>
          <Space>
            <Button 
              type="primary" 
              icon={<NodeIndexOutlined />}
              onClick={handleAddNode}
            >
              添加知识点
            </Button>
            <Button 
              icon={<LinkOutlined />}
              onClick={handleAddRelation}
            >
              添加关系
            </Button>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="图形视图" key="graph" />
          <TabPane tab="知识点列表" key="nodes" />
          <TabPane tab="关系列表" key="relations" />
        </Tabs>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <Spin size="large" tip="加载中..." />
          </div>
        ) : (
          <>
            {activeTab === 'graph' && (
              <div style={{ height: 600, border: '1px solid #ddd', borderRadius: 4 }} ref={reactFlowWrapper}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  fitView
                >
                  <Controls />
                  <MiniMap />
                  <Background />
                </ReactFlow>
              </div>
            )}

            {activeTab === 'nodes' && (
              <Table
                columns={nodeColumns}
                dataSource={knowledgeNodes}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            )}

            {activeTab === 'relations' && (
              <Table
                columns={relationColumns}
                dataSource={knowledgeRelations}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            )}
          </>
        )}
      </Card>

      {/* 知识点表单模态框 */}
      <Modal
        title={editingNode ? '编辑知识点' : '添加知识点'}
        open={nodeModalVisible}
        onCancel={() => setNodeModalVisible(false)}
        onOk={handleNodeSubmit}
        confirmLoading={confirmLoading}
        width={600}
      >
        <Form
          form={nodeForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入知识点名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择知识点类型' }]}
          >
            <Select>
              {nodeTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="level"
            label="级别"
          >
            <Select>
              <Option value={1}>初级</Option>
              <Option value={2}>中级</Option>
              <Option value={3}>高级</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 关系表单模态框 */}
      <Modal
        title={editingRelation ? '编辑关系' : '添加关系'}
        open={relationModalVisible}
        onCancel={() => setRelationModalVisible(false)}
        onOk={handleRelationSubmit}
        confirmLoading={confirmLoading}
        width={600}
      >
        <Form
          form={relationForm}
          layout="vertical"
        >
          <Form.Item
            name="sourceId"
            label="源知识点"
            rules={[{ required: true, message: '请选择源知识点' }]}
          >
            <Select showSearch optionFilterProp="children">
              {knowledgeNodes.map(node => (
                <Option key={node.id} value={node.id}>{node.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="targetId"
            label="目标知识点"
            rules={[{ required: true, message: '请选择目标知识点' }]}
          >
            <Select showSearch optionFilterProp="children">
              {knowledgeNodes.map(node => (
                <Option key={node.id} value={node.id}>{node.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="关系类型"
            rules={[{ required: true, message: '请选择关系类型' }]}
          >
            <Select>
              {relationTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="weight"
            label="权重"
          >
            <Select>
              <Option value={1}>1 - 弱关联</Option>
              <Option value={2}>2</Option>
              <Option value={3}>3 - 中度关联</Option>
              <Option value={4}>4</Option>
              <Option value={5}>5 - 强关联</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgeGraph; 