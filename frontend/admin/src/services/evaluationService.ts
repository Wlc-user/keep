import { message } from 'antd';
import apiService from './api';
import { StudentEvaluation, EvaluationDimension, EvaluationLevel } from '../components/HexagonalEvaluation';
import { apiService as apiServiceAdmin } from './apiService';

// 评估维度转换映射表（前后端字段名映射）
const dimensionMapping = {
  'academic_performance': EvaluationDimension.ACADEMIC_PERFORMANCE,
  'critical_thinking': EvaluationDimension.CRITICAL_THINKING,
  'research_ability': EvaluationDimension.RESEARCH_ABILITY,
  'practical_skills': EvaluationDimension.PRACTICAL_SKILLS,
  'innovation': EvaluationDimension.INNOVATION,
  'problem_solving': EvaluationDimension.PROBLEM_SOLVING,
  'teamwork': EvaluationDimension.TEAMWORK,
  'communication': EvaluationDimension.COMMUNICATION,
  'leadership': EvaluationDimension.LEADERSHIP,
  'ethics': EvaluationDimension.ETHICS,
  'social_responsibility': EvaluationDimension.SOCIAL_RESPONSIBILITY,
  'global_perspective': EvaluationDimension.GLOBAL_PERSPECTIVE
};

/**
 * 标准化评估维度数据
 * @param evaluations 原始评估数据
 * @returns 标准化后的评估数据
 */
export const normalizeEvaluationData = (evaluations: any[]): any[] => {
  // 确保包含所有维度
  const normalizedEvaluations = [...evaluations];
  
  // 检查是否缺少任何维度
  const existingDimensions = new Set(normalizedEvaluations.map(e => e.dimension));
  
  // 添加缺失的维度
  Object.values(EvaluationDimension).forEach(dimension => {
    if (!existingDimensions.has(dimension)) {
      normalizedEvaluations.push({
        dimension,
        score: 0,
        level: EvaluationLevel.NEEDS_IMPROVEMENT,
        comment: '未评价'
      });
    }
  });
  
  return normalizedEvaluations;
};

/**
 * 标准化学生评估数据
 * @param studentEvaluation 学生评估数据
 * @returns 标准化后的学生评估数据
 */
export const normalizeStudentEvaluation = (studentEvaluation: StudentEvaluation): StudentEvaluation => {
  if (!studentEvaluation) return null;
  
  // 克隆以避免修改原始对象
  const normalized = {...studentEvaluation};
  
  // 标准化评估数据
  normalized.evaluations = normalizeEvaluationData(normalized.evaluations || []);
  
  // 确保有整体评价
  if (!normalized.overallComment) {
    normalized.overallComment = getOverallComment(normalized.evaluations);
  }
  
  return normalized;
};

/**
 * 生成随机学生评价数据
 * @param studentId 学生ID
 * @param studentName 学生姓名
 * @param academicYear 学年
 * @param semester 学期
 * @returns 学生评价数据
 */
export const generateMockStudentEvaluation = (
  studentId: string,
  studentName: string,
  academicYear: string,
  semester: string
): StudentEvaluation => {
  const getRandomScore = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  const evaluations = Object.values(EvaluationDimension).map(dimension => {
    const score = getRandomScore(60, 100);
    return {
      dimension,
      score,
      level: getEvaluationLevel(score),
      comment: `${studentName}在${dimension}方面${getCommentByScore(score)}`,
    };
  });

  return {
    studentId,
    studentName,
    academicYear,
    semester,
    evaluations,
    overallComment: `${studentName}整体表现${getOverallComment(evaluations)}`,
    evaluatedBy: '系统自动评价',
    evaluatedAt: new Date().toISOString(),
  };
};

/**
 * 根据分数获取评价等级
 * @param score 分数
 * @returns 评价等级
 */
export const getEvaluationLevel = (score: number): EvaluationLevel => {
  if (score >= 90) return EvaluationLevel.EXCELLENT;
  if (score >= 80) return EvaluationLevel.GOOD;
  if (score >= 70) return EvaluationLevel.SATISFACTORY;
  if (score >= 60) return EvaluationLevel.AVERAGE;
  return EvaluationLevel.NEEDS_IMPROVEMENT;
};

