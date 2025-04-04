using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineLearningSystem.API.Models
{
    /// <summary>
    /// 课程教师关联表
    /// </summary>
    public class CourseTeacher
    {
        /// <summary>
        /// 主键ID
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// 用户ID
        /// </summary>
        public string UserId { get; set; }
        
        /// <summary>
        /// 教师ID (UserId的别名，用于兼容性)
        /// </summary>
        [NotMapped]
        public string TeacherId 
        { 
            get { return UserId; }
            set { UserId = value; }
        }
        
        /// <summary>
        /// 课程ID
        /// </summary>
        public int CourseId { get; set; }
        
        /// <summary>
        /// 是否主要教师
        /// </summary>
        public bool IsPrimary { get; set; } = false;
        
        /// <summary>
        /// 分配时间
        /// </summary>
        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// 教师课程的基本权限
        /// </summary>
        public bool CanEditCourse { get; set; } = true;
        public bool CanGradeAssignments { get; set; } = true;
        public bool CanManageStudents { get; set; } = true;
        
        /// <summary>
        /// 导航属性：用户
        /// </summary>
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }
        
        /// <summary>
        /// 导航属性：课程
        /// </summary>
        [ForeignKey("CourseId")]
        public virtual Course Course { get; set; }
        
        /// <summary>
        /// 教师课程集合属性 (用于兼容性)
        /// </summary>
        [NotMapped]
        public virtual System.Collections.Generic.ICollection<Course> TeachingCourses
        {
            get
            {
                if (Course != null)
                {
                    return new System.Collections.Generic.List<Course> { Course };
                }
                return new System.Collections.Generic.List<Course>();
            }
        }
    }
    
    /// <summary>
    /// 教师角色常量
    /// </summary>
    public static class TeacherRoleConstants
    {
        /// <summary>
        /// 主讲教师
        /// </summary>
        public const string MainTeacher = "主讲";
        
        /// <summary>
        /// 助教
        /// </summary>
        public const string Assistant = "助教";
        
        /// <summary>
        /// 课程管理员
        /// </summary>
        public const string CourseAdmin = "课程管理员";
    }
} 