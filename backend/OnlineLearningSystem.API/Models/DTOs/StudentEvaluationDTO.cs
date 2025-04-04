using System;
using System.Collections.Generic;

namespace OnlineLearningSystem.API.DTOs
{
    public class StudentEvaluationDto
    {
        public string StudentId { get; set; }
        public string AcademicYear { get; set; }
        public string Semester { get; set; }
        public int CourseId { get; set; }  // 使用int类型以与模型匹配
        public string CourseName { get; set; }
        public int OverallScore { get; set; }
        public List<EvaluationDimensionDto> Evaluations { get; set; }
        public string Strengths { get; set; }
        public string AreasForImprovement { get; set; }
        public string OverallComment { get; set; }
    }

    public class EvaluationDimensionDto
    {
        public string Dimension { get; set; }
        public int Score { get; set; }
        public string Comments { get; set; }
    }
} 