/**
 * 根据分数获取评价文本
 * @param score 分数
 * @returns 评价文本
 */
export const getCommentByScore = (score: number): string => {
  if (score >= 90) return '表现优异，有突出才能';
  if (score >= 80) return '表现良好，稳定发展';
  if (score >= 70) return '表现一般，需要提高';
  if (score >= 60) return '达到基本要求，有待加强';
  return '未达到要求，需要特别关注';
};

/**
 * 计算评价总分
 * @param evaluations 评价项
 * @returns 总分
 */
export const calculateAverageScore = (evaluations: any[]): number => {
  return evaluations.reduce((sum, item) => sum + item.score, 0) / evaluations.length;
};

/**
 * 获取总体评价文本
 * @param evaluations 评价项
 * @returns 总体评价文本
 */
export const getOverallComment = (evaluations: any[]): string => {
  const avgScore = calculateAverageScore(evaluations);
  if (avgScore >= 90) return '优秀，全面发展，多方面表现突出';
  if (avgScore >= 80) return '良好，各方面均衡发展';
  if (avgScore >= 70) return '中等，某些方面需要提高';
  if (avgScore >= 60) return '及格，需要在多方面加强';
  return '较差，需要全面关注和辅导';
};

/**
 * 评价历史记录接口
 */
export interface EvaluationHistory {
  id: string;
  date: string;
  academicYear: string;
  semester: string;
  evaluation: StudentEvaluation;
  evaluator: string;
  courseId?: string;
  courseName?: string;
}

/**
 * 计算评价各维度平均分
 * @param evaluations 评价数据数组
 * @returns 各维度平均分对象
 */
export const calculateDimensionAverages = (evaluations: StudentEvaluation[]): Record<EvaluationDimension, number> => {
  // 初始化结果对象
  const result: Record<EvaluationDimension, number> = {} as Record<EvaluationDimension, number>;
  const counts: Record<EvaluationDimension, number> = {} as Record<EvaluationDimension, number>;
  
  // 初始化维度数据
  Object.values(EvaluationDimension).forEach(dim => {
    result[dim] = 0;
    counts[dim] = 0;
  });
  
  // 累加各维度分数
  evaluations.forEach(studentEval => {
    studentEval.evaluations.forEach(evaluation => {
      if (evaluation.score > 0) {  // 只计算有效分数
        result[evaluation.dimension] += evaluation.score;
        counts[evaluation.dimension]++;
      }
    });
  });
  
  // 计算平均分
  Object.values(EvaluationDimension).forEach(dim => {
    result[dim] = counts[dim] > 0 ? parseFloat((result[dim] / counts[dim]).toFixed(1)) : 0;
  });
  
  return result;
};

/**
 * 解析并适配API返回的评价数据
 * @param apiData API返回的原始数据
 * @returns 标准化的评价数据
 */
export const adaptEvaluationData = (apiData: any): StudentEvaluation => {
  if (!apiData) return null;
  
  try {
    // 转换字段名称格式
    const adapted: StudentEvaluation = {
      studentId: apiData.student_id || apiData.studentId,
      studentName: apiData.student_name || apiData.studentName,
      academicYear: apiData.academic_year || apiData.academicYear,
      semester: apiData.semester,
      courseId: apiData.course_id || apiData.courseId,
      courseName: apiData.course_name || apiData.courseName,
      overallComment: apiData.overall_comment || apiData.overallComment,
      evaluatedBy: apiData.evaluated_by || apiData.evaluatedBy,
      evaluatedAt: apiData.evaluated_at || apiData.evaluatedAt,
      evaluations: []
    };
    
    // 转换评价维度数据
    const rawEvaluations = apiData.evaluations || [];
    adapted.evaluations = rawEvaluations.map((evalItem: any) => {
      // 处理后端可能使用的不同字段命名格式
      const dimensionKey = evalItem.dimension_key || evalItem.dimensionKey;
      const dimension = dimensionMapping[dimensionKey] || evalItem.dimension;
      
      return {
        dimension,
        score: evalItem.score || 0,
        level: evalItem.level || getEvaluationLevel(evalItem.score || 0),
        comment: evalItem.comment || ''
      };
    });
    
    // 标准化数据
    return normalizeStudentEvaluation(adapted);
  } catch (error) {
    console.error('适配评价数据出错:', error);
    return null;
  }
};

