using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineLearningSystem.API.Models
{
    public class Lesson
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; }
        
        public string Description { get; set; }
        
        [Required]
        public int CourseId { get; set; }
        
        [ForeignKey("CourseId")]
        public virtual Course Course { get; set; }
        
        public int OrderIndex { get; set; }
        
        [Required]
        public string ContentType { get; set; } // video, article, quiz, assignment
        
        public string ContentUrl { get; set; }
        
        public string ContentHtml { get; set; }
        
        public int DurationMinutes { get; set; }
        
        public bool IsPublished { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        public string CreatedBy { get; set; } // User ID
        
        // 导航属性
        public virtual ICollection<LessonResource> Resources { get; set; }
        public virtual ICollection<LessonCompletion> Completions { get; set; }
    }
    
    public class LessonResource
    {
        public int Id { get; set; }
        
        [Required]
        public int LessonId { get; set; }
        
        [ForeignKey("LessonId")]
        public virtual Lesson Lesson { get; set; }
        
        [Required]
        public string Title { get; set; }
        
        public string Description { get; set; }
        
        [Required]
        public string ResourceType { get; set; } // file, link, video
        
        [Required]
        public string ResourceUrl { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
    
    public class LessonCompletion
    {
        public int Id { get; set; }
        
        [Required]
        public int LessonId { get; set; }
        
        [ForeignKey("LessonId")]
        public virtual Lesson Lesson { get; set; }
        
        [Required]
        public string UserId { get; set; }
        
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }
        
        public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
        
        public decimal ProgressPercentage { get; set; } = 100;
        
        public string Notes { get; set; }
    }
} 