using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineLearningSystem.API.Models
{
    public class StudentEvaluation
    {
        [Key]
        public int Id { get; set; }
        
        // 评估基本信息
        [Required]
        public string StudentId { get; set; }
        
        [ForeignKey("StudentId")]
        public virtual ApplicationUser Student { get; set; }
        
        [Required]
        public string AcademicYear { get; set; }
        
        [Required]
        public string Semester { get; set; }
        
        [Required]
        public int CourseId { get; set; }
        
        [ForeignKey("CourseId")]
        public virtual Course Course { get; set; }
        
        [Required]
        public string CourseName { get; set; }
        
        // 评估者信息
        [Required]
        public string EvaluatorId { get; set; }
        
        [ForeignKey("EvaluatorId")]
        public virtual ApplicationUser Evaluator { get; set; }
        
        [Required]
        public DateTime EvaluationDate { get; set; } = DateTime.UtcNow;
        
        // 评估内容
        [Required]
        public int OverallScore { get; set; }
        
        public string Strengths { get; set; }
        
        public string AreasForImprovement { get; set; }
        
        public string OverallComment { get; set; }
        
        // 导航属性
        public virtual ICollection<EvaluationDimension> Dimensions { get; set; } = new List<EvaluationDimension>();
    }
    
    public class EvaluationDimension
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int EvaluationId { get; set; }
        
        [ForeignKey("EvaluationId")]
        public virtual StudentEvaluation Evaluation { get; set; }
        
        [Required]
        public string Dimension { get; set; }
        
        [Required]
        public int Score { get; set; }
        
        public string Comments { get; set; }
    }
} 