/**
 * 获取学生评估历史记录
 * @param studentId 学生ID
 * @returns 评估历史记录
 */
export const getEvaluationHistory = async (studentId: string): Promise<EvaluationHistory[]> => {
  try {
    // 首先尝试从API获取数据
    const response = await apiService.evaluations.getEvaluationHistory(studentId);
    return response.data;
  } catch (error) {
    console.error('获取评估历史失败，尝试使用模拟数据:', error);
    
    // 如果API请求失败，尝试使用模拟数据
    try {
      const mockResponse = await fetch(`/mock/student-evaluations/history.json`);
      if (!mockResponse.ok) {
        throw new Error(`模拟数据请求失败: ${mockResponse.status}`);
      }
      const mockData = await mockResponse.json();
      return mockData.data;
    } catch (mockError) {
      console.error('获取模拟数据也失败:', mockError);
      // 返回空数组而不是抛出错误，避免UI崩溃
      return [];
    }
  }
};

/**
 * 获取特定学生的评估信息
 * @param studentId 学生ID
 * @param courseId 可选的课程ID
 * @returns 学生评估数据
 */
export const getStudentEvaluation = async (studentId: string, courseId?: string): Promise<StudentEvaluation> => {
  try {
    // 首先尝试从API获取数据
    const response = await apiService.evaluations.getStudentEvaluation(studentId, courseId);
    // API可能直接返回数据，而不是嵌套在data属性中
    const responseData = response.data || response;
    return adaptEvaluationData(responseData);
  } catch (error) {
    console.error('获取学生评估失败，尝试使用模拟数据:', error);
    
    // 如果API请求失败，尝试使用模拟数据
    try {
      const mockResponse = await fetch(`/mock/student-evaluations/student-evaluation.json`);
      if (!mockResponse.ok) {
        throw new Error(`模拟数据请求失败: ${mockResponse.status}`);
      }
      const mockData = await mockResponse.json();
      return adaptEvaluationData(mockData.data || mockData);
    } catch (mockError) {
      console.error('获取模拟数据也失败:', mockError);
      message.error('获取学生评估数据失败');
      
      // 如果模拟数据也失败，返回生成的模拟数据
      return generateMockStudentEvaluation(
        studentId, 
        '未知学生', 
        '2023-2024', 
        '第一学期'
      );
    }
  }
};

/**
 * 保存学生评估
 * @param evaluation 评估数据
 * @returns 保存结果
 */
export const saveStudentEvaluation = async (evaluation: StudentEvaluation): Promise<any> => {
  try {
    // 首先尝试通过API保存
    const response = await apiService.evaluations.saveStudentEvaluation(evaluation);
    message.success('评估保存成功');
    return response.data;
  } catch (error) {
    console.error('保存学生评估失败，尝试使用模拟保存:', error);
    
    // 如果API请求失败，尝试使用模拟响应
    try {
      const mockResponse = await fetch(`/mock/student-evaluations/save-evaluation.json`);
      if (!mockResponse.ok) {
        throw new Error(`模拟保存请求失败: ${mockResponse.status}`);
      }
      const mockData = await mockResponse.json();
      message.success('评估已保存（模拟）');
      return mockData.data;
    } catch (mockError) {
      console.error('模拟保存也失败:', mockError);
      message.error('保存评估失败');
      throw mockError;
    }
  }
};

/**
 * 导出学生评估报告
 * @param studentId 学生ID
 * @param evaluationId 评估ID
 * @returns 报告Blob对象
 */
export const exportEvaluationReport = async (studentId: string, evaluationId: string): Promise<Blob> => {
  try {
    // 创建AbortController以便能够取消请求
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30秒超时
    
    try {
      const response = await apiService.evaluations.exportEvaluationReport(studentId, evaluationId);
      clearTimeout(timeout);
      // 如果response已经是Blob，直接返回，否则尝试访问data属性
      return response instanceof Blob ? response : (response.data || new Blob(['导出失败'], { type: 'text/plain' }));
    } catch (error) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        console.warn('导出评估报告请求超时');
        message.warning('导出评估报告请求超时');
      }
      throw error;
    }
  } catch (error) {
    console.error('导出评估报告失败:', error);
    message.error('导出评估报告失败');
    throw error;
  }
};

