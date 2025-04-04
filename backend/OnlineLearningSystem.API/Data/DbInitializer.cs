using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OnlineLearningSystem.API.Data
{
    public static class DbInitializer
    {
        public static async Task Initialize(ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            // 确保数据库已创建
            context.Database.EnsureCreated();

            // 如果已有数据则退出
            if (context.Users.Any())
            {
                return;
            }

            // 创建角色
            var roles = new[] { "admin", "teacher", "student" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }

            // 创建管理员
            var adminUser = new ApplicationUser
            {
                UserName = "admin@example.com",
                Email = "admin@example.com",
                FirstName = "Admin",
                LastName = "User",
                DisplayName = "系统管理员",
                Role = "admin",
                EmailConfirmed = true,
                AvatarUrl = "https://via.placeholder.com/150"
            };

            await CreateUserWithRole(userManager, adminUser, "Admin123!", "admin");

            // 创建教师
            var teacherUser = new ApplicationUser
            {
                UserName = "teacher@example.com",
                Email = "teacher@example.com",
                FirstName = "Teacher",
                LastName = "User",
                DisplayName = "示范教师",
                Role = "teacher",
                EmailConfirmed = true,
                AvatarUrl = "https://via.placeholder.com/150"
            };

            await CreateUserWithRole(userManager, teacherUser, "Teacher123!", "teacher");

            // 创建学生
            var studentUser = new ApplicationUser
            {
                UserName = "student@example.com",
                Email = "student@example.com",
                FirstName = "Student",
                LastName = "User",
                DisplayName = "测试学生",
                Role = "student",
                EmailConfirmed = true,
                AvatarUrl = "https://via.placeholder.com/150"
            };

            await CreateUserWithRole(userManager, studentUser, "Student123!", "student");

            // 添加示例课程
            var courses = new List<Course>
            {
                new Course
                {
                    Title = "C# 编程基础",
                    Description = "学习C#编程的基础知识，包括语法、数据类型、面向对象编程等内容。",
                    Category = "编程",
                    ImageUrl = "https://via.placeholder.com/450x300?text=C%23+Programming",
                    Level = "beginner",
                    Price = 99.99m,
                    IsFree = false,
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-30),
                    PublishedAt = DateTime.UtcNow.AddDays(-28),
                    CreatedBy = teacherUser.UserName
                },
                new Course
                {
                    Title = "ASP.NET Core Web开发",
                    Description = "学习使用ASP.NET Core构建现代Web应用程序，包括MVC模式、API开发、身份验证等。",
                    Category = "Web开发",
                    ImageUrl = "https://via.placeholder.com/450x300?text=ASP.NET+Core",
                    Level = "intermediate",
                    Price = 149.99m,
                    IsFree = false,
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-20),
                    PublishedAt = DateTime.UtcNow.AddDays(-18),
                    CreatedBy = teacherUser.UserName
                },
                new Course
                {
                    Title = "React前端开发",
                    Description = "学习使用React构建现代化的前端应用，包括组件、状态管理、路由等。",
                    Category = "前端开发",
                    ImageUrl = "https://via.placeholder.com/450x300?text=React",
                    Level = "intermediate",
                    Price = 129.99m,
                    IsFree = false,
                    IsPublished = false,
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    CreatedBy = teacherUser.UserName
                },
                new Course
                {
                    Title = "Python数据分析入门",
                    Description = "学习使用Python进行数据分析的基础知识，包括NumPy、Pandas、数据可视化等。",
                    Category = "数据科学",
                    ImageUrl = "https://via.placeholder.com/450x300?text=Python+Data+Analysis",
                    Level = "beginner",
                    Price = 0,
                    IsFree = true,
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-15),
                    PublishedAt = DateTime.UtcNow.AddDays(-14),
                    CreatedBy = teacherUser.UserName
                }
            };

            context.Courses.AddRange(courses);
            await context.SaveChangesAsync();

            // 给教师分配课程
            var teacher = await userManager.FindByNameAsync(teacherUser.UserName);
            foreach (var course in courses)
            {
                var courseTeacher = new CourseTeacher
                {
                    CourseId = course.Id,
                    UserId = teacher.Id,
                    IsPrimary = true,
                    AssignedDate = course.CreatedAt,
                    CanEditCourse = true,
                    CanGradeAssignments = true,
                    CanManageStudents = true
                };

                context.CourseTeachers.Add(courseTeacher);
            }
            await context.SaveChangesAsync();

            // 学生注册课程
            var student = await userManager.FindByNameAsync(studentUser.UserName);
            foreach (var course in courses.Where(c => c.IsPublished))
            {
                var enrollment = new CourseEnrollment
                {
                    CourseId = course.Id,
                    UserId = student.Id,
                    EnrollmentDate = DateTime.UtcNow.AddDays(-10),
                    CompletionPercentage = course.Id % 2 == 0 ? 50 : 25,
                    IsCompleted = false,
                    LastActivityDate = DateTime.UtcNow.AddDays(-2)
                };

                context.CourseEnrollments.Add(enrollment);
            }
            await context.SaveChangesAsync();

            // 添加课程内容
            AddLessonsToFirstCourse(context, courses[0]);
            
            // 添加示例资料
            AddSampleMaterials(context, teacherUser.UserName);
            
            await context.SaveChangesAsync();
        }

        private static async Task CreateUserWithRole(UserManager<ApplicationUser> userManager, ApplicationUser user, string password, string role)
        {
            var result = await userManager.CreateAsync(user, password);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, role);
            }
        }
        
        private static void AddLessonsToFirstCourse(ApplicationDbContext context, Course course)
        {
            var lessons = new List<Lesson>
            {
                new Lesson
                {
                    Title = "C#简介和开发环境搭建",
                    Description = "了解C#语言特点和搭建开发环境",
                    CourseId = course.Id,
                    OrderIndex = 1,
                    ContentType = "video",
                    ContentUrl = "https://example.com/videos/csharp-intro.mp4",
                    ContentHtml = "<p>本课时将介绍C#语言的历史、特点，以及如何搭建开发环境。</p>",
                    DurationMinutes = 30,
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-28),
                    CreatedBy = course.CreatedBy
                },
                new Lesson
                {
                    Title = "C#基础语法",
                    Description = "学习C#的基础语法和数据类型",
                    CourseId = course.Id,
                    OrderIndex = 2,
                    ContentType = "video",
                    ContentUrl = "https://example.com/videos/csharp-syntax.mp4",
                    ContentHtml = "<p>本课时将介绍C#的基础语法、数据类型和变量声明。</p>",
                    DurationMinutes = 45,
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-27),
                    CreatedBy = course.CreatedBy
                },
                new Lesson
                {
                    Title = "C#流程控制",
                    Description = "学习C#的条件语句和循环结构",
                    CourseId = course.Id,
                    OrderIndex = 3,
                    ContentType = "video",
                    ContentUrl = "https://example.com/videos/csharp-control-flow.mp4",
                    ContentHtml = "<p>本课时将介绍C#的条件语句（if-else, switch）和循环结构（for, while, do-while, foreach）。</p>",
                    DurationMinutes = 40,
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-26),
                    CreatedBy = course.CreatedBy
                },
                new Lesson
                {
                    Title = "C#方法和函数",
                    Description = "学习如何在C#中定义和使用方法",
                    CourseId = course.Id,
                    OrderIndex = 4,
                    ContentType = "video",
                    ContentUrl = "https://example.com/videos/csharp-methods.mp4",
                    ContentHtml = "<p>本课时将介绍C#中的方法定义、参数传递、返回值和方法重载。</p>",
                    DurationMinutes = 35,
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-25),
                    CreatedBy = course.CreatedBy
                },
                new Lesson
                {
                    Title = "C#面向对象编程基础",
                    Description = "学习C#的类和对象",
                    CourseId = course.Id,
                    OrderIndex = 5,
                    ContentType = "video",
                    ContentUrl = "https://example.com/videos/csharp-oop-basics.mp4",
                    ContentHtml = "<p>本课时将介绍C#中的类和对象的概念、属性和方法的定义、构造函数等。</p>",
                    DurationMinutes = 50,
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-24),
                    CreatedBy = course.CreatedBy
                },
                new Lesson
                {
                    Title = "C#继承和多态",
                    Description = "学习C#的继承和多态特性",
                    CourseId = course.Id,
                    OrderIndex = 6,
                    ContentType = "video",
                    ContentUrl = "https://example.com/videos/csharp-inheritance.mp4",
                    ContentHtml = "<p>本课时将介绍C#中的继承、方法重写、多态性和抽象类。</p>",
                    DurationMinutes = 55,
                    IsPublished = false,
                    CreatedAt = DateTime.UtcNow.AddDays(-23),
                    CreatedBy = course.CreatedBy
                }
            };

            context.Lessons.AddRange(lessons);
            
            // 为第一课时添加资源
            var resources = new List<LessonResource>
            {
                new LessonResource
                {
                    LessonId = 1, // 第一课时
                    Title = "Visual Studio安装指南",
                    Description = "Visual Studio Community版本的安装步骤",
                    ResourceType = "file",
                    ResourceUrl = "https://example.com/files/vs-installation-guide.pdf",
                    CreatedAt = DateTime.UtcNow.AddDays(-28)
                },
                new LessonResource
                {
                    LessonId = 1, // 第一课时
                    Title = "C#官方文档",
                    Description = "Microsoft C#编程语言官方文档链接",
                    ResourceType = "link",
                    ResourceUrl = "https://docs.microsoft.com/en-us/dotnet/csharp/",
                    CreatedAt = DateTime.UtcNow.AddDays(-28)
                }
            };

            context.LessonResources.AddRange(resources);
        }
        
        private static void AddSampleMaterials(ApplicationDbContext context, string createdBy)
        {
            var materials = new List<Material>
            {
                new Material
                {
                    Title = "C#编程最佳实践",
                    Description = "C#编程的常见最佳实践和代码规范",
                    Category = "编程语言",
                    FilePath = "https://example.com/materials/csharp-best-practices.pdf",
                    FileType = "pdf",
                    FileSize = 2048, // 2MB
                    AccessLevel = MaterialAccessLevels.Public,
                    Status = MaterialStatus.Approved,
                    CreatedAt = DateTime.UtcNow.AddDays(-20),
                    CreatedBy = createdBy
                },
                new Material
                {
                    Title = "ASP.NET Core MVC入门指南",
                    Description = "ASP.NET Core MVC框架的基础入门教程",
                    Category = "Web开发",
                    FilePath = "https://example.com/materials/aspnet-core-mvc-intro.pdf",
                    FileType = "pdf",
                    FileSize = 1536, // 1.5MB
                    AccessLevel = MaterialAccessLevels.Course,
                    Status = MaterialStatus.Approved,
                    CreatedAt = DateTime.UtcNow.AddDays(-15),
                    CreatedBy = createdBy
                },
                new Material
                {
                    Title = "React组件设计模式",
                    Description = "React组件设计的常见模式和最佳实践",
                    Category = "前端开发",
                    FilePath = "https://example.com/materials/react-component-patterns.pptx",
                    FileType = "pptx",
                    FileSize = 3072, // 3MB
                    AccessLevel = MaterialAccessLevels.Teacher,
                    Status = MaterialStatus.Pending,
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    CreatedBy = createdBy
                },
                new Material
                {
                    Title = "Python数据分析实例",
                    Description = "使用Python进行数据分析的实例代码和讲解",
                    Category = "数据科学",
                    FilePath = "https://example.com/materials/python-data-analysis-examples.zip",
                    FileType = "zip",
                    FileSize = 5120, // 5MB
                    AccessLevel = MaterialAccessLevels.Public,
                    Status = MaterialStatus.Approved,
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    CreatedBy = createdBy
                }
            };

            context.Materials.AddRange(materials);
        }
    }
} 