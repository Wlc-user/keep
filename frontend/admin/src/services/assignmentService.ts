import apiService from './api';
import { message } from 'antd';

/**
 * 作业类型
 */
export enum AssignmentType {
  ESSAY = 'essay',
  QUIZ = 'quiz',
  PROJECT = 'project',
  CODE = 'code',
  OTHER = 'other'
}

/**
 * 作业状态
 */
export enum AssignmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  GRADING = 'grading',
  COMPLETED = 'completed'
}

/**
 * 学生提交状态
 */
export enum SubmissionStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  LATE = 'late',
  GRADED = 'graded',
  REJECTED = 'rejected'
}

/**
 * 作业接口
 */
export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  type: AssignmentType;
  status: AssignmentStatus;
  startDate: string;
  endDate: string;
  totalPoints: number;
  submissionCount: number;
  totalStudents: number;
  gradedCount: number;
  createdAt: string;
  attachments?: string[];
  allowLateSubmission: boolean;
  latePenalty: number;
  allowResubmission: boolean;
  maxResubmissions: number;
  passingScore: number;
  visibleToStudents: boolean;
  gradingCriteria?: string;
  estimatedTime?: number;
  tags?: string[];
  groupAssignment: boolean;
  maxGroupSize?: number;
}

/**
 * 学生提交接口
 */
export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  submissionDate: string;
  status: SubmissionStatus;
  content: string;
  attachments: string[];
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  isLate: boolean;
  resubmissionCount: number;
  comments?: SubmissionComment[];
}

/**
 * 提交评论接口
 */
export interface SubmissionComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
  attachments?: string[];
}

/**
 * 获取教师作业列表
 * @param teacherId 教师ID
 * @param courseId 课程ID（可选）
 */
export const getTeacherAssignments = async (teacherId: string, courseId?: string): Promise<Assignment[]> => {
  try {
    const params = courseId ? { courseId } : {};
    const response = await apiService.get(`/assignments/teacher/${teacherId}`, params);
    return response.data;
  } catch (error) {
    console.error('获取教师作业列表失败:', error);
    // 在开发模式下生成mock数据
    if (process.env.NODE_ENV === 'development') {
      return generateMockAssignments(5);
    }
    throw error;
  }
};

/**
 * 获取学生作业列表
 * @param studentId 学生ID
 * @param courseId 课程ID（可选）
 */
export const getStudentAssignments = async (studentId: string, courseId?: string): Promise<Assignment[]> => {
  try {
    const params = courseId ? { courseId } : {};
    const response = await apiService.get(`/assignments/student/${studentId}`, params);
    return response.data;
  } catch (error) {
    console.error('获取学生作业列表失败:', error);
    // 在开发模式下生成mock数据
    if (process.env.NODE_ENV === 'development') {
      return generateMockAssignments(3);
    }
    throw error;
  }
};

/**
 * 获取作业详情
 * @param assignmentId 作业ID
 */
