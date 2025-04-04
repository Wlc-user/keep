import React, { useEffect, useState, useMemo } from 'react';
import { Radar } from '@ant-design/charts';
import { Card, Typography, Row, Col, Select, Tooltip, Tag, Divider, Space, Button, Input, Slider, Radio } from 'antd';
import { QuestionCircleOutlined, EditOutlined, SaveOutlined, CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// 六边形评价维度
export enum EvaluationDimension {
  // 学术能力
  ACADEMIC_PERFORMANCE = '学术表现',
  CRITICAL_THINKING = '批判性思维',
  RESEARCH_ABILITY = '研究能力',
  
  // 实践能力
  PRACTICAL_SKILLS = '实践技能',
  INNOVATION = '创新能力',
  PROBLEM_SOLVING = '问题解决',
  
  // 素质能力
  TEAMWORK = '团队协作',
  COMMUNICATION = '沟通能力',
  LEADERSHIP = '领导力',
  
  // 综合素养
  ETHICS = '职业道德',
  SOCIAL_RESPONSIBILITY = '社会责任',
  GLOBAL_PERSPECTIVE = '国际视野',
}

// 评价等级枚举
export enum EvaluationLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  SATISFACTORY = 'satisfactory',
  AVERAGE = 'average',
  NEEDS_IMPROVEMENT = 'needsImprovement'
}

// 评价等级分数映射
const levelScoreMap: Record<EvaluationLevel, number> = {
  [EvaluationLevel.EXCELLENT]: 5,
  [EvaluationLevel.GOOD]: 4,
  [EvaluationLevel.SATISFACTORY]: 3,
  [EvaluationLevel.AVERAGE]: 2,
  [EvaluationLevel.NEEDS_IMPROVEMENT]: 1,
};

// 评价等级名称映射
const levelNameMap: Record<EvaluationLevel, string> = {
  [EvaluationLevel.EXCELLENT]: '优秀',
  [EvaluationLevel.GOOD]: '良好',
  [EvaluationLevel.SATISFACTORY]: '一般',
  [EvaluationLevel.AVERAGE]: '较差',
  [EvaluationLevel.NEEDS_IMPROVEMENT]: '需改进',
};

// 评价等级颜色映射
const levelColorMap: Record<EvaluationLevel, string> = {
  [EvaluationLevel.EXCELLENT]: '#52c41a',
  [EvaluationLevel.GOOD]: '#1890ff',
  [EvaluationLevel.SATISFACTORY]: '#faad14',
  [EvaluationLevel.AVERAGE]: '#fa8c16',
  [EvaluationLevel.NEEDS_IMPROVEMENT]: '#f5222d',
};

// 评价维度分类
export const dimensionCategories = {
  '学术能力': [
    EvaluationDimension.ACADEMIC_PERFORMANCE,
    EvaluationDimension.CRITICAL_THINKING,
    EvaluationDimension.RESEARCH_ABILITY,
  ],
  '实践能力': [
    EvaluationDimension.PRACTICAL_SKILLS,
    EvaluationDimension.INNOVATION,
    EvaluationDimension.PROBLEM_SOLVING,
  ],
  '素质能力': [
    EvaluationDimension.TEAMWORK,
    EvaluationDimension.COMMUNICATION,
    EvaluationDimension.LEADERSHIP,
  ],
  '综合素养': [
    EvaluationDimension.ETHICS,
    EvaluationDimension.SOCIAL_RESPONSIBILITY,
    EvaluationDimension.GLOBAL_PERSPECTIVE,
  ],
};

// 维度说明信息
const dimensionDescriptions: Record<EvaluationDimension, string> = {
  [EvaluationDimension.ACADEMIC_PERFORMANCE]: '课程成绩、学习主动性、学术认真度等。',
  [EvaluationDimension.CRITICAL_THINKING]: '对知识的批判性分析能力、逻辑推理能力等。',
  [EvaluationDimension.RESEARCH_ABILITY]: '探索未知领域、进行学术研究的能力。',
  [EvaluationDimension.PRACTICAL_SKILLS]: '将理论知识运用到实践中的能力。',
  [EvaluationDimension.INNOVATION]: '创新思维、创造性解决问题的能力。',
  [EvaluationDimension.PROBLEM_SOLVING]: '分析问题、解决复杂问题的能力。',
  [EvaluationDimension.TEAMWORK]: '在团队中合作、分享和贡献的能力。',
  [EvaluationDimension.COMMUNICATION]: '有效表达、倾听和交流的能力。',
  [EvaluationDimension.LEADERSHIP]: '激励他人、组织团队、实现目标的能力。',
  [EvaluationDimension.ETHICS]: '诚信、职业道德和学术规范的遵守。',
  [EvaluationDimension.SOCIAL_RESPONSIBILITY]: '对社会责任的认识和承担。',
  [EvaluationDimension.GLOBAL_PERSPECTIVE]: '国际视野、跨文化理解能力。',
};