/**
 * 获取班级评价
 * @param classId 班级ID
 * @param academicYear 学年
 * @param semester 学期
 */
export const getClassEvaluation = async (
  classId: string,
  academicYear?: string,
  semester?: string
): Promise<StudentEvaluation[]> => {
  // 检查是否使用模拟数据
  if (import.meta.env.DEV && apiService.isMockEnabled) {
    console.log('使用模拟班级评价数据 - 模拟数据模式已启用');
    
    // 生成模拟数据
    const studentCount = Math.floor(Math.random() * 20) + 20; // 生成20-40个学生
    const evaluations: StudentEvaluation[] = [];
    
    for (let i = 0; i < studentCount; i++) {
      const studentId = `${classId}-${(i + 1).toString().padStart(3, '0')}`;
      const studentName = `学生${i + 1}`;
      
      evaluations.push(generateMockStudentEvaluation(
        studentId,
        studentName,
        academicYear || '2023-2024',
        semester || '第一学期'
      ));
    }
    
    return evaluations;
  }
  
  try {
    // 构建请求参数
    const params: any = {};
    if (academicYear) params.academicYear = academicYear;
    if (semester) params.semester = semester;

    // 发送API请求
    return await apiService.evaluations.getClassEvaluation(classId, params);
  } catch (error) {
    console.error('获取班级评价失败:', error);
    
    // 使用模拟数据作为回退方案
    console.log('使用模拟班级评价数据');
    
    // 生成模拟数据
    const studentCount = Math.floor(Math.random() * 20) + 20; // 生成20-40个学生
    const evaluations: StudentEvaluation[] = [];
    
    for (let i = 0; i < studentCount; i++) {
      const studentId = `${classId}-${(i + 1).toString().padStart(3, '0')}`;
      const studentName = `学生${i + 1}`;
      
      evaluations.push(generateMockStudentEvaluation(
        studentId,
        studentName,
        academicYear || '2023-2024',
        semester || '第一学期'
      ));
    }
    
    return evaluations;
  }
};

/**
 * 获取班级评价比较数据
 * @param classId 班级ID
 * @param currentYear 当前学年
 * @param currentSemester 当前学期
 */
export const getClassEvaluationComparison = async (
  classId: string,
  currentYear: string,
  currentSemester: string
): Promise<{
  current: StudentEvaluation[];
  previous: StudentEvaluation[];
}> => {
  // 确定上一个学期
  let previousYear = currentYear;
  let previousSemester = currentSemester === '第一学期' ? '第二学期' : '第一学期';
  
  // 如果当前是第一学期，上一个学期应该是上一学年的第二学期
  if (currentSemester === '第一学期') {
    const yearParts = currentYear.split('-');
    if (yearParts.length === 2) {
      const firstYear = parseInt(yearParts[0]);
      const secondYear = parseInt(yearParts[1]);
      previousYear = `${firstYear - 1}-${secondYear - 1}`;
    }
  }
  
  // 检查是否使用模拟数据
  if (import.meta.env.DEV && apiService.isMockEnabled) {
    console.log('使用模拟班级评价比较数据 - 模拟数据模式已启用');
    
    // 生成当前和上一学期的模拟数据
    const current = await getClassEvaluation(classId, currentYear, currentSemester);
    const previous = await getClassEvaluation(classId, previousYear, previousSemester);
    
    return { current, previous };
  }
  
  try {
    // 并行获取当前学期和上一学期的评价数据
    const [current, previous] = await Promise.all([
      getClassEvaluation(classId, currentYear, currentSemester),
      getClassEvaluation(classId, previousYear, previousSemester)
    ]);
    
    return { current, previous };
  } catch (error) {
    console.error('获取班级评价比较数据失败:', error);
    message.error('获取班级评价比较数据失败');
    
    // 在失败的情况下使用模拟数据
    console.log('使用模拟班级评价比较数据（回退）');
    const current = await getClassEvaluation(classId, currentYear, currentSemester);
    const previous = await getClassEvaluation(classId, previousYear, previousSemester);
    
    return { current, previous };
  }
};

