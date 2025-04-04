using System;
using System.Collections.Generic;

namespace OnlineLearningSystem.API.Models
{
    public class Assignment
    {
        public Assignment()
        {
            // 初始化集合属性
            Submissions = new List<AssignmentSubmission>();
        }

        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime DueDate { get; set; }
        public int MaxPoints { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // 外键
        public int CourseId { get; set; }
        public Course Course { get; set; }
        
        // 导航属性
        public virtual ICollection<AssignmentSubmission> Submissions { get; set; }
    }
    
    public class AssignmentSubmission
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public string FileUrl { get; set; }
        public DateTime SubmissionDate { get; set; } = DateTime.UtcNow;
        public int? Score { get; set; }
        public string Feedback { get; set; }
        public bool IsGraded { get; set; } = false;
        
        // 外键
        public int AssignmentId { get; set; }
        public Assignment Assignment { get; set; }
        
        public string StudentId { get; set; }
        public ApplicationUser Student { get; set; }
    }
} 