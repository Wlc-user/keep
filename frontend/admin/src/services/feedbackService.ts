import api from './api';
import { AxiosRequestConfig } from 'axios';
import axios from 'axios';

// 存储每个请求对应的AbortController
const abortControllers = new Map<string, AbortController>();

// 取消并移除现有请求
const cancelExistingRequest = (key: string) => {
  if (abortControllers.has(key)) {
    abortControllers.get(key)?.abort();
    abortControllers.delete(key);
  }
};

// 设置新的AbortController
const setAbortController = (key: string, controller: AbortController) => {
  abortControllers.set(key, controller);
};

// 创建请求配置
const createRequestConfig = (key: string): AxiosRequestConfig => {
  // 取消可能存在的相同请求
  cancelExistingRequest(key);
  
  // 创建新的控制器
  const controller = new AbortController();
  setAbortController(key, controller);
  
  return {
    signal: controller.signal
  };
};

// 反馈类型
export interface Feedback {
  id: number;
  title: string;
  content: string;
  feedbackType: string;
  status: string;
  priority: string;
  studentId: number;
  studentName: string;
  createdAt: string;
  updatedAt: string;
  resourceIdentifier?: string;
  resourceUrl?: string;
  attachments: FeedbackAttachment[];
  replies: FeedbackReply[];
  recommendations: LearningRecommendation[];
  statusHistory: StatusHistory[];
}

// 反馈回复
export interface FeedbackReply {
  id: number;
  feedbackId: number;
  content: string;
  userId: number;
  userName: string;
  userRole: string;
  isInternal: boolean;
  createdAt: string;
  attachments: FeedbackAttachment[];
}

// 附件
export interface FeedbackAttachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  uploadedBy: number;
  createdAt: string;
}

// 学习建议
export interface LearningRecommendation {
  id: number;
  feedbackId: number;
  title: string;
  description: string;
  resourceUrl?: string;
  resourceType?: string;
  createdAt: string;
  createdBy: number;
}

// 状态历史
export interface StatusHistory {
  status: string;
  updatedAt: string;
  updatedBy?: string;
  comments?: string;
}

// 反馈查询参数
export interface FeedbackQueryParams {
  page: number;
  pageSize: number;
  status?: string;
  type?: string;
  search?: string;
  sortBy?: string;
  descending?: boolean;
  fromDate?: string;
  toDate?: string;
  studentId?: number;
}

// 统计数据
export interface FeedbackStatistics {
  totalCount: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
  feedbacksByType: {
    type: string;
    count: number;
  }[];
  feedbacksByPriority: {
    priority: string;
    count: number;
  }[];
  feedbacksTrend: {
    date: string;
    count: number;
  }[];
  avgResponseTime: number;
  avgResolutionTime: number;
}

/**
 * 获取反馈列表
 * @param params 查询参数
 * @returns 反馈列表及分页信息
 */
export const getFeedbacks = async (params: FeedbackQueryParams): Promise<PaginatedResult<Feedback>> => {
  const key = `feedbacks_${JSON.stringify(params)}`;
  const config = createRequestConfig(key);
  
  try {
    const response = await api.get<PaginatedResult<Feedback>>('/api/feedback', params, config);
    return response;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('获取反馈列表请求已取消');
    } else {
      console.error('获取反馈列表失败', error);
    }
    throw error;
  } finally {
    abortControllers.delete(key);
  }
};

/**
 * 获取单个反馈详情
 * @param id 反馈ID
 * @returns 反馈详情
 */
export const getFeedbackById = async (id: number): Promise<FeedbackDetail> => {
  const key = `feedback_${id}`;
  const config = createRequestConfig(key);
  
  try {
    const response = await api.get<FeedbackDetail>(`/api/feedback/${id}`, {}, config);
    return response;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log(`获取反馈${id}详情请求已取消`);
    } else {
      console.error(`获取反馈详情失败: ${id}`, error);
    }
    throw error;
  } finally {
    abortControllers.delete(key);
  }
};

/**
 * 创建新反馈
 * @param data 反馈数据（FormData格式）
 * @returns 创建的反馈
 */
export const createFeedback = async (data: FormData): Promise<Feedback> => {
  const key = `create_feedback`;
  const config = createRequestConfig(key);
  
  try {
    const response = await api.post<Feedback>('/api/feedback', data, config);
    return response;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('创建反馈请求已取消');
    } else {
      console.error('创建反馈失败', error);
    }
    throw error;
  } finally {
    abortControllers.delete(key);
  }
};

