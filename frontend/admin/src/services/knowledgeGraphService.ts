import axios from 'axios';
import { message } from 'antd';
import apiService from './apiService';
import { 
  KnowledgeGraph, 
  KnowledgeNode, 
  KnowledgeRelation,
  LearningPath,
  KnowledgeTest,
  LearningProgress
} from '../types/knowledgeGraph';

// 知识点接口
export interface KnowledgeNode {
  id: string;
  title: string;
  description: string;
  content?: string;
  type: 'concept' | 'fact' | 'procedure' | 'principle';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  credit: number; // 学分，表示该知识点的重要程度和学习投入
  grade: number; // 年级，1-4表示大一至大四
  sourceId: string;
  sourceType: ResourceType;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: any;
  isKeyNode?: boolean; // 是否为关键节点
}

// 知识点关系接口
export interface KnowledgeRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'prerequisite' | 'related' | 'part_of' | 'leads_to' | 'precedes' | 'follows';
  // prerequisite: 先决条件，表示学习目标节点前必须先学习源节点
  // related: 相关关系，表示两个节点内容相关
  // part_of: 包含关系，表示源节点是目标节点的一部分
  // leads_to: 引导关系，表示源节点学习后自然引导到目标节点
  // precedes: 先序关系，表示源节点在课程体系中先于目标节点学习
  // follows: 后序关系，表示源节点在课程体系中后于目标节点学习
  strength: number; // 0-1之间的关系强度，可理解为知识点间的依赖程度或相关性
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 知识图谱接口
export interface KnowledgeGraph {
  id: string;
  title: string;
  description: string;
  nodes: KnowledgeNode[];
  relations: KnowledgeRelation[];
  createdAt: string;
  updatedAt: string;
}

// 学习路径接口
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  nodes: string[]; // 知识点ID的有序数组
  difficulty: 'basic' | 'intermediate' | 'advanced';
  estimatedTime: number; // 预计完成时间（分钟）
  createdAt: string;
  updatedAt: string;
}

// 资源类型
export type ResourceType = 'document' | 'video' | 'audio' | 'image' | 'quiz';

// 资源接口
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  fileSize: number;
  duration?: number; // 视频或音频的时长（秒）
  format: string; // 文件格式，如pdf, mp4, mp3, jpg等
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  metadata: any; // 额外的元数据
}

// 知识图谱分析结果
export interface GraphAnalysisResult {
  graph: KnowledgeGraph;
  learningPaths: LearningPath[];
  keyNodes: string[]; // 关键知识点ID
  recommendations: {
    nodeId: string;
    resources: Resource[];
  }[];
}

// 节点类型定义
export enum NodeType {
  CONCEPT = 'concept',
  PRINCIPLE = 'principle',
  FACT = 'fact',
  PROCEDURE = 'procedure',
  THEORY = 'theory',
  RULE = 'rule',
  PROBLEM = 'problem',
  EXAMPLE = 'example'
}

// 难度级别定义
export enum DifficultyLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

// 关系类型定义
export enum RelationType {
  LEADS_TO = 'leads_to',
  PART_OF = 'part_of',
  IS_A = 'is_a',
  EXAMPLE_OF = 'example_of',
  SIMILAR_TO = 'similar_to',
  PREREQUISITE = 'prerequisite',
  RELATED_TO = 'related_to',
  DEPENDS_ON = 'depends_on'
}

// 知识关系
export interface KnowledgeRelation {
  id: string;
  source: string;
  target: string;
  type: string;
  description?: string;
  weight?: number;
  bidirectional?: boolean;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

// 知识图谱
export interface KnowledgeGraph {
  id?: string;
  title?: string;
  description?: string;
  nodes: KnowledgeNode[];
  relations: KnowledgeRelation[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  courseId?: string;
  subject?: string;
  tags?: string[];
  version?: string;
  metadata?: Record<string, any>;
}

// 学习路径
export interface LearningPath {
  id: string;
  title: string;
  description?: string;
  nodes: string[]; // 节点ID数组
  nodeDetails?: KnowledgeNode[]; // 完整节点信息
  difficulty?: DifficultyLevel;
  estimatedTime?: number; // 估计学习时间（分钟）
  courseId?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  metadata?: Record<string, any>;
}

/**
 * 知识图谱服务类
 * 处理所有与知识图谱相关的API调用和数据逻辑
 */
class KnowledgeGraphService {
  private apiUrl: string;

