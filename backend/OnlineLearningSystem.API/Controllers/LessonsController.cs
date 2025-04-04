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
    public class LessonsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LessonsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Lessons/5
        [HttpGet("{id}")]
        public async Task<ActionResult<LessonDetailDTO>> GetLesson(int id)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Course)
                .Include(l => l.Resources)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (lesson == null)
            {
                return NotFound();
            }

            // 检查未发布课程/内容的权限
            if (!lesson.IsPublished || !lesson.Course.IsPublished)
            {
                // 只有管理员、课程创建者和课程教师可以访问未发布内容
                var isTeacher = await _context.CourseTeachers
                    .AnyAsync(t => t.CourseId == lesson.CourseId && 
                              t.User.UserName == User.Identity.Name);
                              
                if (!User.IsInRole("admin") && 
                    !User.IsInRole("teacher") && 
                    lesson.CreatedBy != User.Identity.Name &&
                    !isTeacher)
                {
                    return NotFound();
                }
            }

            // 检查学生是否已注册课程
            if (User.IsInRole("student"))
            {
                var userId = _context.Users
                    .Where(u => u.UserName == User.Identity.Name)
                    .Select(u => u.Id)
                    .FirstOrDefault();
                    
                var isEnrolled = await _context.CourseEnrollments
                    .AnyAsync(e => e.CourseId == lesson.CourseId && e.UserId == userId);
                    
                if (!isEnrolled)
                {
                    return Forbid();
                }
                
                // 记录学生的课程活动
                await TrackLessonView(lesson.Id, userId);
            }

            var lessonDetail = new LessonDetailDTO
            {
                Id = lesson.Id,
                Title = lesson.Title,
                Description = lesson.Description,
                CourseId = lesson.CourseId,
                CourseName = lesson.Course.Title,
                OrderIndex = lesson.OrderIndex,
                ContentType = lesson.ContentType,
                ContentUrl = lesson.ContentUrl,
                ContentHtml = lesson.ContentHtml,
                DurationMinutes = lesson.DurationMinutes,
                IsPublished = lesson.IsPublished,
                CreatedAt = lesson.CreatedAt,
                UpdatedAt = lesson.UpdatedAt,
                CreatedBy = lesson.CreatedBy,
                Resources = lesson.Resources.Select(r => new LessonResourceDTO
                {
                    Id = r.Id,
                    Title = r.Title,
                    Description = r.Description,
                    ResourceType = r.ResourceType,
                    ResourceUrl = r.ResourceUrl,
                    CreatedAt = r.CreatedAt
                }).ToList()
            };

            // 获取学生的完成状态
            if (User.Identity.IsAuthenticated)
            {
                var userId = _context.Users
                    .Where(u => u.UserName == User.Identity.Name)
                    .Select(u => u.Id)
                    .FirstOrDefault();
                    
                var completion = await _context.LessonCompletions
                    .FirstOrDefaultAsync(lc => lc.LessonId == id && lc.UserId == userId);
                    
                lessonDetail.IsCompleted = completion != null;
                lessonDetail.CompletionDate = completion?.CompletedAt;
                lessonDetail.ProgressPercentage = completion?.ProgressPercentage ?? 0;
            }

            return lessonDetail;
        }

        // POST: api/Lessons
        [HttpPost]
        [Authorize(Roles = "admin,teacher")]
        public async Task<ActionResult<LessonDTO>> CreateLesson(CreateLessonDTO createLessonDTO)
        {
            // 检查课程是否存在
            var course = await _context.Courses
                .Include(c => c.Teachers)
                .FirstOrDefaultAsync(c => c.Id == createLessonDTO.CourseId);
                
            if (course == null)
            {
                return BadRequest("Course not found");
            }

            // 检查是否有权限创建课时
            var userId = _context.Users
                .Where(u => u.UserName == User.Identity.Name)
                .Select(u => u.Id)
                .FirstOrDefault();
                
            var isTeacher = course.Teachers
                .Any(t => t.UserId == userId && t.CanEditCourse);
                
            if (!User.IsInRole("admin") && 
                course.CreatedBy != User.Identity.Name && 
                !isTeacher)
            {
                return Forbid();
            }

            // 计算新课时的顺序索引
            var maxOrderIndex = await _context.Lessons
                .Where(l => l.CourseId == createLessonDTO.CourseId)
                .Select(l => l.OrderIndex)
                .DefaultIfEmpty(0)
                .MaxAsync();

            var lesson = new Lesson
            {
                Title = createLessonDTO.Title,
                Description = createLessonDTO.Description,
                CourseId = createLessonDTO.CourseId,
                OrderIndex = maxOrderIndex + 1,
                ContentType = createLessonDTO.ContentType,
                ContentUrl = createLessonDTO.ContentUrl,
                ContentHtml = createLessonDTO.ContentHtml,
                DurationMinutes = createLessonDTO.DurationMinutes,
                IsPublished = createLessonDTO.IsPublished,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = User.Identity.Name
            };

            _context.Lessons.Add(lesson);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetLesson),
                new { id = lesson.Id },
                new LessonDTO
                {
                    Id = lesson.Id,
                    Title = lesson.Title,
                    Description = lesson.Description,
                    CourseId = lesson.CourseId,
                    OrderIndex = lesson.OrderIndex,
                    ContentType = lesson.ContentType,
                    DurationMinutes = lesson.DurationMinutes,
                    IsPublished = lesson.IsPublished
                }
            );
        }

        // PUT: api/Lessons/5
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> UpdateLesson(int id, UpdateLessonDTO updateLessonDTO)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Course)
                .ThenInclude(c => c.Teachers)
                .FirstOrDefaultAsync(l => l.Id == id);
                
            if (lesson == null)
            {
                return NotFound();
            }

            // 检查是否有权限更新课时
            var userId = _context.Users
                .Where(u => u.UserName == User.Identity.Name)
                .Select(u => u.Id)
                .FirstOrDefault();
                
            var isTeacher = lesson.Course.Teachers
                .Any(t => t.UserId == userId && t.CanEditCourse);
                
            if (!User.IsInRole("admin") && 
                lesson.CreatedBy != User.Identity.Name && 
                !isTeacher)
            {
                return Forbid();
            }

            lesson.Title = updateLessonDTO.Title;
            lesson.Description = updateLessonDTO.Description;
            lesson.ContentType = updateLessonDTO.ContentType;
            lesson.ContentUrl = updateLessonDTO.ContentUrl;
            lesson.ContentHtml = updateLessonDTO.ContentHtml;
            lesson.DurationMinutes = updateLessonDTO.DurationMinutes;
            lesson.IsPublished = updateLessonDTO.IsPublished;
            lesson.UpdatedAt = DateTime.UtcNow;

            _context.Entry(lesson).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LessonExists(id))
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

        // PUT: api/Lessons/5/order
        [HttpPut("{id}/order")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> UpdateLessonOrder(int id, [FromBody] UpdateLessonOrderDTO updateOrderDTO)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Course)
                .ThenInclude(c => c.Teachers)
                .FirstOrDefaultAsync(l => l.Id == id);
                
            if (lesson == null)
            {
                return NotFound();
            }

            // 检查是否有权限更新课时顺序
            var userId = _context.Users
                .Where(u => u.UserName == User.Identity.Name)
                .Select(u => u.Id)
                .FirstOrDefault();
                
            var isTeacher = lesson.Course.Teachers
                .Any(t => t.UserId == userId && t.CanEditCourse);
                
            if (!User.IsInRole("admin") && 
                lesson.Course.CreatedBy != User.Identity.Name && 
                !isTeacher)
            {
                return Forbid();
            }

            // 获取课程所有课时，按顺序排列
            var courseLessons = await _context.Lessons
                .Where(l => l.CourseId == lesson.CourseId)
                .OrderBy(l => l.OrderIndex)
                .ToListAsync();
                
            // 移除当前课时
            courseLessons.Remove(lesson);
            
            // 在新位置插入课时
            courseLessons.Insert(updateOrderDTO.NewOrderIndex, lesson);
            
            // 更新所有课时的顺序
            for (int i = 0; i < courseLessons.Count; i++)
            {
                courseLessons[i].OrderIndex = i + 1;
                _context.Entry(courseLessons[i]).State = EntityState.Modified;
            }
            
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Lessons/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> DeleteLesson(int id)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Course)
                .ThenInclude(c => c.Teachers)
                .FirstOrDefaultAsync(l => l.Id == id);
                
            if (lesson == null)
            {
                return NotFound();
            }

            // 检查是否有权限删除课时
            var userId = _context.Users
                .Where(u => u.UserName == User.Identity.Name)
                .Select(u => u.Id)
                .FirstOrDefault();
                
            var isTeacher = lesson.Course.Teachers
                .Any(t => t.UserId == userId && t.CanEditCourse);
                
            if (!User.IsInRole("admin") && 
                lesson.CreatedBy != User.Identity.Name && 
                !isTeacher)
            {
                return Forbid();
            }

            _context.Lessons.Remove(lesson);
            await _context.SaveChangesAsync();

            // 重新排序课程中的其他课时
            var remainingLessons = await _context.Lessons
                .Where(l => l.CourseId == lesson.CourseId)
                .OrderBy(l => l.OrderIndex)
                .ToListAsync();
                
            for (int i = 0; i < remainingLessons.Count; i++)
            {
                remainingLessons[i].OrderIndex = i + 1;
                _context.Entry(remainingLessons[i]).State = EntityState.Modified;
            }
            
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Lessons/5/complete
        [HttpPost("{id}/complete")]
        [Authorize]
        public async Task<IActionResult> CompleteLesson(int id, [FromBody] CompleteLessonDTO completeDTO)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Course)
                .FirstOrDefaultAsync(l => l.Id == id);
                
            if (lesson == null)
            {
                return NotFound();
            }

            var userId = _context.Users
                .Where(u => u.UserName == User.Identity.Name)
                .Select(u => u.Id)
                .FirstOrDefault();
                
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User not found");
            }

            // 检查学生是否已注册课程
            var isEnrolled = await _context.CourseEnrollments
                .AnyAsync(e => e.CourseId == lesson.CourseId && e.UserId == userId);
                
            if (!isEnrolled && !User.IsInRole("admin") && !User.IsInRole("teacher"))
            {
                return Forbid();
            }

            // 查找现有完成记录
            var existingCompletion = await _context.LessonCompletions
                .FirstOrDefaultAsync(lc => lc.LessonId == id && lc.UserId == userId);
                
            if (existingCompletion != null)
            {
                // 更新现有记录
                existingCompletion.CompletedAt = DateTime.UtcNow;
                existingCompletion.ProgressPercentage = completeDTO.ProgressPercentage;
                existingCompletion.Notes = completeDTO.Notes;
                _context.Entry(existingCompletion).State = EntityState.Modified;
            }
            else
            {
                // 创建新记录
                var completion = new LessonCompletion
                {
                    LessonId = id,
                    UserId = userId,
                    CompletedAt = DateTime.UtcNow,
                    ProgressPercentage = completeDTO.ProgressPercentage,
                    Notes = completeDTO.Notes
                };
                _context.LessonCompletions.Add(completion);
            }

            await _context.SaveChangesAsync();
            
            // 更新课程完成百分比
            await UpdateCourseCompletionAsync(lesson.CourseId, userId);

            return Ok(new { message = "Lesson marked as completed" });
        }

        // POST: api/Lessons/5/resources
        [HttpPost("{id}/resources")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<ActionResult<LessonResourceDTO>> AddLessonResource(int id, CreateLessonResourceDTO resourceDTO)
        {
            var lesson = await _context.Lessons
                .Include(l => l.Course)
                .ThenInclude(c => c.Teachers)
                .FirstOrDefaultAsync(l => l.Id == id);
                
            if (lesson == null)
            {
                return NotFound();
            }

            // 检查是否有权限添加资源
            var userId = _context.Users
                .Where(u => u.UserName == User.Identity.Name)
                .Select(u => u.Id)
                .FirstOrDefault();
                
            var isTeacher = lesson.Course.Teachers
                .Any(t => t.UserId == userId && t.CanEditCourse);
                
            if (!User.IsInRole("admin") && 
                lesson.CreatedBy != User.Identity.Name && 
                !isTeacher)
            {
                return Forbid();
            }

            var resource = new LessonResource
            {
                LessonId = id,
                Title = resourceDTO.Title,
                Description = resourceDTO.Description,
                ResourceType = resourceDTO.ResourceType,
                ResourceUrl = resourceDTO.ResourceUrl,
                CreatedAt = DateTime.UtcNow
            };

            _context.LessonResources.Add(resource);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetLesson),
                new { id = lesson.Id },
                new LessonResourceDTO
                {
                    Id = resource.Id,
                    Title = resource.Title,
                    Description = resource.Description,
                    ResourceType = resource.ResourceType,
                    ResourceUrl = resource.ResourceUrl,
                    CreatedAt = resource.CreatedAt
                }
            );
        }

        // DELETE: api/Lessons/resources/5
        [HttpDelete("resources/{resourceId}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> DeleteLessonResource(int resourceId)
        {
            var resource = await _context.LessonResources
                .Include(r => r.Lesson)
                .ThenInclude(l => l.Course)
                .ThenInclude(c => c.Teachers)
                .FirstOrDefaultAsync(r => r.Id == resourceId);
                
            if (resource == null)
            {
                return NotFound();
            }

            // 检查是否有权限删除资源
            var userId = _context.Users
                .Where(u => u.UserName == User.Identity.Name)
                .Select(u => u.Id)
                .FirstOrDefault();
                
            var isTeacher = resource.Lesson.Course.Teachers
                .Any(t => t.UserId == userId && t.CanEditCourse);
                
            if (!User.IsInRole("admin") && 
                resource.Lesson.CreatedBy != User.Identity.Name && 
                !isTeacher)
            {
                return Forbid();
            }

            _context.LessonResources.Remove(resource);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // 辅助方法: 记录学生的课程学习活动
        private async Task TrackLessonView(int lessonId, string userId)
        {
            var enrollment = await _context.CourseEnrollments
                .Include(e => e.Course)
                .ThenInclude(c => c.Lessons)
                .FirstOrDefaultAsync(e => e.Course.Lessons.Any(l => l.Id == lessonId) && e.UserId == userId);
                
            if (enrollment != null)
            {
                // 更新最后活动时间
                enrollment.LastActivityDate = DateTime.UtcNow;
                
                // 统计已查看的课时数量
                var viewedLessonsCount = await _context.LessonCompletions
                    .CountAsync(lc => lc.Lesson.CourseId == enrollment.CourseId && lc.UserId == userId);
                    
                enrollment.TotalLessonsViewed = viewedLessonsCount;
                
                _context.Entry(enrollment).State = EntityState.Modified;
                await _context.SaveChangesAsync();
            }
        }

        // 辅助方法: 更新课程完成百分比
        private async Task UpdateCourseCompletionAsync(int courseId, string userId)
        {
            // 获取课程的所有课时
            var totalLessonsCount = await _context.Lessons
                .CountAsync(l => l.CourseId == courseId);
                
            if (totalLessonsCount == 0)
            {
                return;
            }

            // 获取学生已完成的课时数量
            var completedLessonsCount = await _context.LessonCompletions
                .CountAsync(lc => lc.Lesson.CourseId == courseId && lc.UserId == userId);

            // 计算完成百分比
            decimal completionPercentage = (decimal)completedLessonsCount / totalLessonsCount * 100;
            
            // 更新课程注册记录
            var enrollment = await _context.CourseEnrollments
                .FirstOrDefaultAsync(e => e.CourseId == courseId && e.UserId == userId);
                
            if (enrollment != null)
            {
                enrollment.CompletionPercentage = completionPercentage;
                enrollment.IsCompleted = (completionPercentage >= 100);
                
                if (enrollment.IsCompleted && !enrollment.CompletionDate.HasValue)
                {
                    enrollment.CompletionDate = DateTime.UtcNow;
                }
                
                _context.Entry(enrollment).State = EntityState.Modified;
                await _context.SaveChangesAsync();
            }
        }

        private bool LessonExists(int id)
        {
            return _context.Lessons.Any(e => e.Id == id);
        }
    }
} 