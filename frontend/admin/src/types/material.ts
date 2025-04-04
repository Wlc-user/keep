import { KnowledgeNode } from './knowledgeGraph';

// 素材类型枚举
export enum MaterialType {
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  IMAGE = 'image',
  PDF = 'pdf',
  OTHER = 'other'
}

// 素材状态枚举
export enum MaterialStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DRAFT = 'draft'
}

// 分类状态枚举
export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

// 权限类型枚举
export enum PermissionType {
  VIEW = 'view',
  DOWNLOAD = 'download',
  EDIT = 'edit',
  DELETE = 'delete',
  APPROVE = 'approve',
  MANAGE = 'manage'
}

// 角色类型枚举
export enum RoleType {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  GUEST = 'guest'
}

// 视频测试点类型
export type VideoTestPointType = 
  | 'concept_check'     // 概念检查
  | 'application'       // 应用题
  | 'reflection'        // 反思题
  | 'knowledge_check'   // 知识点检查
  | 'attention_check';  // 注意力检查

// 视频测试点难度
export type TestPointDifficulty = 'easy' | 'medium' | 'hard';

// 视频测试点
export interface VideoTestPoint {
  id: string;
  videoId: string;
  title: string;
  description?: string;
  timePosition: number; // 秒数，出现在视频的哪个时间点
  type: VideoTestPointType;
  difficulty: TestPointDifficulty;
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
  // 关联的知识图谱节点
  relatedKnowledgeNodes?: string[] | KnowledgeNode[]; 
  // 测试点覆盖的知识范围描述
  knowledgeCoverage?: string;
  // 用户参与此测试点的数据统计
  statistics?: {
    attempts: number;
    correctRate: number;
    averageResponseTime: number;
  };
}

// 视频学习记录
export interface VideoLearningRecord {
  id: string;
  userId: string;
  videoId: string;
  watchDuration: number;
  completionRate: number; // 0-1
  lastPosition: number;
  testPointsAttempted: {
    testPointId: string;
    answered: boolean;
    correct?: boolean;
    answer?: string | string[];
    timeSpent?: number;
  }[];
  knowledgeNodesVisited?: string[];
  startTime: string;
  endTime?: string;
}

// 视频资源扩展信息
export interface VideoResourceExtended {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number; // 秒
  thumbnailUrl?: string;
  // 视频测试点
  testPoints?: VideoTestPoint[];
  // 关联的知识图谱节点
  relatedKnowledgeNodes?: string[];
  // 视频转写文本
  transcript?: {
    text: string;
    segments: {
      startTime: number;
      endTime: number;
      text: string;
    }[];
  };
  // 章节标记
  chapters?: {
    title: string;
    startTime: number;
    endTime?: number;
    description?: string;
  }[];
}

// 素材接口
export interface Material {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  type: MaterialType;
  status: MaterialStatus;
  categoryId: string;
  categoryName: string;
  uploaderId: string;
  uploaderName: string;
  tags?: string[];
  size: number;
  downloadCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  rejectReason?: string;
}

// 素材分类接口
export interface MaterialCategory {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  icon?: string;
  order: number;
  status: CategoryStatus;
  tags?: string[];
  resourceCount: number;
  level: number;
  path: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// 素材列表响应接口
export interface MaterialListResponse {
  items: Material[];
  total: number;
  page: number;
  pageSize: number;
}

// 素材查询参数接口
export interface MaterialQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  type?: MaterialType;
  status?: MaterialStatus;
  categoryId?: string;
  tags?: string[];
  fullTextSearch?: boolean;
  fuzzySearch?: boolean;
}

// 素材上传参数接口
export interface MaterialUploadParams {
  title: string;
  description: string;
  type: MaterialType;
  categoryId: string;
  file: File;
  tags?: string[];
}

// 分类查询参数接口
export interface CategoryQueryParams {
  keyword?: string;
  status?: CategoryStatus;
  parentId?: string;
  level?: number;
}

// 分类统计接口
export interface CategoryStatistics {
  totalCategories: number;
  activeCategories: number;
  totalResources: number;
  resourcesByType: Record<MaterialType, number>;
}

// 素材权限接口
export interface MaterialPermission {
  materialId: string;
  roleId: string;
  roleName: string;
  permissions: PermissionType[];
}

// 分类权限接口
export interface CategoryPermission {
  categoryId: string;
  roleId: string;
  roleName: string;
  permissions: PermissionType[];
}

// 高级搜索参数接口
export interface AdvancedSearchParams {
  keyword?: string;
  type?: MaterialType;
  status?: MaterialStatus;
  categoryId?: string;
  tags?: string[];
  uploaderId?: string;
  dateRange?: [string, string];
  sizeRange?: [number, number];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  fullTextSearch?: boolean;
}

// 权限更新参数接口
export interface PermissionUpdateParams {
  roleId: string;
  permissions: PermissionType[];
} 