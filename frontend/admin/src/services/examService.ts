import apiService from './apiService';
import config from '../config/env';
import mockDataLoader from '../utils/mockDataLoader';
import { 
  Exam, 
  ExamSubmission, 
  ExamQuestion,
  ClassExamAnalysis, 
  QuestionAnalysis, 
  StudentExamAnalysis, 
  OverallExamAnalysis,
  KnowledgePointAnalysis,
  ExamAnalyticsQuery
} from '../types/exam';

interface Exam {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  totalScore: number;
  passingScore: number;
  status: string;
  questionCount: number;
  courseId?: string;
  courseName?: string;
}

class ExamService {
  /**
   * 获取考试列表
   * @returns 考试列表
   */
  async getExams(): Promise<Exam[]> {
    try {
      console.log('正在获取考试数据...');
      
      // 优先使用模拟数据
      if (config.USE_MOCK_DATA) {
        console.log('尝试从模拟数据获取考试');
        try {
          const mockData = await mockDataLoader.loadMockData('exams');
          if (mockData && Array.isArray(mockData)) {
            console.log(`成功从模拟数据获取考试: ${mockData.length}`);
            return mockData;
          }
        } catch (mockError) {
          console.error('获取模拟考试数据失败，回退到API:', mockError);
        }
      }
      
      // 如果模拟数据获取失败或未启用，尝试使用API
      const response = await apiService.get('/api/exams');
      return response.items || [];
    } catch (error) {
      console.error('获取考试数据失败:', error);
      return [];
    }
  }
  
  /**
   * 获取考试详情
   * @param examId 考试ID
   * @returns 考试详情
   */
  async getExamDetail(examId: string): Promise<Exam | null> {
    try {
      if (config.USE_MOCK_DATA) {
        try {
          const exams = await this.getExams();
          return exams.find(exam => exam.id === examId) || null;
        } catch (mockError) {
          console.error('从模拟数据获取考试详情失败:', mockError);
        }
      }
      
      const response = await apiService.get(`/api/exams/${examId}`);
      return response;
    } catch (error) {
      console.error(`获取考试详情失败[${examId}]:`, error);
      return null;
    }
  }

  // 创建考试
  async createExam(exam: Omit<Exam, 'id'>): Promise<Exam> {
    return apiService.post('/exams', exam);
  }

  // 更新考试
  async updateExam(examId: string, exam: Partial<Exam>): Promise<Exam> {
    return apiService.put(`/exams/${examId}`, exam);
  }

  // 删除考试
  async deleteExam(examId: string): Promise<void> {
    return apiService.delete(`/exams/${examId}`);
  }

  // 发布考试
  async publishExam(examId: string): Promise<Exam> {
    return apiService.post(`/exams/${examId}/publish`);
  }

  // 考试审核
  async reviewExam(examId: string, approved: boolean, comment?: string): Promise<Exam> {
    return apiService.post(`/exams/${examId}/review`, { approved, comment });
  }

  // 获取考试提交记录
  async getExamSubmissions(params?: {
    examId?: string;
    studentId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: ExamSubmission[]; total: number }> {
    return apiService.get('/exam-submissions', params);
  }

  // 获取单个提交记录详情
  async getExamSubmission(submissionId: string): Promise<ExamSubmission> {
    return apiService.get(`/exam-submissions/${submissionId}`);
  }

  // 提交考试答案
  async submitExam(examId: string, submission: Omit<ExamSubmission, 'id' | 'graderId' | 'graderName' | 'gradingTime' | 'score'>): Promise<ExamSubmission> {
    return apiService.post(`/exams/${examId}/submit`, submission);
  }

  // 评分考试提交
  async gradeExamSubmission(submissionId: string, grading: {
    score: number;
    gradingComments?: string;
  }): Promise<ExamSubmission> {
    return apiService.post(`/exam-submissions/${submissionId}/grade`, grading);
  }

  // 获取学生参加的考试列表
  async getStudentExams(studentId: string, params?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: Exam[]; total: number }> {
    return apiService.get(`/students/${studentId}/exams`, params);
  }

  // 获取教师创建的考试列表
  async getTeacherExams(teacherId: string, params?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: Exam[]; total: number }> {
    return apiService.get(`/teachers/${teacherId}/exams`, params);
  }

  // 复制考试
  async copyExam(examId: string, newTitle?: string): Promise<Exam> {
    return apiService.post(`/exams/${examId}/copy`, { title: newTitle });
  }

  // 导入考试题目
  async importQuestions(examId: string, questions: ExamQuestion[]): Promise<Exam> {
    return apiService.post(`/exams/${examId}/import-questions`, { questions });
  }

  // 导出考试题目
  async exportQuestions(examId: string): Promise<ExamQuestion[]> {
    return apiService.get(`/exams/${examId}/export-questions`);
  }

  // 考试分析API
  
  // 获取考试整体分析
  async getOverallExamAnalysis(examId: string): Promise<OverallExamAnalysis> {
    return apiService.get(`/exam-analytics/overall/${examId}`);
  }
  
  // 获取班级考试分析
  async getClassExamAnalysis(examId: string, classId: string): Promise<ClassExamAnalysis> {
    return apiService.get(`/exam-analytics/class/${examId}/${classId}`);
  }
  
  // 获取学生考试分析
  async getStudentExamAnalysis(examId: string, studentId: string): Promise<StudentExamAnalysis> {
    return apiService.get(`/exam-analytics/student/${examId}/${studentId}`);
  }
  
  // 获取题目分析
  async getQuestionAnalysis(examId: string, questionId: string): Promise<QuestionAnalysis> {
    return apiService.get(`/exam-analytics/question/${examId}/${questionId}`);
  }
  
  // 获取知识点分析
  async getKnowledgePointAnalysis(examId: string, knowledgePointId: string): Promise<KnowledgePointAnalysis> {
    return apiService.get(`/exam-analytics/knowledge-point/${examId}/${knowledgePointId}`);
  }
  
  // 高级分析查询
  async queryExamAnalytics(params: ExamAnalyticsQuery): Promise<any> {
    return apiService.post('/exam-analytics/query', params);
  }
  
  // 获取可用的考试班级列表
  async getExamClasses(examId: string): Promise<{ id: string; name: string }[]> {
    return apiService.get(`/exams/${examId}/classes`);
  }
  
  // 获取考试的所有题目
  async getExamQuestions(examId: string): Promise<ExamQuestion[]> {
    return apiService.get(`/exams/${examId}/questions`);
  }
}

export default new ExamService(); 