  constructor(apiUrl: string = '/api/knowledge-graph') {
    this.apiUrl = apiUrl;
  }

  // 从资源中提取知识图谱
  async extractGraphFromResources(resources: Resource[]): Promise<KnowledgeGraph> {
    try {
      const response = await axios.post(`${this.apiUrl}/extract`, { resources });
      return response.data;
    } catch (error) {
      console.error('提取知识图谱失败:', error);
      throw error;
    }
  }

  // 根据资源类型处理资源
  async processResourceByType(resource: Resource): Promise<KnowledgeNode[]> {
    try {
      const response = await axios.post(`${this.apiUrl}/process`, { resource });
      return response.data;
    } catch (error) {
      console.error(`处理${resource.type}资源失败:`, error);
      throw error;
    }
  }

  // 处理文档资源
  async processDocumentResource(resource: Resource): Promise<KnowledgeNode[]> {
    if (resource.type !== 'document') {
      throw new Error('资源类型不是文档');
    }
    
    try {
      const response = await axios.post(`${this.apiUrl}/process/document`, { resource });
      return response.data;
    } catch (error) {
      console.error('处理文档资源失败:', error);
      throw error;
    }
  }

  // 处理视频资源
  async processVideoResource(resource: Resource): Promise<KnowledgeNode[]> {
    if (resource.type !== 'video') {
      throw new Error('资源类型不是视频');
    }
    
    try {
      const response = await axios.post(`${this.apiUrl}/process/video`, { resource });
      return response.data;
    } catch (error) {
      console.error('处理视频资源失败:', error);
      throw error;
    }
  }

  // 处理音频资源
  async processAudioResource(resource: Resource): Promise<KnowledgeNode[]> {
    if (resource.type !== 'audio') {
      throw new Error('资源类型不是音频');
    }
    
    try {
      const response = await axios.post(`${this.apiUrl}/process/audio`, { resource });
      return response.data;
    } catch (error) {
      console.error('处理音频资源失败:', error);
      throw error;
    }
  }

  // 处理图片资源
  async processImageResource(resource: Resource): Promise<KnowledgeNode[]> {
    if (resource.type !== 'image') {
      throw new Error('资源类型不是图片');
    }
    
    try {
      const response = await axios.post(`${this.apiUrl}/process/image`, { resource });
      return response.data;
    } catch (error) {
      console.error('处理图片资源失败:', error);
      throw error;
    }
  }

  // 获取知识图谱
  // 删除了重复的方法定义 - async getKnowledgeGraph, createKnowledgeGraph, updateKnowledgeGraph, deleteKnowledgeGraph
  async addKnowledgeNode(graphId: string, node: Partial<KnowledgeNode>): Promise<KnowledgeNode> {
    try {
      const response = await axios.post(`${this.apiUrl}/${graphId}/nodes`, node);
      return response.data;
    } catch (error) {
      console.error('添加知识点失败:', error);
      throw error;
    }
  }

  // 更新知识点
  async updateKnowledgeNode(graphId: string, nodeId: string, node: Partial<KnowledgeNode>): Promise<KnowledgeNode> {
    try {
      const response = await axios.put(`${this.apiUrl}/${graphId}/nodes/${nodeId}`, node);
      return response.data;
    } catch (error) {
      console.error('更新知识点失败:', error);
      throw error;
    }
  }

  // 删除知识点
  async deleteKnowledgeNode(graphId: string, nodeId: string): Promise<void> {
    try {
      await axios.delete(`${this.apiUrl}/${graphId}/nodes/${nodeId}`);
    } catch (error) {
      console.error('删除知识点失败:', error);
      throw error;
    }
  }

  // 添加知识点关系
  async addKnowledgeRelation(graphId: string, relation: Partial<KnowledgeRelation>): Promise<KnowledgeRelation> {
    try {
      const response = await axios.post(`${this.apiUrl}/${graphId}/relations`, relation);
      return response.data;
    } catch (error) {
      console.error('添加知识点关系失败:', error);
      throw error;
    }
  }

  // 更新知识点关系
  async updateKnowledgeRelation(graphId: string, relationId: string, relation: Partial<KnowledgeRelation>): Promise<KnowledgeRelation> {
    try {
      const response = await axios.put(`${this.apiUrl}/${graphId}/relations/${relationId}`, relation);
      return response.data;
    } catch (error) {
      console.error('更新知识点关系失败:', error);
      throw error;
    }
  }

