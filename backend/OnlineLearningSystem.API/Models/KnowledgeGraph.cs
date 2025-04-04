using System;
using System.Collections.Generic;

namespace OnlineLearningSystem.API.Models
{
    /// <summary>
    /// 知识图谱
    /// </summary>
    public class KnowledgeGraph
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        
        // 知识图谱类型，如"课程图谱"、"学科图谱"等
        public string Type { get; set; }
        
        // 是否公开
        public bool IsPublic { get; set; } = false;
        
        // 创建时间和更新时间
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // 创建者
        public string CreatorId { get; set; }
        public ApplicationUser Creator { get; set; }
        
        // 可能关联的课程
        public int? CourseId { get; set; }
        public Course Course { get; set; }
        
        // 导航属性
        public virtual ICollection<KnowledgeNode> Nodes { get; set; }
    }
    
    /// <summary>
    /// 知识节点
    /// </summary>
    public class KnowledgeNode
    {
        public int Id { get; set; }
        public string Label { get; set; }
        public string Description { get; set; }
        
        // 知识点类型，如"概念"、"原理"、"事实"、"程序"等
        public string Type { get; set; }
        
        // 知识点难度级别 (1-5)
        public int DifficultyLevel { get; set; } = 1;
        
        // 可视化属性
        public string Group { get; set; } // 节点分组
        public string Color { get; set; } // 节点颜色
        public string Icon { get; set; } // 节点图标
        
        // 知识图谱关联
        public int GraphId { get; set; }
        public KnowledgeGraph Graph { get; set; }
        
        // 扩展属性 (Json格式存储)
        public string Properties { get; set; }
        
        // 创建和更新时间
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // 导航属性 - 关系
        public virtual ICollection<KnowledgeRelation> OutgoingRelations { get; set; }
        public virtual ICollection<KnowledgeRelation> IncomingRelations { get; set; }
    }
    
    /// <summary>
    /// 知识点关系
    /// </summary>
    public class KnowledgeRelation
    {
        public int Id { get; set; }
        
        // 关系类型，如"先决条件"、"包含"、"关联"等
        public string Type { get; set; }
        
        // 关系标签
        public string Label { get; set; }
        
        // 关系权重 (可用于可视化，值越大关系越重要)
        public double Weight { get; set; } = 1.0;
        
        // 关系方向（从源节点到目标节点）
        public int SourceNodeId { get; set; }
        public KnowledgeNode SourceNode { get; set; }
        
        public int TargetNodeId { get; set; }
        public KnowledgeNode TargetNode { get; set; }
        
        // 扩展属性 (Json格式存储)
        public string Properties { get; set; }
        
        // 创建和更新时间
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
    
    /// <summary>
    /// 用户知识状态 - 记录学生对知识点的掌握程度
    /// </summary>
    public class UserKnowledgeState
    {
        public int Id { get; set; }
        
        // 用户ID
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }
        
        // 知识点ID
        public int KnowledgeNodeId { get; set; }
        public KnowledgeNode KnowledgeNode { get; set; }
        
        // 掌握度 (0-100)
        public int MasteryLevel { get; set; } = 0;
        
        // 学习记录
        public int ViewCount { get; set; } = 0;
        public int CorrectAnswers { get; set; } = 0;
        public int TotalAnswers { get; set; } = 0;
        public int InteractionCount { get; set; } = 0;
        
        // 最后学习时间
        public DateTime LastInteractionAt { get; set; } = DateTime.UtcNow;
        
        // 更新时间
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
} 