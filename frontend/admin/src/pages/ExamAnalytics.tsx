import React, { useState, useEffect } from 'react';
import { Typography, Card, Select, Tabs, Row, Col, Statistic, Table, Empty, Spin, Space, DatePicker, Radio, Button, message } from 'antd';
import { BarChartOutlined, LineChartOutlined, PieChartOutlined, UserOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import PageHeader from '../components/PageHeader';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useAppContext } from '../contexts/AppContext';
import apiService from '../services/apiService';
import { OverallExamAnalysis, ClassExamAnalysis } from '../types/exam';

// 假数据，仅在API请求失败时使用
const mockExams = [
  { id: '1', title: '期中考试：数学代数基础', course: '高中数学' },
  { id: '2', title: '期末考试：英语综合能力', course: '高中英语' },
  { id: '3', title: '第一单元测试：化学元素', course: '高中化学' },
];

const mockClasses = [
  { id: '1', name: '高一(1)班' },
  { id: '2', name: '高一(2)班' },
  { id: '3', name: '高二(3)班' },
];

const mockScoreDistribution = [
  { range: '0-59', count: 5, percentage: 10 },
  { range: '60-69', count: 10, percentage: 20 },
  { range: '70-79', count: 15, percentage: 30 },
  { range: '80-89', count: 12, percentage: 24 },
  { range: '90-100', count: 8, percentage: 16 },
];

const mockQuestionPerformance = [
  { id: '1', content: '单选题：代数基本运算法则', type: '单选题', correctRate: 0.75, avgScore: 3, difficultyLevel: 0.4 },
  { id: '2', content: '多选题：解析几何要点', type: '多选题', correctRate: 0.45, avgScore: 2.5, difficultyLevel: 0.7 },
  { id: '3', content: '填空题：函数与导数', type: '填空题', correctRate: 0.6, avgScore: 4, difficultyLevel: 0.5 },
  { id: '4', content: '解答题：三角函数应用', type: '解答题', correctRate: 0.3, avgScore: 6, difficultyLevel: 0.8 },
];

const mockStudentRanking = [
  { id: '1', name: '张三', score: 92, rank: 1, completionTime: 45 },
  { id: '2', name: '李四', score: 88, rank: 2, completionTime: 50 },
  { id: '3', name: '王五', score: 85, rank: 3, completionTime: 55 },
  { id: '4', name: '赵六', score: 82, rank: 4, completionTime: 48 },
  { id: '5', name: '钱七', score: 78, rank: 5, completionTime: 60 },
];