  // 删除知识点关系
  async deleteKnowledgeRelation(graphId: string, relationId: string): Promise<void> {
    try {
      await axios.delete(`${this.apiUrl}/${graphId}/relations/${relationId}`);
    } catch (error) {
      console.error('删除知识点关系失败:', error);
      throw error;
    }
  }

  // 生成学习路径
  async generateLearningPaths(graphId: string, options?: {
    difficulty?: 'basic' | 'intermediate' | 'advanced';
    startNodeId?: string;
    endNodeId?: string;
    maxPathLength?: number;
  }): Promise<LearningPath[]> {
    try {
      const response = await axios.post(`${this.apiUrl}/${graphId}/learning-paths`, options);
      return response.data;
    } catch (error) {
      console.error('生成学习路径失败:', error);
      throw error;
    }
  }

  // 分析知识图谱
  async analyzeGraph(graphId: string): Promise<GraphAnalysisResult> {
    try {
      const response = await axios.get(`${this.apiUrl}/${graphId}/analyze`);
      return response.data;
    } catch (error) {
      console.error('分析知识图谱失败:', error);
      throw error;
    }
  }

  // 获取学生的学习进度
  async getStudentProgress(graphId: string, studentId: string): Promise<{
    completedNodes: string[];
    inProgressNodes: string[];
    recommendedNextNodes: string[];
    overallProgress: number; // 0-1之间的完成比例
  }> {
    try {
      const response = await axios.get(`${this.apiUrl}/${graphId}/students/${studentId}/progress`);
      return response.data;
    } catch (error) {
      console.error('获取学生学习进度失败:', error);
      throw error;
    }
  }

  // 模拟知识图谱提取算法（前端演示用）
  simulateGraphExtraction(resources: Resource[]): KnowledgeGraph {
    // 创建知识点
    const nodes: KnowledgeNode[] = [];
    const relations: KnowledgeRelation[] = [];
    
    // 根据资源类型处理
    resources.forEach((resource, index) => {
      // 为每个资源创建1-3个知识点
      const nodeCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < nodeCount; i++) {
        const nodeId = `node_${index}_${i}`;
        const nodeTypes: Array<KnowledgeNode['type']> = ['concept', 'fact', 'procedure', 'principle'];
        const difficultyLevels: Array<KnowledgeNode['difficulty']> = ['basic', 'intermediate', 'advanced'];
        const selectedDifficulty = difficultyLevels[Math.floor(Math.random() * difficultyLevels.length)];
        
        // 根据难度级别分配学分
        let credit = 1;
        if (selectedDifficulty === 'basic') {
          credit = Math.random() > 0.5 ? 1 : 2;
        } else if (selectedDifficulty === 'intermediate') {
          credit = Math.random() > 0.5 ? 2 : 3;
        } else {
          credit = Math.random() > 0.5 ? 3 : 4;
        }
        
        // 根据难度级别分配年级
        let grade = 1;
        if (selectedDifficulty === 'basic') {
          grade = Math.random() > 0.5 ? 1 : 2;
        } else if (selectedDifficulty === 'intermediate') {
          grade = Math.random() > 0.5 ? 2 : 3;
        } else {
          grade = Math.random() > 0.5 ? 3 : 4;
        }
        
        // 随机决定是否为关键节点，关键节点的概率为20%
        const isKeyNode = Math.random() < 0.2;
        
        nodes.push({
          id: nodeId,
          title: `${resource.title} - 知识点 ${i + 1}`,
          description: `从${resource.type}资源"${resource.title}"中提取的知识点`,
          content: `这是从${resource.type}资源"${resource.title}"中提取的第${i + 1}个知识点的详细内容。包含了该知识点的核心概念、原理和应用示例。`,
          type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)],
          difficulty: selectedDifficulty,
          credit: credit,
          grade: grade,
          sourceId: resource.id,
          sourceType: resource.type,
          keywords: [`关键词${i * 3 + 1}`, `关键词${i * 3 + 2}`, `关键词${i * 3 + 3}`],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isKeyNode: isKeyNode,
          metadata: {
            importance: isKeyNode ? 'high' : (Math.random() > 0.5 ? 'medium' : 'low')
          }
        });
      }
    });
    