/**
 * 生成班级评价统计数据
 * @param evaluations 评价数据
 */
export const generateClassStatistics = (evaluations: StudentEvaluation[]) => {
  if (!evaluations.length) return null;
  
  // 计算每个维度的平均分
  const dimensionAverages = Object.values(EvaluationDimension).map(dimension => {
    const scores = evaluations.map(evaluation => 
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
  
  evaluations.forEach(evaluation => {
    const averageScore = calculateAverageScore(evaluation.evaluations);
    const level = getEvaluationLevel(averageScore);
    levelCounts[level]++;
  });
  
  const levelDistribution = Object.entries(levelCounts).map(([level, count]) => ({
    level,
    count,
    percentage: (count / evaluations.length) * 100
  }));
  
  return { dimensionAverages, levelDistribution };
};

/**
 * 分析班级评价趋势
 * @param evaluations 评价数据
 */
export const analyzeClassTrends = (
  currentEvaluations: StudentEvaluation[],
  previousEvaluations?: StudentEvaluation[]
) => {
  // 计算当前评价的维度平均分
  const currentAverages = Object.values(EvaluationDimension).reduce((acc, dimension) => {
    const scores = currentEvaluations.map(evaluation => 
      evaluation.evaluations.find(e => e.dimension === dimension)?.score || 0
    );
    acc[dimension] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return acc;
  }, {} as Record<string, number>);
  
  // 如果有历史评价数据，计算变化
  if (previousEvaluations && previousEvaluations.length > 0) {
    const previousAverages = Object.values(EvaluationDimension).reduce((acc, dimension) => {
      const scores = previousEvaluations.map(evaluation => 
        evaluation.evaluations.find(e => e.dimension === dimension)?.score || 0
      );
      acc[dimension] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return acc;
    }, {} as Record<string, number>);
    
    // 计算变化
    const changes = Object.values(EvaluationDimension).reduce((acc, dimension) => {
      acc[dimension] = currentAverages[dimension] - (previousAverages[dimension] || 0);
      return acc;
    }, {} as Record<string, number>);
    
    return {
      current: currentAverages,
      previous: previousAverages,
      changes,
      hasImproved: Object.values(changes).reduce((sum, change) => sum + change, 0) > 0
    };
  }
  
  return {
    current: currentAverages,
    hasImproved: true
  };
};

// 评估维度接口
export interface EvaluationDimension {
  dimension: string;
  score: number;
  comments: string;
}

// 学生评估接口
export interface StudentEvaluation {
  id?: string;
  studentId: string;
  studentName: string;
  academicYear: string;
  semester: string;
  courseId?: string;
  courseName?: string;
  evaluator?: string;
  evaluationDate?: string;
  overallScore: number;
  evaluations: EvaluationDimension[];
  strengths?: string;
  areasForImprovement?: string;
  overallComment?: string;
}

// 评估历史记录接口
export interface EvaluationHistoryItem {
  id: string;
  date: string;
  academicYear: string;
  semester: string;
  evaluator: string;
  courseId: string;
  courseName: string;
  evaluation: StudentEvaluation;
}

// 添加getStudentEvaluationHistory别名方法
export const getStudentEvaluationHistory = async (studentId: string, limit?: number): Promise<EvaluationHistory[]> => {
  try {
    // 调用原始方法
    const history = await getEvaluationHistory(studentId);
    
    // 如果有limit参数，限制返回的记录数
    if (limit && history.length > limit) {
      return history.slice(0, limit);
    }
    return history;
  } catch (error) {
    console.error('获取学生评估历史记录失败:', error);
    return [];
  }
};

export default {
  normalizeEvaluationData,
  normalizeStudentEvaluation,
  generateMockStudentEvaluation,
  getEvaluationLevel,
  getCommentByScore,
  calculateAverageScore,
  getOverallComment,
  calculateDimensionAverages,
  adaptEvaluationData,
  getStudentEvaluation,
  getEvaluationHistory,
  getStudentEvaluationHistory,
  saveStudentEvaluation,
  exportEvaluationReport,
  getClassEvaluation,
  getClassEvaluationComparison,
  generateClassStatistics,
  analyzeClassTrends
}; 