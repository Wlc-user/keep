using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineLearningSystem.API.Models
{
    /// <summary>
    /// 学生反馈模型类
    /// </summary>
    public class Feedback
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }
        
        [Required]
        [MaxLength(2000)]
        public string Content { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string FeedbackType { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Status { get; set; }
        
        public DateTime? ResolvedAt { get; set; }
        
        [MaxLength(50)]
        public string Priority { get; set; } = "Normal";
        
        public int? CourseId { get; set; }
        
        [ForeignKey("CourseId")]
        public Course Course { get; set; }
        
        public int? MaterialId { get; set; }
        
        [ForeignKey("MaterialId")]
        public Material Material { get; set; }
        
        [Required]
        [MaxLength(128)]
        public string StudentId { get; set; }
        
        [ForeignKey("StudentId")]
        public ApplicationUser Student { get; set; }
        
        [MaxLength(128)]
        public string AssignedToId { get; set; }
        
        [ForeignKey("AssignedToId")]
        public ApplicationUser AssignedTo { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; }
        
        [Required]
        public DateTime UpdatedAt { get; set; }
        
        // 存储状态更新历史
        [NotMapped]
        public List<StatusHistory> StatusHistory { get; set; } = new List<StatusHistory>();
        
        // 存储与反馈关联的附件
        [NotMapped]
        public List<FeedbackAttachment> Attachments { get; set; } = new List<FeedbackAttachment>();
        
        // 导航属性
        public ICollection<FeedbackReply> Replies { get; set; } = new List<FeedbackReply>();
        
        // 导航属性
        public ICollection<LearningRecommendation> Recommendations { get; set; } = new List<LearningRecommendation>();
        
        // 状态历史
        public ICollection<StatusHistory> StatusHistories { get; set; } = new List<StatusHistory>();
    }
    
    /// <summary>
    /// 反馈回复模型类
    /// </summary>
    public class FeedbackReply
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(2000)]
        public string Content { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; }
        
        [Required]
        public bool IsFromTeacher { get; set; }
        
        // 用户名（冗余存储，方便显示）
        [MaxLength(100)]
        public string UserName { get; set; }
        
        // 是否为系统消息
        public bool IsSystemMessage { get; set; }
        
        // 是否为内部备注（仅管理员/教师可见）
        public bool IsInternal { get; set; }
        
        [Required]
        [MaxLength(128)]
        public string UserId { get; set; }
        
        [ForeignKey("UserId")]
        public ApplicationUser User { get; set; }
        
        [Required]
        public int FeedbackId { get; set; }
        
        [ForeignKey("FeedbackId")]
        public Feedback Feedback { get; set; }
        
        // 导航属性
        public ICollection<FeedbackAttachment> Attachments { get; set; } = new List<FeedbackAttachment>();
    }
    
    /// <summary>
    /// 反馈附件模型类
    /// </summary>
    public class FeedbackAttachment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string FileName { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string FilePath { get; set; }
        
        [MaxLength(100)]
        public string FileType { get; set; }
        
        [MaxLength(100)]
        public string ContentType { get; set; }
        
        [MaxLength(500)]
        public string StoredFileName { get; set; }
        
        public string UploadedById { get; set; }
        
        public long FileSize { get; set; }
        
        [Required]
        public DateTime UploadedAt { get; set; }
        
        // 可以关联到回复或直接关联到反馈
        public int? ReplyId { get; set; }
        
        [ForeignKey("ReplyId")]
        public FeedbackReply Reply { get; set; }
        
        // 如果附件直接关联到反馈而非回复
        public int? FeedbackId { get; set; }
        
        [ForeignKey("FeedbackId")]
        public Feedback Feedback { get; set; }
    }
    
    /// <summary>
    /// 学习推荐模型类
    /// </summary>
    public class LearningRecommendation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }
        
        [Required]
        [MaxLength(2000)]
        public string Content { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string RecommendationType { get; set; }
        
        [Required]
        public bool IsFromAI { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; }
        
        // 推荐关联的课程（可选）
        public int? CourseId { get; set; }
        
        [ForeignKey("CourseId")]
        public Course Course { get; set; }
        
        // 推荐关联的学习资料（可选）
        public int? MaterialId { get; set; }
        
        [ForeignKey("MaterialId")]
        public Material Material { get; set; }
        
        // 推荐关联的知识点（可选）
        public int? KnowledgeNodeId { get; set; }
        
        [ForeignKey("KnowledgeNodeId")]
        public KnowledgeNode KnowledgeNode { get; set; }
        
        // 关联的反馈（可选）
        public int? FeedbackId { get; set; }
        
        [ForeignKey("FeedbackId")]
        public Feedback Feedback { get; set; }
        
        // 推荐给哪个学生
        [Required]
        [MaxLength(128)]
        public string StudentId { get; set; }
        
        [ForeignKey("StudentId")]
        public ApplicationUser Student { get; set; }
        
        // 由哪个教师创建，如果是AI生成则可为空
        public string TeacherId { get; set; }
        
        [ForeignKey("TeacherId")]
        public ApplicationUser Teacher { get; set; }
        
        // 学生已阅读
        public bool IsRead { get; set; } = false;
        public bool IsUseful { get; set; } = false;
        public DateTime? ReadAt { get; set; }
        public DateTime? FeedbackAt { get; set; }
        [MaxLength(500)]
        public string StudentFeedback { get; set; }
    }
    
    /// <summary>
    /// 反馈状态常量
    /// </summary>
    public static class FeedbackStatus
    {
        public const string Pending = "Pending";         // 待处理
        public const string InProgress = "InProgress";   // 处理中
        public const string Resolved = "Resolved";       // 已解决
        public const string Closed = "Closed";           // 已关闭
    }
    
    /// <summary>
    /// 反馈类型常量
    /// </summary>
    public static class FeedbackType
    {
        public const string LearningQuestion = "LearningQuestion";   // 学习问题
        public const string TechnicalIssue = "TechnicalIssue";       // 技术问题
        public const string ContentError = "ContentError";           // 内容错误
        public const string Suggestion = "Suggestion";               // 建议
        public const string Other = "Other";                         // 其他
    }
    
    /// <summary>
    /// 推荐类型常量
    /// </summary>
    public static class RecommendationType
    {
        public const string LearningMaterial = "LearningMaterial";   // 学习资料
        public const string Exercise = "Exercise";                   // 练习题
        public const string Course = "Course";                       // 课程
        public const string KnowledgePoint = "KnowledgePoint";       // 知识点
        public const string Video = "Video";                         // 视频
        public const string Article = "Article";                     // 文章
    }
} 