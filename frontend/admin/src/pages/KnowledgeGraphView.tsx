import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Tabs, 
  Button, 
  Space, 
  Typography, 
  Divider, 
  Tag, 
  List, 
  Avatar, 
  Descriptions,
  Empty,
  Spin,
  message,
  Tooltip,
  Dropdown,
  Menu,
  Badge,
  Row,
  Col
} from 'antd';
import { 
  NodeIndexOutlined, 
  ArrowLeftOutlined, 
  ShareAltOutlined, 
  DownloadOutlined,
  InfoCircleOutlined,
  UserOutlined,
  BookOutlined,
  FileImageOutlined,
  FileOutlined,
  DownOutlined,
  ExportOutlined
} from '@ant-design/icons';
import KnowledgeGraphVisualization from '../components/KnowledgeGraphVisualization';
import knowledgeGraphService, { 
  KnowledgeGraph, 
  KnowledgeNode, 
  KnowledgeRelation, 
  LearningPath 
} from '../services/knowledgeGraphService';
import html2canvas from 'html2canvas';

const { Title, Text, Paragraph } = Typography;

interface KnowledgeGraphViewParams {
  graphId: string;
}

const KnowledgeGraphView: React.FC = () => {
  const { graphId } = useParams<KnowledgeGraphViewParams>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [graph, setGraph] = useState<KnowledgeGraph | null>(null);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [selectedRelation, setSelectedRelation] = useState<KnowledgeRelation | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResults, setAnalysisResults] = useState<{
    keyNodes: KnowledgeNode[];
    recommendedPaths: { name: string; nodes: KnowledgeNode[] }[];
    clusters: { name: string; nodes: KnowledgeNode[] }[];
  } | null>(null);
  
  // 加载知识图谱数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 模拟API调用
        // 在实际应用中，这里应该调用knowledgeGraphService.getKnowledgeGraph(graphId)
        const mockGraph = knowledgeGraphService.simulateGraphExtraction([
          {
            id: '1',
            title: '人工智能导论教材',
            description: '介绍人工智能的基本概念、历史发展和应用领域',
            type: 'document',
            url: '/uploads/ai_intro.pdf',
            fileSize: 15 * 1024 * 1024,
            format: 'pdf',
            uploadedBy: 'admin',
            createdAt: '2023-03-01T10:00:00Z',
            updatedAt: '2023-03-01T10:00:00Z',
            metadata: {
              pages: 120,
              author: '张教授'
            }
          }
        ]);
        
        setGraph(mockGraph);
        
        // 模拟生成学习路径
        // 在实际应用中，这里应该调用knowledgeGraphService.generateLearningPaths(graphId)
        const mockPaths = knowledgeGraphService.simulatePathGeneration(mockGraph);
        setLearningPaths(mockPaths);
        
        setLoading(false);
      } catch (error) {
        console.error('加载知识图谱数据失败:', error);
        message.error('加载知识图谱数据失败');
        setLoading(false);
      }
    };
    
    loadData();
  }, [graphId]);
  
  // 处理返回
  const handleBack = () => {
    navigate('/knowledge-graph');
  };
  
  // 处理查看学习路径
  const handleViewPath = (path: LearningPath) => {
    setSelectedPath(path);
    setHighlightedPath(path.nodes);
  };
  
  // 处理节点点击
  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedNode(node);
    setSelectedRelation(null);
    setHighlightedNodes([node.id]);
  };
  
  // 处理关系点击
  const handleRelationClick = (relation: KnowledgeRelation) => {
    setSelectedRelation(relation);
    setSelectedNode(null);
    setHighlightedPath([relation.sourceId, relation.targetId]);
  };
  
  // 处理导出知识图谱
  const handleExportGraph = () => {
    if (!graph) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(graph));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${graph.title}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    message.success('知识图谱导出成功');
  };
  
  // 处理导出学习路径
  const handleExportPath = (path: LearningPath) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(path));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${path.title}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    message.success('学习路径导出成功');
  };
  
  // 添加导出功能
  const handleExportAsPNG = () => {
    if (!graph) return;
    
    message.loading({ content: '正在生成图片...', key: 'exportPng' });
    
    // 获取SVG元素
    const svgElement = document.getElementById('knowledge-graph-svg');
    if (!svgElement) {
      message.error({ content: '无法找到图谱元素', key: 'exportPng' });
      return;
    }
    
    // 使用html2canvas将SVG转换为图片
    html2canvas(svgElement, {
      backgroundColor: '#ffffff',
      allowTaint: true,
      useCORS: true,
      scale: 2 // 提高导出图片质量
    }).then(canvas => {
      message.success({ content: '图片已生成，正在下载...', key: 'exportPng' });
      
      // 将canvas转换为图片并下载
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `知识图谱_${graph.title}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = imgData;
      link.click();
    }).catch(error => {
      console.error('导出图片失败:', error);
      message.error({ content: '导出图片失败，请重试', key: 'exportPng' });
    });
  };

  const handleExportAsJSON = () => {
    if (!graph) return;
    
    message.loading({ content: '正在准备数据...', key: 'exportJson' });
    
    try {
      // 准备导出数据
      const exportData = {
        title: graph.title,
        description: graph.description,
        nodes: graph.nodes,
        relations: graph.relations,
        metadata: {
          exportDate: new Date().toISOString(),
          exportVersion: '1.0',
          nodeCount: graph.nodes.length,
          relationCount: graph.relations.length
        }
      };
      
      // 转换为JSON字符串
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // 创建Blob对象
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `知识图谱_${graph.title}_${new Date().toISOString().split('T')[0]}.json`;
      link.href = url;
      
      // 触发下载
      link.click();
      
      // 释放URL对象
      URL.revokeObjectURL(url);
      
      message.success({ content: 'JSON数据导出成功', key: 'exportJson' });
    } catch (error) {
      console.error('导出JSON失败:', error);
      message.error({ content: '导出JSON失败，请重试', key: 'exportJson' });
    }
  };
  
  // 获取难度标签
  const getDifficultyTag = (difficulty: string) => {
    switch (difficulty) {
      case 'basic':
        return <Tag color="success">基础</Tag>;
      case 'intermediate':
        return <Tag color="warning">中级</Tag>;
      case 'advanced':
        return <Tag color="error">高级</Tag>;
      default:
        return null;
    }
  };
  
  // 获取类型标签
  const getTypeTag = (type: string) => {
    switch (type) {
      case 'concept':
        return <Tag color="#1890ff">概念</Tag>;
      case 'fact':
        return <Tag color="#52c41a">事实</Tag>;
      case 'principle':
        return <Tag color="#722ed1">原理</Tag>;
      case 'procedure':
        return <Tag color="#fa8c16">过程</Tag>;
      case 'algorithm':
        return <Tag color="#eb2f96">算法</Tag>;
      default:
        return null;
    }
  };
  
  // 获取年级标签
  const getGradeTag = (grade: number) => {
    switch (grade) {
      case 1:
        return <Tag color="#52c41a">大一</Tag>;
      case 2:
        return <Tag color="#1890ff">大二</Tag>;
      case 3:
        return <Tag color="#722ed1">大三</Tag>;
      case 4:
        return <Tag color="#eb2f96">大四</Tag>;
      default:
        return null;
    }
  };
  
  // 获取关系类型标签
  const getRelationTypeTag = (type: string) => {
    switch (type) {
      case 'includes':
        return <Tag color="#1890ff">包含</Tag>;
      case 'prerequisite':
        return <Tag color="#fa8c16">先决条件</Tag>;
      case 'uses':
        return <Tag color="#52c41a">使用</Tag>;
      case 'related':
        return <Tag color="#722ed1">相关</Tag>;
      case 'part_of':
        return <Tag color="#eb2f96">组成部分</Tag>;
      case 'leads_to':
        return <Tag color="#f5222d">引导至</Tag>;
      case 'precedes':
        return <Tag color="#13c2c2">先于</Tag>;
      case 'follows':
        return <Tag color="#faad14">后于</Tag>;
      default:
        return null;
    }
  };
  
  // 渲染节点关系
  const renderNodeRelationships = (nodeId: string) => {
    if (!graph) return null;
    
    // 查找与该节点相关的所有关系
    const incomingRelations = graph.relations.filter(rel => rel.targetId === nodeId);
    const outgoingRelations = graph.relations.filter(rel => rel.sourceId === nodeId);
    
    if (incomingRelations.length === 0 && outgoingRelations.length === 0) {
      return <Text type="secondary">无相关关系</Text>;
    }
    
    return (
      <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
        {incomingRelations.length > 0 && (
          <div>
            <Text strong>前置知识点：</Text>
            <Space wrap>
              {incomingRelations.map(rel => {
                const sourceNode = graph.nodes.find(n => n.id === rel.sourceId);
                return (
                  <Tag key={rel.id} color="blue">
                    {sourceNode?.title} {getRelationTypeTag(rel.type)}
                  </Tag>
                );
              })}
            </Space>
          </div>
        )}
        
        {outgoingRelations.length > 0 && (
          <div>
            <Text strong>后续知识点：</Text>
            <Space wrap>
              {outgoingRelations.map(rel => {
                const targetNode = graph.nodes.find(n => n.id === rel.targetId);
                return (
                  <Tag key={rel.id} color="green">
                    {targetNode?.title} {getRelationTypeTag(rel.type)}
                  </Tag>
                );
              })}
            </Space>
          </div>
        )}
      </Space>
    );
  };
  
  // 渲染学习路径卡片
  const renderPathCard = (path: LearningPath) => {
    // 获取路径中的节点详情
    const pathNodes = path.nodes.map(nodeId => {
      return graph?.nodes.find(n => n.id === nodeId);
    }).filter(Boolean) as KnowledgeNode[];

    return (
      <Card 
        title={path.title} 
        style={{ marginBottom: 16 }} 
        key={path.id}
        extra={
          <Space>
            <Tag color={path.difficulty === 'basic' ? 'green' : path.difficulty === 'intermediate' ? 'blue' : 'purple'}>
              {path.difficulty === 'basic' ? '基础' : path.difficulty === 'intermediate' ? '中级' : '高级'}
            </Tag>
            <Button 
              icon={<DownloadOutlined />} 
              size="small" 
              onClick={() => handleExportPath(path)}
            >
              导出
            </Button>
            <Button 
              size="small" 
              onClick={() => handleViewPath(path)}
            >
              查看详情
            </Button>
          </Space>
        }
      >
        <Paragraph>{path.description}</Paragraph>
        <Descriptions size="small" column={3}>
          <Descriptions.Item label="知识点数量">{path.nodes.length}</Descriptions.Item>
          <Descriptions.Item label="预计学习时间">{path.estimatedTime}分钟</Descriptions.Item>
          <Descriptions.Item label="创建时间">{new Date(path.createdAt).toLocaleString()}</Descriptions.Item>
        </Descriptions>
        
        {selectedPath && selectedPath.id === path.id && (
          <div style={{ marginTop: 16 }}>
            <Divider orientation="left">路径知识点</Divider>
            <List
              size="small"
              dataSource={pathNodes}
              renderItem={(node, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar>{index + 1}</Avatar>}
                    title={
                      <Space>
                        <Text strong>{node.title}</Text>
                        {getTypeTag(node.type)}
                        {getDifficultyTag(node.difficulty)}
                        {getGradeTag(node.grade)}
                        <Tag color="#722ed1">学分: {node.credit}</Tag>
                        {node.isKeyNode && <Tag color="#f50">关键节点</Tag>}
                      </Space>
                    }
                    description={
                      <>
                        <div>{node.content || node.description}</div>
                        {renderNodeRelationships(node.id)}
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Card>
    );
  };
  
  // 分析知识图谱
  const handleAnalyzeGraph = () => {
    setAnalyzing(true);
    
    // 模拟分析过程
    setTimeout(() => {
      // 关键节点分析 - 选择连接数最多的节点
      const nodeConnections = new Map<string, number>();
      
      graph.relations.forEach(relation => {
        nodeConnections.set(
          relation.sourceId, 
          (nodeConnections.get(relation.sourceId) || 0) + 1
        );
        nodeConnections.set(
          relation.targetId, 
          (nodeConnections.get(relation.targetId) || 0) + 1
        );
      });
      
      // 按连接数排序
      const sortedNodes = [...nodeConnections.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // 取前5个
        .map(([nodeId]) => graph.nodes.find(node => node.id === nodeId))
        .filter(Boolean) as KnowledgeNode[];
      
      // 学习路径推荐 - 基于难度和依赖关系
      const basicPath = graph.nodes
        .filter(node => node.difficulty === 'basic')
        .slice(0, 5);
        
      const intermediatePath = graph.nodes
        .filter(node => node.difficulty === 'intermediate')
        .slice(0, 5);
        
      const advancedPath = graph.nodes
        .filter(node => node.difficulty === 'advanced')
        .slice(0, 5);
      
      // 知识点聚类 - 按类型和年级
      const typeClusters = new Map<string, KnowledgeNode[]>();
      const gradeClusters = new Map<string, KnowledgeNode[]>();
      
      graph.nodes.forEach(node => {
        // 按类型聚类
        if (!typeClusters.has(node.type)) {
          typeClusters.set(node.type, []);
        }
        typeClusters.get(node.type)?.push(node);
        
        // 按年级聚类
        const gradeKey = `Grade ${node.grade}`;
        if (!gradeClusters.has(gradeKey)) {
          gradeClusters.set(gradeKey, []);
        }
        gradeClusters.get(gradeKey)?.push(node);
      });
      
      // 设置分析结果
      setAnalysisResults({
        keyNodes: sortedNodes,
        recommendedPaths: [
          { name: '基础学习路径', nodes: basicPath },
          { name: '进阶学习路径', nodes: intermediatePath },
          { name: '高级学习路径', nodes: advancedPath }
        ],
        clusters: [
          ...[...typeClusters.entries()].map(([name, nodes]) => ({ name, nodes })),
          ...[...gradeClusters.entries()].map(([name, nodes]) => ({ name, nodes }))
        ]
      });
      
      setAnalyzing(false);
      message.success('知识图谱分析完成');
    }, 2000);
  };
  
  // 渲染分析结果
  const renderAnalysisResults = () => {
    if (!analysisResults) return null;
    
    const items = [
      {
        key: 'keyNodes',
        label: '关键知识点',
        children: (
          <List
            itemLayout="horizontal"
            dataSource={analysisResults.keyNodes}
            renderItem={node => (
              <List.Item
                actions={[
                  <Button 
                    type="link" 
                    onClick={() => {
                      // 高亮显示该节点
                      setHighlightedNodes([node.id]);
                    }}
                  >
                    高亮显示
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={node.title}
                  description={`重要度: ${node.importance}, 类型: ${node.type}`}
                />
              </List.Item>
            )}
          />
        )
      },
      {
        key: 'paths',
        label: '推荐学习路径',
        children: (
          <>
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>推荐学习路径</Title>
              <Text type="secondary">基于知识图谱自动生成的学习路径推荐</Text>
            </div>
            {analysisResults.recommendedPaths.map((path, index) => (
              <Card 
                key={index} 
                title={path.name} 
                size="small" 
                style={{ marginBottom: 16 }}
                extra={
                  <Button 
                    type="link" 
                    onClick={() => {
                      // 高亮显示路径
                      setHighlightedPath(path.nodes.map(node => node.id));
                    }}
                  >
                    在图谱中查看
                  </Button>
                }
              >
                <List
                  size="small"
                  dataSource={path.nodes}
                  renderItem={(node, nodeIndex) => (
                    <List.Item>
                      <Space>
                        <Badge count={nodeIndex + 1} style={{ backgroundColor: '#1890ff' }} />
                        <Text>{node.title}</Text>
                        {getTypeTag(node.type)}
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            ))}
          </>
        )
      },
      {
        key: 'clusters',
        label: '知识点聚类',
        children: (
          <Row gutter={[16, 16]}>
            {analysisResults.clusters.map((cluster, index) => (
              <Col span={12} key={index}>
                <Card 
                  title={cluster.name} 
                  size="small"
                  extra={
                    <Button 
                      type="link" 
                      onClick={() => {
                        // 高亮显示聚类
                        setHighlightedNodes(cluster.nodes.map(node => node.id));
                      }}
                    >
                      在图谱中查看
                    </Button>
                  }
                >
                  <List
                    size="small"
                    dataSource={cluster.nodes.slice(0, 5)} // 只显示前5个
                    renderItem={node => (
                      <List.Item>
                        <Text>{node.title}</Text>
                      </List.Item>
                    )}
                  />
                  {cluster.nodes.length > 5 && (
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                      <Text type="secondary">
                        还有 {cluster.nodes.length - 5} 个知识点...
                      </Text>
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        )
      }
    ];
    
    return (
      <Card title="知识图谱分析结果" style={{ marginTop: 16 }}>
        <Tabs defaultActiveKey="keyNodes" destroyInactiveTabPane={true} items={items} />
      </Card>
    );
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>加载知识图谱...</div>
        </div>
      </div>
    );
  }
  
  if (!graph) {
    return (
      <Empty description="未找到知识图谱" />
    );
  }
  
  return (
    <div className="knowledge-graph-view">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              返回
            </Button>
            <Title level={4} style={{ margin: 0 }}>{graph.title}</Title>
            {graph.description && (
              <Tooltip title={graph.description}>
                <InfoCircleOutlined style={{ color: '#1890ff', marginLeft: 8 }} />
              </Tooltip>
            )}
          </Space>
          
          <Space>
            <Button 
              icon={<NodeIndexOutlined />} 
              type="primary"
              onClick={handleAnalyzeGraph}
              loading={analyzing}
            >
              分析知识图谱
            </Button>
            
            <Dropdown menu={{ 
              items: [
                {
                  key: 'png',
                  label: '导出为PNG图片',
                  icon: <FileImageOutlined />,
                  onClick: handleExportAsPNG
                },
                {
                  key: 'json',
                  label: '导出为JSON数据',
                  icon: <FileOutlined />,
                  onClick: handleExportAsJSON
                }
              ]
            }}>
              <Button icon={<ExportOutlined />}>
                导出图谱 <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        </div>
        
        <Paragraph>{graph.description}</Paragraph>
        
        <Tabs 
          defaultActiveKey="visualization"
          destroyInactiveTabPane={true}
          items={[
            {
              key: 'visualization',
              label: '知识图谱可视化',
              children: (
                <KnowledgeGraphVisualization 
                  graph={graph}
                  highlightedNodes={highlightedNodes}
                  highlightedPath={highlightedPath}
                  onNodeClick={handleNodeClick}
                  onRelationClick={handleRelationClick}
                  height={600}
                />
              )
            },
            {
              key: 'paths',
              label: '学习路径',
              children: (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <Title level={4}>推荐学习路径</Title>
                    <Text type="secondary">基于知识图谱自动生成的学习路径推荐</Text>
                  </div>
                  {learningPaths.length > 0 ? (
                    learningPaths.map(path => renderPathCard(path))
                  ) : (
                    <Empty description="暂无学习路径" />
                  )}
                </>
              )
            },
            {
              key: 'nodes',
              label: '知识点列表',
              children: (
                <List
                  itemLayout="horizontal"
                  dataSource={graph.nodes}
                  renderItem={node => (
                    <List.Item
                      actions={[
                        <Button size="small" onClick={() => handleNodeClick(node)}>查看</Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<InfoCircleOutlined />} />}
                        title={
                          <Space>
                            <Text strong>{node.title}</Text>
                            {getTypeTag(node.type)}
                            {getDifficultyTag(node.difficulty)}
                            {getGradeTag(node.grade)}
                            <Tag color="#722ed1">学分: {node.credit}</Tag>
                            {node.isKeyNode && <Tag color="#f50">关键节点</Tag>}
                          </Space>
                        }
                        description={node.content}
                      />
                    </List.Item>
                  )}
                />
              )
            },
            {
              key: 'relations',
              label: '关系列表',
              children: (
                <List
                  itemLayout="horizontal"
                  dataSource={graph.relations}
                  renderItem={relation => {
                    const sourceNode = graph.nodes.find(node => node.id === relation.sourceId);
                    const targetNode = graph.nodes.find(node => node.id === relation.targetId);
                    
                    return (
                      <List.Item
                        actions={[
                          <Button size="small" onClick={() => handleRelationClick(relation)}>查看</Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon={<ShareAltOutlined />} />}
                          title={
                            <Space>
                              <Text strong>{sourceNode?.title || relation.sourceId}</Text>
                              <ArrowLeftOutlined />
                              {getRelationTypeTag(relation.type)}
                              <ArrowLeftOutlined />
                              <Text strong>{targetNode?.title || relation.targetId}</Text>
                            </Space>
                          }
                          description={`关系强度: ${relation.strength}`}
                        />
                      </List.Item>
                    );
                  }}
                />
              )
            }
          ]}
        />
      </Card>
      
      {/* 知识图谱可视化 */}
      <Card style={{ marginTop: 16 }}>
        <KnowledgeGraphVisualization 
          graph={graph}
          loading={loading}
          height={600}
          highlightedNodes={highlightedNodes}
          highlightedPath={highlightedPath}
          onNodeClick={handleNodeClick}
          onRelationClick={handleRelationClick}
        />
      </Card>
      
      {/* 分析结果 */}
      {renderAnalysisResults()}
    </div>
  );
};

export default KnowledgeGraphView; 