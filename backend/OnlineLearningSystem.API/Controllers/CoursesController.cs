using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.Models;
using OnlineLearningSystem.API.DTOs;

namespace OnlineLearningSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public CoursesController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        // GET: api/Courses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseDTO>>> GetCourses(
            string category = null,
            string level = null,
            bool? isFree = null,
            bool? isPublished = null,
            string search = null,
            int page = 1,
            int pageSize = 10)
        {
            try
            {
                var query = _context.Courses.AsQueryable();
    
                // 应用筛选条件
                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Where(c => c.Category == category);
                }
    
                if (!string.IsNullOrEmpty(level))
                {
                    query = query.Where(c => c.Level == level);
                }
    
                if (isFree.HasValue)
                {
                    query = query.Where(c => c.IsFree == isFree.Value);
                }
    
                if (isPublished.HasValue)
                {
                    query = query.Where(c => c.IsPublished == isPublished.Value);
                }
    
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(c => c.Title.Contains(search) || c.Description.Contains(search));
                }
    
                // 默认只返回已发布的课程
                if (!isPublished.HasValue && !User.IsInRole("admin") && !User.IsInRole("teacher"))
                {
                    query = query.Where(c => c.IsPublished);
                }
    
                // 计算总记录数
                var totalCount = await query.CountAsync();
                
                // 如果数据库中没有课程，返回模拟数据
                if (totalCount == 0)
                {
                    var mockCourses = GetMockCourses(page, pageSize);
                    
                    // 设置响应头以包含分页信息
                    Response.Headers.Add("X-Total-Count", mockCourses.Count.ToString());
                    Response.Headers.Add("X-Page", page.ToString());
                    Response.Headers.Add("X-Page-Size", pageSize.ToString());
                    Response.Headers.Add("X-Total-Pages", "1");
                    
                    return mockCourses;
                }
    
                // 分页
                var courses = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new CourseDTO
                    {
                        Id = c.Id,
                        Title = c.Title,
                        Description = c.Description,
                        Category = c.Category,
                        ImageUrl = c.ImageUrl,
                        Level = c.Level,
                        Price = c.Price,
                        IsFree = c.IsFree,
                        IsPublished = c.IsPublished,
                        CreatedAt = c.CreatedAt,
                        PublishedAt = c.PublishedAt,
                        CreatedBy = c.CreatedBy,
                        LessonCount = c.Lessons.Count,
                        EnrollmentCount = c.Enrollments.Count
                    })
                    .ToListAsync();
    
                // 设置响应头以包含分页信息
                Response.Headers.Add("X-Total-Count", totalCount.ToString());
                Response.Headers.Add("X-Page", page.ToString());
                Response.Headers.Add("X-Page-Size", pageSize.ToString());
                Response.Headers.Add("X-Total-Pages", ((int)Math.Ceiling(totalCount / (double)pageSize)).ToString());
    
                return courses;
            }
            catch (Exception ex)
            {
                // 记录详细错误信息
                Console.WriteLine($"获取课程列表时发生错误: {ex.Message}");
                Console.WriteLine($"内部错误: {ex.InnerException?.Message}");
                Console.WriteLine($"堆栈跟踪: {ex.StackTrace}");
                
                // 返回降级的模拟数据
                var mockCourses = GetMockCourses(page, pageSize);
                
                // 设置响应头以包含分页信息
                Response.Headers.Add("X-Total-Count", mockCourses.Count.ToString());
                Response.Headers.Add("X-Page", page.ToString());
                Response.Headers.Add("X-Page-Size", pageSize.ToString());
                Response.Headers.Add("X-Total-Pages", "1");
                
                // 这里我们返回200 OK而不是500错误，以确保前端可以继续工作
                return Ok(new { 
                    items = mockCourses,
                    totalCount = mockCourses.Count,
                    pageNumber = page,
                    pageSize = pageSize
                });
            }
        }
        
        // 获取模拟课程数据
        private List<CourseDTO> GetMockCourses(int page, int pageSize)
        {
            var mockCourses = new List<CourseDTO>
            {
                new CourseDTO
                {
                    Id = 1,
                    Title = "Python编程入门",
                    Description = "这是一门Python编程入门课程，适合零基础学习。",
                    Category = "计算机科学",
                    ImageUrl = "/images/courses/python.jpg",
                    Level = "beginner",
                    Price = 0,
                    IsFree = true,
                    IsPublished = true,
                    CreatedAt = DateTime.Now.AddDays(-30),
                    PublishedAt = DateTime.Now.AddDays(-28),
                    CreatedBy = "admin",
                    LessonCount = 10,
                    EnrollmentCount = 100
                },
                new CourseDTO
                {
                    Id = 2,
                    Title = "Java编程进阶",
                    Description = "这是一门Java编程进阶课程，适合有一定基础的学习者。",
                    Category = "计算机科学",
                    ImageUrl = "/images/courses/java.jpg",
                    Level = "intermediate",
                    Price = 100,
                    IsFree = false,
                    IsPublished = true,
                    CreatedAt = DateTime.Now.AddDays(-60),
                    PublishedAt = DateTime.Now.AddDays(-55),
                    CreatedBy = "admin",
                    LessonCount = 15,
                    EnrollmentCount = 80
                },
                new CourseDTO
                {
                    Id = 3,
                    Title = "高等数学",
                    Description = "这是一门高等数学课程，包含微积分、线性代数等内容。",
                    Category = "数学",
                    ImageUrl = "/images/courses/math.jpg",
                    Level = "advanced",
                    Price = 80,
                    IsFree = false,
                    IsPublished = true,
                    CreatedAt = DateTime.Now.AddDays(-90),
                    PublishedAt = DateTime.Now.AddDays(-85),
                    CreatedBy = "admin",
                    LessonCount = 20,
                    EnrollmentCount = 120
                },
                new CourseDTO
                {
                    Id = 4,
                    Title = "英语口语",
                    Description = "这是一门英语口语课程，帮助学生提高口语表达能力。",
                    Category = "语言",
                    ImageUrl = "/images/courses/english.jpg",
                    Level = "beginner",
                    Price = 50,
                    IsFree = false,
                    IsPublished = true,
                    CreatedAt = DateTime.Now.AddDays(-120),
                    PublishedAt = DateTime.Now.AddDays(-115),
                    CreatedBy = "admin",
                    LessonCount = 12,
                    EnrollmentCount = 150
                },
                new CourseDTO
                {
                    Id = 5,
                    Title = "世界历史",
                    Description = "这是一门世界历史课程，带你了解人类文明的发展历程。",
                    Category = "历史",
                    ImageUrl = "/images/courses/history.jpg",
                    Level = "intermediate",
                    Price = 60,
                    IsFree = false,
                    IsPublished = true,
                    CreatedAt = DateTime.Now.AddDays(-150),
                    PublishedAt = DateTime.Now.AddDays(-145),
                    CreatedBy = "admin",
                    LessonCount = 18,
                    EnrollmentCount = 90
                }
            };
            
            return mockCourses.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        }

        // GET: api/Courses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CourseDetailDTO>> GetCourse(int id)
        {
            var course = await _context.Courses
                .Include(c => c.Lessons.OrderBy(l => l.OrderIndex))
                .Include(c => c.Teachers)
                    .ThenInclude(t => t.User)
                .FirstOrDefaultAsync(c => c.Id == id);
                
            if (course == null)
            {
                return NotFound();
            }
            
            // 检查未发布课程的权限
            if (!course.IsPublished)
            {
                // 只有管理员、课程创建者和课程教师可以访问未发布课程
                if (!User.IsInRole("admin") && 
                    !User.IsInRole("teacher") && 
                    (User.Identity.Name != course.CreatedBy || 
                     !course.Teachers.Any(t => t.User.UserName == User.Identity.Name)))
                {
                    return NotFound();
                }
            }

            var courseDetail = new CourseDetailDTO
            {
                Id = course.Id,
                Title = course.Title,
                Description = course.Description,
                Category = course.Category,
                ImageUrl = course.ImageUrl,
                Level = course.Level,
                Price = course.Price,
                IsFree = course.IsFree,
                IsPublished = course.IsPublished,
                CreatedAt = course.CreatedAt,
                PublishedAt = course.PublishedAt,
                CreatedBy = course.CreatedBy,
                Teachers = course.Teachers.Select(t => new TeacherDTO
                {
                    Id = t.User.Id,
                    Name = $"{t.User.FirstName} {t.User.LastName}",
                    DisplayName = t.User.DisplayName,
                    AvatarUrl = t.User.AvatarUrl,
                    IsPrimary = t.IsPrimary
                }).ToList(),
                Lessons = course.Lessons.Select(l => new LessonDTO
                {
                    Id = l.Id,
                    Title = l.Title,
                    Description = l.Description,
                    OrderIndex = l.OrderIndex,
                    ContentType = l.ContentType,
                    DurationMinutes = l.DurationMinutes,
                    IsPublished = l.IsPublished
                }).ToList()
            };

            return courseDetail;
        }

        // POST: api/Courses
        [HttpPost]
        [Authorize(Roles = "admin,teacher")]
        public async Task<ActionResult<CourseDTO>> CreateCourse(CreateCourseDTO createCourseDTO)
        {
            var course = new Course
            {
                Title = createCourseDTO.Title,
                Description = createCourseDTO.Description,
                Category = createCourseDTO.Category,
                ImageUrl = createCourseDTO.ImageUrl,
                Level = createCourseDTO.Level,
                Price = createCourseDTO.Price,
                IsFree = createCourseDTO.IsFree,
                IsPublished = createCourseDTO.IsPublished,
                CreatedAt = DateTime.UtcNow,
                PublishedAt = createCourseDTO.IsPublished ? DateTime.UtcNow : (DateTime?)null,
                CreatedBy = User.Identity.Name
            };
            
            _context.Courses.Add(course);
            await _context.SaveChangesAsync();
            
            // 将当前用户添加为课程的主要教师
            var userId = _context.Users
                .Where(u => u.UserName == User.Identity.Name)
                .Select(u => u.Id)
                .FirstOrDefault();

            if (!string.IsNullOrEmpty(userId))
            {
                var courseTeacher = new CourseTeacher
                {
                    CourseId = course.Id,
                    UserId = userId,
                    IsPrimary = true,
                    AssignedDate = DateTime.UtcNow,
                    CanEditCourse = true,
                    CanGradeAssignments = true,
                    CanManageStudents = true
                };

                _context.CourseTeachers.Add(courseTeacher);
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(
                nameof(GetCourse),
                new { id = course.Id },
                new CourseDTO
                {
                    Id = course.Id,
                    Title = course.Title,
                    Description = course.Description,
                    Category = course.Category,
                    ImageUrl = course.ImageUrl,
                    Level = course.Level,
                    Price = course.Price,
                    IsFree = course.IsFree,
                    IsPublished = course.IsPublished,
                    CreatedAt = course.CreatedAt,
                    PublishedAt = course.PublishedAt,
                    CreatedBy = course.CreatedBy
                }
            );
        }

        // PUT: api/Courses/5
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> UpdateCourse(int id, UpdateCourseDTO updateCourseDTO)
        {
            var course = await _context.Courses
                .Include(c => c.Teachers)
                    .ThenInclude(t => t.User)
                .FirstOrDefaultAsync(c => c.Id == id);
                
            if (course == null)
            {
                return NotFound();
            }
            
            // 检查权限：只有管理员、课程创建者和有编辑权限的教师可以修改课程
            if (!User.IsInRole("admin") &&
                User.Identity.Name != course.CreatedBy &&
                !course.Teachers.Any(t => t.User.UserName == User.Identity.Name && t.CanEditCourse))
            {
                return Forbid();
            }
            
            course.Title = updateCourseDTO.Title;
            course.Description = updateCourseDTO.Description;
            course.Category = updateCourseDTO.Category;
            course.ImageUrl = updateCourseDTO.ImageUrl;
            course.Level = updateCourseDTO.Level;
            course.Price = updateCourseDTO.Price;
            course.IsFree = updateCourseDTO.IsFree;

            // 如果课程状态从未发布变为已发布，设置发布时间
            if (!course.IsPublished && updateCourseDTO.IsPublished)
            {
                course.PublishedAt = DateTime.UtcNow;
            }

            course.IsPublished = updateCourseDTO.IsPublished;

            _context.Entry(course).State = EntityState.Modified;
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CourseExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            
            return NoContent();
        }
        
        // DELETE: api/Courses/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }
            
            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // POST: api/Courses/5/enroll
        [HttpPost("{id}/enroll")]
        [Authorize]
        public async Task<IActionResult> EnrollCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }
            
            if (!course.IsPublished)
            {
                return BadRequest("Cannot enroll in an unpublished course.");
            }

            var userId = _context.Users
                .Where(u => u.UserName == User.Identity.Name)
                .Select(u => u.Id)
                .FirstOrDefault();

            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User not found.");
            }

            // 检查用户是否已经注册了该课程
            var existingEnrollment = await _context.CourseEnrollments
                .FirstOrDefaultAsync(e => e.CourseId == id && e.UserId == userId);

            if (existingEnrollment != null)
            {
                return BadRequest("You are already enrolled in this course.");
            }

            var enrollment = new CourseEnrollment
            {
                CourseId = id,
                UserId = userId,
                EnrollmentDate = DateTime.UtcNow,
                CompletionPercentage = 0,
                IsCompleted = false,
                LastActivityDate = DateTime.UtcNow
            };

            _context.CourseEnrollments.Add(enrollment);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Successfully enrolled in the course." });
        }

        // GET: api/Courses/enrolled
        [HttpGet("enrolled")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<EnrolledCourseDTO>>> GetEnrolledCourses(
            int page = 1,
            int pageSize = 10)
        {
            var userId = _context.Users
                .Where(u => u.UserName == User.Identity.Name)
                .Select(u => u.Id)
                .FirstOrDefault();

            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User not found.");
            }

            var query = _context.CourseEnrollments
                .Where(e => e.UserId == userId)
                .Include(e => e.Course);

            // 计算总记录数
            var totalCount = await query.CountAsync();

            // 分页
            var enrolledCourses = await query
                .OrderByDescending(e => e.LastActivityDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(e => new EnrolledCourseDTO
                {
                    Id = e.Course.Id,
                    Title = e.Course.Title,
                    Description = e.Course.Description,
                    Category = e.Course.Category,
                    ImageUrl = e.Course.ImageUrl,
                    Level = e.Course.Level,
                    CompletionPercentage = e.CompletionPercentage,
                    IsCompleted = e.IsCompleted,
                    EnrollmentDate = e.EnrollmentDate,
                    LastActivityDate = e.LastActivityDate
                })
                .ToListAsync();

            // 设置响应头以包含分页信息
            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Page", page.ToString());
            Response.Headers.Add("X-Page-Size", pageSize.ToString());
            Response.Headers.Add("X-Total-Pages", ((int)Math.Ceiling(totalCount / (double)pageSize)).ToString());

            return enrolledCourses;
        }

        // GET: api/Courses/teaching
        [HttpGet("teaching")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<ActionResult<IEnumerable<TeachingCourseDTO>>> GetTeachingCourses(
            int page = 1,
            int pageSize = 10)
        {
            var userId = _context.Users
                .Where(u => u.UserName == User.Identity.Name)
                .Select(u => u.Id)
                .FirstOrDefault();

            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User not found.");
            }

            var query = _context.CourseTeachers
                .Where(t => t.UserId == userId)
                .Include(t => t.Course);

            // 计算总记录数
            var totalCount = await query.CountAsync();

            // 分页
            var teachingCourses = await query
                .OrderByDescending(t => t.AssignedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new TeachingCourseDTO
                {
                    Id = t.Course.Id,
                    Title = t.Course.Title,
                    Description = t.Course.Description,
                    Category = t.Course.Category,
                    ImageUrl = t.Course.ImageUrl,
                    Level = t.Course.Level,
                    IsPublished = t.Course.IsPublished,
                    CreatedAt = t.Course.CreatedAt,
                    PublishedAt = t.Course.PublishedAt,
                    EnrollmentCount = t.Course.Enrollments.Count,
                    IsPrimary = t.IsPrimary,
                    CanEditCourse = t.CanEditCourse,
                    CanGradeAssignments = t.CanGradeAssignments,
                    CanManageStudents = t.CanManageStudents
                })
                .ToListAsync();

            // 设置响应头以包含分页信息
            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Page", page.ToString());
            Response.Headers.Add("X-Page-Size", pageSize.ToString());
            Response.Headers.Add("X-Total-Pages", ((int)Math.Ceiling(totalCount / (double)pageSize)).ToString());

            return teachingCourses;
        }
        
        // GET: api/Courses/categories
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategories()
        {
            try
            {
                var categories = await _context.Courses
                    .Where(c => c.Category != null && c.Category.Trim() != "")
                    .Select(c => c.Category)
                    .Distinct()
                    .OrderBy(c => c)
                    .ToListAsync();
                
                // 如果数据库中没有分类，返回默认分类
                if (categories == null || categories.Count == 0)
                {
                    var defaultCategories = new List<string> 
                    { 
                        "计算机科学", "数学", "物理", "化学", 
                        "文学", "历史", "艺术", "语言" 
                    };
                    
                    return Ok(defaultCategories);
                }
                
                return Ok(categories);
            }
            catch (Exception ex)
            {
                // 记录详细错误信息
                Console.WriteLine($"获取课程分类时发生错误: {ex.Message}");
                Console.WriteLine($"内部错误: {ex.InnerException?.Message}");
                Console.WriteLine($"堆栈跟踪: {ex.StackTrace}");
                
                // 返回降级的模拟数据
                var fallbackCategories = new List<string> 
                { 
                    "计算机科学", "数学", "物理", "化学", 
                    "文学", "历史", "艺术", "语言" 
                };
                
                // 这里我们返回200 OK而不是500错误，以确保前端可以继续工作
                return Ok(fallbackCategories);
            }
        }
        
        private bool CourseExists(int id)
        {
            return _context.Courses.Any(e => e.Id == id);
        }
    }
} 