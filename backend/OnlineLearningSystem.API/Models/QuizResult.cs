using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineLearningSystem.API.Models
{
    /// <summary>
    /// 测验结果，记录学生完成测验的得分情况
    /// </summary>
    public class QuizResult
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string StudentId { get; set; }
        
        [ForeignKey("StudentId")]
        public ApplicationUser Student { get; set; }
        
        [Required]
        public int QuizId { get; set; }
        
        [ForeignKey("QuizId")]
        public Quiz Quiz { get; set; }
        
        /// <summary>
        /// 测验得分
        /// </summary>
        [Required]
        public int Score { get; set; }
        
        /// <summary>
        /// 测验满分
        /// </summary>
        [Required]
        public int MaxScore { get; set; }
        
        /// <summary>
        /// 完成测验的时间
        /// </summary>
        [Required]
        public DateTime CompletedAt { get; set; }
        
        /// <summary>
        /// 测验耗时（秒）
        /// </summary>
        public int DurationSeconds { get; set; }
        
        /// <summary>
        /// 作答错误的问题数量
        /// </summary>
        public int WrongAnswers { get; set; }
        
        /// <summary>
        /// 作答正确的问题数量
        /// </summary>
        public int CorrectAnswers { get; set; }
        
        /// <summary>
        /// 未作答的问题数量
        /// </summary>
        public int UnansweredQuestions { get; set; }
    }
    
    /// <summary>
    /// 测验模型，包含测验的基本信息
    /// </summary>
    public class Quiz
    {
        [Key]
        public int Id { get; set; }
        
        [Required, MaxLength(200)]
        public string Title { get; set; }
        
        public string Description { get; set; }
        
        /// <summary>
        /// 测验类别/标签
        /// </summary>
        [MaxLength(100)]
        public string Category { get; set; }
        
        /// <summary>
        /// 关联的课程ID
        /// </summary>
        public int? CourseId { get; set; }
        
        [ForeignKey("CourseId")]
        public Course Course { get; set; }
        
        /// <summary>
        /// 关联的章节ID
        /// </summary>
        public int? CourseChapterId { get; set; }
        
        [ForeignKey("CourseChapterId")]
        public CourseChapter CourseChapter { get; set; }
        
        /// <summary>
        /// 测验时长限制（分钟）
        /// </summary>
        public int? TimeLimit { get; set; }
        
        /// <summary>
        /// 测验通过的最低分数
        /// </summary>
        public int PassingScore { get; set; }
        
        /// <summary>
        /// 测验创建时间
        /// </summary>
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// 最后更新时间
        /// </summary>
        public DateTime? UpdatedAt { get; set; }
        
        /// <summary>
        /// 测验创建者
        /// </summary>
        public string CreatedById { get; set; }
        
        [ForeignKey("CreatedById")]
        public ApplicationUser CreatedBy { get; set; }
        
        /// <summary>
        /// 测验难度级别（1-5）
        /// </summary>
        public int DifficultyLevel { get; set; } = 1;
        
        /// <summary>
        /// 是否随机排序问题
        /// </summary>
        public bool RandomizeQuestions { get; set; }
        
        /// <summary>
        /// 是否立即显示结果
        /// </summary>
        public bool ShowResultImmediately { get; set; } = true;
    }
} 