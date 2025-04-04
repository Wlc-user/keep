using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineLearningSystem.API.Models
{
    /// <summary>
    /// 课程注册记录，表示学生选修的课程及学习进度
    /// </summary>
    public class CourseEnrollment
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; }
        
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }
        
        [Required]
        public int CourseId { get; set; }
        
        [ForeignKey("CourseId")]
        public virtual Course Course { get; set; }
        
        /// <summary>
        /// 注册时间
        /// </summary>
        [Required]
        public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// 完成百分比
        /// </summary>
        public decimal CompletionPercentage { get; set; } = 0;
        
        /// <summary>
        /// 是否已完成课程
        /// </summary>
        public bool IsCompleted { get; set; } = false;
        
        /// <summary>
        /// 完成时间
        /// </summary>
        public DateTime? CompletionDate { get; set; }
        
        // 学生学习记录统计属性
        public int TotalLessonsViewed { get; set; } = 0;
        public int TotalQuizzesCompleted { get; set; } = 0;
        public int TotalAssignmentsSubmitted { get; set; } = 0;
        public DateTime LastActivityDate { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// 最后访问时间
        /// </summary>
        public DateTime? LastAccessedAt { get; set; }
        
        /// <summary>
        /// 完成课程的评分（1-5星）
        /// </summary>
        public int? Rating { get; set; }
        
        /// <summary>
        /// 学生对课程的评论
        /// </summary>
        public string Review { get; set; }
        
        /// <summary>
        /// 课程证书ID
        /// </summary>
        public string CertificateId { get; set; }
        
        /// <summary>
        /// 证书颁发时间
        /// </summary>
        public DateTime? CertificateIssuedAt { get; set; }
    }
    
    /// <summary>
    /// 学生章节进度，记录学生在特定章节的学习进度
    /// </summary>
    public class StudentChapterProgress
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string StudentId { get; set; }
        
        [ForeignKey("StudentId")]
        public ApplicationUser Student { get; set; }
        
        [Required]
        public int CourseChapterId { get; set; }
        
        [ForeignKey("CourseChapterId")]
        public CourseChapter CourseChapter { get; set; }
        
        /// <summary>
        /// 开始学习时间
        /// </summary>
        public DateTime StartedAt { get; set; }
        
        /// <summary>
        /// 最后访问时间
        /// </summary>
        public DateTime? LastAccessedAt { get; set; }
        
        /// <summary>
        /// 完成百分比
        /// </summary>
        public double CompletionPercentage { get; set; }
        
        /// <summary>
        /// 是否已完成章节
        /// </summary>
        public bool IsCompleted { get; set; }
        
        /// <summary>
        /// 完成时间
        /// </summary>
        public DateTime? CompletedAt { get; set; }
        
        /// <summary>
        /// 学习总时长（分钟）
        /// </summary>
        public int TotalLearningTimeMinutes { get; set; }
    }
} 