/**
 * 回复反馈
 * @param id 反馈ID
 * @param data 回复数据（FormData格式）
 * @returns 回复结果
 */
export const replyToFeedback = async (id: number, data: FormData) => {
  return await api.post<FeedbackReply>(`/api/feedback/${id}/replies`, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 更新反馈状态
 * @param id 反馈ID
 * @param status 新状态
 * @param comments 状态变更备注（可选）
 * @returns 更新结果
 */
export const updateFeedbackStatus = async (id: number, status: string, comments?: string) => {
  const key = `update_status_${id}`;
  const config = createRequestConfig(key);
  
  try {
    await api.put<Feedback>(`/api/feedback/${id}/status`, {
      status,
      comments
    }, config);
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log(`更新反馈${id}状态请求已取消`);
    } else {
      console.error(`更新反馈状态失败: ${id}`, error);
    }
    throw error;
  } finally {
    abortControllers.delete(key);
  }
};

/**
 * 更新反馈优先级
 * @param id 反馈ID
 * @param priority 新优先级
 * @returns 更新结果
 */
export const updateFeedbackPriority = async (id: number, priority: string) => {
  return await api.put<Feedback>(`/api/feedback/${id}/priority`, {
    priority
  });
};

/**
 * 添加学习建议
 * @param id 反馈ID
 * @param recommendation 建议数据
 * @returns 添加结果
 */
export const addLearningRecommendation = async (id: number, recommendation: Partial<LearningRecommendation>) => {
  return await api.post<LearningRecommendation>(`/api/feedback/${id}/recommendations`, recommendation);
};

/**
 * 删除反馈
 * @param id 反馈ID
 * @returns 删除结果
 */
export const deleteFeedback = async (id: number) => {
  return await api.delete(`/api/feedback/${id}`);
};

/**
 * 下载附件
 * @param id 附件ID
 * @returns 附件二进制数据
 */
export const downloadAttachment = async (id: number) => {
  return await api.get<Blob>(`/api/feedback/attachments/${id}/download`, {
    responseType: 'blob'
  });
};

/**
 * 获取反馈统计数据
 * @returns 统计数据
 */
export const getFeedbackStatistics = async (startDate?: Date, endDate?: Date): Promise<FeedbackStatistics> => {
  const key = `feedback_stats_${startDate?.toISOString()}_${endDate?.toISOString()}`;
  const config = createRequestConfig(key);
  
  try {
    const params: any = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    
    const response = await api.get<FeedbackStatistics>('/api/feedback/stats', params, config);
    return response;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('获取反馈统计请求已取消');
    } else {
      console.error('获取反馈统计失败', error);
    }
    throw error;
  } finally {
    abortControllers.delete(key);
  }
};

/**
 * 获取反馈类型选项
 * @returns 类型选项
 */
export const getFeedbackTypes = async (): Promise<string[]> => {
  const key = 'feedback_types';
  const config = createRequestConfig(key);
  
  try {
    const response = await api.get<string[]>('/api/feedback/types', {}, config);
    return response;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('获取反馈类型列表请求已取消');
      throw error;
    } else {
      console.error('获取反馈类型列表失败', error);
      return [];
    }
  } finally {
    abortControllers.delete(key);
  }
};

/**
 * 获取反馈状态选项
 * @returns 状态选项
 */
export const getFeedbackStatuses = async (): Promise<string[]> => {
  const key = 'feedback_statuses';
  const config = createRequestConfig(key);
  
  try {
    const response = await api.get<string[]>('/api/feedback/statuses', {}, config);
    return response;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('获取反馈状态列表请求已取消');
      throw error;
    } else {
      console.error('获取反馈状态列表失败', error);
      return [];
    }
  } finally {
    abortControllers.delete(key);
  }
};

/**
 * 获取反馈优先级选项
 * @returns 优先级选项
 */
export const getFeedbackPriorities = async (): Promise<string[]> => {
  const key = 'feedback_priorities';
  const config = createRequestConfig(key);
  
  try {
    const response = await api.get<string[]>('/api/feedback/priorities', {}, config);
    return response;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('获取反馈优先级列表请求已取消');
      throw error;
    } else {
      console.error('获取反馈优先级列表失败', error);
      return [];
    }
  } finally {
    abortControllers.delete(key);
  }
};

// 清理所有请求
export const cleanupFeedbackRequests = () => {
  abortControllers.forEach((controller, key) => {
    controller.abort();
  });
  abortControllers.clear();
}; 