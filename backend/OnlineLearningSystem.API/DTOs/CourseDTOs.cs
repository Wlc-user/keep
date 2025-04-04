using System;
using System.Collections.Generic;

namespace OnlineLearningSystem.API.DTOs
{
    public class CourseDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string ImageUrl { get; set; }
        public string Level { get; set; }
        public decimal Price { get; set; }
        public bool IsFree { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public string CreatedBy { get; set; }
        public int LessonCount { get; set; }
        public int EnrollmentCount { get; set; }
    }

    public class CourseDetailDTO : CourseDTO
    {
        public List<TeacherDTO> Teachers { get; set; }
        public List<LessonDTO> Lessons { get; set; }
    }

    public class TeacherDTO
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string AvatarUrl { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class CreateCourseDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string ImageUrl { get; set; }
        public string Level { get; set; }
        public decimal Price { get; set; }
        public bool IsFree { get; set; }
        public bool IsPublished { get; set; }
    }

    public class UpdateCourseDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string ImageUrl { get; set; }
        public string Level { get; set; }
        public decimal Price { get; set; }
        public bool IsFree { get; set; }
        public bool IsPublished { get; set; }
    }

    public class EnrolledCourseDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string ImageUrl { get; set; }
        public string Level { get; set; }
        public decimal CompletionPercentage { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime EnrollmentDate { get; set; }
        public DateTime LastActivityDate { get; set; }
    }

    public class TeachingCourseDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string ImageUrl { get; set; }
        public string Level { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public int EnrollmentCount { get; set; }
        public bool IsPrimary { get; set; }
        public bool CanEditCourse { get; set; }
        public bool CanGradeAssignments { get; set; }
        public bool CanManageStudents { get; set; }
    }
} 