export const getAssignmentDetail = async (assignmentId: string): Promise<Assignment> => {
  try {
    const response = await apiService.get(`/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error('获取作业详情失败:', error);
    // 在开发模式下生成mock数据
    if (process.env.NODE_ENV === 'development') {
      return generateMockAssignments(1)[0];
    }
    throw error;
  }
};

/**
 * 创建作业
 * @param assignmentData 作业数据
 */
export const createAssignment = async (assignmentData: Partial<Assignment>): Promise<Assignment> => {
  try {
    const response = await apiService.post('/assignments', assignmentData);
    message.success('作业创建成功');
    return response.data;
  } catch (error) {
    console.error('创建作业失败:', error);
    message.error('创建作业失败');
    throw error;
  }
};

/**
 * 更新作业
 * @param assignmentId 作业ID
 * @param assignmentData 作业数据
 */
export const updateAssignment = async (assignmentId: string, assignmentData: Partial<Assignment>): Promise<Assignment> => {
  try {
    const response = await apiService.put(`/assignments/${assignmentId}`, assignmentData);
    message.success('作业更新成功');
    return response.data;
  } catch (error) {
    console.error('更新作业失败:', error);
    message.error('更新作业失败');
    throw error;
  }
};

/**
 * 删除作业
 * @param assignmentId 作业ID
 */
export const deleteAssignment = async (assignmentId: string): Promise<boolean> => {
  try {
    await apiService.delete(`/assignments/${assignmentId}`);
    message.success('作业删除成功');
    return true;
  } catch (error) {
    console.error('删除作业失败:', error);
    message.error('删除作业失败');
    throw error;
  }
};

/**
 * 获取作业提交列表
 * @param assignmentId 作业ID
 */
export const getSubmissionsByAssignment = async (assignmentId: string): Promise<Submission[]> => {
  try {
    const response = await apiService.get(`/assignments/${assignmentId}/submissions`);
    return response.data;
  } catch (error) {
    console.error('获取作业提交列表失败:', error);
    // 在开发模式下生成mock数据
    if (process.env.NODE_ENV === 'development') {
      return generateMockSubmissions(assignmentId, 10);
    }
    throw error;
  }
};

/**
 * 获取学生提交详情
 * @param submissionId 提交ID
 */
export const getSubmissionDetail = async (submissionId: string): Promise<Submission> => {
  try {
    const response = await apiService.get(`/submissions/${submissionId}`);
    return response.data;
  } catch (error) {
    console.error('获取提交详情失败:', error);
    // 在开发模式下生成mock数据
    if (process.env.NODE_ENV === 'development') {
      return generateMockSubmissions('mock-assignment', 1)[0];
    }
    throw error;
  }
};

/**
 * 学生提交作业
 * @param assignmentId 作业ID
 * @param submissionData 提交数据
 */
export const submitAssignment = async (assignmentId: string, submissionData: Partial<Submission>): Promise<Submission> => {
  try {
    const response = await apiService.post(`/assignments/${assignmentId}/submit`, submissionData);
    message.success('作业提交成功');
    return response.data;
  } catch (error) {
    console.error('提交作业失败:', error);
    message.error('提交作业失败');
    throw error;
  }
};

/**
 * 评分作业
 * @param submissionId 提交ID
 * @param gradeData 评分数据
 */
export const gradeSubmission = async (submissionId: string, gradeData: { grade: number; feedback?: string }): Promise<Submission> => {
  try {
    const response = await apiService.put(`/submissions/${submissionId}/grade`, gradeData);
    message.success('评分成功');
    return response.data;
  } catch (error) {
    console.error('评分失败:', error);
    message.error('评分失败');
    throw error;
  }
};

/**
 * 批量评分
 * @param submissionIds 提交ID列表
 * @param gradeData 评分数据
 */
export const batchGradeSubmissions = async (submissionIds: string[], gradeData: { grade: number; feedback?: string }): Promise<boolean> => {
  try {
    await apiService.post('/submissions/batch-grade', { submissionIds, ...gradeData });
    message.success('批量评分成功');
    return true;
  } catch (error) {
    console.error('批量评分失败:', error);
    message.error('批量评分失败');
    throw error;
  }
};

/**
 * 添加评论
 * @param submissionId 提交ID
 * @param commentData 评论数据
 */
export const addComment = async (submissionId: string, commentData: Partial<SubmissionComment>): Promise<SubmissionComment> => {
  try {
    const response = await apiService.post(`/submissions/${submissionId}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('添加评论失败:', error);
    message.error('添加评论失败');
    throw error;
  }
};

// 生成模拟作业数据
const generateMockAssignments = (count: number): Assignment[] => {
  const assignmentTypes = Object.values(AssignmentType);
  const assignmentStatuses = Object.values(AssignmentStatus);
  
  return Array(count).fill(null).map((_, i) => ({
    id: `mock-assignment-${i + 1}`,
    title: `模拟作业 ${i + 1}`,
    description: `这是一个用于测试的模拟作业 ${i + 1}`,
    courseId: `mock-course-${Math.floor(Math.random() * 5) + 1}`,
    courseName: `模拟课程 ${Math.floor(Math.random() * 5) + 1}`,
    type: assignmentTypes[Math.floor(Math.random() * assignmentTypes.length)],
    status: assignmentStatuses[Math.floor(Math.random() * assignmentStatuses.length)],
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalPoints: 100,
    submissionCount: Math.floor(Math.random() * 20) + 10,
    totalStudents: 30,
    gradedCount: Math.floor(Math.random() * 10),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    attachments: ['模拟附件.pdf'],
    allowLateSubmission: Math.random() > 0.5,
    latePenalty: 10,
    allowResubmission: Math.random() > 0.5,
    maxResubmissions: 3,
    passingScore: 60,
    visibleToStudents: true,
    gradingCriteria: '根据完成质量和创新性评分',
    estimatedTime: 60,
    tags: ['测试', '模拟'],
    groupAssignment: Math.random() > 0.7,
    maxGroupSize: 4
  }));
};

// 生成模拟提交数据
const generateMockSubmissions = (assignmentId: string, count: number): Submission[] => {
  const submissionStatuses = Object.values(SubmissionStatus);
  
  return Array(count).fill(null).map((_, i) => {
    const status = submissionStatuses[Math.floor(Math.random() * submissionStatuses.length)];
    const isGraded = status === SubmissionStatus.GRADED;
    
    return {
      id: `mock-submission-${i + 1}`,
      assignmentId,
      assignmentTitle: '模拟作业标题',
      studentId: `mock-student-${i + 1}`,
      studentName: `模拟学生 ${i + 1}`,
      submissionDate: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000).toISOString(),
      status,
      content: `这是模拟学生 ${i + 1} 的作业提交内容，包含了完成的任务和思考过程。`,
      attachments: [`提交附件${i + 1}.pdf`],
      grade: isGraded ? Math.floor(Math.random() * 41) + 60 : undefined,
      feedback: isGraded ? `很好的工作，但还有一些可以改进的地方：\n1. 可以更详细地解释算法原理\n2. 需要添加更多的测试用例` : undefined,
      gradedBy: isGraded ? 'mock-teacher-1' : undefined,
      gradedAt: isGraded ? new Date(Date.now() - Math.floor(Math.random() * 2) * 24 * 60 * 60 * 1000).toISOString() : undefined,
      isLate: Math.random() > 0.8,
      resubmissionCount: Math.floor(Math.random() * 3),
      comments: Math.random() > 0.7 ? [
        {
          id: `mock-comment-${i}-1`,
          authorId: 'mock-teacher-1',
          authorName: '模拟教师',
          authorRole: 'teacher',
          content: '请注意这部分内容需要更详细的说明',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          attachments: []
        },
        {
          id: `mock-comment-${i}-2`,
          authorId: `mock-student-${i + 1}`,
          authorName: `模拟学生 ${i + 1}`,
          authorRole: 'student',
          content: '已经补充完善，请查看',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          attachments: []
        }
      ] : []
    };
  });
};

// 导出服务
const assignmentService = {
  getTeacherAssignments,
  getStudentAssignments,
  getAssignmentDetail,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getSubmissionsByAssignment,
  getSubmissionDetail,
  submitAssignment,
  gradeSubmission,
  batchGradeSubmissions,
  addComment
};

export default assignmentService; 