    // 创建知识点之间的关系，避免循环依赖
    for (let i = 0; i < nodes.length; i++) {
      // 每个节点可能与1-3个其他节点有关系
      const relationCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < relationCount; j++) {
        // 随机选择目标节点，但避免选择年级更低的节点作为目标
        const potentialTargets = nodes.filter((node, idx) => 
          idx !== i && // 避免自我关联
          node.grade >= nodes[i].grade // 避免指向年级更低的节点
        );
        
        if (potentialTargets.length === 0) continue;
        
        const targetNode = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
        const relationTypes: Array<KnowledgeRelation['type']> = ['prerequisite', 'related', 'part_of', 'leads_to'];
        
        // 如果目标节点年级更高，添加 precedes/follows 关系
        if (targetNode.grade > nodes[i].grade) {
          relationTypes.push('follows');
          
          // 添加反向关系
          relations.push({
            id: `relation_${targetNode.id}_to_${nodes[i].id}`,
            sourceId: targetNode.id,
            targetId: nodes[i].id,
            type: 'precedes',
            strength: 0.7 + Math.random() * 0.3, // 0.7-1之间的随机值，表示强关系
            description: `${targetNode.title} 在课程体系中后于 ${nodes[i].title}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        
        relations.push({
          id: `relation_${nodes[i].id}_to_${targetNode.id}`,
          sourceId: nodes[i].id,
          targetId: targetNode.id,
          type: relationTypes[Math.floor(Math.random() * relationTypes.length)],
          strength: 0.5 + Math.random() * 0.5, // 0.5-1之间的随机值，偏向较强关系
          description: `${nodes[i].title} 与 ${targetNode.title} 的关系`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    return {
      id: `graph_${Date.now()}`,
      title: '自动生成的知识图谱',
      description: '从上传资源中自动提取的知识图谱',
      nodes,
      relations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // 模拟生成学习路径（前端演示用）
  simulatePathGeneration(graph: KnowledgeGraph): LearningPath[] {
    if (!graph || !graph.nodes || graph.nodes.length === 0) {
      return [];
    }
    
    // 获取关键节点
    const keyNodes = graph.nodes.filter(node => node.isKeyNode).map(node => node.id);
    
    // 按年级分组节点
    const nodesByGrade: Record<number, KnowledgeNode[]> = {
      1: [],
      2: [],
      3: [],
      4: []
    };
    
    graph.nodes.forEach(node => {
      if (node.grade >= 1 && node.grade <= 4) {
        nodesByGrade[node.grade].push(node);
      }
    });
    
    // 基础学习路径：按年级顺序排列，每个年级内按学分排序
    const basicNodes: string[] = [];
    
    // 添加大一课程
    basicNodes.push(
      ...nodesByGrade[1]
        .sort((a, b) => (b.credit || 0) - (a.credit || 0))
        .map(node => node.id)
    );
    
    // 添加大二基础课程
    basicNodes.push(
      ...nodesByGrade[2]
        .filter(node => node.difficulty === 'basic')
        .sort((a, b) => (b.credit || 0) - (a.credit || 0))
        .map(node => node.id)
    );
    
    const basicPath: LearningPath = {
      id: `path_basic_${graph.id}_${Date.now()}`,
      title: '基础学习路径',
      description: '适合初学者的基础学习路径，按年级顺序排列，包含大一和大二基础课程',
      nodes: basicNodes,
      difficulty: 'basic',
      estimatedTime: basicNodes.length * 15, // 每个节点估计15分钟
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 进阶学习路径：包含大一至大三课程，按年级和学分排序
    const intermediateNodes: string[] = [];
    
    // 添加大一课程
    intermediateNodes.push(
      ...nodesByGrade[1]
        .sort((a, b) => (b.credit || 0) - (a.credit || 0))
        .map(node => node.id)
    );
    
    // 添加大二课程
    intermediateNodes.push(
      ...nodesByGrade[2]
        .sort((a, b) => (b.credit || 0) - (a.credit || 0))
        .map(node => node.id)
    );
    
    // 添加大三基础和中级课程
    intermediateNodes.push(
      ...nodesByGrade[3]
        .filter(node => node.difficulty !== 'advanced' || node.isKeyNode)
        .sort((a, b) => (b.credit || 0) - (a.credit || 0))
        .map(node => node.id)
    );
    
    const intermediatePath: LearningPath = {
      id: `path_intermediate_${graph.id}_${Date.now()}`,
      title: '进阶学习路径',
      description: '适合有一定基础的学习者，包含大一至大三课程，按年级和学分排序',
      nodes: intermediateNodes,
      difficulty: 'intermediate',
      estimatedTime: intermediateNodes.length * 20, // 每个节点估计20分钟
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 完整学习路径：包含所有课程，按年级和学分排序
    const advancedNodes: string[] = [];
    
    // 按年级顺序添加所有课程
    for (let grade = 1; grade <= 4; grade++) {
      advancedNodes.push(
        ...nodesByGrade[grade]
          .sort((a, b) => (b.credit || 0) - (a.credit || 0))
          .map(node => node.id)
      );
    }
    
    const advancedPath: LearningPath = {
      id: `path_advanced_${graph.id}_${Date.now()}`,
      title: '完整学习路径',
      description: '适合系统学习的学习者，包含所有课程，按年级和学分排序',
      nodes: advancedNodes,
      difficulty: 'advanced',
      estimatedTime: advancedNodes.length * 25, // 每个节点估计25分钟
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 关键节点学习路径：只包含关键节点，按年级排序
    const keyNodesSorted = keyNodes
      .map(id => graph.nodes.find(node => node.id === id))
      .filter(Boolean) as KnowledgeNode[];
    
    keyNodesSorted.sort((a, b) => {
      // 首先按年级排序
      if (a.grade !== b.grade) {
        return a.grade - b.grade;
      }
      // 然后按学分排序
      return (b.credit || 0) - (a.credit || 0);
    });
    
    const keyPath: LearningPath = {
      id: `path_key_${graph.id}_${Date.now()}`,
      title: '核心知识路径',
      description: '只包含关键节点，按年级和学分排序，适合快速掌握核心知识',
      nodes: keyNodesSorted.map(node => node.id),
      difficulty: 'intermediate',
      estimatedTime: keyNodesSorted.length * 30, // 每个节点估计30分钟
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 专业方向路径：根据知识点类型分组
    const aiConceptNodes = graph.nodes
      .filter(node => node.type === 'concept' && node.keywords.some(kw => 
        kw.toLowerCase().includes('人工智能') || 
        kw.toLowerCase().includes('ai') || 
        kw.toLowerCase().includes('机器学习') || 
        kw.toLowerCase().includes('深度学习')
      ))
      .sort((a, b) => a.grade - b.grade)
      .map(node => node.id);
    
    const aiPath: LearningPath = {
      id: `path_ai_${graph.id}_${Date.now()}`,
      title: '人工智能方向路径',
      description: '专注于人工智能概念的学习路径，按年级排序',
      nodes: aiConceptNodes,
      difficulty: 'intermediate',
      estimatedTime: aiConceptNodes.length * 25,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const algorithmNodes = graph.nodes
      .filter(node => node.type === 'algorithm')
      .sort((a, b) => a.grade - b.grade)
      .map(node => node.id);
    
    const algorithmPath: LearningPath = {
      id: `path_algorithm_${graph.id}_${Date.now()}`,
      title: '算法学习路径',
      description: '专注于算法学习的路径，按年级排序',
      nodes: algorithmNodes,
      difficulty: 'intermediate',
      estimatedTime: algorithmNodes.length * 25,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return [basicPath, intermediatePath, advancedPath, keyPath, aiPath, algorithmPath];
  }

  /**
   * 验证知识图谱数据结构的完整性
   * @param graph 知识图谱数据
   */
  private validateGraphData(graph: any): KnowledgeGraph {
    console.log('验证知识图谱数据:', graph);
    
    if (!graph) {
      console.warn('知识图谱数据为空，使用空图谱');
      return { nodes: [], relations: [] };
    }
    
    // 确保图谱包含节点和关系数组
    const result: KnowledgeGraph = {
      ...graph,
      nodes: graph.nodes || [],
      relations: graph.relations || []
    };
    
    // 验证节点数据
    result.nodes = result.nodes.map((node: any, index: number) => {
      // 确保每个节点都有ID
      if (!node.id) {
        console.warn(`节点 ${index} 缺少ID，生成随机ID`);
        node.id = `node_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // 确保每个节点都有标题
      if (!node.title) {
        console.warn(`节点 ${node.id} 缺少标题，使用ID作为标题`);
        node.title = `节点 ${node.id}`;
      }
      
      return node;
    });
    
    // 验证关系数据
    result.relations = result.relations.map((relation: any, index: number) => {
      // 确保每个关系都有ID
      if (!relation.id) {
        console.warn(`关系 ${index} 缺少ID，生成随机ID`);
        relation.id = `relation_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // 确保每个关系都有源节点和目标节点
      if (!relation.source || !relation.target) {
        console.warn(`关系 ${relation.id} 缺少源节点或目标节点`);
      }
      
      // 确保每个关系都有类型
      if (!relation.type) {
        console.warn(`关系 ${relation.id} 缺少类型，使用默认类型`);
        relation.type = RelationType.RELATED_TO;
      }
      
      return relation;
    });
    
    // 验证关系中的节点都存在
    const nodeIds = new Set(result.nodes.map(n => n.id));
    const invalidRelations: string[] = [];
    
    result.relations.forEach(relation => {
      if (!nodeIds.has(relation.source) || !nodeIds.has(relation.target)) {
        console.warn(`关系 ${relation.id} 包含不存在的节点: source=${relation.source}, target=${relation.target}`);
        invalidRelations.push(relation.id);
      }
    });
    
    // 如果发现无效关系，移除它们
    if (invalidRelations.length > 0) {
      console.warn(`移除 ${invalidRelations.length} 个无效关系`);
      result.relations = result.relations.filter(r => !invalidRelations.includes(r.id));
    }
    
    return result;
  }
  
  /**
   * 获取模拟知识图谱数据（开发环境使用）
   */
  private getMockGraph(): KnowledgeGraph {
    const nodes: KnowledgeNode[] = [
      {
        id: 'node1',
        title: '编程基础',
        description: '计算机编程的基本概念和原理',
        type: NodeType.CONCEPT,
        difficulty: DifficultyLevel.BASIC
      },
      {
        id: 'node2',
        title: '变量与数据类型',
        description: '编程语言中变量的声明和使用，以及基本数据类型',
        type: NodeType.CONCEPT,
        difficulty: DifficultyLevel.BASIC
      },
      {
        id: 'node3',
        title: '条件语句',
        description: '用于控制程序流程的条件判断语句',
        type: NodeType.PRINCIPLE,
        difficulty: DifficultyLevel.BASIC
      },
      {
        id: 'node4',
        title: '循环结构',
        description: '用于重复执行代码块的循环结构',
        type: NodeType.PRINCIPLE,
        difficulty: DifficultyLevel.INTERMEDIATE
      },
      {
        id: 'node5',
        title: '函数',
        description: '函数的定义、调用和参数传递',
        type: NodeType.PROCEDURE,
        difficulty: DifficultyLevel.INTERMEDIATE
      }
    ];
    
    const relations: KnowledgeRelation[] = [
      {
        id: 'rel1',
        source: 'node1',
        target: 'node2',
        type: RelationType.LEADS_TO,
        description: '编程基础导致学习变量与数据类型'
      },
      {
        id: 'rel2',
        source: 'node2',
        target: 'node3',
        type: RelationType.LEADS_TO,
        description: '理解变量后学习条件语句'
      },
      {
        id: 'rel3',
        source: 'node2',
        target: 'node4',
        type: RelationType.LEADS_TO,
        description: '理解变量后学习循环结构'
      },
      {
        id: 'rel4',
        source: 'node3',
        target: 'node5',
        type: RelationType.PREREQUISITE,
        description: '条件语句是学习函数的前提'
      },
      {
        id: 'rel5',
        source: 'node4',
        target: 'node5',
        type: RelationType.PREREQUISITE,
        description: '循环结构是学习函数的前提'
      }
    ];
    
    return {
      id: 'mock_graph_1',
      title: '计算机编程基础知识图谱',
      description: '展示编程入门的基本概念和它们之间的关系',
      nodes,
      relations,
      createdAt: new Date().toISOString(),
      subject: '计算机科学',
      tags: ['编程', '入门', '基础']
    };
  }

  // 获取知识图谱列表
  async getKnowledgeGraphs(params?: { 
    page?: number; 
    pageSize?: number; 
    subject?: string;
    creatorId?: string;
  }): Promise<{ items: KnowledgeGraph[]; total: number }> {
    try {
      return await apiService.knowledgeGraph.getAll(params);
    } catch (error) {
      console.error('获取知识图谱列表失败:', error);
      // 如果API请求失败，返回空列表
      return { items: [], total: 0 };
    }
  }

  // 获取单个知识图谱
  async getKnowledgeGraph(id: string): Promise<KnowledgeGraph | null> {
    try {
      return await apiService.knowledgeGraph.getById(id);
    } catch (error) {
      console.error(`获取知识图谱 ${id} 失败:`, error);
      return null;
    }
  }

  // 创建知识图谱
  async createKnowledgeGraph(graph: Omit<KnowledgeGraph, 'id'>): Promise<KnowledgeGraph | null> {
    try {
      return await apiService.knowledgeGraph.create(graph);
    } catch (error) {
      console.error('创建知识图谱失败:', error);
      return null;
    }
  }

  // 更新知识图谱
  async updateKnowledgeGraph(id: string, graph: Partial<KnowledgeGraph>): Promise<KnowledgeGraph | null> {
    try {
      return await apiService.knowledgeGraph.update(id, graph);
    } catch (error) {
      console.error(`更新知识图谱 ${id} 失败:`, error);
      return null;
    }
  }

  // 删除知识图谱
  async deleteKnowledgeGraph(id: string): Promise<boolean> {
    try {
      await apiService.knowledgeGraph.delete(id);
      return true;
    } catch (error) {
      console.error(`删除知识图谱 ${id} 失败:`, error);
      return false;
    }
  }

  // 导入知识图谱
  async importKnowledgeGraph(file: File): Promise<KnowledgeGraph | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      return await apiService.knowledgeGraph.import(formData);
    } catch (error) {
      console.error('导入知识图谱失败:', error);
      return null;
    }
  }

  // 从文档生成知识图谱
  async generateFromDocument(params: {
    resourceIds: string[];
    subject: string;
    name: string;
    description?: string;
  }): Promise<KnowledgeGraph | null> {
    try {
      return await apiService.knowledgeGraph.generateFromDoc(params);
    } catch (error) {
      console.error('从文档生成知识图谱失败:', error);
      return null;
    }
  }

  // 学习路径相关方法

  // 获取学习路径列表
  async getLearningPaths(params?: {
    page?: number;
    pageSize?: number;
    graphId?: string;
    difficulty?: string;
  }): Promise<{ items: LearningPath[]; total: number }> {
    try {
      return await apiService.knowledgeGraph.learningPaths.getAll(params);
    } catch (error) {
      console.error('获取学习路径列表失败:', error);
      return { items: [], total: 0 };
    }
  }

  // 获取单个学习路径
  async getLearningPath(id: string): Promise<LearningPath | null> {
    try {
      return await apiService.knowledgeGraph.learningPaths.getById(id);
    } catch (error) {
      console.error(`获取学习路径 ${id} 失败:`, error);
      return null;
    }
  }

  // 创建学习路径
  async createLearningPath(path: Omit<LearningPath, 'id'>): Promise<LearningPath | null> {
    try {
      return await apiService.knowledgeGraph.learningPaths.create(path);
    } catch (error) {
      console.error('创建学习路径失败:', error);
      return null;
    }
  }

  // 更新学习路径
  async updateLearningPath(id: string, path: Partial<LearningPath>): Promise<LearningPath | null> {
    try {
      return await apiService.knowledgeGraph.learningPaths.update(id, path);
    } catch (error) {
      console.error(`更新学习路径 ${id} 失败:`, error);
      return null;
    }
  }

  // 删除学习路径
  async deleteLearningPath(id: string): Promise<boolean> {
    try {
      await apiService.knowledgeGraph.learningPaths.delete(id);
      return true;
    } catch (error) {
      console.error(`删除学习路径 ${id} 失败:`, error);
      return false;
    }
  }

  // 自动生成学习路径
  async generateLearningPath(graphId: string, params: {
    name: string;
    description?: string;
    difficulty: 'basic' | 'intermediate' | 'advanced';
    startNodeId?: string;
    endNodeId?: string;
    maxNodes?: number;
  }): Promise<LearningPath | null> {
    try {
      return await apiService.knowledgeGraph.learningPaths.generate(graphId, params);
    } catch (error) {
      console.error('自动生成学习路径失败:', error);
      return null;
    }
  }

  // 用于处理请求失败的回退方法
  private getErrorResponse(error: any): any {
    console.error('API请求失败:', error);
    if (import.meta.env.DEV) {
      console.log('开发环境，返回模拟数据');
      return null; // 开发环境返回null
    }
    throw error; // 生产环境抛出错误
  }
}

export default new KnowledgeGraphService();