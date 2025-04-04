using System;

namespace OnlineLearningSystem.API.DTOs
{
    public class EnrollmentDTO
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; }
        public string CourseImage { get; set; }
        public double CompletionPercentage { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime EnrolledAt { get; set; }
        public DateTime? LastAccessedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? Rating { get; set; }
        public string CertificateId { get; set; }
        public string Review { get; set; }
    }
} 