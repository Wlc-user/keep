import { KnowledgeNode, KnowledgeRelation, KnowledgeGraph, Resource, LearningPath } from '../services/knowledgeGraphService';

/**
 * 知识图谱算法类
 * 实现从不同类型资源中提取知识点、构建知识图谱和生成学习路径的算法
 */
class KnowledgeGraphAlgorithm {
  /**
   * 从资源集合中提取知识图谱
   * @param resources 资源集合
   * @returns 知识图谱
   */
  extractGraphFromResources(resources: Resource[]): KnowledgeGraph {
    // 创建新的知识图谱
    const graph: KnowledgeGraph = {
      id: `graph_${Date.now()}`,
      title: resources.length === 1 
        ? `基于 ${resources[0].title} 的知识图谱` 
        : `知识图谱 ${new Date().toLocaleDateString()}`,
      description: resources.length === 1
        ? `从资源 "${resources[0].title}" 自动提取的知识图谱`
        : `从${resources.length}个资源中自动生成的知识图谱`,
      nodes: [],
      relations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 从每个资源中提取知识点
    resources.forEach(resource => {
      const nodes = this.extractNodesFromResource(resource);
      graph.nodes.push(...nodes);
    });
    
    // 构建知识点之间的关系
    graph.relations = this.buildRelations(graph.nodes);
    
    return graph;
  }
  
  /**
   * 从单个资源中提取知识点
   * @param resource 资源
   * @returns 知识点数组
   */
  extractNodesFromResource(resource: Resource): KnowledgeNode[] {
    // 根据资源类型调用不同的处理方法
    switch (resource.type) {
      case 'document':
        return this.extractNodesFromDocument(resource);
      case 'video':
        return this.extractNodesFromVideo(resource);
      case 'audio':
        return this.extractNodesFromAudio(resource);
      case 'image':
        return this.extractNodesFromImage(resource);
      case 'quiz':
        return this.extractNodesFromQuiz(resource);
      default:
        return [];
    }
  }
  
  /**
   * 从文档资源中提取知识点
   * @param resource 文档资源
   * @returns 知识点数组
   */
  extractNodesFromDocument(resource: Resource): KnowledgeNode[] {
    // 文档处理算法
    // 1. 文本预处理：分段、分句
    // 2. 关键词提取：使用TF-IDF、TextRank等算法
    // 3. 实体识别：识别文档中的概念、术语等
    // 4. 主题建模：使用LDA等算法识别主题
    // 5. 知识点构建：根据提取的信息构建知识点
    
    // 模拟实现，实际应调用NLP服务
    const nodes: KnowledgeNode[] = [];
    const nodeCount = Math.floor(Math.random() * 5) + 3; // 3-7个知识点
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(this.createMockNode(resource, i));
    }
    
    return nodes;
  }
  
  /**
   * 从视频资源中提取知识点
   * @param resource 视频资源
   * @returns 知识点数组
   */
  extractNodesFromVideo(resource: Resource): KnowledgeNode[] {
    // 视频处理算法
    // 1. 视频分段：基于场景变化、字幕等
    // 2. 语音转文本：提取视频中的语音内容
    // 3. 字幕分析：分析视频字幕
    // 4. 视觉内容分析：识别视频中的关键视觉元素
    // 5. 知识点构建：结合以上信息构建知识点
    
    // 模拟实现，实际应调用视频处理服务
    const nodes: KnowledgeNode[] = [];
    const nodeCount = Math.floor(Math.random() * 4) + 2; // 2-5个知识点
    
    for (let i = 0; i < nodeCount; i++) {
      const node = this.createMockNode(resource, i);
      // 为视频知识点添加时间戳
      node.metadata = {
        ...node.metadata,
        startTime: Math.floor(Math.random() * (resource.duration || 300)),
        endTime: Math.floor(Math.random() * (resource.duration || 300) + 60)
      };
      nodes.push(node);
    }
    
    return nodes;
  }
  
