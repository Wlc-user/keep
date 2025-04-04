import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, InputNumber, Radio, Space, Switch, Modal, Tooltip, Empty, Spin, Tag, Row, Col, Card, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined, LinkOutlined, QuestionCircleOutlined, BulbOutlined, SearchOutlined } from '@ant-design/icons';
import { VideoTestPoint, VideoTestPointType, TestPointDifficulty } from '../types/material';
import { KnowledgeNode, KnowledgeNodeType } from '../types/knowledgeGraph';
import KnowledgeGraphVisualization from './KnowledgeGraphVisualization';
import { formatTime } from '../utils/formatters';

const { Option } = Select;
const { TextArea } = Input;

interface VideoTestPointEditorProps {
  videoId: string;
  testPoint?: VideoTestPoint;
  onSave: (testPoint: VideoTestPoint) => Promise<void>;
  onCancel: () => void;
  videoCurrentTime?: number;
  videoThumbnailUrl?: string;
  videoDuration?: number;
  isLoading?: boolean;
}

const VideoTestPointEditor: React.FC<VideoTestPointEditorProps> = ({
  videoId,
  testPoint,
  onSave,
  onCancel,
  videoCurrentTime = 0,
  videoThumbnailUrl,
  videoDuration = 0,
  isLoading = false
}) => {
  const [form] = Form.useForm();
  const [questionType, setQuestionType] = useState<'single_choice' | 'multiple_choice' | 'text'>(
    testPoint?.options ? (Array.isArray(testPoint.correctAnswer) ? 'multiple_choice' : 'single_choice') : 'text'
  );
  const [options, setOptions] = useState<string[]>(testPoint?.options || ['', '', '', '']);
  const [timePosition, setTimePosition] = useState<number>(testPoint?.timePosition || videoCurrentTime);
  const [knowledgeNodeSearchModalVisible, setKnowledgeNodeSearchModalVisible] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<KnowledgeNode[]>([]);
  const [selectedKnowledgeNodes, setSelectedKnowledgeNodes] = useState<KnowledgeNode[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // 初始化表单值
  useEffect(() => {
    if (testPoint) {
      form.setFieldsValue({
        title: testPoint.title,
        description: testPoint.description,
        type: testPoint.type,
        difficulty: testPoint.difficulty,
        question: testPoint.question,
        explanation: testPoint.explanation,
        timePosition: testPoint.timePosition,
        correctAnswer: testPoint.correctAnswer
      });
      
      setTimePosition(testPoint.timePosition);
      
      // 如果有关联的知识节点，加载它们
      if (testPoint.relatedKnowledgeNodes && testPoint.relatedKnowledgeNodes.length > 0) {
        if (typeof testPoint.relatedKnowledgeNodes[0] === 'string') {
          // IDs, need to fetch
          fetchKnowledgeNodes(testPoint.relatedKnowledgeNodes as string[]);
        } else {
          // Already have the nodes
          setSelectedKnowledgeNodes(testPoint.relatedKnowledgeNodes as KnowledgeNode[]);
        }
      }
    } else {
      form.setFieldsValue({
        timePosition: videoCurrentTime,
        type: 'knowledge_check',
        difficulty: 'medium'
      });
    }
  }, [form, testPoint, videoCurrentTime]);
  
  // 获取知识节点
  const fetchKnowledgeNodes = async (nodeIds: string[]) => {
    try {
      const response = await fetch(`/api/knowledge-nodes?ids=${nodeIds.join(',')}`);
      if (response.ok) {
        const nodes = await response.json();
        setSelectedKnowledgeNodes(nodes);
      }
    } catch (error) {
      console.error('Error fetching knowledge nodes:', error);
    }
  };
  
  // 搜索知识节点
  const searchKnowledgeNodes = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    
    try {
      const response = await fetch(`/api/knowledge-nodes/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error searching knowledge nodes:', error);
    } finally {
      setSearchLoading(false);
    }
  };
  
  // 防抖搜索
  const handleSearchInputChange = (query: string) => {
    setSearchQuery(query);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      searchKnowledgeNodes(query);
    }, 500);
    
    setSearchTimeout(timeout);
  };
  
  // 处理选择知识节点
  const handleSelectKnowledgeNode = (node: KnowledgeNode) => {
    if (!selectedKnowledgeNodes.some(n => n.id === node.id)) {
      setSelectedKnowledgeNodes([...selectedKnowledgeNodes, node]);
    }
  };
  
  // 处理移除知识节点
  const handleRemoveKnowledgeNode = (nodeId: string) => {
    setSelectedKnowledgeNodes(selectedKnowledgeNodes.filter(node => node.id !== nodeId));
  };
  
  // 处理问题类型变更
  const handleQuestionTypeChange = (value: 'single_choice' | 'multiple_choice' | 'text') => {
    setQuestionType(value);
    if (value === 'text') {
      form.setFieldsValue({ correctAnswer: '' });
    } else if (value === 'single_choice') {
      form.setFieldsValue({ correctAnswer: options[0] });
    } else {
      form.setFieldsValue({ correctAnswer: [options[0]] });
    }
  };
  
  // 处理选项变更
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  // 添加选项
  const handleAddOption = () => {
    setOptions([...options, '']);
  };
  
  // 删除选项
  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    
    // 如果删除的选项是当前正确答案，需要更新正确答案
    const currentCorrectAnswer = form.getFieldValue('correctAnswer');
    if (questionType === 'single_choice' && currentCorrectAnswer === options[index]) {
      form.setFieldsValue({ correctAnswer: newOptions[0] || '' });
    } else if (questionType === 'multiple_choice' && Array.isArray(currentCorrectAnswer)) {
      const newCorrectAnswer = currentCorrectAnswer.filter(ans => ans !== options[index]);
      form.setFieldsValue({ correctAnswer: newCorrectAnswer });
    }
  };
  
  // 保存表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const formData: VideoTestPoint = {
        id: testPoint?.id || `tp_${Date.now()}`,
        videoId,
        title: values.title,
        description: values.description,
        timePosition: values.timePosition,
        type: values.type,
        difficulty: values.difficulty,
        question: values.question,
        explanation: values.explanation,
        relatedKnowledgeNodes: selectedKnowledgeNodes.map(node => node.id)
      };
      
      if (questionType !== 'text') {
        formData.options = options;
        formData.correctAnswer = values.correctAnswer;
      }
      
      await onSave(formData);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };
  
  // 获取知识节点类型的颜色
  const getNodeTypeColor = (type: KnowledgeNodeType) => {
    const colorMap: Record<KnowledgeNodeType, string> = {
      [KnowledgeNodeType.CONCEPT]: '#1890ff',
      [KnowledgeNodeType.PRINCIPLE]: '#722ed1',
      [KnowledgeNodeType.PROCEDURE]: '#13c2c2',
      [KnowledgeNodeType.FACT]: '#52c41a',
      [KnowledgeNodeType.TERM]: '#fa8c16'
    };
    return colorMap[type];
  };
  
  // 渲染知识节点搜索模态框
  const renderKnowledgeNodeSearchModal = () => (
    <Modal
      title="关联知识图谱节点"
      open={knowledgeNodeSearchModalVisible}
      onCancel={() => setKnowledgeNodeSearchModalVisible(false)}
      width={800}
      footer={[
        <Button key="close" onClick={() => setKnowledgeNodeSearchModalVisible(false)}>
          关闭
        </Button>
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索知识节点..."
          value={searchQuery}
          onChange={e => handleSearchInputChange(e.target.value)}
          loading={searchLoading}
          enterButton
        />
      </div>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="搜索结果" style={{ marginBottom: 16 }} size="small">
            {searchLoading ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Spin />
              </div>
            ) : searchResults.length > 0 ? (
              <div style={{ maxHeight: 300, overflow: 'auto' }}>
                {searchResults.map(node => (
                  <div 
                    key={node.id}
                    style={{ 
                      padding: '8px 12px',
                      marginBottom: 8,
                      border: '1px solid #f0f0f0',
                      borderRadius: 4,
                      cursor: 'pointer',
                      backgroundColor: selectedKnowledgeNodes.some(n => n.id === node.id) ? '#f6f6f6' : 'white'
                    }}
                    onClick={() => handleSelectKnowledgeNode(node)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold' }}>{node.name}</span>
                      <Tag color={getNodeTypeColor(node.type)}>{node.type}</Tag>
                    </div>
                    <div style={{ fontSize: '0.9em', color: '#666', marginTop: 4 }}>
                      {node.description.length > 100 
                        ? `${node.description.substring(0, 100)}...` 
                        : node.description}
                    </div>
                    
                    {node.keywords && node.keywords.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        {node.keywords.map(keyword => (
                          <Tag key={keyword} style={{ marginRight: 4 }}>{keyword}</Tag>
                        ))}
                      </div>
                    )}
                    
                    {selectedKnowledgeNodes.some(n => n.id === node.id) && (
                      <div style={{ textAlign: 'right', marginTop: 8 }}>
                        <Tag color="green">已选择</Tag>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Empty 
                description={searchQuery ? "未找到匹配的知识节点" : "请输入搜索关键词"} 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="已选择的节点" size="small">
            {selectedKnowledgeNodes.length > 0 ? (
              <div style={{ maxHeight: 300, overflow: 'auto' }}>
                {selectedKnowledgeNodes.map(node => (
                  <div 
                    key={node.id}
                    style={{ 
                      padding: '8px 12px',
                      marginBottom: 8,
                      border: '1px solid #f0f0f0',
                      borderRadius: 4
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold' }}>{node.name}</span>
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleRemoveKnowledgeNode(node.id)}
                      />
                    </div>
                    <div style={{ fontSize: '0.9em', color: '#666', marginTop: 4 }}>
                      {node.description.length > 100 
                        ? `${node.description.substring(0, 100)}...` 
                        : node.description}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Tag color={getNodeTypeColor(node.type)}>{node.type}</Tag>
                      <Tag color="#2db7f5">{node.difficulty}</Tag>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty 
                description="尚未选择任何知识节点" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>
    </Modal>
  );
  
  return (
    <div className="video-test-point-editor">
      <Spin spinning={isLoading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 'knowledge_check',
            difficulty: 'medium',
            timePosition: videoCurrentTime
          }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="title"
                label="测试点标题"
                rules={[{ required: true, message: '请输入测试点标题' }]}
              >
                <Input placeholder="输入测试点标题" />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="timePosition"
                label="时间点 (秒)"
                rules={[{ required: true, message: '请输入时间点' }]}
              >
                <InputNumber
                  min={0}
                  max={videoDuration}
                  style={{ width: '100%' }}
                  onChange={value => setTimePosition(value as number)}
                  formatter={value => formatTime(value as number)}
                  parser={value => {
                    const parts = value?.split(':') || [];
                    if (parts.length === 2) {
                      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
                    } else if (parts.length === 3) {
                      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
                    }
                    return parseInt(value || '0');
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="测试点类型"
                rules={[{ required: true, message: '请选择测试点类型' }]}
              >
                <Select placeholder="选择测试点类型">
                  <Option value="concept_check">概念检查</Option>
                  <Option value="application">应用题</Option>
                  <Option value="reflection">反思题</Option>
                  <Option value="knowledge_check">知识点检查</Option>
                  <Option value="attention_check">注意力检查</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="difficulty"
                label="难度级别"
                rules={[{ required: true, message: '请选择难度级别' }]}
              >
                <Radio.Group>
                  <Radio.Button value="easy">简单</Radio.Button>
                  <Radio.Button value="medium">中等</Radio.Button>
                  <Radio.Button value="hard">困难</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={2} placeholder="输入测试点描述" />
          </Form.Item>
          
          <Form.Item
            name="question"
            label="问题"
            rules={[{ required: true, message: '请输入问题' }]}
          >
            <TextArea rows={3} placeholder="输入问题内容" />
          </Form.Item>
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8 }}>问题类型</div>
            <Radio.Group value={questionType} onChange={e => handleQuestionTypeChange(e.target.value)}>
              <Radio.Button value="single_choice">单选题</Radio.Button>
              <Radio.Button value="multiple_choice">多选题</Radio.Button>
              <Radio.Button value="text">开放式问题</Radio.Button>
            </Radio.Group>
          </div>
          
          {questionType !== 'text' && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span>选项</span>
                <Button type="link" onClick={handleAddOption} icon={<PlusOutlined />}>
                  添加选项
                </Button>
              </div>
              
              {options.map((option, index) => (
                <div key={index} style={{ display: 'flex', marginBottom: 8 }}>
                  <Input
                    value={option}
                    onChange={e => handleOptionChange(index, e.target.value)}
                    placeholder={`选项 ${index + 1}`}
                    style={{ marginRight: 8 }}
                  />
                  <Button 
                    icon={<DeleteOutlined />} 
                    onClick={() => handleRemoveOption(index)}
                    disabled={options.length <= 2}
                  />
                </div>
              ))}
              
              <Form.Item
                name="correctAnswer"
                label="正确答案"
                rules={[{ required: true, message: '请选择正确答案' }]}
              >
                {questionType === 'single_choice' ? (
                  <Select placeholder="选择正确答案">
                    {options.map((option, index) => (
                      <Option key={index} value={option} disabled={!option}>
                        {option || `选项 ${index + 1} (未填写)`}
                      </Option>
                    ))}
                  </Select>
                ) : (
                  <Select 
                    mode="multiple" 
                    placeholder="选择所有正确答案"
                    optionFilterProp="children"
                  >
                    {options.map((option, index) => (
                      <Option key={index} value={option} disabled={!option}>
                        {option || `选项 ${index + 1} (未填写)`}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </div>
          )}
          
          <Form.Item
            name="explanation"
            label="解释/反馈"
          >
            <TextArea rows={3} placeholder="输入解释或反馈内容，将在用户回答后显示" />
          </Form.Item>
          
          <Divider />
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                关联知识图谱节点 
                <Tooltip title="关联知识图谱节点可以帮助系统理解测试点涵盖的知识范围，并提供更好的学习分析">
                  <QuestionCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
              </div>
              <Button 
                type="primary" 
                icon={<LinkOutlined />} 
                onClick={() => setKnowledgeNodeSearchModalVisible(true)}
              >
                添加关联节点
              </Button>
            </div>
            
            {selectedKnowledgeNodes.length > 0 ? (
              <div style={{ marginBottom: 16 }}>
                {selectedKnowledgeNodes.map(node => (
                  <Tag
                    key={node.id}
                    closable
                    onClose={() => handleRemoveKnowledgeNode(node.id)}
                    color={getNodeTypeColor(node.type)}
                    style={{ marginBottom: 8 }}
                  >
                    {node.name}
                  </Tag>
                ))}
              </div>
            ) : (
              <Empty 
                description="尚未关联任何知识节点" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
          
          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" onClick={handleSubmit}>
                保存测试点
              </Button>
              <Button onClick={onCancel}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Spin>
      
      {renderKnowledgeNodeSearchModal()}
    </div>
  );
};

export default VideoTestPointEditor; 