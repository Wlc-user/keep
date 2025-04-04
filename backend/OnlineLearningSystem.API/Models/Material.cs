using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineLearningSystem.API.Models
{
    public class Material
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string Title { get; set; }
        
        [MaxLength(1000)]
        public string Description { get; set; }
        
        [MaxLength(100)]
        public string Category { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string FilePath { get; set; }
        
        [MaxLength(50)]
        public string FileType { get; set; }
        
        public long FileSize { get; set; }
        
        [MaxLength(500)]
        public string ThumbnailUrl { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public DateTime UpdatedAt { get; set; }
        
        [MaxLength(128)]
        public string CreatedBy { get; set; }
        
        [ForeignKey("CreatedBy")]
        public ApplicationUser Creator { get; set; }
        
        // 访问权限控制字段
        [Required]
        [MaxLength(50)]
        public string AccessLevel { get; set; } = "Private"; // 默认为私有
        
        // 可选关联的课程ID（如果素材属于某个课程）
        public int? CourseId { get; set; }
        
        [ForeignKey("CourseId")]
        public Course Course { get; set; }
        
        // 素材审核状态
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // 待审核、已通过、已拒绝、已下架
        
        // 审核相关字段
        [MaxLength(128)]
        public string ReviewedBy { get; set; }
        
        public DateTime? ReviewedAt { get; set; }
        
        [MaxLength(500)]
        public string ReviewComments { get; set; }
        
        // 统计字段
        public int ViewCount { get; set; } = 0;
        public int DownloadCount { get; set; } = 0;
        public int LikeCount { get; set; } = 0;
    }
    
    // 访问级别常量（方便代码中使用）
    public static class MaterialAccessLevels
    {
        public const string Public = "Public";       // 所有人可见
        public const string Course = "Course";       // 仅课程学生可见
        public const string Teacher = "Teacher";     // 仅教师可见
        public const string Private = "Private";     // 仅创建者可见
    }
    
    // 素材状态常量
    public static class MaterialStatus
    {
        public const string Pending = "Pending";       // 待审核
        public const string Approved = "Approved";     // 已通过
        public const string Rejected = "Rejected";     // 已拒绝
        public const string Unpublished = "Unpublished"; // 已下架
    }
    
    public class MaterialCategory
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        
        // 支持层级分类
        public int? ParentCategoryId { get; set; }
        public MaterialCategory ParentCategory { get; set; }
    }
} 