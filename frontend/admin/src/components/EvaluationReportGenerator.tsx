import React, { useState, useMemo } from 'react';
import { Card, Button, Space, Typography, Progress, Table, Tag, Row, Col, Statistic, Divider } from 'antd';
import { 
  DownloadOutlined, 
  FileExcelOutlined, 
  FilePdfOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { Column, Line, Pie } from '@ant-design/plots';
import { StudentEvaluation, EvaluationDimension, EvaluationLevel } from './HexagonalEvaluation';
import type { EvaluationHistory } from '../services/evaluationService';

const { Title, Text, Paragraph } = Typography;

interface EvaluationReportGeneratorProps {
  currentEvaluation: StudentEvaluation;
  evaluationHistory: EvaluationHistory[];
  onExport: (format: 'pdf' | 'excel') => void;
}

const EvaluationReportGenerator: React.FC<EvaluationReportGeneratorProps> = ({
  currentEvaluation,
  evaluationHistory,
  onExport,
}) => {
  const [loading, setLoading] = useState(false);

  // 计算平均分数
  const averageScore = useMemo(() => {
    const scores = currentEvaluation.evaluations.map(e => e.score);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }, [currentEvaluation]);

  // 计算评价等级分布
  const levelDistribution = useMemo(() => {
    const distribution = {
      excellent: 0,
      good: 0,
      satisfactory: 0,
      average: 0,
      needsImprovement: 0,
    };
    
    currentEvaluation.evaluations.forEach(e => {
      distribution[e.level]++;
    });
    
    return distribution;
  }, [currentEvaluation]);

  // 生成趋势数据
  const trendData = useMemo(() => {
    return evaluationHistory.map(history => ({
      date: history.date,
      score: history.evaluation.evaluations.reduce((a, b) => a + b.score, 0) / history.evaluation.evaluations.length,
    }));
  }, [evaluationHistory]);

  // 生成维度分布数据
  const dimensionData = useMemo(() => {
    return currentEvaluation.evaluations.map(e => ({
      dimension: e.dimension,
      score: e.score,
      level: e.level,
    }));
  }, [currentEvaluation]);

  // 生成饼图数据
  const pieData = useMemo(() => {
    return Object.entries(levelDistribution).map(([level, count]) => ({
      type: level,
      value: count,
    }));
  }, [levelDistribution]);

  // 处理导出
  const handleExport = async (format: 'pdf' | 'excel') => {
    setLoading(true);
    try {
      await onExport(format);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="evaluation-report">
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 报告头部 */}
          <div>
            <Title level={2}>学生能力评价报告</Title>
            <Space direction="vertical" size="small">
              <Text>学生姓名：{currentEvaluation.studentName}</Text>
              <Text>评价时间：{currentEvaluation.evaluatedAt}</Text>
              <Text>评价人：{currentEvaluation.evaluatedBy}</Text>
            </Space>
          </div>

          <Divider />

          {/* 总体评分 */}
          <Card title="总体评分">
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Statistic
                  title="平均得分"
                  value={averageScore}
                  precision={1}
                  suffix="/ 100"
                />
              </Col>
              <Col span={12}>
                <Progress
                  type="circle"
                  percent={averageScore}
                  format={percent => `${percent}分`}
                />
              </Col>
            </Row>
          </Card>

          {/* 评价趋势 */}
          <Card title="评价趋势">
            <Line
              data={trendData}
              xField="date"
              yField="score"
              smooth
              animation={{
                appear: {
                  animation: 'path-in',
                  duration: 1000,
                },
              }}
              yAxis={{
                min: 60,
                max: 100,
              }}
            />
          </Card>

          {/* 维度分布 */}
          <Card title="能力维度分布">
            <Column
              data={dimensionData}
              xField="dimension"
              yField="score"
              label={{
                position: 'top',
                style: {
                  fontWeight: 'bold',
                },
              }}
              color={({ level }) => {
                switch (level) {
                  case EvaluationLevel.EXCELLENT:
                    return '#52c41a';
                  case EvaluationLevel.GOOD:
                    return '#1890ff';
                  case EvaluationLevel.SATISFACTORY:
                    return '#faad14';
                  case EvaluationLevel.AVERAGE:
                    return '#722ed1';
                  case EvaluationLevel.NEEDS_IMPROVEMENT:
                    return '#f5222d';
                  default:
                    return '#1890ff';
                }
              }}
            />
          </Card>

          {/* 等级分布 */}
          <Card title="评价等级分布">
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Pie
                  data={pieData}
                  angleField="value"
                  colorField="type"
                  radius={0.8}
                  innerRadius={0.5}
                  label={{
                    type: 'spider',
                    content: '{percentage}',
                  }}
                  interactions={[
                    {
                      type: 'element-active',
                    },
                  ]}
                />
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="middle">
                  {Object.entries(levelDistribution).map(([level, count]) => (
                    <div key={level}>
                      <Space>
                        <Tag color={
                          level === EvaluationLevel.EXCELLENT ? 'success' :
                          level === EvaluationLevel.GOOD ? 'blue' :
                          level === EvaluationLevel.SATISFACTORY ? 'gold' :
                          level === EvaluationLevel.AVERAGE ? 'purple' :
                          'red'
                        }>
                          {level}
                        </Tag>
                        <Text>{count}个维度</Text>
                      </Space>
                    </div>
                  ))}
                </Space>
              </Col>
            </Row>
          </Card>

          {/* 详细评价 */}
          <Card title="详细评价">
            <Table
              dataSource={currentEvaluation.evaluations}
              columns={[
                {
                  title: '评价维度',
                  dataIndex: 'dimension',
                  key: 'dimension',
                },
                {
                  title: '得分',
                  dataIndex: 'score',
                  key: 'score',
                  render: (score: number) => (
                    <Progress
                      percent={score}
                      size="small"
                      showInfo={false}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                    />
                  ),
                },
                {
                  title: '等级',
                  dataIndex: 'level',
                  key: 'level',
                  render: (level: EvaluationLevel) => (
                    <Tag color={
                      level === EvaluationLevel.EXCELLENT ? 'success' :
                      level === EvaluationLevel.GOOD ? 'blue' :
                      level === EvaluationLevel.SATISFACTORY ? 'gold' :
                      level === EvaluationLevel.AVERAGE ? 'purple' :
                      'red'
                    }>
                      {level}
                    </Tag>
                  ),
                },
                {
                  title: '评价说明',
                  dataIndex: 'comment',
                  key: 'comment',
                },
              ]}
            />
          </Card>

          {/* 总体评价 */}
          {currentEvaluation.overallComment && (
            <Card title="总体评价">
              <Paragraph>{currentEvaluation.overallComment}</Paragraph>
            </Card>
          )}

          {/* 导出按钮 */}
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={() => handleExport('excel')}
                loading={loading}
              >
                导出Excel
              </Button>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={() => handleExport('pdf')}
                loading={loading}
              >
                导出PDF
              </Button>
            </Space>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default EvaluationReportGenerator; 