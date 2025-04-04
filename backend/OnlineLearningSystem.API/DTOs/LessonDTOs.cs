using System;
using System.Collections.Generic;

namespace OnlineLearningSystem.API.DTOs
{
    public class LessonDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int CourseId { get; set; }
        public int OrderIndex { get; set; }
        public string ContentType { get; set; }
        public int DurationMinutes { get; set; }
        public bool IsPublished { get; set; }
    }

    public class LessonDetailDTO : LessonDTO
    {
        public string CourseName { get; set; }
        public string ContentUrl { get; set; }
        public string ContentHtml { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string CreatedBy { get; set; }
        public List<LessonResourceDTO> Resources { get; set; }
        
        // 学生相关字段
        public bool IsCompleted { get; set; }
        public DateTime? CompletionDate { get; set; }
        public decimal ProgressPercentage { get; set; }
    }

    public class LessonResourceDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ResourceType { get; set; }
        public string ResourceUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateLessonDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int CourseId { get; set; }
        public string ContentType { get; set; }
        public string ContentUrl { get; set; }
        public string ContentHtml { get; set; }
        public int DurationMinutes { get; set; }
        public bool IsPublished { get; set; }
    }

    public class UpdateLessonDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string ContentType { get; set; }
        public string ContentUrl { get; set; }
        public string ContentHtml { get; set; }
        public int DurationMinutes { get; set; }
        public bool IsPublished { get; set; }
    }

    public class UpdateLessonOrderDTO
    {
        public int NewOrderIndex { get; set; }
    }

    public class CompleteLessonDTO
    {
        public decimal ProgressPercentage { get; set; } = 100;
        public string Notes { get; set; }
    }

    public class CreateLessonResourceDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string ResourceType { get; set; }
        public string ResourceUrl { get; set; }
    }
} 