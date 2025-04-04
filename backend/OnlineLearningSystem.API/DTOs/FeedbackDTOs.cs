using System;
using System.Collections.Generic;

namespace OnlineLearningSystem.API.DTOs
{
    // 基础反馈DTO，用于列表展示
    public class FeedbackDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string FeedbackType { get; set; }
        public string Status { get; set; }
        public string Priority { get; set; }
        public int? CourseId { get; set; }
        public string CourseName { get; set; }
        public int? MaterialId { get; set; }
        public string MaterialTitle { get; set; }
        public string StudentId { get; set; }
        public string StudentName { get; set; }
        public string AssignedToId { get; set; }
        public string AssignedToName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }

    // 详细反馈DTO，包含回复和附件
    public class FeedbackDetailDTO : FeedbackDTO
    {
        public List<FeedbackReplyDTO> Replies { get; set; } = new List<FeedbackReplyDTO>();
        public List<AttachmentDTO> Attachments { get; set; } = new List<AttachmentDTO>();
        public List<LearningRecommendationDTO> Recommendations { get; set; } = new List<LearningRecommendationDTO>();
    }

    // 创建反馈DTO
    public class CreateFeedbackDTO
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public string FeedbackType { get; set; }
        public string Priority { get; set; }
        public int? CourseId { get; set; }
        public int? MaterialId { get; set; }
    }

    // 反馈回复DTO
    public class FeedbackReplyDTO
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public bool IsFromTeacher { get; set; }
        public bool IsSystemMessage { get; set; }
        public bool IsInternal { get; set; }
        public List<AttachmentDTO> Attachments { get; set; } = new List<AttachmentDTO>();
    }

    // 添加回复DTO
    public class AddReplyDTO
    {
        public string Content { get; set; }
        public bool IsInternal { get; set; }
        public string NewStatus { get; set; }
    }

    // 更新状态DTO
    public class UpdateStatusDTO
    {
        public string Status { get; set; }
    }

    // 分配反馈DTO
    public class AssignFeedbackDTO
    {
        public string AssignedToId { get; set; }
    }

    // 附件DTO
    public class AttachmentDTO
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public long FileSize { get; set; }
        public string ContentType { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    // 学习推荐DTO
    public class LearningRecommendationDTO
    {
        public int Id { get; set; }
        public string ResourceType { get; set; }
        public string ResourceId { get; set; }
        public string ResourceTitle { get; set; }
        public string Reason { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsSystemGenerated { get; set; }
    }

    // 分页结果
    public class PaginatedResult<T>
    {
        public List<T> Items { get; set; }
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    }

    // 反馈统计DTO
    public class FeedbackStatsDTO
    {
        public int TotalCount { get; set; }
        public Dictionary<string, int> ByStatus { get; set; }
        public Dictionary<string, int> ByType { get; set; }
        public double? AverageResolutionTimeHours { get; set; }
        public List<DailyStatDTO> DailyStats { get; set; }
    }

    // 每日统计数据点
    public class DailyStatDTO
    {
        public DateTime Date { get; set; }
        public int Count { get; set; }
    }

    // 趋势数据点
    public class TrendDataPoint
    {
        public DateTime Date { get; set; }
        public int Count { get; set; }
    }

    // 趋势结果DTO
    public class TrendResultDTO
    {
        public string Label { get; set; }
        public List<TrendDataPoint> Data { get; set; }
    }
} 