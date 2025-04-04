using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;

namespace OnlineLearningSystem.API.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Role { get; set; } // admin, teacher, student
        public string DisplayName { get; set; }
        public string AvatarUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLogin { get; set; }
        
        // 导航属性
        public virtual ICollection<Notification> Notifications { get; set; }
        public virtual ICollection<CourseEnrollment> CourseEnrollments { get; set; }
        public virtual ICollection<CourseTeacher> TeachingCourses { get; set; }
        
        // 刷新令牌相关属性
        // 注释掉这些属性，因为数据库中没有对应的列
        // 这些字段应该存储在单独的表中，或者等待迁移添加
        //public string RefreshToken { get; set; }
        //public DateTime RefreshTokenExpiryTime { get; set; }
    }
} 