import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, Typography, Select, Button, Spin, Empty, message, Tabs, Alert, Space, Input, Row, Col, Radio, Drawer, Tag } from 'antd';
import { SearchOutlined, UserOutlined, ExportOutlined, DownloadOutlined, HistoryOutlined, BarChartOutlined, FileExcelOutlined, FilePdfOutlined, UserSwitchOutlined, FilterOutlined } from '@ant-design/icons';
import HexagonalEvaluation, { 
  StudentEvaluation as StudentEvaluationData, 
  EvaluationDimension, 
  EvaluationLevel 
} from '../components/HexagonalEvaluation';
import PageHeader from '../components/PageHeader';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Line, Column } from '@ant-design/plots';
import evaluationService from '../services/evaluationService';
import type { EvaluationHistory } from '../services/evaluationService';
import StudentSearch, { Student, Class } from '../components/StudentSearch';
import EvaluationReportGenerator from '../components/EvaluationReportGenerator';
import { useAppContext } from '../contexts/AppContext';

const { Title, Text } = Typography;
const { Option } = Select;

// 模拟学生数据
const mockStudents: Student[] = [
  { id: '1', name: '张三', className: '计算机科学一班', status: 'active', studentId: '20210101', tags: ['优秀学生', '班干部'] },
  { id: '2', name: '李四', className: '计算机科学一班', status: 'active', studentId: '20210102', tags: ['学习委员'] },
  { id: '3', name: '王五', className: '软件工程二班', status: 'active', studentId: '20210201', tags: ['编程能手'] },
  { id: '4', name: '赵六', className: '软件工程二班', status: 'inactive', studentId: '20210202' },
  { id: '5', name: '钱七', className: '人工智能专业班', status: 'active', studentId: '20210301', tags: ['科研新星'] },
  { id: '6', name: '孙八', className: '人工智能专业班', status: 'active', studentId: '20210302' },
  { id: '7', name: '周九', className: '数据科学实验班', status: 'active', studentId: '20210401', tags: ['数学竞赛冠军'] },
  { id: '8', name: '吴十', className: '数据科学实验班', status: 'graduated', studentId: '20210402' },
];

// 模拟班级数据
const mockClasses: Class[] = [
  { id: 'C001', name: '计算机科学一班', count: 30 },
  { id: 'C002', name: '软件工程二班', count: 35 },
  { id: 'C003', name: '人工智能专业班', count: 25 },
  { id: 'C004', name: '数据科学实验班', count: 20 },
];

// 模拟学年和学期数据
const academicYears = ['2021-2022', '2022-2023', '2023-2024'];
const semesters = ['第一学期', '第二学期'];

// 课程数据
const courses = [
  { id: 'course1', name: '计算机网络' },
  { id: 'course2', name: '操作系统' },
  { id: 'course3', name: '数据结构' },
  { id: 'course4', name: '算法分析' },
  { id: 'course5', name: '人工智能导论' },
];

// 颜色映射
const dimensionColors = {
  [EvaluationDimension.ACADEMIC_PERFORMANCE]: '#1890ff',
  [EvaluationDimension.CRITICAL_THINKING]: '#2f54eb',
  [EvaluationDimension.RESEARCH_ABILITY]: '#722ed1',
  [EvaluationDimension.PRACTICAL_SKILLS]: '#13c2c2',
  [EvaluationDimension.INNOVATION]: '#52c41a',
  [EvaluationDimension.PROBLEM_SOLVING]: '#faad14',
  [EvaluationDimension.TEAMWORK]: '#fa8c16',
  [EvaluationDimension.COMMUNICATION]: '#fa541c',
  [EvaluationDimension.LEADERSHIP]: '#f5222d',
  [EvaluationDimension.ETHICS]: '#eb2f96',
  [EvaluationDimension.SOCIAL_RESPONSIBILITY]: '#fadb14',
  [EvaluationDimension.GLOBAL_PERSPECTIVE]: '#a0d911',
};

const StudentEvaluationPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppContext();
  const queryParams = new URLSearchParams(location.search);
  const subjectParam = queryParams.get('subject');
  
  const isStudent = user?.role === 'student';
  const isMounted = useRef(true);
  
  // 定义用于取消请求的控制器
  const evaluationController = useRef<AbortController | null>(null);
  const historyController = useRef<AbortController | null>(null);
  const comparisonController = useRef<AbortController | null>(null);
  const exportController = useRef<AbortController | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(isStudent ? user?.id || '1' : '1');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(isStudent 
    ? { id: user?.id || '1', name: user?.name || '当前学生', className: user?.className || '未知班级', status: 'active', studentId: user?.studentId || '未知学号' }
    : mockStudents[0]);
  const [academicYear, setAcademicYear] = useState<string>(academicYears[academicYears.length - 1]);
  const [semester, setSemester] = useState<string>(semesters[0]);
  const [courseId, setCourseId] = useState<string | undefined>(undefined);
  const [currentEvaluation, setCurrentEvaluation] = useState<StudentEvaluationData | null>(null);
  const [evaluationHistory, setEvaluationHistory] = useState<EvaluationHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [comparisonData, setComparisonData] = useState<StudentEvaluationData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("current");
  const [studentDrawerVisible, setStudentDrawerVisible] = useState(false);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  
  // 组件卸载时清理工作
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      // 取消所有进行中的请求
      if (evaluationController.current) {
        evaluationController.current.abort();
      }
      if (historyController.current) {
        historyController.current.abort();
      }
      if (comparisonController.current) {
        comparisonController.current.abort();
      }
      if (exportController.current) {
        exportController.current.abort();
      }
    };
  }, []);
  
  // 获取学生评价数据
  const fetchEvaluation = useCallback(async () => {
    if (!selectedStudent?.id) return;
    
    // 取消之前的请求
    if (evaluationController.current) {
      evaluationController.current.abort();
    }
    
    // 创建新的AbortController
    evaluationController.current = new AbortController();
    
    setLoading(true);
    try {
      const evaluation = await evaluationService.getStudentEvaluation(
        selectedStudent.id,
        courseId
      );
      
      if (isMounted.current) {
        setCurrentEvaluation(evaluation);
      }
    } catch (error) {
      console.error('获取学生评价失败:', error);
      if (isMounted.current && error.name !== 'AbortError') {
        if (error instanceof Error) {
          message.error(`获取学生评价失败: ${error.message}`);
        } else {
          message.error('获取学生评价失败');
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [selectedStudent, academicYear, semester, courseId]);

  // 获取历史评价数据
  const fetchEvaluationHistory = useCallback(async () => {
    if (!selectedStudent?.id) return;
    
    // 取消之前的请求
    if (historyController.current) {
      historyController.current.abort();
    }
    
    // 创建新的AbortController
    historyController.current = new AbortController();
    
    setHistoryLoading(true);
    try {
      const history = await evaluationService.getStudentEvaluationHistory(selectedStudent.id, 5);
      if (isMounted.current) {
        setEvaluationHistory(history);
      }
    } catch (error) {
      console.error('获取评价历史失败:', error);
      if (isMounted.current && error.name !== 'AbortError') {
        if (error instanceof Error) {
          message.error(`获取评价历史失败: ${error.message}`);
        } else {
          message.error('获取评价历史失败');
        }
      }
    } finally {
      if (isMounted.current) {
        setHistoryLoading(false);
      }
    }
  }, [selectedStudent]);

  // 获取对比数据
  const fetchComparisonData = useCallback(async () => {
    if (!selectedStudent?.id || !compareMode) return;
    
    // 取消之前的请求
    if (comparisonController.current) {
      comparisonController.current.abort();
    }
    
    // 创建新的AbortController
    comparisonController.current = new AbortController();
    
    // 确定上一个学期的学年和学期
    let prevYear = academicYear;
    let prevSemester = semester === '第一学期' ? '第二学期' : '第一学期';
    
    // 如果当前是第一学期，上一个学期应该是上一学年的第二学期
    if (semester === '第一学期') {
      const yearParts = academicYear.split('-');
      if (yearParts.length === 2) {
        const firstYear = parseInt(yearParts[0]);
        const secondYear = parseInt(yearParts[1]);
        prevYear = `${firstYear - 1}-${secondYear - 1}`;
      }
    }
    
    try {
      const prevEvaluation = await evaluationService.getStudentEvaluation(
        selectedStudent.id,
        courseId
      );
      
      if (isMounted.current) {
        setComparisonData(prevEvaluation);
      }
    } catch (error) {
      console.error('获取比较数据失败:', error);
      if (isMounted.current && error.name !== 'AbortError') {
        if (error instanceof Error) {
          message.error(`获取比较数据失败: ${error.message}`);
        } else {
          message.error('获取比较数据失败');
        }
      }
    }
  }, [selectedStudent, compareMode, academicYear, semester, courseId]);

  // 当学生、学年或学期变化时，重新获取数据
  useEffect(() => {
    fetchEvaluation();
  }, [fetchEvaluation]);

  // 当学生变化时，获取历史评价数据
  useEffect(() => {
    fetchEvaluationHistory();
  }, [fetchEvaluationHistory]);

  // 获取比较数据
  useEffect(() => {
    if (compareMode) {
      fetchComparisonData();
    } else {
      setComparisonData(null);
    }
  }, [compareMode, fetchComparisonData]);

  // 如果URL中有学生ID或者当前用户是学生，则自动选择相应的学生
  useEffect(() => {
    if (isStudent && user?.id) {
      setSelectedStudentId(user.id);
      setSelectedStudent({ 
        id: user.id, 
        name: user.name || '当前学生', 
        className: user.className || '未知班级', 
        status: 'active', 
        studentId: user.studentId || '未知学号'
      });
    } else if (studentId) {
      const student = mockStudents.find(s => s.id === studentId);
      if (student) {
        setSelectedStudent(student);
      }
    }
  }, [studentId, isStudent, user]);
  
  // 切换比较模式
  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
  };
  
  // 保存评价
  const handleSaveEvaluation = async (evaluation: StudentEvaluationData) => {
    if (!isMounted.current) return;
    
    try {
      setLoading(true);
      await evaluationService.saveStudentEvaluation(evaluation);
      
      if (isMounted.current) {
        message.success('评价保存成功');
        fetchEvaluation();
      }
    } catch (error) {
      console.error('保存评价失败:', error);
      if (isMounted.current) {
        if (error instanceof Error) {
          message.error(`保存评价失败: ${error.message}`);
        } else {
          message.error('保存评价失败');
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  
  // 导出报告
  const handleExportReport = async (format: 'pdf' | 'excel') => {
    if (!selectedStudent?.id || !isMounted.current) return;
    
    // 取消之前的导出请求
    if (exportController.current) {
      exportController.current.abort();
    }
    
    // 创建新的AbortController
    exportController.current = new AbortController();
    
    try {
      setLoading(true);
      const blob = await evaluationService.exportEvaluationReport(selectedStudent.id, "1"); // 暂时使用固定ID
      
      if (isMounted.current) {
        // 创建下载链接
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `学生评价报告_${selectedStudent.id}_${format === 'pdf' ? '.pdf' : '.xlsx'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        message.success(`报告已导出为${format === 'pdf' ? 'PDF' : 'Excel'}格式`);
      }
    } catch (error) {
      console.error('导出报告失败:', error);
      if (isMounted.current && error.name !== 'AbortError') {
        if (error instanceof Error) {
          message.error(`导出报告失败: ${error.message}`);
        } else {
          message.error('导出报告失败');
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  
  // 过滤学生
  const filteredStudents = searchQuery
    ? mockStudents.filter(
        s => s.name.includes(searchQuery) || s.studentId.includes(searchQuery)
      )
    : mockStudents;
  
  // 生成趋势数据
  const getTrendData = useMemo(() => {
    if (!currentEvaluation || !evaluationHistory.length) return [];
    
    // 将当前评价和历史评价合并，按日期排序
    const allEvaluations = [
      ...evaluationHistory.map(h => ({
        date: h.date,
        ...Object.values(EvaluationDimension).reduce((acc, dim) => {
          const evalItem = h.evaluation.evaluations.find(e => e.dimension === dim);
          if (evalItem) {
            acc[dim] = evalItem.score;
          }
          return acc;
        }, {} as Record<string, number>)
      }))
    ];
    
    // 按日期排序，从早到晚
    allEvaluations.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return allEvaluations;
  }, [currentEvaluation, evaluationHistory]);
  
  // 生成维度分布数据
  const getDimensionDistribution = useMemo(() => {
    if (!currentEvaluation) return [];
    
    return currentEvaluation.evaluations.map(evaluation => ({
      dimension: evaluation.dimension,
      score: evaluation.score,
      color: dimensionColors[evaluation.dimension] || '#1890ff'
    }));
  }, [currentEvaluation]);
  
  // 生成Tab项
  const tabItems = [
    {
      key: 'current',
      label: '当前评价',
      children: (
        <div style={{ padding: '0 0 20px 0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <Spin />
              <div style={{ marginTop: 16 }}>加载评价数据...</div>
            </div>
          ) : currentEvaluation ? (
            <Row gutter={[24, 24]}>
              <Col xs={24} md={compareMode ? 12 : 24}>
                <Card 
                  title={
                    <Space>
                      <Text>当前评价</Text>
                      <Text type="secondary">
                        ({academicYear} {semester}{courseId ? ` ${courses.find(c => c.id === courseId)?.name}` : ''})
                      </Text>
                    </Space>
                  }
                >
                  <HexagonalEvaluation
                    studentEvaluation={currentEvaluation}
                    editable={true}
                    onSave={handleSaveEvaluation}
                  />
                </Card>
              </Col>
              
              {compareMode && comparisonData && (
                <Col xs={24} md={12}>
                  <Card 
                    title={
                      <Space>
                        <Text>上学期评价</Text>
                        <Text type="secondary">
                          ({comparisonData.academicYear} {comparisonData.semester})
                        </Text>
                      </Space>
                    }
                  >
                    <HexagonalEvaluation
                      studentEvaluation={comparisonData}
                      editable={false}
                    />
                  </Card>
                </Col>
              )}
            </Row>
          ) : (
            <Alert
              message="未找到评价数据"
              description="当前没有可用的评价数据，请选择其他学生或学期"
              type="info"
              showIcon
            />
          )}
        </div>
      ),
    },
    {
      key: 'history',
      label: '评价历史',
      children: (
        <div style={{ padding: '0 0 20px 0' }}>
          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <Spin />
              <div style={{ marginTop: 16 }}>加载历史数据...</div>
            </div>
          ) : evaluationHistory.length > 0 ? (
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card title="评价变化趋势">
                  <Line
                    data={getTrendData}
                    xField="date"
                    yField="value"
                    seriesField="dimension"
                    legend={{
                      position: 'top'
                    }}
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
                    color={Object.values(dimensionColors)}
                    point={{
                      size: 5,
                      shape: 'circle',
                      style: {
                        fillOpacity: 0.8
                      }
                    }}
                  />
                </Card>
              </Col>
              
              {evaluationHistory.map((history, index) => (
                <Col xs={24} md={12} xl={8} key={history.id}>
                  <Card
                    title={
                      <Space>
                        <HistoryOutlined />
                        <span>{new Date(history.date).toLocaleDateString()}</span>
                        <Text type="secondary">{history.evaluator}</Text>
                      </Space>
                    }
                    extra={
                      <Text type="secondary">
                        {history.academicYear} {history.semester}
                        {history.courseName ? ` (${history.courseName})` : ''}
                      </Text>
                    }
                    style={{ marginBottom: 16 }}
                    size="small"
                  >
                    <HexagonalEvaluation
                      studentEvaluation={history.evaluation}
                      editable={false}
                      compact={true}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Alert
              message="未找到历史评价"
              description="当前没有可用的历史评价数据"
              type="info"
              showIcon
            />
          )}
        </div>
      ),
    },
    {
      key: 'distribution',
      label: '维度分布',
      children: (
        <div style={{ padding: '0 0 20px 0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <Spin />
              <div style={{ marginTop: 16 }}>加载分布数据...</div>
            </div>
          ) : currentEvaluation ? (
            <Card title="能力维度分布">
              <Column
                data={getDimensionDistribution}
                xField="dimension"
                yField="score"
                meta={{
                  score: {
                    min: 60,
                    max: 100,
                  }
                }}
                color={({ dimension }) => dimensionColors[dimension] || '#1890ff'}
                label={{
                  position: 'top',
                  style: {
                    fontWeight: 'bold',
                  },
                }}
                xAxis={{
                  label: {
                    autoRotate: true,
                    autoHide: false,
                    autoEllipsis: true,
                  },
                }}
                animation={{
                  appear: {
                    animation: 'fade-in',
                    duration: 1000,
                  },
                }}
              />
            </Card>
          ) : (
            <Alert
              message="未找到评价数据"
              description="当前没有可用的评价数据，请选择其他学生或学期"
              type="info"
              showIcon
            />
          )}
        </div>
      ),
    },
    {
      key: 'report',
      label: '评价报告',
      children: (
        <div style={{ padding: '0 0 20px 0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <Spin />
              <div style={{ marginTop: 16 }}>加载报告数据...</div>
            </div>
          ) : currentEvaluation ? (
            <EvaluationReportGenerator
              currentEvaluation={currentEvaluation}
              evaluationHistory={evaluationHistory}
              onExport={handleExportReport}
            />
          ) : (
            <Alert
              message="未找到评价数据"
              description="当前没有可用的评价数据，请选择其他学生或学期"
              type="info"
              showIcon
            />
          )}
        </div>
      ),
    }
  ];

  // 处理Tab切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // 处理学生变更
  const handleStudentSelect = (student: Student) => {
    setSelectedStudentId(student.id);
    setSelectedStudent(student);
    setStudentDrawerVisible(false);
  };

  return (
    <div className="student-evaluation-page">
      <PageHeader 
        title="学生能力评估" 
        subtitle={isStudent ? "查看您的个人能力评估和发展报告" : "全面评估学生能力发展"} 
      />
      
      <Card style={{ marginBottom: 24 }}>
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <UserSwitchOutlined style={{ fontSize: 20 }} />
            <Space direction="vertical" size={0}>
              <Text strong>{selectedStudent?.name}</Text>
              <Text type="secondary">{selectedStudent?.className}</Text>
            </Space>
          </Space>
          
          <Space>
            <Text>{academicYear} {semester}</Text>
            {courseId && 
              <Tag color="blue">{courses.find(c => c.id === courseId)?.name}</Tag>
            }
          </Space>
          
          <Space>
            {!isStudent && (
              <Button 
                icon={<UserSwitchOutlined />} 
                onClick={() => setStudentDrawerVisible(true)}
              >
                选择学生
              </Button>
            )}
            <Button 
              icon={<FilterOutlined />} 
              onClick={() => setFilterDrawerVisible(true)}
            >
              筛选条件
            </Button>
            <Radio.Group 
              value={compareMode ? 'compare' : 'single'} 
              onChange={(e) => setCompareMode(e.target.value === 'compare')}
              buttonStyle="solid"
            >
              <Radio.Button value="single">单一评价</Radio.Button>
              <Radio.Button value="compare">对比评价</Radio.Button>
            </Radio.Group>
          </Space>
        </Space>
      </Card>
      
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          type="card"
          items={tabItems}
        />
      </Card>
      
      {/* 学生选择抽屉 - 仅对非学生用户显示 */}
      {!isStudent && (
        <Drawer
          title="选择学生"
          placement="right"
          width={480}
          onClose={() => setStudentDrawerVisible(false)}
          open={studentDrawerVisible}
        >
          <StudentSearch
            students={mockStudents}
            classes={mockClasses}
            onSelect={handleStudentSelect}
            selectedStudentId={selectedStudentId}
            showScore={false}
          />
        </Drawer>
      )}
      
      {/* 筛选条件抽屉 */}
      <Drawer
        title="评价条件筛选"
        placement="right"
        width={360}
        onClose={() => setFilterDrawerVisible(false)}
        open={filterDrawerVisible}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text>学年:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={academicYear}
              onChange={setAcademicYear}
            >
              {academicYears.map(year => (
                <Option key={year} value={year}>{year}</Option>
              ))}
            </Select>
          </div>
          
          <div>
            <Text>学期:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={semester}
              onChange={setSemester}
            >
              {semesters.map(sem => (
                <Option key={sem} value={sem}>{sem}</Option>
              ))}
            </Select>
          </div>
          
          <div>
            <Text>课程:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={courseId}
              onChange={setCourseId}
              allowClear
              placeholder="选择课程(可选)"
            >
              {courses.map(course => (
                <Option key={course.id} value={course.id}>{course.name}</Option>
              ))}
            </Select>
          </div>
          
          <div>
            <Text>对比模式:</Text>
            <Radio.Group 
              value={compareMode ? 'compare' : 'single'} 
              onChange={(e) => setCompareMode(e.target.value === 'compare')}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Radio.Button value="single" style={{ width: '50%', textAlign: 'center' }}>
                单一评价
              </Radio.Button>
              <Radio.Button value="compare" style={{ width: '50%', textAlign: 'center' }}>
                对比评价
              </Radio.Button>
            </Radio.Group>
          </div>
          
          <div style={{ marginTop: 40 }}>
            <Button type="primary" block onClick={() => setFilterDrawerVisible(false)}>
              应用筛选
            </Button>
          </div>
        </Space>
      </Drawer>
    </div>
  );
};

export default StudentEvaluationPage; 