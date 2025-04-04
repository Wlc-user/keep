import React, { useState, useEffect } from 'react';
import { Card, Button, Divider, Typography, Space, Alert, Row, Col, Spin, Empty, Statistic } from 'antd';
import KnowledgeGraphVisualization from '../components/KnowledgeGraphVisualization';
import { initializeResources } from '../styles/loadExternalResources';
import { KnowledgeGraph, KnowledgeNode, KnowledgeRelation } from '../services/knowledgeGraphService';

const { Title, Text, Paragraph } = Typography;

// 创建简化版的知识节点类型，与接口兼容
interface SimpleKnowledgeNode {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  // 添加兼容KnowledgeNode接口所需的属性
  credit?: number;
  grade?: number;
  sourceId?: string;
  sourceType?: any;
  keywords?: string[];
  createdAt?: string;
  updatedAt?: string;
  metadata?: any;
}

// 创建简化版的知识关系类型，与接口兼容
interface SimpleKnowledgeRelation {
  id: string;
  source: string;
  target: string;
  type: string;
  description: string;
  // 兼容KnowledgeRelation接口的属性
  weight?: number;
  bidirectional?: boolean;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

// 创建简化版的知识图谱类型，与接口兼容
interface SimpleKnowledgeGraph {
  id: string;
  title: string;
  description: string;
  nodes: SimpleKnowledgeNode[];
  relations: SimpleKnowledgeRelation[];
}

// 测试数据
const testGraphData: SimpleKnowledgeGraph = {
  id: 'test-graph',
  title: '测试知识图谱',
  description: '用于测试知识图谱可视化组件的测试数据',
  nodes: [
    { 
      id: 'node1', 
      title: '知识点1', 
      description: '这是第一个知识点', 
      type: 'concept',
      difficulty: 'basic'
    },
    { 
      id: 'node2', 
      title: '知识点2', 
      description: '这是第二个知识点', 
      type: 'fact',
      difficulty: 'intermediate'
    },
    { 
      id: 'node3', 
      title: '知识点3', 
      description: '这是第三个知识点', 
      type: 'principle',
      difficulty: 'advanced'
    }
  ],
  relations: [
    { 
      id: 'relation1', 
      source: 'node1', 
      target: 'node2', 
      type: 'leads_to',
      description: '知识点1导致知识点2'
    },
    { 
      id: 'relation2', 
      source: 'node2', 
      target: 'node3', 
      type: 'part_of',
      description: '知识点2是知识点3的一部分'
    }
  ]
};

// 单节点测试数据
const singleNodeTestData: SimpleKnowledgeGraph = {
  id: 'single-node-test',
  title: '单节点测试',
  description: '只有一个节点的图谱',
  nodes: [
    { 
      id: 'solo-node', 
      title: '孤立节点', 
      description: '这是一个孤立的节点，没有与其他节点的关系', 
      type: 'concept',
      difficulty: 'basic'
    }
  ],
  relations: []
};

// 多节点无关系测试数据
const noRelationsTestData: SimpleKnowledgeGraph = {
  id: 'no-relations-test',
  title: '无关系测试',
  description: '有节点但没有关系的图谱',
  nodes: [
    { 
      id: 'node-a', 
      title: '节点A', 
      description: '没有关系的节点A', 
      type: 'concept',
      difficulty: 'basic'
    },
    { 
      id: 'node-b', 
      title: '节点B', 
      description: '没有关系的节点B', 
      type: 'fact',
      difficulty: 'intermediate'
    },
    { 
      id: 'node-c', 
      title: '节点C', 
      description: '没有关系的节点C', 
      type: 'principle',
      difficulty: 'advanced'
    }
  ],
  relations: []
};

// 更复杂的测试数据
const complexTestData: SimpleKnowledgeGraph = {
  id: 'complex-test-graph',
  title: '复杂测试图谱',
  description: '包含更多节点和关系的测试知识图谱',
  nodes: [
    { id: 'n1', title: '编程基础', description: '计算机编程的基本概念', type: 'concept', difficulty: 'basic' },
    { id: 'n2', title: '变量和数据类型', description: '变量定义和基本数据类型', type: 'concept', difficulty: 'basic' },
    { id: 'n3', title: '条件语句', description: '条件判断和分支结构', type: 'principle', difficulty: 'basic' },
    { id: 'n4', title: '循环结构', description: '各种循环结构的使用', type: 'principle', difficulty: 'basic' },
    { id: 'n5', title: '函数', description: '函数定义和调用', type: 'principle', difficulty: 'intermediate' },
    { id: 'n6', title: '数组', description: '数组的定义和操作', type: 'concept', difficulty: 'intermediate' },
    { id: 'n7', title: '对象和类', description: '面向对象编程基础', type: 'concept', difficulty: 'advanced' },
    { id: 'n8', title: '异常处理', description: '错误和异常处理机制', type: 'principle', difficulty: 'advanced' }
  ],
  relations: [
    { id: 'r1', source: 'n1', target: 'n2', type: 'leads_to', description: '基础知识引导数据类型学习' },
    { id: 'r2', source: 'n2', target: 'n3', type: 'leads_to', description: '掌握变量后学习条件语句' },
    { id: 'r3', source: 'n2', target: 'n4', type: 'leads_to', description: '掌握变量后学习循环结构' },
    { id: 'r4', source: 'n3', target: 'n5', type: 'leads_to', description: '条件语句是函数的基础' },
    { id: 'r5', source: 'n4', target: 'n5', type: 'leads_to', description: '循环是函数的基础' },
    { id: 'r6', source: 'n5', target: 'n6', type: 'leads_to', description: '函数知识引导数组学习' },
    { id: 'r7', source: 'n6', target: 'n7', type: 'leads_to', description: '数组基础引导对象概念学习' },
    { id: 'r8', source: 'n5', target: 'n8', type: 'leads_to', description: '函数是异常处理的基础' },
    { id: 'r9', source: 'n7', target: 'n8', type: 'related_to', description: '对象和异常处理相关' }
  ]
};

// 无效数据测试
const invalidDataTest: SimpleKnowledgeGraph = {
  id: 'invalid-data-test',
  title: '无效数据测试',
  description: '测试组件处理无效数据的能力',
  nodes: [
    { id: 'node1', title: '有效节点', description: '这是一个有效的节点', type: 'concept', difficulty: 'basic' },
    { id: 'node2', title: '无ID节点', description: '这个节点没有ID', type: 'fact', difficulty: 'intermediate' },
    { id: 'node3', title: '缺少字段节点', description: '', type: 'principle', difficulty: 'advanced' }
  ],
  relations: [
    { id: 'rel1', source: 'node1', target: 'nonexistent', type: 'leads_to', description: '目标节点不存在' },
    { id: 'rel2', source: 'node1', target: 'node3', type: 'part_of', description: '缺少ID' },
    { id: 'rel3', source: 'nonexistent', target: 'node3', type: 'related_to', description: '源节点不存在' }
  ]
};

const KnowledgeGraphTest: React.FC = () => {
  const [selectedGraphData, setSelectedGraphData] = useState<SimpleKnowledgeGraph>(testGraphData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resourcesInitialized, setResourcesInitialized] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedRelation, setSelectedRelation] = useState<any>(null);
  const [eventLogs, setEventLogs] = useState<{ type: string; message: string; time: Date }[]>([]);

