using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace OnlineLearningSystem.API.Models
{
    public class Course
    {
        public Course()
        {
            // 初始化集合属性
            Enrollments = new List<CourseEnrollment>();
            Teachers = new List<CourseTeacher>();
            Lessons = new List<Lesson>();
        }

        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string ImageUrl { get; set; }
        public string Level { get; set; } // beginner, intermediate, advanced
        public decimal Price { get; set; }
        public bool IsFree { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PublishedAt { get; set; }
        public string CreatedBy { get; set; } // User ID
        
        // 导航属性
        public virtual ICollection<CourseEnrollment> Enrollments { get; set; }
        public virtual ICollection<CourseTeacher> Teachers { get; set; }
        public virtual ICollection<Lesson> Lessons { get; set; }
        
        /// <summary>
        /// 获取已注册本课程的学生列表
        /// </summary>
        [NotMapped]
        public virtual ICollection<ApplicationUser> Students
        {
            get
            {
                if (Enrollments == null)
                {
                    return new List<ApplicationUser>();
                }
                return Enrollments
                    .Where(e => e.User != null)
                    .Select(e => e.User)
                    .ToList();
            }
        }
    }
} 