import { User } from '../contexts/AppContext';

// 考试状态
export type ExamStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'active' | 'ended' | 'archived';

// 题目类型
export type QuestionType = 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_blank' | 'short_answer' | 'essay';

// 试题
export interface ExamQuestion {
  id: string;
  content: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string | string[];
  score: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// 考试
export interface Exam {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  creatorId: string;
  creatorName: string;
  status: ExamStatus;
  duration: number; // 考试时长(分钟)
  startTime: string; // ISO日期时间字符串
  endTime: string; // ISO日期时间字符串
  totalScore: number;
  passingScore: number;
  questions: ExamQuestion[];
  isRandomOrder: boolean;
  allowedRetries: number;
  visibleToStudents: boolean;
  reviewerId?: string;
  reviewerName?: string;
  reviewTime?: string;
  reviewComment?: string;
}

// 考试答题
export interface ExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  startTime: string;
  endTime: string;
  status: 'in_progress' | 'submitted' | 'graded';
  answers: {
    questionId: string;
    answer: string | string[];
  }[];
  score?: number;
  graderId?: string;
  graderName?: string;
  gradingTime?: string;
  gradingComments?: string;
}

// 考试分析 - 班级维度
export interface ClassExamAnalysis {
  examId: string;
  classId: string;
  className: string;
  submissionCount: number;
  studentCount: number;
  participationRate: number;
  avgScore: number;
  medianScore: number;
  highestScore: number;
  lowestScore: number;
  passingRate: number;
  scoreDistribution: {
    range: string; // 如 "0-10", "11-20"
    count: number;
    percentage: number;
  }[];
  questionPerformance: {
    questionId: string;
    avgScore: number;
    correctRate: number;
    difficultyLevel: number; // 根据学生表现评估的实际难度
  }[];
  // 学生表现排名
  studentRanking: {
    studentId: string;
    studentName: string;
    score: number;
    rank: number;
    completionTime: number; // 完成时间(分钟)
  }[];
}

// 考试分析 - 试题维度
export interface QuestionAnalysis {
  questionId: string;
  examId: string;
  content: string;
  type: QuestionType;
  correctAnswer: string | string[];
  attemptCount: number;
  correctCount: number;
  correctRate: number;
  avgScore: number;
  maxScore: number;
  difficultyLevel: number; // 根据学生表现评估的实际难度
  averageTimeSpent: number; // 平均花费时间(秒)
  discriminationIndex: number; // 区分度指数(0-1)
  // 选择题选项分析
  optionStats?: {
    option: string;
    selectedCount: number;
    selectedPercentage: number;
  }[];
  // 常见错误模式
  commonMistakes?: {
    pattern: string;
    count: number;
    percentage: number;
  }[];
}

// 考试分析 - 学生维度
export interface StudentExamAnalysis {
  studentId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  classId: string;
  className: string;
  score: number;
  totalScore: number;
  scorePercentage: number;
  completionTime: number;
  startTime: string;
  endTime: string;
  classRank: number;
  classSize: number;
  passingStatus: boolean;
  // 各知识点掌握情况
  knowledgePoints: {
    knowledgePointId: string;
    name: string;
    masteryLevel: number; // 掌握程度(0-1)
    relatedQuestions: string[];
  }[];
  // 各题型表现
  questionTypePerformance: {
    type: QuestionType;
    averageScore: number;
    totalScore: number;
    percentage: number;
  }[];
  // 各难度题目表现
  difficultyPerformance: {
    difficulty: 'easy' | 'medium' | 'hard';
    averageScore: number;
    totalScore: number;
    percentage: number;
  }[];
  // 与历史表现比较
  historicalComparison?: {
    previousExamCount: number;
    averageScorePercentage: number;
    improvement: number;
    trend: 'up' | 'down' | 'stable';
  };
  // 问题答题详情
  questionDetails: {
    questionId: string;
    score: number;
    maxScore: number;
    isCorrect: boolean;
    timeSpent: number; // 秒
    answer: string | string[];
  }[];
  // 推荐改进领域
  improvementAreas: {
    area: string;
    description: string;
    relatedQuestions: string[];
    suggestions: string[];
  }[];
}

// 考试分析 - 整体分析
export interface OverallExamAnalysis {
  examId: string;
  examTitle: string;
  courseId: string;
  courseName: string;
  totalParticipants: number;
  avgScore: number;
  medianScore: number;
  highestScore: number;
  lowestScore: number;
  standardDeviation: number;
  passingRate: number;
  completionRate: number;
  averageCompletionTime: number; // 分钟
  // 按班级分组的表现
  classPerformance: {
    classId: string;
    className: string;
    participantCount: number;
    avgScore: number;
    passingRate: number;
  }[];
  // 各难度题目表现
  difficultyAnalysis: {
    difficulty: 'easy' | 'medium' | 'hard';
    avgCorrectRate: number;
    questionCount: number;
  }[];
  // 各题型表现
  questionTypeAnalysis: {
    type: QuestionType;
    avgCorrectRate: number;
    questionCount: number;
  }[];
  // 分数分布
  scoreDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  // 难度最高的问题
  hardestQuestions: {
    questionId: string;
    content: string;
    correctRate: number;
    avgScore: number;
  }[];
  // 题目表现概览
  questionPerformanceOverview: {
    questionId: string;
    correctRate: number;
    avgScore: number;
    difficultyLevel: number;
  }[];
  // 与历史同类考试比较
  historicalComparison?: {
    previousExamCount: number;
    avgScoreChange: number;
    passingRateChange: number;
    trend: 'improved' | 'declined' | 'stable';
  };
}

// 知识点分析
export interface KnowledgePointAnalysis {
  id: string;
  name: string;
  examId: string;
  relatedQuestionIds: string[];
  overallMasteryLevel: number; // 0-1
  studentCount: number;
  // 掌握程度分布
  masteryDistribution: {
    level: string; // 如 "excellent", "good", "fair", "poor"
    count: number;
    percentage: number;
  }[];
  // 学生掌握情况
  studentMastery: {
    studentId: string;
    studentName: string;
    masteryLevel: number;
    performance: string; // 定性评价
  }[];
}

// 考试分析查询参数
export interface ExamAnalyticsQuery {
  examId?: string;
  classId?: string;
  studentId?: string;
  timeRange?: [string, string];
  questionType?: QuestionType;
  difficulty?: 'easy' | 'medium' | 'hard';
  minScore?: number;
  maxScore?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} 