using System;
using System.Collections.Generic;

namespace OnlineLearningSystem.API.Models
{
    /// <summary>
    /// 课程章节
    /// </summary>
    public class CourseChapter
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        
        // 章节排序
        public int OrderIndex { get; set; }
        
        // 是否发布
        public bool IsPublished { get; set; } = false;
        
        // 创建时间和更新时间
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // 外键 - 课程
        public int CourseId { get; set; }
        public Course Course { get; set; }
        
        // 导航属性 - 章节内容
        public virtual ICollection<ChapterContent> Contents { get; set; }
    }
    
    /// <summary>
    /// 章节内容
    /// </summary>
    public class ChapterContent
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        
        // 内容类型: video, text, quiz等
        public string ContentType { get; set; }
        
        // 内容数据 (可以是HTML文本、视频URL等)
        public string Content { get; set; }
        
        // 时长 (对视频或音频类型)
        public int? DurationInSeconds { get; set; }
        
        // 排序索引
        public int OrderIndex { get; set; }
        
        // 是否发布
        public bool IsPublished { get; set; } = false;
        
        // 创建和更新时间
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // 外键 - 章节
        public int ChapterId { get; set; }
        public CourseChapter Chapter { get; set; }
    }
} 