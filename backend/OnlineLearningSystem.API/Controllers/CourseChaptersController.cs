using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace OnlineLearningSystem.API.Controllers
{
    [Route("api/courses/{courseId}/chapters")]
    [ApiController]
    [Authorize]
    public class CourseChaptersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        
        public CourseChaptersController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        
        /// <summary>
        /// 获取课程的所有章节
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseChapter>>> GetChapters(int courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            // 验证课程是否存在
            var course = await _context.Courses
                .Include(c => c.Teachers)
                .Include(c => c.Students)
                .FirstOrDefaultAsync(c => c.Id == courseId);
                
            if (course == null)
            {
                return NotFound(new { Message = "课程不存在" });
            }
            
            // 验证权限 - 必须是管理员、课程的教师或学生
            if (userRole != "admin" && 
                !course.Teachers.Any(t => t.UserId == userId) && 
                !course.Students.Any(s => s.Id == userId))
            {
                return Forbid();
            }
            
            // 查询章节列表
            // 对于非教师，只返回已发布的章节
            var chaptersQuery = _context.CourseChapters
                .Where(c => c.CourseId == courseId);
                
            if (userRole != "admin" && !course.Teachers.Any(t => t.UserId == userId))
            {
                chaptersQuery = chaptersQuery.Where(c => c.IsPublished);
            }
            
            var chapters = await chaptersQuery
                .OrderBy(c => c.OrderIndex)
                .ToListAsync();
                
            return Ok(chapters);
        }
        
        /// <summary>
        /// 获取指定章节详情
        /// </summary>
        [HttpGet("{chapterId}")]
        public async Task<ActionResult<CourseChapter>> GetChapter(int courseId, int chapterId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            // 验证课程是否存在
            var course = await _context.Courses
                .Include(c => c.Teachers)
                .Include(c => c.Students)
                .FirstOrDefaultAsync(c => c.Id == courseId);
                
            if (course == null)
            {
                return NotFound(new { Message = "课程不存在" });
            }
            
            // 验证权限
            if (userRole != "admin" && 
                !course.Teachers.Any(t => t.UserId == userId) && 
                !course.Students.Any(s => s.Id == userId))
            {
                return Forbid();
            }
            
            // 查询章节
            var chapter = await _context.CourseChapters
                .Include(c => c.Contents.OrderBy(content => content.OrderIndex))
                .FirstOrDefaultAsync(c => c.Id == chapterId && c.CourseId == courseId);
                
            if (chapter == null)
            {
                return NotFound(new { Message = "章节不存在" });
            }
            
            // 对于学生，只能查看已发布的章节
            if (userRole != "admin" && 
                !course.Teachers.Any(t => t.UserId == userId) && 
                !chapter.IsPublished)
            {
                return Forbid();
            }
            
            return Ok(chapter);
        }
        
        /// <summary>
        /// 创建新章节
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "admin,teacher")]
        public async Task<ActionResult<CourseChapter>> CreateChapter(int courseId, CourseChapter chapter)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            // 验证课程是否存在
            var course = await _context.Courses
                .Include(c => c.Teachers)
                .FirstOrDefaultAsync(c => c.Id == courseId);
                
            if (course == null)
            {
                return NotFound(new { Message = "课程不存在" });
            }
            
            // 验证权限 - 必须是管理员或课程的教师
            if (userRole != "admin" && !course.Teachers.Any(t => t.UserId == userId))
            {
                return Forbid();
            }
            
            // 设置章节所属课程
            chapter.CourseId = courseId;
            
            // 如果未设置排序，则放到最后
            if (chapter.OrderIndex <= 0)
            {
                var lastOrderIndex = await _context.CourseChapters
                    .Where(c => c.CourseId == courseId)
                    .OrderByDescending(c => c.OrderIndex)
                    .Select(c => c.OrderIndex)
                    .FirstOrDefaultAsync();
                    
                chapter.OrderIndex = lastOrderIndex + 1;
            }
            
            // 创建章节
            _context.CourseChapters.Add(chapter);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetChapter), 
                new { courseId = courseId, chapterId = chapter.Id }, 
                chapter);
        }
        
        /// <summary>
        /// 更新章节信息
        /// </summary>
        [HttpPut("{chapterId}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> UpdateChapter(int courseId, int chapterId, CourseChapter chapter)
        {
            if (chapterId != chapter.Id || courseId != chapter.CourseId)
            {
                return BadRequest();
            }
            
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            // 验证章节是否存在
            var existingChapter = await _context.CourseChapters
                .Include(c => c.Course)
                .ThenInclude(c => c.Teachers)
                .FirstOrDefaultAsync(c => c.Id == chapterId && c.CourseId == courseId);
                
            if (existingChapter == null)
            {
                return NotFound();
            }
            
            // 验证权限 - 必须是管理员或课程的教师
            if (userRole != "admin" && !existingChapter.Course.Teachers.Any(t => t.UserId == userId))
            {
                return Forbid();
            }
            
            // 更新章节信息
            existingChapter.Title = chapter.Title;
            existingChapter.Description = chapter.Description;
            existingChapter.IsPublished = chapter.IsPublished;
            existingChapter.UpdatedAt = DateTime.UtcNow;
            
            // 如果排序值有变化，需要重新排序
            if (existingChapter.OrderIndex != chapter.OrderIndex)
            {
                await ReorderChapters(courseId, existingChapter.Id, existingChapter.OrderIndex, chapter.OrderIndex);
            }
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ChapterExists(chapterId))
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
        
        /// <summary>
        /// 删除章节
        /// </summary>
        [HttpDelete("{chapterId}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> DeleteChapter(int courseId, int chapterId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            // 验证章节是否存在
            var chapter = await _context.CourseChapters
                .Include(c => c.Course)
                .ThenInclude(c => c.Teachers)
                .Include(c => c.Contents)
                .FirstOrDefaultAsync(c => c.Id == chapterId && c.CourseId == courseId);
                
            if (chapter == null)
            {
                return NotFound();
            }
            
            // 验证权限 - 必须是管理员或课程的教师
            if (userRole != "admin" && !chapter.Course.Teachers.Any(t => t.UserId == userId))
            {
                return Forbid();
            }
            
            // 删除章节及其内容
            _context.ChapterContents.RemoveRange(chapter.Contents);
            _context.CourseChapters.Remove(chapter);
            
            // 获取当前章节的排序位置
            var currentOrderIndex = chapter.OrderIndex;
            
            await _context.SaveChangesAsync();
            
            // 重新排序其他章节
            var chaptersToUpdate = await _context.CourseChapters
                .Where(c => c.CourseId == courseId && c.OrderIndex > currentOrderIndex)
                .ToListAsync();
                
            foreach (var c in chaptersToUpdate)
            {
                c.OrderIndex--;
            }
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        /// <summary>
        /// 调整章节顺序
        /// </summary>
        [HttpPost("{chapterId}/move")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> MoveChapter(int courseId, int chapterId, [FromBody] MoveChapterDTO moveInfo)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            // 验证章节是否存在
            var chapter = await _context.CourseChapters
                .Include(c => c.Course)
                .ThenInclude(c => c.Teachers)
                .FirstOrDefaultAsync(c => c.Id == chapterId && c.CourseId == courseId);
                
            if (chapter == null)
            {
                return NotFound();
            }
            
            // 验证权限 - 必须是管理员或课程的教师
            if (userRole != "admin" && !chapter.Course.Teachers.Any(t => t.UserId == userId))
            {
                return Forbid();
            }
            
            if (moveInfo.Direction == "up" && chapter.OrderIndex > 1)
            {
                await ReorderChapters(courseId, chapterId, chapter.OrderIndex, chapter.OrderIndex - 1);
            }
            else if (moveInfo.Direction == "down")
            {
                var maxOrderIndex = await _context.CourseChapters
                    .Where(c => c.CourseId == courseId)
                    .MaxAsync(c => c.OrderIndex);
                    
                if (chapter.OrderIndex < maxOrderIndex)
                {
                    await ReorderChapters(courseId, chapterId, chapter.OrderIndex, chapter.OrderIndex + 1);
                }
            }
            else if (moveInfo.Direction == "to" && moveInfo.TargetIndex.HasValue)
            {
                var maxOrderIndex = await _context.CourseChapters
                    .Where(c => c.CourseId == courseId)
                    .CountAsync();
                    
                if (moveInfo.TargetIndex.Value > 0 && moveInfo.TargetIndex.Value <= maxOrderIndex)
                {
                    await ReorderChapters(courseId, chapterId, chapter.OrderIndex, moveInfo.TargetIndex.Value);
                }
            }
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        /// <summary>
        /// 重新排序章节
        /// </summary>
        private async Task ReorderChapters(int courseId, int chapterId, int oldIndex, int newIndex)
        {
            if (oldIndex == newIndex) return;
            
            var chapters = await _context.CourseChapters
                .Where(c => c.CourseId == courseId)
                .OrderBy(c => c.OrderIndex)
                .ToListAsync();
                
            var chapter = chapters.First(c => c.Id == chapterId);
            
            // 如果是向上移动
            if (newIndex < oldIndex)
            {
                foreach (var c in chapters.Where(c => c.OrderIndex >= newIndex && c.OrderIndex < oldIndex))
                {
                    c.OrderIndex++;
                }
            }
            // 如果是向下移动
            else
            {
                foreach (var c in chapters.Where(c => c.OrderIndex > oldIndex && c.OrderIndex <= newIndex))
                {
                    c.OrderIndex--;
                }
            }
            
            chapter.OrderIndex = newIndex;
        }
        
        private bool ChapterExists(int id)
        {
            return _context.CourseChapters.Any(e => e.Id == id);
        }
    }
    
    public class MoveChapterDTO
    {
        // up, down 或 to
        public string Direction { get; set; }
        
        // 仅当Direction为to时使用
        public int? TargetIndex { get; set; }
    }
} 