  /**
   * 从音频资源中提取知识点
   * @param resource 音频资源
   * @returns 知识点数组
   */
  extractNodesFromAudio(resource: Resource): KnowledgeNode[] {
    // 音频处理算法
    // 1. 音频分段：基于停顿、说话人变化等
    // 2. 语音转文本：提取音频中的语音内容
    // 3. 关键词提取：从转录文本中提取关键词
    // 4. 知识点构建：根据提取的信息构建知识点
    
    // 模拟实现，实际应调用音频处理服务
    const nodes: KnowledgeNode[] = [];
    const nodeCount = Math.floor(Math.random() * 3) + 2; // 2-4个知识点
    
    for (let i = 0; i < nodeCount; i++) {
      const node = this.createMockNode(resource, i);
      // 为音频知识点添加时间戳
      node.metadata = {
        ...node.metadata,
        startTime: Math.floor(Math.random() * (resource.duration || 300)),
        endTime: Math.floor(Math.random() * (resource.duration || 300) + 60)
      };
      nodes.push(node);
    }
    
    return nodes;
  }
  
  /**
   * 从图片资源中提取知识点
   * @param resource 图片资源
   * @returns 知识点数组
   */
  extractNodesFromImage(resource: Resource): KnowledgeNode[] {
    // 图片处理算法
    // 1. 图像识别：识别图片中的对象、场景
    // 2. OCR：提取图片中的文本
    // 3. 图表分析：如果是图表，分析其内容
    // 4. 知识点构建：根据提取的信息构建知识点
    
    // 模拟实现，实际应调用图像处理服务
    const nodes: KnowledgeNode[] = [];
    const nodeCount = Math.floor(Math.random() * 2) + 1; // 1-2个知识点
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(this.createMockNode(resource, i));
    }
    
