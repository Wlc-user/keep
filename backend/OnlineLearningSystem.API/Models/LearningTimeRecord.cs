using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineLearningSystem.API.Models
{
    /// <summary>
    /// 学习时长记录，跟踪学生在课程上的学习时间
    /// </summary>
    public class LearningTimeRecord
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string StudentId { get; set; }
        
        [ForeignKey("StudentId")]
        public ApplicationUser Student { get; set; }
        
        [Required]
        public int CourseId { get; set; }
        
        [ForeignKey("CourseId")]
        public Course Course { get; set; }
        
        public int? CourseChapterId { get; set; }
        
        [ForeignKey("CourseChapterId")]
        public CourseChapter CourseChapter { get; set; }
        
        /// <summary>
        /// 学习时长（分钟）
        /// </summary>
        [Required]
        public int DurationMinutes { get; set; }
        
        /// <summary>
        /// 记录创建时间
        /// </summary>
        [Required]
        public DateTime RecordedAt { get; set; }
        
        /// <summary>
        /// 会话标识，用于识别同一学习会话
        /// </summary>
        public string SessionId { get; set; }
        
        /// <summary>
        /// 设备信息
        /// </summary>
        public string DeviceInfo { get; set; }
        
        /// <summary>
        /// IP地址
        /// </summary>
        public string IpAddress { get; set; }
    }
} 