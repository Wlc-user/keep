using System;
using System.Collections.Generic;

namespace OnlineLearningSystem.API.DTOs
{
    public class MaterialDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; }
        public long FileSize { get; set; }
        public string ThumbnailUrl { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? CourseId { get; set; }
        public string CourseName { get; set; }
        public string AccessLevel { get; set; }
        public string Status { get; set; }
        public string ReviewedBy { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string ReviewComments { get; set; }
        public int ViewCount { get; set; }
        public int DownloadCount { get; set; }
        public int LikeCount { get; set; }
    }

    public class CreateMaterialDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; }
        public long FileSize { get; set; }
        public string ThumbnailUrl { get; set; }
        public int? CourseId { get; set; }
        public string AccessLevel { get; set; }
    }

    public class UpdateMaterialDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string ThumbnailUrl { get; set; }
        public int? CourseId { get; set; }
        public string AccessLevel { get; set; }
    }

    public class ReviewCommentDTO
    {
        public string Comment { get; set; }
    }
    
    public class PagedResponseDTO<T>
    {
        public List<T> Items { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
    }
} 