    return nodes;
  }
  
  /**
   * 从测验资源中提取知识点
   * @param resource 测验资源
   * @returns 知识点数组
   */
  extractNodesFromQuiz(resource: Resource): KnowledgeNode[] {
    // 测验处理算法
    // 1. 分析问题：提取问题中的关键概念
    // 2. 分析选项：提取选项中的关键信息
    // 3. 分析答案：根据正确答案提取重要知识点
    // 4. 知识点构建：根据提取的信息构建知识点
    
    // 模拟实现，实际应分析测验内容
    const nodes: KnowledgeNode[] = [];
    const nodeCount = Math.floor(Math.random() * 3) + 1; // 1-3个知识点
    
    for (let i = 0; i < nodeCount; i++) {
      const node = this.createMockNode(resource, i);
      // 为测验知识点添加难度信息
      node.difficulty = ['basic', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as any;
      nodes.push(node);
    }
    
    return nodes;
  }
  
  /**
   * 构建知识点之间的关系
   * @param nodes 知识点数组
   * @returns 关系数组
   */
  private buildRelations(nodes: KnowledgeNode[]): KnowledgeRelation[] {
    const relations: KnowledgeRelation[] = [];
    
    // 实际算法应该基于以下几点构建关系：
    // 1. 文本相似度：计算知识点描述的相似度
    // 2. 关键词重叠：分析知识点关键词的重叠程度
    // 3. 语义关联：使用词向量或语言模型分析语义关联
    // 4. 时序关系：基于资源中的时间顺序
    // 5. 结构关系：基于资源的结构（如章节关系）
    
    // 模拟实现，随机构建关系
    for (let i = 0; i < nodes.length; i++) {
      // 每个节点可能与1-3个其他节点有关系
      const relationCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < relationCount; j++) {
        // 随机选择目标节点
        const targetIndex = Math.floor(Math.random() * nodes.length);
        if (targetIndex !== i) { // 避免自我关联
          const relationTypes: Array<KnowledgeRelation['type']> = ['prerequisite', 'related', 'part_of', 'leads_to'];
          
          relations.push({
            id: `relation_${i}_${j}`,
            sourceId: nodes[i].id,
            targetId: nodes[targetIndex].id,
            type: relationTypes[Math.floor(Math.random() * relationTypes.length)],
            strength: 0.5 + Math.random() * 0.5, // 0.5-1之间的随机值，偏向较强关系
            description: `${nodes[i].title} 与 ${nodes[targetIndex].title} 的关系`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
    }
    
    return relations;
  }
  
  /**
   * 生成学习路径
   * @param graph 知识图谱
   * @param options 选项
   * @returns 学习路径数组
   */
  generateLearningPaths(graph: KnowledgeGraph, options?: {
    difficulty?: 'basic' | 'intermediate' | 'advanced';
    startNodeId?: string;
    endNodeId?: string;
    maxPathLength?: number;
  }): LearningPath[] {
    // 学习路径生成算法
    // 1. 图算法：将知识图谱视为有向图
    // 2. 路径搜索：使用DFS、BFS或最短路径算法
    // 3. 路径优化：考虑知识点难度、关系强度等
    // 4. 路径多样化：生成多条不同特点的路径
    
    // 检查图是否有效
    if (!graph || !graph.nodes || graph.nodes.length === 0) {
      return [];
    }
    
    const paths: LearningPath[] = [];
    const { difficulty, startNodeId, endNodeId, maxPathLength = 10 } = options || {};
    
    // 根据难度筛选节点
    let availableNodes = [...graph.nodes];
    if (difficulty) {
      availableNodes = availableNodes.filter(node => node.difficulty === difficulty);
      // 如果筛选后没有节点，返回空数组
      if (availableNodes.length === 0) {
        return [];
      }
    }
    
    // 如果指定了起始节点，确保它在可用节点中
    let startNode = startNodeId ? availableNodes.find(node => node.id === startNodeId) : null;
    if (startNodeId && !startNode) {
      startNode = graph.nodes.find(node => node.id === startNodeId) || null;
      if (startNode) availableNodes.push(startNode);
    }
    
    // 如果指定了结束节点，确保它在可用节点中
    let endNode = endNodeId ? availableNodes.find(node => node.id === endNodeId) : null;
    if (endNodeId && !endNode) {
      endNode = graph.nodes.find(node => node.id === endNodeId) || null;
      if (endNode) availableNodes.push(endNode);
    }
    
    // 限制尝试生成路径的次数，避免无限循环
    const maxAttempts = 3;
    let attempts = 0;
    
    // 生成3条不同的学习路径
    while (paths.length < 3 && attempts < maxAttempts) {
      attempts++;
      
      const pathNodes: string[] = [];
      
      // 如果有指定起始节点，从它开始
      if (startNode) {
        pathNodes.push(startNode.id);
      } else if (availableNodes.length > 0) {
        // 否则随机选择一个起始节点
        const randomStartIndex = Math.floor(Math.random() * availableNodes.length);
        pathNodes.push(availableNodes[randomStartIndex].id);
      } else {
        // 如果没有可用节点，跳过此次尝试
        continue;
      }
      
      // 构建路径
      try {
        this.buildPath(graph, pathNodes, availableNodes, endNodeId, maxPathLength);
        
        // 如果路径太短，跳过
        if (pathNodes.length < 2) {
          continue;
        }
        
        // 创建学习路径对象
        const pathDifficulty: LearningPath['difficulty'] = difficulty || 
          ['basic', 'intermediate', 'advanced'][paths.length % 3] as any;
        
        paths.push({
          id: `path_${Date.now()}_${paths.length}`,
          title: `学习路径 ${paths.length + 1}`,
          description: `难度为${pathDifficulty}的学习路径`,
          nodes: pathNodes,
          difficulty: pathDifficulty,
          estimatedTime: pathNodes.length * 30, // 每个知识点估计30分钟
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('构建路径时出错:', error);
        // 出错时继续尝试下一条路径
      }
    }
    
    return paths;
  }
  
  /**
   * 构建路径
   * @param graph 知识图谱
   * @param pathNodes 当前路径节点
   * @param availableNodes 可用节点
   * @param endNodeId 结束节点ID
   * @param maxPathLength 最大路径长度
   */
  private buildPath(
    graph: KnowledgeGraph, 
    pathNodes: string[], 
    availableNodes: KnowledgeNode[], 
    endNodeId?: string,
    maxPathLength: number = 10
  ): void {
    // 如果路径已达到最大长度或已到达终点，停止构建
    if (pathNodes.length >= maxPathLength || (endNodeId && pathNodes[pathNodes.length - 1] === endNodeId)) {
      return;
    }
    
    // 如果没有可用节点，停止构建
    const remainingNodes = availableNodes.filter(node => !pathNodes.includes(node.id));
    if (remainingNodes.length === 0) {
      return;
    }
    
    const currentNodeId = pathNodes[pathNodes.length - 1];
    
    // 找出与当前节点有关系的节点，但只考虑尚未在路径中的目标节点
    const outgoingRelations = graph.relations.filter(rel => 
      rel.sourceId === currentNodeId && 
      !pathNodes.includes(rel.targetId)
    );
    
    // 如果没有有效的出边，随机选择一个节点
    if (outgoingRelations.length === 0) {
      // 随机选择一个尚未在路径中的节点
      const randomIndex = Math.floor(Math.random() * remainingNodes.length);
      pathNodes.push(remainingNodes[randomIndex].id);
      
      // 递归构建路径，但确保不会无限递归
      if (pathNodes.length < maxPathLength) {
        this.buildPath(graph, pathNodes, availableNodes, endNodeId, maxPathLength);
      }
      return;
    }
    
    // 按关系强度排序
    outgoingRelations.sort((a, b) => b.strength - a.strength);
    
    // 选择最强的关系
    const nextRelation = outgoingRelations[0];
    const nextNodeId = nextRelation.targetId;
    
    // 添加下一个节点到路径
    pathNodes.push(nextNodeId);
    
    // 递归构建路径，但确保不会无限递归
    if (pathNodes.length < maxPathLength) {
      this.buildPath(graph, pathNodes, availableNodes, endNodeId, maxPathLength);
    }
  }
  
  /**
   * 分析知识图谱，找出关键节点
   * @param graph 知识图谱
   * @returns 关键节点ID数组
   */
  analyzeGraph(graph: KnowledgeGraph): string[] {
    // 图分析算法
    // 1. 中心性分析：计算节点的度中心性、接近中心性、介数中心性等
    // 2. 社区发现：识别知识图谱中的社区结构
    // 3. 关键节点识别：基于中心性和社区结构识别关键节点
    
    // 模拟实现，使用简单的度中心性
    const nodeDegrees = new Map<string, number>();
    
    // 计算每个节点的度（入度+出度）
    graph.nodes.forEach(node => {
      const inDegree = graph.relations.filter(rel => rel.targetId === node.id).length;
      const outDegree = graph.relations.filter(rel => rel.sourceId === node.id).length;
      nodeDegrees.set(node.id, inDegree + outDegree);
    });
    
    // 按度排序节点
    const sortedNodes = [...nodeDegrees.entries()].sort((a, b) => b[1] - a[1]);
    
    // 取前30%的节点作为关键节点
    const keyNodeCount = Math.max(1, Math.ceil(graph.nodes.length * 0.3));
    return sortedNodes.slice(0, keyNodeCount).map(entry => entry[0]);
  }
  
  /**
   * 创建模拟知识点（用于演示）
   * @param resource 资源
   * @param index 索引
   * @returns 知识点
   */
  private createMockNode(resource: Resource, index: number): KnowledgeNode {
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
      grade = Math.random() > 0.5 ? 1 : 2; // 基础课程通常在大一或大二
    } else if (selectedDifficulty === 'intermediate') {
      grade = Math.random() > 0.5 ? 2 : 3; // 中级课程通常在大二或大三
    } else {
      grade = Math.random() > 0.5 ? 3 : 4; // 高级课程通常在大三或大四
    }
    
    // 随机决定是否为关键节点，关键节点的概率为20%
    const isKeyNode = Math.random() < 0.2;
    
    return {
      id: `node_${resource.id}_${index}`,
      title: `${resource.title} - 知识点 ${index + 1}`,
      description: `从${resource.type}资源"${resource.title}"中提取的知识点`,
      content: `这是从${resource.type}资源"${resource.title}"中提取的第${index + 1}个知识点的详细内容。包含了该知识点的核心概念、原理和应用示例。`,
      type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)],
      difficulty: selectedDifficulty,
      credit: credit,
      grade: grade,
      sourceId: resource.id,
      sourceType: resource.type,
      keywords: [`关键词${index * 3 + 1}`, `关键词${index * 3 + 2}`, `关键词${index * 3 + 3}`],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isKeyNode: isKeyNode,
      metadata: {
        confidence: 0.7 + Math.random() * 0.3 // 提取置信度，0.7-1之间
      }
    };
  }

  /**
   * 模拟知识图谱提取（用于演示）
   * @param resources 资源集合
   * @returns 模拟的知识图谱
   */
  simulateGraphExtraction(resources: Resource[]): KnowledgeGraph {
    // 创建模拟知识图谱
    const graph: KnowledgeGraph = {
      id: `graph_${Date.now()}`,
      title: '人工智能基础知识图谱',
      description: '包含人工智能基础概念、机器学习算法和深度学习模型的知识图谱',
      nodes: [],
      relations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 创建模拟知识点
    const aiIntroNode: KnowledgeNode = {
      id: 'node_1',
      title: '人工智能导论',
      description: '人工智能导论知识点',
      content: '人工智能是计算机科学的一个分支，致力于创造能够模拟人类智能的系统。',
      type: 'concept',
      difficulty: 'basic',
      credit: 3, // 基础课程，3学分
      grade: 1, // 大一课程
      sourceId: resources.find(r => r.title.includes('人工智能导论'))?.id || '',
      sourceType: 'document',
      keywords: ['人工智能', '导论', '计算机科学'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isKeyNode: true, // 作为入门课程，是关键节点
      metadata: {
        importance: 'high'
      }
    };
    
    const mlBasicsNode: KnowledgeNode = {
      id: 'node_2',
      title: '机器学习基础',
      description: '机器学习基础知识点',
      content: '机器学习是人工智能的一个子领域，专注于开发能够从数据中学习的算法。',
      type: 'concept',
      difficulty: 'basic',
      credit: 4, // 重要基础课程，4学分
      grade: 2, // 大二课程
      sourceId: resources.find(r => r.title.includes('机器学习'))?.id || '',
      sourceType: 'document',
      keywords: ['机器学习', '算法', '数据'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isKeyNode: true, // 机器学习是AI领域的关键知识点
      metadata: {
        importance: 'high'
      }
    };
    
    const supervisedLearningNode: KnowledgeNode = {
      id: 'node_3',
      title: '监督学习',
      description: '监督学习知识点',
      content: '监督学习是机器学习的一种方法，通过标记的训练数据来学习输入到输出的映射。',
      type: 'concept',
      difficulty: 'intermediate',
      credit: 3, // 中级课程，3学分
      grade: 2, // 大二课程
      sourceId: resources.find(r => r.title.includes('机器学习'))?.id || '',
      sourceType: 'document',
      keywords: ['监督学习', '机器学习', '训练数据'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        importance: 'medium'
      }
    };
    
    const unsupervisedLearningNode: KnowledgeNode = {
      id: 'node_4',
      title: '无监督学习',
      description: '无监督学习知识点',
      content: '无监督学习是机器学习的一种方法，通过未标记的数据来发现数据中的模式和结构。',
      type: 'concept',
      difficulty: 'intermediate',
      credit: 3, // 中级课程，3学分
      grade: 2, // 大二课程
      sourceId: resources.find(r => r.title.includes('机器学习'))?.id || '',
      sourceType: 'document',
      keywords: ['无监督学习', '机器学习', '未标记数据'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        importance: 'medium'
      }
    };
    
    const deepLearningNode: KnowledgeNode = {
      id: 'node_5',
      title: '深度学习',
      description: '深度学习知识点',
      content: '深度学习是机器学习的一个子领域，使用多层神经网络来学习数据表示。',
      type: 'concept',
      difficulty: 'advanced',
      credit: 4, // 高级课程，4学分
      grade: 3, // 大三课程
      sourceId: resources.find(r => r.title.includes('深度学习'))?.id || '',
      sourceType: 'document',
      keywords: ['深度学习', '机器学习', '多层神经网络'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isKeyNode: true, // 深度学习是当前AI领域的关键技术
      metadata: {
        importance: 'high'
      }
    };
    
    const neuralNetworkNode: KnowledgeNode = {
      id: 'node_6',
      title: '神经网络',
      description: '神经网络知识点',
      content: '神经网络是一种受人脑结构启发的计算模型，由多层互连的神经元组成。',
      type: 'concept',
      difficulty: 'advanced',
      credit: 3, // 高级课程，3学分
      grade: 3, // 大三课程
      sourceId: resources.find(r => r.title.includes('神经网络'))?.id || '',
      sourceType: 'document',
      keywords: ['神经网络', '计算模型', '多层神经元'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isKeyNode: true, // 神经网络是深度学习的基础，是关键节点
      metadata: {
        importance: 'high'
      }
    };
    
    const cnnNode: KnowledgeNode = {
      id: 'node_7',
      title: '卷积神经网络',
      description: '卷积神经网络知识点',
      content: '卷积神经网络是一种专门用于处理网格结构数据（如图像）的神经网络。',
      type: 'algorithm',
      difficulty: 'advanced',
      credit: 2, // 专项技术课程，2学分
      grade: 3, // 大三课程
      sourceId: resources.find(r => r.title.includes('神经网络'))?.id || '',
      sourceType: 'document',
      keywords: ['卷积神经网络', 'CNN', '图像处理'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        importance: 'medium'
      }
    };
    
    const rnnNode: KnowledgeNode = {
      id: 'node_8',
      title: '循环神经网络',
      description: '循环神经网络知识点',
      content: '循环神经网络是一种专门用于处理序列数据的神经网络，具有记忆能力。',
      type: 'algorithm',
      difficulty: 'advanced',
      credit: 2, // 专项技术课程，2学分
      grade: 3, // 大三课程
      sourceId: resources.find(r => r.title.includes('深度学习'))?.id || '',
      sourceType: 'document',
      keywords: ['循环神经网络', 'RNN', '序列数据'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        importance: 'medium'
      }
    };
    
    const linearRegressionNode: KnowledgeNode = {
      id: 'node_9',
      title: '线性回归',
      description: '线性回归知识点',
      content: '线性回归是一种基本的监督学习算法，用于预测连续值。',
      type: 'algorithm',
      difficulty: 'basic',
      credit: 1, // 基础算法，1学分
      grade: 2, // 大二课程
      sourceId: resources.find(r => r.title.includes('机器学习'))?.id || '',
      sourceType: 'document',
      keywords: ['线性回归', '监督学习', '连续值预测'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        importance: 'medium'
      }
    };
    
    const logisticRegressionNode: KnowledgeNode = {
      id: 'node_10',
      title: '逻辑回归',
      description: '逻辑回归知识点',
      content: '逻辑回归是一种基本的监督学习算法，用于二分类问题。',
      type: 'algorithm',
      difficulty: 'basic',
      credit: 1, // 基础算法，1学分
      grade: 2, // 大二课程
      sourceId: resources.find(r => r.title.includes('机器学习'))?.id || '',
      sourceType: 'document',
      keywords: ['逻辑回归', '监督学习', '二分类'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        importance: 'medium'
      }
    };
    
    const decisionTreeNode: KnowledgeNode = {
      id: 'node_11',
      title: '决策树',
      description: '决策树知识点',
      content: '决策树是一种基本的监督学习算法，通过树状结构进行决策。',
      type: 'algorithm',
      difficulty: 'intermediate',
      credit: 2, // 中级算法，2学分
      grade: 2, // 大二课程
      sourceId: resources.find(r => r.title.includes('机器学习'))?.id || '',
      sourceType: 'document',
      keywords: ['决策树', '监督学习', '分类'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        importance: 'medium'
      }
    };
    
    const svmNode: KnowledgeNode = {
      id: 'node_12',
      title: '支持向量机',
      description: '支持向量机知识点',
      content: '支持向量机是一种强大的监督学习算法，通过寻找最优超平面进行分类。',
      type: 'algorithm',
      difficulty: 'intermediate',
      credit: 2, // 中级算法，2学分
      grade: 2, // 大二课程
      sourceId: resources.find(r => r.title.includes('机器学习'))?.id || '',
      sourceType: 'document',
      keywords: ['支持向量机', 'SVM', '分类'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        importance: 'medium'
      }
    };
    
    // 添加高级课程
    const reinforcementLearningNode: KnowledgeNode = {
      id: 'node_13',
      title: '强化学习',
      description: '强化学习知识点',
      content: '强化学习是一种机器学习方法，通过与环境交互来学习最优策略。',
      type: 'concept',
      difficulty: 'advanced',
      credit: 3, // 高级课程，3学分
      grade: 3, // 大三课程
      sourceId: resources.find(r => r.title.includes('机器学习'))?.id || '',
      sourceType: 'document',
      keywords: ['强化学习', '机器学习', '策略优化'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        importance: 'high'
      }
    };
    
    const transformerNode: KnowledgeNode = {
      id: 'node_14',
      title: 'Transformer模型',
      description: 'Transformer模型知识点',
      content: 'Transformer是一种基于自注意力机制的神经网络架构，广泛应用于自然语言处理。',
      type: 'algorithm',
      difficulty: 'advanced',
      credit: 3, // 高级课程，3学分
      grade: 4, // 大四课程
      sourceId: resources.find(r => r.title.includes('深度学习'))?.id || '',
      sourceType: 'document',
      keywords: ['Transformer', '自注意力', 'NLP'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isKeyNode: true,
      metadata: {
        importance: 'high'
      }
    };
    
    const llmNode: KnowledgeNode = {
      id: 'node_15',
      title: '大型语言模型',
      description: '大型语言模型知识点',
      content: '大型语言模型是基于Transformer架构的大规模预训练模型，如GPT和BERT。',
      type: 'concept',
      difficulty: 'advanced',
      credit: 4, // 高级课程，4学分
      grade: 4, // 大四课程
      sourceId: resources.find(r => r.title.includes('深度学习'))?.id || '',
      sourceType: 'document',
      keywords: ['LLM', 'GPT', 'BERT'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isKeyNode: true,
      metadata: {
        importance: 'high'
      }
    };
    
    const aiEthicsNode: KnowledgeNode = {
      id: 'node_16',
      title: '人工智能伦理',
      description: '人工智能伦理知识点',
      content: '人工智能伦理研究AI技术的道德影响和责任问题。',
      type: 'concept',
      difficulty: 'intermediate',
      credit: 2, // 通识课程，2学分
      grade: 4, // 大四课程
      sourceId: resources.find(r => r.title.includes('人工智能'))?.id || '',
      sourceType: 'document',
      keywords: ['AI伦理', '道德', '责任'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        importance: 'medium'
      }
    };
    
    // 添加知识点到图谱
    graph.nodes = [
      aiIntroNode,
      mlBasicsNode,
      supervisedLearningNode,
      unsupervisedLearningNode,
      deepLearningNode,
      neuralNetworkNode,
      cnnNode,
      rnnNode,
      linearRegressionNode,
      logisticRegressionNode,
      decisionTreeNode,
      svmNode,
      reinforcementLearningNode,
      transformerNode,
      llmNode,
      aiEthicsNode
    ];
    
    // 创建模拟关系
    // 1. 基于年级的先序后序关系
    const relations: KnowledgeRelation[] = [];
    
    // 为每个节点创建与其他节点的关系
    for (let i = 0; i < graph.nodes.length; i++) {
      const sourceNode = graph.nodes[i];
      
      for (let j = 0; j < graph.nodes.length; j++) {
        if (i === j) continue; // 跳过自身
        
        const targetNode = graph.nodes[j];
        
        // 1. 基于年级的先序后序关系
        if (sourceNode.grade < targetNode.grade) {
          // 低年级课程先于高年级课程
          relations.push({
            id: `relation_precedes_${sourceNode.id}_${targetNode.id}`,
            sourceId: sourceNode.id,
            targetId: targetNode.id,
            type: 'precedes',
            strength: 0.7 + Math.random() * 0.3, // 0.7-1.0之间的强度
            description: `${sourceNode.title}（${sourceNode.grade}年级）先于${targetNode.title}（${targetNode.grade}年级）学习`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        } else if (sourceNode.grade > targetNode.grade) {
          // 高年级课程后于低年级课程
          relations.push({
            id: `relation_follows_${sourceNode.id}_${targetNode.id}`,
            sourceId: sourceNode.id,
            targetId: targetNode.id,
            type: 'follows',
            strength: 0.7 + Math.random() * 0.3, // 0.7-1.0之间的强度
            description: `${sourceNode.title}（${sourceNode.grade}年级）后于${targetNode.title}（${targetNode.grade}年级）学习`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        
        // 2. 基于知识内容的先决条件关系
        // 特定的知识依赖关系
        if (
          (sourceNode.id === aiIntroNode.id && targetNode.id === mlBasicsNode.id) ||
          (sourceNode.id === mlBasicsNode.id && targetNode.id === supervisedLearningNode.id) ||
          (sourceNode.id === mlBasicsNode.id && targetNode.id === unsupervisedLearningNode.id) ||
          (sourceNode.id === mlBasicsNode.id && targetNode.id === deepLearningNode.id) ||
          (sourceNode.id === supervisedLearningNode.id && targetNode.id === linearRegressionNode.id) ||
          (sourceNode.id === supervisedLearningNode.id && targetNode.id === logisticRegressionNode.id) ||
          (sourceNode.id === supervisedLearningNode.id && targetNode.id === decisionTreeNode.id) ||
          (sourceNode.id === supervisedLearningNode.id && targetNode.id === svmNode.id) ||
          (sourceNode.id === deepLearningNode.id && targetNode.id === neuralNetworkNode.id) ||
          (sourceNode.id === neuralNetworkNode.id && targetNode.id === cnnNode.id) ||
          (sourceNode.id === neuralNetworkNode.id && targetNode.id === rnnNode.id) ||
          (sourceNode.id === linearRegressionNode.id && targetNode.id === logisticRegressionNode.id) ||
          (sourceNode.id === neuralNetworkNode.id && targetNode.id === transformerNode.id) ||
          (sourceNode.id === transformerNode.id && targetNode.id === llmNode.id) ||
          (sourceNode.id === mlBasicsNode.id && targetNode.id === reinforcementLearningNode.id)
        ) {
          relations.push({
            id: `relation_prerequisite_${sourceNode.id}_${targetNode.id}`,
            sourceId: sourceNode.id,
            targetId: targetNode.id,
            type: 'prerequisite',
            strength: 0.8 + Math.random() * 0.2, // 0.8-1.0之间的强度
            description: `${sourceNode.title}是学习${targetNode.title}的先决条件`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        
        // 3. 同年级课程之间的相关性关系
        if (sourceNode.grade === targetNode.grade && Math.random() < 0.3) { // 30%的概率创建相关关系
          relations.push({
            id: `relation_related_${sourceNode.id}_${targetNode.id}`,
            sourceId: sourceNode.id,
            targetId: targetNode.id,
            type: 'related',
            strength: 0.5 + Math.random() * 0.3, // 0.5-0.8之间的强度
            description: `${sourceNode.title}与${targetNode.title}内容相关`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
    }
    
    // 添加关系到图谱
    graph.relations = relations;
    
    return graph;
  }
}

const knowledgeGraphAlgorithm = new KnowledgeGraphAlgorithm();
export default knowledgeGraphAlgorithm; 