using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineLearningSystem.API.Models
{
    /// <summary>
    /// 状态更新历史记录模型类
    /// </summary>
    public class StatusHistory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [Required]
        public int FeedbackId { get; set; }
        
        [ForeignKey("FeedbackId")]
        public Feedback Feedback { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string OldStatus { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string NewStatus { get; set; }
        
        [MaxLength(500)]
        public string Comments { get; set; }
        
        [Required]
        public DateTime ChangedAt { get; set; }
        
        [Required]
        [MaxLength(128)]
        public string ChangedById { get; set; }
        
        [ForeignKey("ChangedById")]
        public ApplicationUser ChangedBy { get; set; }
    }
} 