  // 初始化资源
  useEffect(() => {
    console.log('测试页面初始化中...');
    try {
      const initialized = initializeResources();
      setResourcesInitialized(initialized);
      console.log('资源初始化状态:', initialized ? '成功' : '失败');
    } catch (err) {
      console.error('资源初始化出错:', err);
      setError('资源初始化失败，请检查控制台日志');
    }
  }, []);

  // 模拟加载图形数据
  const loadGraphData = (data: SimpleKnowledgeGraph) => {
    setLoading(true);
    setError(null);
    
    // 模拟网络延迟
    setTimeout(() => {
      try {
        console.log('加载图谱数据:', data);
        setSelectedGraphData(data);
        setLoading(false);
      } catch (err) {
        console.error('加载图谱数据出错:', err);
        setError('加载图谱数据失败，请检查控制台日志');
        setLoading(false);
      }
    }, 1000);
  };

  // 处理节点点击
  const handleNodeClick = (node: any) => {
    console.log('节点点击:', node);
    setSelectedNode(node);
    setSelectedRelation(null);
    setEventLogs([...eventLogs, { type: '节点点击', message: `节点ID: ${node.id}`, time: new Date() }]);
  };

  // 处理关系点击
  const handleRelationClick = (relation: any) => {
    console.log('关系点击:', relation);
    setSelectedRelation(relation);
    setSelectedNode(null);
    setEventLogs([...eventLogs, { type: '关系点击', message: `关系ID: ${relation.id}`, time: new Date() }]);
  };

  // 转换为KnowledgeGraph类型
  const convertToKnowledgeGraph = (data: SimpleKnowledgeGraph): KnowledgeGraph => {
    // 添加必要的字段，确保与KnowledgeGraph接口兼容
    return {
      ...data,
      nodes: data.nodes.map(node => ({
        ...node,
        credit: 1,
        grade: 1,
        sourceId: 'source-id',
        sourceType: 'document',
        keywords: [],
        createdAt: '',
        updatedAt: ''
      })) as KnowledgeNode[],
      relations: data.relations as KnowledgeRelation[]
    };
  };

