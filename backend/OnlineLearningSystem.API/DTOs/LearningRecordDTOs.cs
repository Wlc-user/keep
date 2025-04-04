using System;

namespace OnlineLearningSystem.API.DTOs
{
    public class LearningRecordDTO
    {
        public int Id { get; set; }
        public string StudentId { get; set; }
        public string StudentName { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; }
        public int? ChapterId { get; set; }
        public string ChapterTitle { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int DurationSeconds { get; set; }
        public string SessionId { get; set; }
        public string DeviceInfo { get; set; }
        public string IpAddress { get; set; }
    }
} 