const mockClassPerformance = [
  { classId: '1', className: '高一(1)班', participantCount: 50, avgScore: 85, passingRate: 0.95 },
  { classId: '2', className: '高一(2)班', participantCount: 48, avgScore: 82, passingRate: 0.92 },
  { classId: '3', className: '高二(3)班', participantCount: 52, avgScore: 78, passingRate: 0.88 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF'];

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ExamAnalytics: React.FC = () => {
  const { user } = useAppContext();
  const [selectedExam, setSelectedExam] = useState<string | undefined>(undefined);
  const [selectedClass, setSelectedClass] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overall');
  
  // 状态数据
  const [exams, setExams] = useState<{id: string; title: string}[]>([]);
  const [classes, setClasses] = useState<{id: string; name: string}[]>([]);
  const [overallAnalysis, setOverallAnalysis] = useState<OverallExamAnalysis | null>(null);
  const [classAnalysis, setClassAnalysis] = useState<ClassExamAnalysis | null>(null);
  const [apiError, setApiError] = useState<boolean>(false);
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  // 加载考试列表
  const loadExamList = async () => {
    setLoading(true);
    try {
      // 尝试从API获取数据
      console.log('开始加载考试列表数据...');
      const response = await apiService.exams.getAll({ 
        headers: { 
          'silent': false,  // 允许显示错误消息
          'handle-mock-error': true  // 启用模拟数据处理
        } 
      });
      
      // 如果收到模拟数据的提示，记录下来但不影响用户体验
      if (response?.statusText === 'OK (Mock)') {
        console.log('使用模拟考试数据');
      }
      
      // 无论是真实API还是模拟数据，都统一处理
      const data = response.items || [];
      
      // 记录加载成功信息
      console.log(`成功加载考试列表，获取到${data.length}条记录`);
      
      // 更新状态
      setExams(data.map(exam => ({
        id: exam.id,
        title: exam.title
      })));
      // 如果有选定的考试ID，从加载的数据中找到对应的考试
      if (selectedExamId && data.length > 0) {
        const selected = data.find(exam => exam.id === selectedExamId);
        if (selected) {
          setSelectedExam(selected);
        } else {
          // 如果找不到之前选择的考试，默认选择第一个
          setSelectedExam(data[0]);
          setSelectedExamId(data[0].id);
        }
      } else if (data.length > 0) {
        // 没有选定的考试ID，默认选择第一个
        setSelectedExam(data[0]);
        setSelectedExamId(data[0].id);
      }
    } catch (error) {
      console.error('加载考试列表失败:', error);
      
      // 尝试加载备用的模拟数据
      try {
        console.log('尝试加载备用模拟数据...');
        const mockResponse = await fetch('/admin/public/mock/exams/get.json');
        if (mockResponse.ok) {
          const mockData = await mockResponse.json();
          console.log(`成功从备用路径加载模拟数据，获取到${mockData.length}条记录`);
          setExams(mockData.map(exam => ({
            id: exam.id,
            title: exam.title
          })));
          
          // 设置默认选择
          if (mockData.length > 0) {
            setSelectedExam(mockData[0]);
            setSelectedExamId(mockData[0].id);
          }
        } else {
          throw new Error('备用模拟数据加载失败');
        }
      } catch (mockError) {
        console.error('备用模拟数据加载也失败:', mockError);
        message.error('无法加载考试列表数据，请稍后再试');
        
        // 设置空数据，避免界面错误
        setExams([]);
        setSelectedExam(null);
        setSelectedExamId('');
      }
    } finally {
      setLoading(false);
    }
  };

  // 考试选择变更处理
  const handleExamChange = async (value: string) => {
    setLoading(true);
    setSelectedExam(value);
    setOverallAnalysis(null);
    setClassAnalysis(null);
    
    try {
      // 加载考试相关的班级列表
      const classesData = await apiService.exams.getExamClasses(value);
      setClasses(classesData);
      
      // 重置班级选择
      setSelectedClass(undefined);
      
      // 加载考试整体分析
      await loadOverallAnalysis(value);
    } catch (error) {
      console.error('加载考试数据失败:', error);
      message.error('加载考试数据失败，使用演示数据');
      setApiError(true);
      setClasses(mockClasses);
    } finally {
      setLoading(false);
    }
  };

  // 班级选择变更处理
  const handleClassChange = async (value: string) => {
    setSelectedClass(value);
    
    if (!selectedExam) return;
    
    try {
      setLoading(true);
      // 加载班级分析数据
      const data = await apiService.exams.analytics.getClass(selectedExam, value);
      setClassAnalysis(data);
    } catch (error) {
      console.error('加载班级分析数据失败:', error);
      message.error('加载班级分析数据失败，使用演示数据');
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };
  
  // 加载考试整体分析
  const loadOverallAnalysis = async (examId: string) => {
    try {
      const data = await apiService.exams.analytics.getOverall(examId);
      setOverallAnalysis(data);
    } catch (error) {
      console.error('加载考试整体分析失败:', error);
      message.error('加载考试整体分析失败，使用演示数据');
      setApiError(true);
    }
  };

  // Tab items 数组定义
  const tabItems = [
    {
      key: 'overall',
      label: (
        <span>
          <BarChartOutlined />
          整体分析
        </span>
      ),
      children: (
        <div className="overall-analysis">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : !selectedExam ? (
            <Empty description="请选择考试以查看分析数据" />
          ) : (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic 
                      title="平均分" 
                      value={apiError || !overallAnalysis ? 82.5 : overallAnalysis.avgScore} 
                      suffix="/100" 
                      precision={1} 
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic 
                      title="中位数" 
                      value={apiError || !overallAnalysis ? 84 : overallAnalysis.medianScore} 
                      suffix="/100" 
                      precision={1} 
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic 
                      title="及格率" 
                      value={apiError || !overallAnalysis ? '92%' : `${(overallAnalysis.passingRate * 100).toFixed(1)}%`} 
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic 
                      title="平均答题时间" 
                      value={apiError || !overallAnalysis ? 50 : overallAnalysis.averageCompletionTime} 
                      suffix="分钟" 
                    />
                  </Card>
                </Col>
              </Row>
              
              <Card title="分数分布" style={{ marginTop: 16 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={apiError || !overallAnalysis ? mockScoreDistribution : overallAnalysis.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name="学生人数" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="percentage" name="百分比(%)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              
              <Card title="班级表现对比" style={{ marginTop: 16 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={apiError || !overallAnalysis ? mockClassPerformance : overallAnalysis.classPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="className" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgScore" name="平均分" fill="#8884d8" />
                    <Bar dataKey="passingRate" name="及格率" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              
              <Card title="题目表现分析" style={{ marginTop: 16 }}>
                <Table 
                  dataSource={
                    apiError || !overallAnalysis 
                      ? mockQuestionPerformance 
                      : overallAnalysis.questionPerformanceOverview.map(q => ({
                        id: q.questionId,
                        content: `题目 ${q.questionId}`,
                        correctRate: q.correctRate,
                        avgScore: q.avgScore,
                        difficultyLevel: q.difficultyLevel
                      }))
                  } 
                  rowKey="id"
                  pagination={false}
                >
                  <Table.Column title="题目" dataIndex="content" key="content" />
                  <Table.Column 
                    title="正确率" 
                    dataIndex="correctRate" 
                    key="correctRate" 
                    render={(text) => `${(text * 100).toFixed(1)}%`}
                    sorter={(a, b) => a.correctRate - b.correctRate}
                  />
                  <Table.Column 
                    title="平均得分" 
                    dataIndex="avgScore" 
                    key="avgScore"
                    sorter={(a, b) => a.avgScore - b.avgScore}
                  />
                  <Table.Column 
                    title="难度系数" 
                    dataIndex="difficultyLevel" 
                    key="difficultyLevel" 
                    render={(text) => {
                      let color = text < 0.4 ? 'green' : text < 0.7 ? 'orange' : 'red';
                      let level = text < 0.4 ? '简单' : text < 0.7 ? '中等' : '困难';
                      return <Text style={{ color }}>{level} ({(text * 100).toFixed(0)}%)</Text>;
                    }}
                    sorter={(a, b) => a.difficultyLevel - b.difficultyLevel}
                  />
                </Table>
              </Card>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'class',
      label: (
        <span>
          <TeamOutlined />
          班级分析
        </span>
      ),
      children: (
        <div className="class-analysis">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : !selectedExam || !selectedClass ? (
            <Empty description="请选择考试和班级以查看分析数据" />
          ) : (
            <>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic 
                      title="班级平均分" 
                      value={apiError || !classAnalysis ? 78.5 : classAnalysis.avgScore} 
                      suffix="/100" 
                      precision={1} 
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic 
                      title="参与率" 
                      value={apiError || !classAnalysis ? "95%" : `${(classAnalysis.participationRate * 100).toFixed(1)}%`} 
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic 
                      title="及格率" 
                      value={apiError || !classAnalysis ? "85%" : `${(classAnalysis.passingRate * 100).toFixed(1)}%`} 
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic 
                      title="最高分" 
                      value={apiError || !classAnalysis ? 98 : classAnalysis.highestScore} 
                      suffix="/100" 
                    />
                  </Card>
                </Col>
              </Row>
              
              <Card title="学生排名" style={{ marginTop: 16 }}>
                <Table 
                  dataSource={apiError || !classAnalysis ? mockStudentRanking : classAnalysis.studentRanking} 
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                >
                  <Table.Column title="排名" dataIndex="rank" key="rank" />
                  <Table.Column 
                    title="学生姓名" 
                    dataIndex={apiError || !classAnalysis ? "name" : "studentName"} 
                    key="name" 
                  />
                  <Table.Column 
                    title="分数" 
                    dataIndex="score" 
                    key="score" 
                    sorter={(a, b) => a.score - b.score}
                  />
                  <Table.Column 
                    title="完成时间" 
                    dataIndex="completionTime" 
                    key="completionTime" 
                    render={(text) => `${text} 分钟`}
                    sorter={(a, b) => a.completionTime - b.completionTime}
                  />
                  <Table.Column
                    title="操作"
                    key="action"
                    render={(_, record) => (
                      <Button type="link" size="small">查看详情</Button>
                    )}
                  />
                </Table>
              </Card>
              
              <Card title="分数分布" style={{ marginTop: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={apiError || !classAnalysis ? mockScoreDistribution : classAnalysis.scoreDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="range"
                          label={({ range, percentage }) => `${range}: ${percentage}%`}
                        >
                          {(apiError || !classAnalysis ? mockScoreDistribution : classAnalysis.scoreDistribution).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Col>
                  <Col span={12}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={apiError || !classAnalysis ? mockScoreDistribution : classAnalysis.scoreDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="学生人数" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Col>
                </Row>
              </Card>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'student',
      label: (
        <span>
          <UserOutlined />
          学生分析
        </span>
      ),
      children: (
        <div className="student-analysis">
          <Empty description="请选择学生以查看个人分析数据" />
        </div>
      ),
    },
    {
      key: 'question',
      label: (
        <span>
          <FileTextOutlined />
          题目分析
        </span>
      ),
      children: (
        <div className="question-analysis">
          <Empty description="请选择题目以查看具体分析" />
        </div>
      ),
    },
  ];

  return (
    <div className="exam-analytics-page">
      <PageHeader 
        title="考试分析" 
        icon={<BarChartOutlined />}
        description="分析考试数据，查看学生表现和题目难度统计"
      />
      
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div className="filter-section">
            <Row gutter={16} align="middle">
              <Col span={6}>
                <Select
                  placeholder="选择考试"
                  style={{ width: '100%' }}
                  onChange={handleExamChange}
                  value={selectedExam}
                  loading={loading}
                >
                  {exams.map(exam => (
                    <Option key={exam.id} value={exam.id}>{exam.title}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={6}>
                <Select
                  placeholder="选择班级"
                  style={{ width: '100%' }}
                  onChange={handleClassChange}
                  value={selectedClass}
                  disabled={!selectedExam || loading}
                  loading={loading && selectedExam}
                >
                  {classes.map(cls => (
                    <Option key={cls.id} value={cls.id}>{cls.name}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={6}>
                <RangePicker
                  placeholder={['开始日期', '结束日期']}
                  style={{ width: '100%' }}
                  disabled={!selectedExam || loading}
                />
              </Col>
              <Col span={6}>
                <Radio.Group defaultValue="score" buttonStyle="solid">
                  <Radio.Button value="score">按分数</Radio.Button>
                  <Radio.Button value="time">按时间</Radio.Button>
                  <Radio.Button value="difficulty">按难度</Radio.Button>
                </Radio.Group>
              </Col>
            </Row>
          </div>
          
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        </Space>
      </Card>
    </div>
  );
};

export default ExamAnalytics; 