// 评价数据接口
export interface EvaluationData {
  dimension: EvaluationDimension;
  score: number;
  level: EvaluationLevel;
  comment?: string;
}

// 评价数据集接口
export interface StudentEvaluation {
  studentId: string;
  studentName: string;
  academicYear: string;
  semester: string;
  courseId?: string;
  courseName?: string;
  evaluations: EvaluationData[];
  overallComment?: string;
  evaluatedBy?: string;
  evaluatedAt?: string;
}

// 样式化组件
const LegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: ${props => props.color};
  margin-right: 4px;
`;

const ScoreIndicator = styled.div<{ $level: EvaluationLevel }>`
  font-size: 12px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 10px;
  background-color: ${props => levelColorMap[props.$level]}20;
  color: ${props => levelColorMap[props.$level]};
`;

interface HexagonalEvaluationProps {
  studentEvaluation: StudentEvaluation;
  editable?: boolean;
  onSave?: (evaluation: StudentEvaluation) => void;
  dimensionsToShow?: EvaluationDimension[];
  compact?: boolean;
}

const HexagonalEvaluation: React.FC<HexagonalEvaluationProps> = ({
  studentEvaluation,
  editable = false,
  onSave,
  dimensionsToShow,
  compact = false,
}) => {
  const [editing, setEditing] = useState(false);
  const [editedEvaluation, setEditedEvaluation] = useState<StudentEvaluation>({ ...studentEvaluation });
  const [selectedDimensions, setSelectedDimensions] = useState<EvaluationDimension[]>(
    dimensionsToShow || Object.values(EvaluationDimension)
  );

  // 计算平均得分
  const averageScore = useMemo(() => {
    const filteredEvaluations = studentEvaluation.evaluations.filter(
      item => selectedDimensions.includes(item.dimension)
    );
    if (filteredEvaluations.length === 0) return 0;
    const sum = filteredEvaluations.reduce((acc, item) => acc + item.score, 0);
    return Number((sum / filteredEvaluations.length).toFixed(1));
  }, [studentEvaluation.evaluations, selectedDimensions]);

  // 获取对应的评价等级
  const getEvaluationLevel = (score: number): EvaluationLevel => {
    if (score >= 4.5) return EvaluationLevel.EXCELLENT;
    if (score >= 3.5) return EvaluationLevel.GOOD;
    if (score >= 2.5) return EvaluationLevel.SATISFACTORY;
    if (score >= 1.5) return EvaluationLevel.AVERAGE;
    return EvaluationLevel.NEEDS_IMPROVEMENT;
  };

  // 处理评分变更
  const handleScoreChange = (dimension: EvaluationDimension, score: number) => {
    setEditedEvaluation(prev => {
      const evaluations = [...prev.evaluations];
      const index = evaluations.findIndex(e => e.dimension === dimension);
      
      if (index !== -1) {
        evaluations[index] = {
          ...evaluations[index],
          score,
          level: getEvaluationLevel(score)
        };
      }
      
      return { ...prev, evaluations };
    });
  };

  // 处理评论变更
  const handleCommentChange = (dimension: EvaluationDimension, comment: string) => {
    setEditedEvaluation(prev => {
      const evaluations = [...prev.evaluations];
      const index = evaluations.findIndex(e => e.dimension === dimension);
      
      if (index !== -1) {
        evaluations[index] = {
          ...evaluations[index],
          comment
        };
      }
      
      return { ...prev, evaluations };
    });
  };

  // 处理保存
  const handleSave = () => {
    if (onSave) {
      onSave(editedEvaluation);
    }
    setEditing(false);
  };

  // 处理取消
  const handleCancel = () => {
    setEditedEvaluation({ ...studentEvaluation });
    setEditing(false);
  };

  // 准备雷达图数据
  const radarData = useMemo(() => {
    return studentEvaluation.evaluations
      .filter(item => selectedDimensions.includes(item.dimension))
      .map(item => ({
        name: item.dimension,
        value: item.score,
        type: '当前评价',
        max: 5
      }));
  }, [studentEvaluation.evaluations, selectedDimensions]);

  const getDimensionScore = (dimension: EvaluationDimension): EvaluationData | undefined => {
    return studentEvaluation.evaluations.find(item => item.dimension === dimension);
  };

  const renderEditableEvaluation = () => {
    return (
      <div>
        <Space direction="vertical" style={{ width: '100%' }}>
          {Object.entries(dimensionCategories).map(([category, dimensions]) => (
            <Card
              key={category}
              title={category}
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 16]}>
                {dimensions.map(dimension => {
                  const evaluationData = editedEvaluation.evaluations.find(
                    item => item.dimension === dimension
                  );
                  return (
                    <Col span={24} key={dimension}>
                      <div style={{ marginBottom: 8 }}>
                        <Space>
                          <Text strong>{dimension}</Text>
                          <Tooltip title={dimensionDescriptions[dimension]}>
                            <QuestionCircleOutlined />
                          </Tooltip>
                        </Space>
                      </div>
                      <div>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Text>评分:</Text>
                            <Slider
                              min={1}
                              max={5}
                              step={0.5}
                              value={evaluationData?.score || 3}
                              onChange={(value) => handleScoreChange(dimension, value)}
                              marks={{
                                1: '1',
                                2: '2',
                                3: '3',
                                4: '4',
                                5: '5',
                              }}
                            />
                          </Col>
                          <Col span={12}>
                            <ScoreIndicator $level={evaluationData?.level || EvaluationLevel.SATISFACTORY}>
                              {levelNameMap[evaluationData?.level || EvaluationLevel.SATISFACTORY]}
                              ({evaluationData?.score || 3})
                            </ScoreIndicator>
                          </Col>
                        </Row>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Text>评语:</Text>
                        <Input.TextArea
                          placeholder={`请输入关于${dimension}的评语`}
                          value={evaluationData?.comment || ''}
                          onChange={(e) => handleCommentChange(dimension, e.target.value)}
                          rows={2}
                        />
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          ))}
        </Space>
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Space>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>
              取消
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              保存评价
            </Button>
          </Space>
        </div>
      </div>
    );
  };

  const renderEvaluationDetails = () => {
    return (
      <div>
        <Space direction="vertical" style={{ width: '100%' }}>
          {Object.entries(dimensionCategories).map(([category, dimensions]) => (
            <Card
              key={category}
              title={category}
              size="small"
              style={{ marginBottom: 16 }}
              extra={
                <Radio.Group
                  size="small"
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDimensions(prev => {
                        const newDimensions = [...prev];
                        dimensions.forEach(dim => {
                          if (!newDimensions.includes(dim)) {
                            newDimensions.push(dim);
                          }
                        });
                        return newDimensions;
                      });
                    } else {
                      setSelectedDimensions(prev => 
                        prev.filter(dim => !dimensions.includes(dim))
                      );
                    }
                  }}
                  defaultValue={true}
                >
                  <Radio.Button value={true}>显示</Radio.Button>
                  <Radio.Button value={false}>隐藏</Radio.Button>
                </Radio.Group>
              }
            >
              <Row gutter={[16, 16]}>
                {dimensions.map(dimension => {
                  const evaluationData = getDimensionScore(dimension);
                  if (!evaluationData) return null;
                  
                  return (
                    <Col span={compact ? 24 : 8} key={dimension}>
                      <Card size="small" variant="outlined">
                        <div>
                          <Space>
                            <Text strong>{dimension}</Text>
                            <Tooltip title={dimensionDescriptions[dimension]}>
                              <InfoCircleOutlined />
                            </Tooltip>
                            <ScoreIndicator $level={evaluationData.level}>
                              {levelNameMap[evaluationData.level]}({evaluationData.score})
                            </ScoreIndicator>
                          </Space>
                        </div>
                        {evaluationData.comment && (
                          <Paragraph
                            type="secondary"
                            ellipsis={{ rows: 2, expandable: true, symbol: '更多' }}
                            style={{ marginTop: 8, fontSize: 13 }}
                          >
                            {evaluationData.comment}
                          </Paragraph>
                        )}
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          ))}
        </Space>
      </div>
    );
  };

  return (
    <Card
      title={
        <div>
          <Space>
            <Title level={4} style={{ margin: 0 }}>{studentEvaluation.studentName}的能力评估</Title>
            <Tag color="#108ee9">{studentEvaluation.academicYear}学年 {studentEvaluation.semester}</Tag>
            {studentEvaluation.courseName && <Tag color="#87d068">{studentEvaluation.courseName}</Tag>}
          </Space>
        </div>
      }
      extra={
        editable && (
          <Space>
            <Select
              mode="multiple"
              placeholder="选择显示维度"
              style={{ width: 300 }}
              value={selectedDimensions}
              onChange={setSelectedDimensions}
              maxTagCount={3}
            >
              {Object.values(EvaluationDimension).map(dimension => (
                <Option key={dimension} value={dimension}>
                  {dimension}
                </Option>
              ))}
            </Select>
            {!editing ? (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditing(true)}
              >
                编辑评价
              </Button>
            ) : (
              <Button
                type="default"
                icon={<CloseOutlined />}
                onClick={handleCancel}
              >
                取消
              </Button>
            )}
          </Space>
        )
      }
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <div style={{ textAlign: 'center' }}>
            <Title level={4}>六边形能力雷达图</Title>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color="#2db7f5">总体评分: {averageScore}</Tag>
                <Tag color={levelColorMap[getEvaluationLevel(averageScore)]}>
                  {levelNameMap[getEvaluationLevel(averageScore)]}
                </Tag>
              </Space>
            </div>
            <Radar 
              data={radarData}
              xField="name"
              yField="value"
              seriesField="type"
              legend={undefined}
              meta={{
                value: {
                  min: 0,
                  max: 5,
                  formatter: (value: number) => Number(value.toFixed(1))
                }
              }}
              xAxis={{
                line: null,
                grid: {
                  line: {
                    style: {
                      lineDash: [0, 0],
                    },
                  },
                },
              }}
              yAxis={{
                label: false,
                grid: {
                  alternateColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
              area={{
                style: {
                  fillOpacity: 0.3,
                },
              }}
              point={{
                size: 3,
              }}
              color="#1890ff"
              lineStyle={{
                lineWidth: 2,
              }}
              tooltip={{
                showCrosshairs: true,
                crosshairs: {
                  line: {
                    style: {
                      lineWidth: 1,
                      lineDash: [4, 4],
                      stroke: '#333',
                    },
                  },
                },
              }}
              animation={{
                appear: {
                  animation: 'fade-in',
                  duration: 800,
                },
              }}
              renderer="svg"
              autoFit={true}
            />
            <LegendContainer>
              {Object.entries(levelNameMap).map(([level, name]) => (
                <LegendItem key={level}>
                  <LegendColor color={levelColorMap[level as EvaluationLevel]} />
                  <Text style={{ fontSize: '12px' }}>{name}: {levelScoreMap[level as EvaluationLevel]}</Text>
                </LegendItem>
              ))}
            </LegendContainer>
          </div>
        </Col>
        <Col xs={24} md={12}>
          {editing ? renderEditableEvaluation() : renderEvaluationDetails()}
        </Col>
      </Row>
      
      <Divider />
      
      <div>
        <Title level={5}>总体评价</Title>
        {editing ? (
          <Input.TextArea
            placeholder="请输入总体评价"
            value={editedEvaluation.overallComment || ''}
            onChange={(e) => setEditedEvaluation({
              ...editedEvaluation,
              overallComment: e.target.value,
            })}
            rows={4}
          />
        ) : (
          <Paragraph>
            {studentEvaluation.overallComment || '暂无总体评价'}
          </Paragraph>
        )}
      </div>
      
      {editing && (
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Space>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>
              取消
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              保存所有评价
            </Button>
          </Space>
        </div>
      )}
    </Card>
  );
};

export default HexagonalEvaluation; 