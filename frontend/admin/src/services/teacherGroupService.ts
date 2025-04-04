import apiService from './apiService';
import { TeacherGroup, TeacherGroupType } from '../contexts/AppContext';

export interface TeacherGroupActivity {
  id: string;
  groupId: string;
  title: string;
  description: string;
  type: 'meeting' | 'project' | 'research' | 'course_design';
  startTime: string;
  endTime?: string;
  location?: string;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  participants: {
    id: string;
    name: string;
  }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
}

export interface TeacherGroupDiscussion {
  id: string;
  groupId: string;
  title: string;
  content: string;
  topic: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  replies?: TeacherGroupDiscussionReply[];
  tags?: string[];
}

export interface TeacherGroupDiscussionReply {
  id: string;
  discussionId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  isApproved: boolean;
  replyTo?: string;
}

class TeacherGroupService {
  // 获取教师分组列表
  async getTeacherGroups(params?: { 
    page?: number; 
    pageSize?: number; 
    type?: TeacherGroupType;
  }): Promise<{ items: TeacherGroup[]; total: number }> {
    try {
      return await apiService.teacherGroups.getAll(params);
    } catch (error) {
      console.error('获取教师分组列表失败:', error);
      // 如果API请求失败，返回空列表
      return { items: [], total: 0 };
    }
  }

  // 获取单个教师分组
  async getTeacherGroup(id: string): Promise<TeacherGroup | null> {
    try {
      return await apiService.teacherGroups.getById(id);
    } catch (error) {
      console.error(`获取教师分组 ${id} 失败:`, error);
      return null;
    }
  }

  // 创建教师分组
  async createTeacherGroup(group: Omit<TeacherGroup, 'id'>): Promise<TeacherGroup | null> {
    try {
      return await apiService.teacherGroups.create(group);
    } catch (error) {
      console.error('创建教师分组失败:', error);
      return null;
    }
  }

  // 更新教师分组
  async updateTeacherGroup(id: string, group: Partial<TeacherGroup>): Promise<TeacherGroup | null> {
    try {
      return await apiService.teacherGroups.update(id, group);
    } catch (error) {
      console.error(`更新教师分组 ${id} 失败:`, error);
      return null;
    }
  }

  // 删除教师分组
  async deleteTeacherGroup(id: string): Promise<boolean> {
    try {
      await apiService.teacherGroups.delete(id);
      return true;
    } catch (error) {
      console.error(`删除教师分组 ${id} 失败:`, error);
      return false;
    }
  }

  // 添加成员
  async addGroupMember(groupId: string, teacherId: string): Promise<boolean> {
    try {
      await apiService.teacherGroups.addMember(groupId, teacherId);
      return true;
    } catch (error) {
      console.error(`向分组 ${groupId} 添加成员失败:`, error);
      return false;
    }
  }

  // 移除成员
  async removeGroupMember(groupId: string, teacherId: string): Promise<boolean> {
    try {
      await apiService.teacherGroups.removeMember(groupId, teacherId);
      return true;
    } catch (error) {
      console.error(`从分组 ${groupId} 移除成员失败:`, error);
      return false;
    }
  }

  // 设置组长
  async setGroupLeader(groupId: string, teacherId: string): Promise<boolean> {
    try {
      await apiService.teacherGroups.setLeader(groupId, teacherId);
      return true;
    } catch (error) {
      console.error(`设置分组 ${groupId} 组长失败:`, error);
      return false;
    }
  }

  // 获取分组活动
  async getGroupActivities(groupId: string, params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    type?: string;
  }): Promise<{ items: TeacherGroupActivity[]; total: number }> {
    try {
      return await apiService.teacherGroups.getActivities(groupId, params);
    } catch (error) {
      console.error(`获取分组 ${groupId} 活动列表失败:`, error);
      return { items: [], total: 0 };
    }
  }

  // 创建分组活动
  async createGroupActivity(groupId: string, activity: Omit<TeacherGroupActivity, 'id' | 'groupId' | 'createdAt' | 'updatedAt'>): Promise<TeacherGroupActivity | null> {
    try {
      return await apiService.teacherGroups.createActivity(groupId, activity);
    } catch (error) {
      console.error(`创建分组 ${groupId} 活动失败:`, error);
      return null;
    }
  }

  // 获取分组讨论
  async getGroupDiscussions(groupId: string, params?: {
    page?: number;
    pageSize?: number;
    topic?: string;
    isPinned?: boolean;
  }): Promise<{ items: TeacherGroupDiscussion[]; total: number }> {
    try {
      return await apiService.teacherGroups.getDiscussions(groupId, params);
    } catch (error) {
      console.error(`获取分组 ${groupId} 讨论列表失败:`, error);
      return { items: [], total: 0 };
    }
  }

  // 创建分组讨论
  async createGroupDiscussion(groupId: string, discussion: Omit<TeacherGroupDiscussion, 'id' | 'groupId' | 'createdAt' | 'updatedAt' | 'replyCount' | 'views' | 'replies'>): Promise<TeacherGroupDiscussion | null> {
    try {
      return await apiService.teacherGroups.createDiscussion(groupId, discussion);
    } catch (error) {
      console.error(`创建分组 ${groupId} 讨论失败:`, error);
      return null;
    }
  }

  // 回复讨论
  async replyToDiscussion(groupId: string, discussionId: string, reply: Omit<TeacherGroupDiscussionReply, 'id' | 'discussionId' | 'createdAt' | 'updatedAt' | 'isApproved'>): Promise<TeacherGroupDiscussionReply | null> {
    try {
      return await apiService.teacherGroups.replyDiscussion(groupId, discussionId, reply);
    } catch (error) {
      console.error(`回复分组 ${groupId} 讨论 ${discussionId} 失败:`, error);
      return null;
    }
  }
}

export default new TeacherGroupService(); 