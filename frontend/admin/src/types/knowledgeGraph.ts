// 知识图谱节点类型枚举
export enum KnowledgeNodeType {
  CONCEPT = 'concept',       // 概念
  PRINCIPLE = 'principle',   // 原理
  PROCEDURE = 'procedure',   // 流程/方法
  FACT = 'fact',             // 事实
  TERM = 'term'              // 术语
}

// 知识图谱关系类型枚举
export enum KnowledgeRelationType {
  IS_PREREQUISITE_OF = 'is_prerequisite_of',   // 是前提条件
  IS_PART_OF = 'is_part_of',                   // 是组成部分
  RELATES_TO = 'relates_to',                   // 相关联
  LEADS_TO = 'leads_to',                       // 导致/引出
  EXAMPLE_OF = 'example_of',                   // 是例子
  SIMILAR_TO = 'similar_to'                    // 相似于
}

// 资源类型
export type ResourceType = 'pdf' | 'document' | 'image' | 'structured_data';

// 知识节点接口
export interface KnowledgeNode {
  id: string;
  name: string;
  type: string;
  category?: string;
  description?: string;
  importance?: number;
  difficulty?: number;
  prerequisites?: string[];
  relatedResources?: string[];
  metadata?: Record<string, any>;
}

// 知识关系接口
export interface KnowledgeRelation {
  id: string;
  source: string; // 源节点ID
  target: string; // 目标节点ID
  type: string;   // 关系类型：如 "prerequisite", "related", "contains" 等
  weight?: number; // 关系权重
  description?: string;
  metadata?: Record<string, any>;
}

// 完整知识图谱
export interface KnowledgeGraph {
  id: string;
  name: string;
  description?: string;
  subject: string;
  nodes: KnowledgeNode[];
  relations: KnowledgeRelation[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    version: number;
    nodeCount: number;
    relationCount: number;
  };
}

// 文档资源类型
export interface DocumentResource {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'md';
  path: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  metadata: {
    pageCount?: number;
    wordCount?: number;
    extractedText?: boolean;
  };
}

// 结构化数据资源
export interface StructuredDataResource {
  id: string;
  name: string;
  type: 'csv' | 'xlsx' | 'json' | 'xml';
  path: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  metadata: {
    rowCount?: number;
    columnCount?: number;
  };
}

// 图片资源
export interface ImageResource {
  id: string;
  name: string;
  type: 'jpg' | 'png' | 'jpeg' | 'svg';
  path: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  metadata: {
    width?: number;
    height?: number;
  };
}

// 学习路径定义
export interface LearningPath {
  id: string;
  name: string;
  description?: string;
  nodes: string[]; // 知识点ID的顺序列表
  graphId: string; // 关联的知识图谱ID
  difficulty: 'basic' | 'intermediate' | 'advanced';
  estimatedTime?: number; // 预计完成时间（分钟）
  metadata?: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    completionRate?: number;
  };
}

// 知识点测试定义
export interface KnowledgeTest {
  id: string;
  nodeId: string; // 关联的知识点ID
  questions: TestQuestion[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
  timeLimit?: number; // 时间限制（分钟）
  passScore?: number; // 通过分数
  metadata?: Record<string, any>;
}

// 测试题目定义
export interface TestQuestion {
  id: string;
  content: string;
  type: 'single' | 'multiple' | 'truefalse' | 'fill' | 'essay';
  options?: TestOption[];
  answer: string | string[];
  explanation?: string;
  score: number;
  difficulty?: number;
}

// 选项定义
export interface TestOption {
  id: string;
  content: string;
}

// 学习进度定义
export interface LearningProgress {
  userId: string;
  pathId: string;
  completedNodes: string[];
  currentNode?: string;
  testResults: {
    nodeId: string;
    testId: string;
    score: number;
    passStatus: boolean;
    completedAt: string;
  }[];
  startDate: string;
  lastActiveDate: string;
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  completionPercentage: number;
} 