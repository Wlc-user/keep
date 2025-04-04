import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, Typography, Row, Col, Select, Statistic, Table, Progress, Tag, Space, Button, Tooltip, Divider, Empty } from 'antd';
import { DownloadOutlined, QuestionCircleOutlined, RiseOutlined, FallOutlined, ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Radar, Column, Area, Pie } from '@ant-design/charts';
import { EvaluationDimension, EvaluationLevel, dimensionCategories, StudentEvaluation } from './HexagonalEvaluation';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// 定义评分颜色
const levelColors = {
  [EvaluationLevel.EXCELLENT]: '#52c41a',
  [EvaluationLevel.GOOD]: '#1890ff',
  [EvaluationLevel.SATISFACTORY]: '#faad14',
  [EvaluationLevel.AVERAGE]: '#fa8c16',
  [EvaluationLevel.NEEDS_IMPROVEMENT]: '#f5222d',
};

// 定义评分级别分布
interface LevelDistribution {
  level: EvaluationLevel;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

// 定义维度平均分
interface DimensionAverage {
  dimension: EvaluationDimension;
  averageScore: number;
  increaseFromPrev?: number;
}

// 定义表格数据接口
interface StudentSummaryData {
  key: string;
  rank: number;
  studentId: string;
  studentName: string;
  averageScore: number;
  improvementRate?: number;
  topDimension?: EvaluationDimension;
  weakDimension?: EvaluationDimension;
  level: EvaluationLevel;
}

interface ClassEvaluationSummaryProps {
  className: string;
  classId: string;
  academicYear: string;
  semester: string;
  studentEvaluations: StudentEvaluation[];
  previousEvaluations?: StudentEvaluation[];
}

const ClassEvaluationSummary: React.FC<ClassEvaluationSummaryProps> = ({
  className,
  classId,
  academicYear,
  semester,
  studentEvaluations,
  previousEvaluations,
}) => {
  const [selectedDimensions, setSelectedDimensions] = useState<EvaluationDimension[]>(
    Object.values(EvaluationDimension)
  );
  // 添加refs代替findDOMNode
  const statisticRef = useRef(null);
  const statCardRef = useRef(null);
  
  // 计算班级平均分
  const classAverageScore = useMemo(() => {
    if (!studentEvaluations || studentEvaluations.length === 0) return 0;
    
    const totalScores = studentEvaluations.reduce((total, student) => {
      const studentAvg = student.evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / student.evaluations.length;
      return total + studentAvg;
    }, 0);
    
    return Number((totalScores / studentEvaluations.length).toFixed(1));
  }, [studentEvaluations]);
  
  // 计算各维度平均分
  const dimensionAverages = useMemo(() => {
    if (!studentEvaluations || studentEvaluations.length === 0) 
      return Object.values(EvaluationDimension).map(dim => ({ dimension: dim, averageScore: 0 }));
    
    // 当前评价的维度平均分
    const currentAverages = Object.values(EvaluationDimension).map(dimension => {
      const scores = studentEvaluations
        .flatMap(student => student.evaluations)
        .filter(evaluation => evaluation.dimension === dimension)
        .map(evaluation => evaluation.score);
      
      const average = scores.length > 0 
        ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1))
        : 0;
      
      return { dimension, averageScore: average };
    });
    
    // 如果有历史评价数据，计算增长率
    if (previousEvaluations && previousEvaluations.length > 0) {
      const prevAverages = Object.values(EvaluationDimension).reduce((acc, dimension) => {
        const scores = previousEvaluations
          .flatMap(student => student.evaluations)
          .filter(evaluation => evaluation.dimension === dimension)
          .map(evaluation => evaluation.score);
        
        const average = scores.length > 0 
          ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1))
          : 0;
        
        acc[dimension] = average;
        return acc;
      }, {} as Record<EvaluationDimension, number>);
      