  return (
    <div className="knowledge-graph-test-page">
      <Card title="知识图谱可视化测试" style={{ marginBottom: 20 }}>
        <Paragraph>
          此页面用于测试知识图谱可视化组件的渲染功能，可以选择不同的测试数据来观察组件行为。
        </Paragraph>
        
        {error && (
          <Alert
            message="错误"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        {!resourcesInitialized && (
          <Alert
            message="警告"
            description="资源初始化未完成，可能会影响组件的正常显示"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space wrap>
            <Button 
              type="primary" 
              onClick={() => loadGraphData(testGraphData)}
              disabled={loading}
            >
              加载测试图谱
            </Button>
            <Button 
              onClick={() => loadGraphData(singleNodeTestData)}
              disabled={loading}
            >
              加载单节点图谱
            </Button>
            <Button 
              onClick={() => loadGraphData(noRelationsTestData)}
              disabled={loading}
            >
              加载无关系图谱
            </Button>
            <Button 
              onClick={() => loadGraphData(complexTestData)}
              disabled={loading}
              type="dashed"
            >
              加载复杂图谱
            </Button>
            <Button 
              onClick={() => loadGraphData(invalidDataTest)}
              disabled={loading}
              danger
            >
              加载无效数据图谱
            </Button>
          </Space>
          
          <Text type="secondary">
            当前加载: {selectedGraphData.title} - {selectedGraphData.nodes.length} 节点, {selectedGraphData.relations?.length || 0} 关系
          </Text>
        </Space>
      </Card>
      
      <Card title="图谱渲染" style={{ minHeight: 600 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 500 }}>
            <Spin>
              <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <div style={{ marginBottom: 24 }}>加载中...</div>
              </div>
            </Spin>
          </div>
        ) : (
          <div className="graph-container" style={{ height: 600, border: '1px solid #eee', borderRadius: 4, overflow: 'hidden' }}>
            <KnowledgeGraphVisualization 
              graph={convertToKnowledgeGraph(selectedGraphData)}
              width={800}
              height={600}
              onNodeClick={handleNodeClick}
              onRelationClick={handleRelationClick}
            />
          </div>
        )}
      </Card>
      
      <Card title="调试信息" style={{ marginTop: 20 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Title level={5}>节点数据</Title>
            <pre style={{ maxHeight: 200, overflow: 'auto', background: '#f5f5f5', padding: 10, borderRadius: 4 }}>
              {JSON.stringify(selectedGraphData.nodes, null, 2)}
            </pre>
          </Col>
          <Col span={12}>
            <Title level={5}>关系数据</Title>
            <pre style={{ maxHeight: 200, overflow: 'auto', background: '#f5f5f5', padding: 10, borderRadius: 4 }}>
              {JSON.stringify(selectedGraphData.relations, null, 2)}
            </pre>
          </Col>
        </Row>
        
        <Divider />
        
        <Row gutter={16}>
          <Col span={12}>
            <Title level={5}>交互事件</Title>
            <Card 
              size="small" 
              title="最近操作" 
              style={{ 
                marginBottom: 16
              }}
              bodyStyle={{ maxHeight: 150, overflow: 'auto' }}
            >
              {eventLogs.map((log, index) => (
                <div key={index} style={{ marginBottom: 8, padding: 8, background: '#f9f9f9', borderRadius: 4 }}>
                  <Text strong>{log.type}</Text>: {log.message}
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{log.time.toLocaleTimeString()}</Text>
                  </div>
                </div>
              ))}
              {eventLogs.length === 0 && <Empty description="暂无操作记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            </Card>
            <Button onClick={() => console.log('当前图谱数据:', selectedGraphData)}>
              输出当前图谱到控制台
            </Button>
          </Col>
          <Col span={12}>
            <Title level={5}>组件状态</Title>
            <Card size="small">
              <Statistic title="节点数量" value={selectedGraphData.nodes?.length || 0} />
              <Statistic title="关系数量" value={selectedGraphData.relations?.length || 0} style={{ marginTop: 16 }} />
              <Statistic 
                title="已选中" 
                value={selectedNode ? '节点' : selectedRelation ? '关系' : '无'} 
                style={{ marginTop: 16 }} 
              />
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                {selectedNode ? `节点ID: ${selectedNode.id}` : 
                 selectedRelation ? `关系ID: ${selectedRelation.id}` : '未选中任何元素'}
              </Text>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default KnowledgeGraphTest; 