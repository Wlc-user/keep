import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Select, Button, Tabs, Radio, Space, Typography, Row, Col, Spin, Table, Tag, Tooltip, DatePicker, message } from 'antd';
import { DownloadOutlined, PrinterOutlined, LineChartOutlined, PieChartOutlined, UserOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { Radar, Column, Pie } from '@ant-design/plots';
import PageHeader from '../components/PageHeader';
import ClassEvaluationSummary from '../components/ClassEvaluationSummary';
import { StudentEvaluation, EvaluationDimension, EvaluationLevel } from '../components/HexagonalEvaluation';
import html2canvas from 'html2canvas';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// 模拟班级数据
const classes = [
  { id: 'C001', name: '计算机科学一班', count: 30 },
  { id: 'C002', name: '软件工程二班', count: 35 },
  { id: 'C003', name: '人工智能专业班', count: 25 },
  { id: 'C004', name: '数据科学实验班', count: 20 },
];

// 模拟学年和学期数据
const academicYears = ['2021-2022', '2022-2023', '2023-2024'];
const semesters = ['第一学期', '第二学期'];

// 随机生成学生评价数据
const generateMockStudentEvaluations = (classId: string, count: number = 30): StudentEvaluation[] => {
  return Array(count).fill(0).map((_, index) => {
    const studentId = `${classId}-${(index + 1).toString().padStart(3, '0')}`;
    return generateRandomStudentEvaluation(studentId, `学生${index + 1}`, classId);
  });
};

// 随机生成单个学生的评价数据
const generateRandomStudentEvaluation = (studentId: string, studentName: string, classId: string): StudentEvaluation => {
  const getRandomScore = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  const dimensions = Object.values(EvaluationDimension);
  const evaluations = dimensions.map(dimension => {
    const score = getRandomScore(60, 100);
    return {
      dimension,
      score,
      level: getEvaluationLevel(score),
      comment: `${studentName}在${dimension}方面${score >= 85 ? '表现优异' : score >= 75 ? '表现良好' : score >= 60 ? '达到基本要求' : '需要提高'}`,
    };
  });

  return {
    studentId,
    studentName,
    academicYear: '2023-2024',
    semester: '第一学期',
    evaluations,
    overallComment: `${studentName}整体表现${getAverageScore(evaluations) >= 85 ? '优秀' : getAverageScore(evaluations) >= 75 ? '良好' : '一般'}`,
    evaluatedBy: '班主任',
    evaluatedAt: new Date().toISOString(),
  };
};

// 获取评价等级
function getEvaluationLevel(score: number): EvaluationLevel {
  if (score >= 90) return EvaluationLevel.EXCELLENT;
  if (score >= 80) return EvaluationLevel.GOOD;
  if (score >= 70) return EvaluationLevel.SATISFACTORY;
  if (score >= 60) return EvaluationLevel.AVERAGE;
  return EvaluationLevel.NEEDS_IMPROVEMENT;
}

// 计算平均分
function getAverageScore(evaluations: any[]): number {
  return evaluations.reduce((sum, item) => sum + item.score, 0) / evaluations.length;
}

// 获取学生排名数据
interface StudentRankingData {
  key: string;
  rank: number;
  studentId: string;
  studentName: string;
  averageScore: number;
  academicPerformance: number;
  practicalSkills: number;
  teamwork: number;
  personalGrowth: number;
  level: EvaluationLevel;
  trend: 'up' | 'down' | 'stable';
}

// 获取评价等级标签颜色
const getLevelColor = (level: EvaluationLevel): string => {
  switch (level) {
    case EvaluationLevel.EXCELLENT: return '#52c41a';
    case EvaluationLevel.GOOD: return '#1890ff';
    case EvaluationLevel.SATISFACTORY: return '#722ed1';
    case EvaluationLevel.AVERAGE: return '#faad14';
    case EvaluationLevel.NEEDS_IMPROVEMENT: return '#f5222d';
    default: return '#d9d9d9';
  }
};

// 主组件
const ClassEvaluationPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>(classes[0].id);
  const [academicYear, setAcademicYear] = useState<string>(academicYears[academicYears.length - 1]);
  const [semester, setSemester] = useState<string>(semesters[0]);
  const [studentEvaluations, setStudentEvaluations] = useState<StudentEvaluation[]>([]);
  const [previousEvaluations, setPreviousEvaluations] = useState<StudentEvaluation[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'previous' | 'none'>('none');
  const [viewMode, setViewMode] = useState<'summary' | 'detail' | 'ranking' | 'trend'>('summary');
  const [dateRange, setDateRange] = useState<[string, string]>(['2023-01-01', '2023-12-31']);

  // 获取评价数据
  const fetchEvaluationData = useCallback(async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 获取当前班级的学生数量
      const classInfo = classes.find(c => c.id === selectedClass);
      const count = classInfo ? classInfo.count : 30;
      
      // 生成随机评价数据
      const evaluations = generateMockStudentEvaluations(selectedClass, count);
      setStudentEvaluations(evaluations);
      
      // 如果是比较模式，生成历史评价数据
      if (comparisonMode === 'previous') {
        const prevEvaluations = generateMockStudentEvaluations(selectedClass, count).map(evaluation => ({
          ...evaluation,
          academicYear: academicYear === academicYears[0] ? academicYear : academicYears[academicYears.indexOf(academicYear) - 1],
          semester: semester === semesters[0] ? semesters[1] : semesters[0]
        }));
        setPreviousEvaluations(prevEvaluations);
      }
    } catch (error) {
      console.error('获取评价数据失败:', error);
      message.error('获取评价数据失败');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, academicYear, semester, comparisonMode]);

  // 当班级、学年或学期变化时，重新获取数据
  useEffect(() => {
    fetchEvaluationData();
  }, [fetchEvaluationData]);

  // 学生排名数据
  const rankingData = useMemo((): StudentRankingData[] => {
    if (!studentEvaluations.length) return [];
    
    return studentEvaluations.map((evaluation, index) => {
      const averageScore = getAverageScore(evaluation.evaluations);
      
      // 分类评分
      const getDimensionScore = (categories: string[]): number => {
        const items = evaluation.evaluations.filter(item => categories.includes(item.dimension));
        return items.length ? getAverageScore(items) : 0;
      };
      
      // 学术表现: 学术表现, 批判性思维, 研究能力
      const academicCategories = [
        EvaluationDimension.ACADEMIC_PERFORMANCE, 
        EvaluationDimension.CRITICAL_THINKING, 
        EvaluationDimension.RESEARCH_ABILITY
      ];
      
      // 实践技能: 实践技能, 创新能力, 问题解决
      const practicalCategories = [
        EvaluationDimension.PRACTICAL_SKILLS,
        EvaluationDimension.INNOVATION,
        EvaluationDimension.PROBLEM_SOLVING
      ];
      
      // 团队协作: 团队协作, 沟通能力, 领导力
      const teamworkCategories = [
        EvaluationDimension.TEAMWORK,
        EvaluationDimension.COMMUNICATION,
        EvaluationDimension.LEADERSHIP
      ];
      
      // 个人成长: 职业道德, 社会责任, 国际视野
      const personalCategories = [
        EvaluationDimension.ETHICS,
        EvaluationDimension.SOCIAL_RESPONSIBILITY,
        EvaluationDimension.GLOBAL_PERSPECTIVE
      ];
      
      return {
        key: evaluation.studentId,
        rank: index + 1,
        studentId: evaluation.studentId,
        studentName: evaluation.studentName,
        averageScore,
        academicPerformance: getDimensionScore(academicCategories),
        practicalSkills: getDimensionScore(practicalCategories),
        teamwork: getDimensionScore(teamworkCategories),
        personalGrowth: getDimensionScore(personalCategories),
        level: getEvaluationLevel(averageScore),
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
      };
    }).sort((a, b) => b.averageScore - a.averageScore)
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [studentEvaluations]);

  // 班级整体评价统计数据
  const classStatistics = useMemo(() => {
    if (!studentEvaluations.length) return null;
    
    // 计算每个维度的平均分
    const dimensionAverages = Object.values(EvaluationDimension).map(dimension => {
      const scores = studentEvaluations.map(evaluation => 
        evaluation.evaluations.find(e => e.dimension === dimension)?.score || 0
      );
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return { dimension, average };
    });
    
    // 计算级别分布
    const levelCounts = {
      [EvaluationLevel.EXCELLENT]: 0,
      [EvaluationLevel.GOOD]: 0,
      [EvaluationLevel.SATISFACTORY]: 0,
      [EvaluationLevel.AVERAGE]: 0,
      [EvaluationLevel.NEEDS_IMPROVEMENT]: 0,
    };
    
    studentEvaluations.forEach(evaluation => {
      const averageScore = getAverageScore(evaluation.evaluations);
      const level = getEvaluationLevel(averageScore);
      levelCounts[level]++;
    });
    
    const levelDistribution = Object.entries(levelCounts).map(([level, count]) => ({
      level,
      count,
      percentage: (count / studentEvaluations.length) * 100
    }));
    
    return { dimensionAverages, levelDistribution };
  }, [studentEvaluations]);
  
  // 趋势模拟数据
  const trendData = useMemo(() => {
    // 生成模拟趋势数据
    const months = ['一月', '二月', '三月', '四月', '五月', '六月'];
    const dimensions = Object.values(EvaluationDimension).slice(0, 4); // 只取部分维度
    
    return dimensions.map(dimension => {
      return months.map(month => ({
        month,
        dimension,
        score: Math.random() * 2.5 + 2.5 // 2.5 - 5 分
      }));
    }).flat();
  }, []);

  // 班级变更处理
  const handleClassChange = (value: string) => {
    setSelectedClass(value);
  };
  
  // 比较模式切换
  const handleComparisonModeChange = (e: any) => {
    setComparisonMode(e.target.value);
  };
  
  // 视图模式切换
  const handleViewModeChange = (e: any) => {
    setViewMode(e.target.value);
  };
  
  // 导出处理
  const handleExport = (format: 'excel' | 'pdf') => {
    message.success(`班级评价报告将以${format === 'excel' ? 'Excel' : 'PDF'}格式导出`);
  };
  
  // 打印处理
  const handlePrint = () => {
    message.success('正在准备打印...');
    window.print();
  };
  
  // 表格列配置
  const columns: ColumnsType<StudentRankingData> = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 70,
      sorter: (a, b) => a.rank - b.rank,
      render: (rank) => (
        <Tag color={rank <= 3 ? 'gold' : rank <= 10 ? 'blue' : 'default'}>
          {rank}
        </Tag>
      ),
    },
    {
      title: '学生',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (name, record) => (
        <Space>
          <UserOutlined />
          <span>{name}</span>
          <Text type="secondary" style={{ fontSize: '12px' }}>({record.studentId})</Text>
        </Space>
      ),
    },
    {
      title: '平均分',
      dataIndex: 'averageScore',
      key: 'averageScore',
      sorter: (a, b) => a.averageScore - b.averageScore,
      render: (score) => (
        <span style={{ color: getLevelColor(getEvaluationLevel(score)), fontWeight: 'bold' }}>
          {score.toFixed(1)}
        </span>
      ),
    },
    {
      title: '学术表现',
      dataIndex: 'academicPerformance',
      key: 'academicPerformance',
      sorter: (a, b) => a.academicPerformance - b.academicPerformance,
      render: (score) => score.toFixed(1),
    },
    {
      title: '实践技能',
      dataIndex: 'practicalSkills',
      key: 'practicalSkills',
      sorter: (a, b) => a.practicalSkills - b.practicalSkills,
      render: (score) => score.toFixed(1),
    },
    {
      title: '团队协作',
      dataIndex: 'teamwork',
      key: 'teamwork',
      sorter: (a, b) => a.teamwork - b.teamwork,
      render: (score) => score.toFixed(1),
    },
    {
      title: '个人成长',
      dataIndex: 'personalGrowth',
      key: 'personalGrowth',
      sorter: (a, b) => a.personalGrowth - b.personalGrowth,
      render: (score) => score.toFixed(1),
    },
    {
      title: '评价等级',
      dataIndex: 'level',
      key: 'level',
      filters: Object.values(EvaluationLevel).map(level => ({ text: level, value: level })),
      onFilter: (value, record) => record.level === value,
      render: (level) => {
        let text;
        let color;
        
        switch (level) {
          case EvaluationLevel.EXCELLENT:
            text = '优秀';
            color = 'success';
            break;
          case EvaluationLevel.GOOD:
            text = '良好';
            color = 'processing';
            break;
          case EvaluationLevel.SATISFACTORY:
            text = '满意';
            color = 'purple';
            break;
          case EvaluationLevel.AVERAGE:
            text = '一般';
            color = 'warning';
            break;
          case EvaluationLevel.NEEDS_IMPROVEMENT:
            text = '需改进';
            color = 'error';
            break;
          default:
            text = '未知';
            color = 'default';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '趋势',
      dataIndex: 'trend',
      key: 'trend',
      width: 80,
      render: (trend) => {
        if (trend === 'up') {
          return <Tag color="green">上升</Tag>;
        } else if (trend === 'down') {
          return <Tag color="red">下降</Tag>;
        } else {
          return <Tag color="blue">稳定</Tag>;
        }
      },
    },
  ];
  
  // 生成雷达图数据
  const getRadarData = () => {
    if (!classStatistics) return [];
    
    return classStatistics.dimensionAverages.map(({ dimension, average }) => ({
      dimension,
      score: average,
      fullScore: 100,
    }));
  };
  
  // 生成饼图数据
  const getPieData = () => {
    if (!classStatistics) return [];
    
    return classStatistics.levelDistribution.map(({ level, count, percentage }) => ({
      type: level,
      value: count,
      percentage: percentage.toFixed(1),
    }));
  };
  
  return (
    <div className="class-evaluation-page">
      <PageHeader
        title="班级能力评价"
        subtitle="班级整体评价与学生个体能力对比分析"
        breadcrumb={[
          { title: '首页', path: '/' },
          { title: '班级管理', path: '/classes' },
          { title: '能力评价' },
        ]}
        actions={[
          {
            key: 'export-excel',
            label: '导出Excel',
            icon: <FileExcelOutlined />,
            onClick: () => handleExport('excel'),
          },
          {
            key: 'export-pdf',
            label: '导出PDF',
            icon: <FilePdfOutlined />,
            onClick: () => handleExport('pdf'),
          },
          {
            key: 'print',
            label: '打印报告',
            icon: <PrinterOutlined />,
            onClick: handlePrint,
          },
        ]}
      />
      
      <Card styles={{ root: { marginBottom: 24 } }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={24} align="middle">
            <Col span={6}>
              <Text>班级:</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={selectedClass}
                onChange={handleClassChange}
              >
                {classes.map(cls => (
                  <Select.Option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.count}人)
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Text>学年:</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={academicYear}
                onChange={setAcademicYear}
              >
                {academicYears.map(year => (
                  <Select.Option key={year} value={year}>{year}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Text>学期:</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={semester}
                onChange={setSemester}
              >
                {semesters.map(sem => (
                  <Select.Option key={sem} value={sem}>{sem}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Text>日期范围:</Text>
              <RangePicker 
                style={{ width: '100%', marginTop: 8 }}
                placeholder={['开始日期', '结束日期']}
                onChange={(dates) => {
                  if (dates) {
                    setDateRange([dates[0]?.format('YYYY-MM-DD') || '', dates[1]?.format('YYYY-MM-DD') || '']);
                  }
                }}
              />
            </Col>
          </Row>
          
          <Row style={{ marginTop: 16 }}>
            <Col span={12}>
              <Text style={{ marginRight: 8 }}>对比模式:</Text>
              <Radio.Group value={comparisonMode} onChange={handleComparisonModeChange}>
                <Radio.Button value="none">当前数据</Radio.Button>
                <Radio.Button value="previous">历史对比</Radio.Button>
              </Radio.Group>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Text style={{ marginRight: 8 }}>视图模式:</Text>
              <Radio.Group value={viewMode} onChange={handleViewModeChange}>
                <Radio.Button value="summary">总览</Radio.Button>
                <Radio.Button value="detail">详情</Radio.Button>
                <Radio.Button value="ranking">排名</Radio.Button>
                <Radio.Button value="trend">趋势</Radio.Button>
              </Radio.Group>
            </Col>
          </Row>
        </Space>
      </Card>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px 0' }}>
          <Spin />
          <div style={{ marginTop: 16 }}>加载评价数据中...</div>
        </div>
      ) : (
        <>
          {viewMode === 'summary' && (
            <Row gutter={24}>
              <Col span={comparisonMode === 'previous' ? 12 : 24}>
                <Card 
                  title={`当前评价 (${academicYear} ${semester})`}
                  extra={<Text type="secondary">{studentEvaluations.length}名学生</Text>}
                >
                  <ClassEvaluationSummary
                    className={classes.find(c => c.id === selectedClass)?.name || ''}
                    classId={selectedClass}
                    academicYear={academicYear}
                    semester={semester}
                    studentEvaluations={studentEvaluations}
                  />
                </Card>
              </Col>
              
              {comparisonMode === 'previous' && previousEvaluations.length > 0 && (
                <Col span={12}>
                  <Card 
                    title="历史评价对比"
                    extra={<Text type="secondary">{previousEvaluations.length}名学生</Text>}
                  >
                    <ClassEvaluationSummary
                      className={classes.find(c => c.id === selectedClass)?.name || ''}
                      classId={selectedClass}
                      academicYear={previousEvaluations[0].academicYear}
                      semester={previousEvaluations[0].semester}
                      studentEvaluations={previousEvaluations}
                    />
                  </Card>
                </Col>
              )}
            </Row>
          )}
          
          {viewMode === 'detail' && (
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="维度平均分布">
                  <Radar
                    data={getRadarData()}
                    xField="dimension"
                    yField="score"
                    seriesField="type"
                    meta={{
                      score: {
                        min: 0,
                        max: 100,
                      },
                    }}
                    xAxis={{
                      line: null,
                      tickLine: null,
                    }}
                    yAxis={{
                      label: false,
                      grid: {
                        alternateColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                    point={{
                      size: 2,
                    }}
                    area={{
                      style: {
                        fillOpacity: 0.2,
                      },
                    }}
                  />
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title="评价等级分布">
                  <Row gutter={[24, 24]}>
                    <Col span={12}>
                      <Pie
                        data={getPieData()}
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
                        {Object.entries(classStatistics?.levelDistribution || {}).map(([level, count]) => (
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
              </Col>
              
              <Col span={12}>
                <Card title="平均分趋势">
                  <Column
                    data={[
                      { semester: '第一学期', score: 82 },
                      { semester: '第二学期', score: 85 },
                      { semester: '第三学期', score: 86 },
                      { semester: '第四学期', score: 89 },
                    ]}
                    xField="semester"
                    yField="score"
                    label={{
                      position: 'middle',
                      style: {
                        fill: '#FFFFFF',
                        opacity: 0.6,
                      },
                    }}
                    meta={{
                      score: {
                        alias: '平均分',
                      },
                    }}
                  />
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title="维度得分分布">
                  <Column
                    data={[
                      { dimension: '学术表现', excellent: 20, good: 25, satisfactory: 10, average: 5, needsImprovement: 1 },
                      { dimension: '实践能力', excellent: 15, good: 20, satisfactory: 18, average: 8, needsImprovement: 2 },
                      { dimension: '批判思维', excellent: 16, good: 18, satisfactory: 20, average: 6, needsImprovement: 2 },
                      { dimension: '创新能力', excellent: 10, good: 15, satisfactory: 25, average: 10, needsImprovement: 3 },
                    ]}
                    isStack={true}
                    xField="dimension"
                    yField="value"
                    seriesField="level"
                    label={{
                      position: 'middle',
                      layout: [
                        { type: 'interval-adjust-position' },
                      ],
                    }}
                    color={['#52c41a', '#1890ff', '#faad14', '#722ed1', '#f5222d']}
                  />
                </Card>
              </Col>
            </Row>
          )}
          
          {viewMode === 'ranking' && (
            <Card title="学生评价排名">
              <Table
                columns={columns}
                dataSource={rankingData}
                rowKey="key"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1200 }}
              />
            </Card>
          )}
          
          {viewMode === 'trend' && (
            <Card title="评价趋势分析">
              <Column
                data={[trendData, trendData]}
                xField="month"
                yField={['AVERAGE', 'STUDENTS_COUNT']}
                label={{
                  position: 'middle',
                }}
                meta={{
                  AVERAGE: {
                    alias: '平均分',
                  },
                  STUDENTS_COUNT: {
                    alias: '学生数量',
                  },
                }}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ClassEvaluationPage; 