      // 添加增长数据
      return currentAverages.map(item => ({
        ...item,
        increaseFromPrev: Number((item.averageScore - (prevAverages[item.dimension] || 0)).toFixed(1))
      }));
    }
    
    return currentAverages;
  }, [studentEvaluations, previousEvaluations]);
  
  // 计算级别分布
  const levelDistribution = useMemo(() => {
    if (!studentEvaluations || studentEvaluations.length === 0) 
      return Object.values(EvaluationLevel).map(level => ({ 
        level, 
        label: getLevelLabel(level),
        count: 0, 
        percentage: 0,
        color: levelColors[level]
      }));
    
    const levelCounts: Record<EvaluationLevel, number> = Object.values(EvaluationLevel).reduce(
      (acc, level) => ({ ...acc, [level]: 0 }),
      {} as Record<EvaluationLevel, number>
    );
    
    // 计算每个学生的平均评价级别
    studentEvaluations.forEach(student => {
      const scores = student.evaluations.map(e => e.score);
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const level = getEvaluationLevel(avgScore);
      levelCounts[level]++;
    });
    
    // 转换为百分比
    const total = studentEvaluations.length;
    return Object.entries(levelCounts).map(([level, count]) => ({
      level: level as EvaluationLevel,
      label: getLevelLabel(level as EvaluationLevel),
      count,
      percentage: Number(((count / total) * 100).toFixed(1)),
      color: levelColors[level as EvaluationLevel]
    }));
  }, [studentEvaluations]);
  
  // 获取评价级别标签
  function getLevelLabel(level: EvaluationLevel): string {
    switch(level) {
      case EvaluationLevel.EXCELLENT: return '优秀';
      case EvaluationLevel.GOOD: return '良好';
      case EvaluationLevel.SATISFACTORY: return '一般';
      case EvaluationLevel.AVERAGE: return '较差';
      case EvaluationLevel.NEEDS_IMPROVEMENT: return '需改进';
    }
  }
  
  // 根据分数获取评价级别
  function getEvaluationLevel(score: number): EvaluationLevel {
    if (score >= 4.5) return EvaluationLevel.EXCELLENT;
    if (score >= 3.5) return EvaluationLevel.GOOD;
    if (score >= 2.5) return EvaluationLevel.SATISFACTORY;
    if (score >= 1.5) return EvaluationLevel.AVERAGE;
    return EvaluationLevel.NEEDS_IMPROVEMENT;
  }
  
  // 准备学生数据表格
  const studentTableData = useMemo(() => {
    if (!studentEvaluations || studentEvaluations.length === 0) return [];
    
    // 计算每个学生的平均分
    const studentsWithScores = studentEvaluations.map(student => {
      const evaluations = student.evaluations;
      const avgScore = Number((evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length).toFixed(1));
      
      // 找出最高和最低维度
      let maxScore = -1;
      let minScore = 6;
      let topDimension = undefined;
      let weakDimension = undefined;
      
      evaluations.forEach(e => {
        if (e.score > maxScore) {
          maxScore = e.score;
          topDimension = e.dimension;
        }
        if (e.score < minScore) {
          minScore = e.score;
          weakDimension = e.dimension;
        }
      });
      
      // 计算与上次评价的进步率
      let improvementRate = undefined;
      if (previousEvaluations) {
        const prevEval = previousEvaluations.find(pe => pe.studentId === student.studentId);
        if (prevEval) {
          const prevAvg = prevEval.evaluations.reduce((sum, e) => sum + e.score, 0) / prevEval.evaluations.length;
          improvementRate = Number(((avgScore - prevAvg) / prevAvg * 100).toFixed(1));
        }
      }
      
      return {
        key: student.studentId,
        studentId: student.studentId,
        studentName: student.studentName,
        averageScore: avgScore,
        improvementRate,
        topDimension,
        weakDimension,
        level: getEvaluationLevel(avgScore)
      };
    });
    
    // 按平均分排序
    studentsWithScores.sort((a, b) => b.averageScore - a.averageScore);
    
    // 添加排名
    return studentsWithScores.map((student, index) => ({
      ...student,
      rank: index + 1
    }));
  }, [studentEvaluations, previousEvaluations]);
  
  // 表格列定义
  const columns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      render: (rank: number) => (
        <Text strong>{rank}</Text>
      )
    },
    {
      title: '学生',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (name: string, record: StudentSummaryData) => (
        <Space>
          <Text strong>{name}</Text>
          <Text type="secondary">({record.studentId})</Text>
        </Space>
      )
    },
    {
      title: '平均得分',
      dataIndex: 'averageScore',
      key: 'averageScore',
      render: (score: number, record: StudentSummaryData) => (
        <Space>
          <Text strong>{score}</Text>
          <Tag color={levelColors[record.level]}>{getLevelLabel(record.level)}</Tag>
        </Space>
      )
    },
    {
      title: '进步率',
      dataIndex: 'improvementRate',
      key: 'improvementRate',
      render: (rate?: number) => {
        if (rate === undefined) return <Text type="secondary">-</Text>;
        return (
          <Space>
            {rate >= 0 ? (
              <Tag color="green" icon={<ArrowUpOutlined />}>+{rate}%</Tag>
            ) : (
              <Tag color="red" icon={<ArrowDownOutlined />}>{rate}%</Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: '优势维度',
      dataIndex: 'topDimension',
      key: 'topDimension',
      render: (dimension?: EvaluationDimension) => (
        dimension ? <Tag color="green">{dimension}</Tag> : <Text type="secondary">-</Text>
      )
    },
    {
      title: '弱势维度',
      dataIndex: 'weakDimension',
      key: 'weakDimension',
      render: (dimension?: EvaluationDimension) => (
        dimension ? <Tag color="orange">{dimension}</Tag> : <Text type="secondary">-</Text>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: StudentSummaryData) => (
        <Button type="link" size="small" onClick={() => console.log('查看详情', record.studentId)}>
          查看详情
        </Button>
      )
    }
  ];
  
  // 雷达图配置
  const radarConfig = {
    data: dimensionAverages.map(item => ({
      dimension: item.dimension,
      score: item.averageScore,
    })),
    xField: 'dimension',
    yField: 'score',
    seriesField: '',
    meta: {
      score: {
        alias: '平均分',
        min: 0,
        max: 5,
      },
    },
    xAxis: {
      line: null,
      tickLine: null,
    },
    yAxis: {
      grid: {
        line: {
          type: 'line',
        },
      },
    },
    area: {
      style: {
        fillOpacity: 0.6,
      },
    },
    point: {
      size: 4,
    },
    color: '#1890ff',
    legend: undefined,
    renderer: 'svg',
  };
  
  // 柱状图配置
  const columnConfig = {
    data: dimensionAverages.map(item => ({
      dimension: item.dimension,
      score: item.averageScore,
      increaseFromPrev: item.increaseFromPrev || 0,
    })),
    isGroup: true,
    xField: 'dimension',
    yField: 'score',
    seriesField: 'name',
    meta: {
      score: {
        max: 5,
        min: 0,
      },
    },
    label: {
      position: 'middle',
      layout: [
        {
          type: 'interval-adjust-position',
        },
        {
          type: 'interval-hide-overlap',
        },
        {
          type: 'adjust-color',
        },
      ],
    },
    color: '#1890ff',
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
  };
  
  // 级别分布柱状图配置
  const levelColumnConfig = {
    data: levelDistribution,
    xField: 'label',
    yField: 'percentage',
    seriesField: 'level',
    color: ({ level }) => levelColors[level as EvaluationLevel],
    label: {
      position: 'middle',
      style: {
        fill: '#fff',
        opacity: 0.8,
      },
      content: (item) => `${item.percentage}%`,
    },
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
  };
  
  return (
    <div>
      <Card ref={statCardRef} variant="outlined" title={`${className} - ${academicYear} ${semester} 学期评价摘要`}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card variant="outlined" title="班级统计">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic 
                    title="班级人数" 
                    value={studentEvaluations.length} 
                    suffix="人"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="平均评分"
                    value={classAverageScore}
                    valueStyle={{ color: classAverageScore >= 4 ? '#52c41a' : classAverageScore >= 3 ? '#1890ff' : '#faad14' }}
                  />
                </Col>
                <Col span={24}>
                  <Divider styles={{ wrapper: { margin: '12px 0' } }} />
                  <Title level={5}>评级分布</Title>
                  <Row gutter={[8, 8]}>
                    {levelDistribution.map(item => (
                      <Col span={12} key={item.level}>
                        <Tooltip title={`${item.count}名学生 (${item.percentage}%)`}>
                          <div style={{ marginBottom: 8 }}>
                            <Space>
                              <Tag color={item.color}>{item.label}</Tag>
                              <Text type="secondary">{item.count}人</Text>
                            </Space>
                            <Progress 
                              percent={item.percentage} 
                              strokeColor={item.color}
                              size={8}
                              showInfo={false}
                            />
                          </div>
                        </Tooltip>
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
          
          <Col xs={24} md={16}>
            <Card 
              variant="outlined" 
              title="能力维度分析"
              extra={
                <Select
                  mode="multiple"
                  placeholder="选择维度"
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
              }
            >
              <Row gutter={16}>
                <Col xs={24} lg={12}>
                  <div style={{ textAlign: 'center' }}>
                    <Title level={5}>雷达图</Title>
                    <Radar
                      data={radarConfig.data}
                      xField={radarConfig.xField}
                      yField={radarConfig.yField}
                      seriesField={radarConfig.seriesField}
                      meta={radarConfig.meta}
                      xAxis={radarConfig.xAxis}
                      yAxis={radarConfig.yAxis}
                      area={radarConfig.area}
                      point={radarConfig.point}
                      color={radarConfig.color}
                      legend={undefined}
                      renderer="svg"
                      height={250}
                    />
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div style={{ textAlign: 'center' }}>
                    <Title level={5}>维度平均分</Title>
                    <Column {...columnConfig} height={250} />
                  </div>
                </Col>
              </Row>
              
              <Divider styles={{ wrapper: { margin: '16px 0' } }} />
              
              <Row gutter={[16, 16]}>
                {dimensionAverages
                  .filter(item => selectedDimensions.includes(item.dimension))
                  .sort((a, b) => b.averageScore - a.averageScore)
                  .map(item => (
                    <Col xs={24} sm={12} md={8} key={item.dimension}>
                      <Card size="small" variant="outlined">
                        <Tooltip title={`班级在${item.dimension}维度的平均得分`} placement="top">
                          <Statistic
                            title={
                              <Space>
                                <Text>{item.dimension}</Text>
                                <InfoCircleOutlined style={{ color: '#bfbfbf' }} />
                              </Space>
                            }
                            value={item.averageScore}
                            precision={1}
                            valueStyle={{ color: item.averageScore >= 4 ? '#52c41a' : item.averageScore >= 3 ? '#1890ff' : '#faad14' }}
                            suffix={
                              item.increaseFromPrev !== undefined && (
                                <Tag color={item.increaseFromPrev >= 0 ? 'green' : 'red'}>
                                  {item.increaseFromPrev >= 0 ? '+' : ''}{item.increaseFromPrev}
                                </Tag>
                              )
                            }
                          />
                        </Tooltip>
                      </Card>
                    </Col>
                  ))
                }
              </Row>
            </Card>
          </Col>
          
          <Col span={24}>
            <Card variant="borderless" title="学生评价排名">
              <Table 
                dataSource={studentTableData} 
                columns={columns}
                pagination={{ pageSize: 10 }}
                size="middle"
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ClassEvaluationSummary; 