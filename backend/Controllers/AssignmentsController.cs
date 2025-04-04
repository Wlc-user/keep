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
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AssignmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        
        public AssignmentsController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        
        // GET: api/assignments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Assignment>>> GetAssignments([FromQuery] int? courseId = null)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            
            var query = _context.Assignments.AsQueryable();
            
            // 根据课程ID筛选
            if (courseId.HasValue)
            {
                query = query.Where(a => a.CourseId == courseId.Value);
            }
            
            // 如果不是管理员，只能查看自己所在课程的作业
            if (currentUserRole != "admin")
            {
                if (currentUserRole == "teacher")
                {
                    // 教师可以看到自己教授的课程作业
                    var teachingCourseIds = await _context.Courses
                        .Where(c => c.Teachers.Any(t => t.Id == currentUserId))
                        .Select(c => c.Id)
                        .ToListAsync();
                    
                    query = query.Where(a => teachingCourseIds.Contains(a.CourseId));
                }
                else
                {
                    // 学生只能看到自己选修的课程作业
                    var enrolledCourseIds = await _context.Courses
                        .Where(c => c.Students.Any(s => s.Id == currentUserId))
                        .Select(c => c.Id)
                        .ToListAsync();
                    
                    query = query.Where(a => enrolledCourseIds.Contains(a.CourseId));
                }
            }
            
            return await query
                .Include(a => a.Course)
                .OrderByDescending(a => a.DueDate)
                .ToListAsync();
        }
        
        // GET: api/assignments/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Assignment>> GetAssignment(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            
            var assignment = await _context.Assignments
                .Include(a => a.Course)
                .Include(a => a.Submissions.Where(s => s.StudentId == currentUserId))
                .FirstOrDefaultAsync(a => a.Id == id);
                
            if (assignment == null)
            {
                return NotFound();
            }
            
            // 验证权限 - 管理员、课程的老师或者是选修该课程的学生可以查看
            if (currentUserRole != "admin" && 
                !await _context.Courses
                    .Where(c => c.Id == assignment.CourseId)
                    .AnyAsync(c => c.Teachers.Any(t => t.Id == currentUserId) || 
                              c.Students.Any(s => s.Id == currentUserId)))
            {
                return Forbid();
            }
            
            return assignment;
        }
        
        // POST: api/assignments
        [HttpPost]
        [Authorize(Roles = "admin,teacher")]
        public async Task<ActionResult<Assignment>> CreateAssignment(Assignment assignment)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            
            // 验证课程存在
            var course = await _context.Courses.FindAsync(assignment.CourseId);
            if (course == null)
            {
                return BadRequest(new { Message = "课程不存在" });
            }
            
            // 验证权限 - 只有管理员或者课程的老师可以创建作业
            if (currentUserRole != "admin" && 
                !await _context.Courses
                    .Where(c => c.Id == assignment.CourseId)
                    .AnyAsync(c => c.Teachers.Any(t => t.Id == currentUserId)))
            {
                return Forbid();
            }
            
            // 设置创建时间
            assignment.CreatedAt = DateTime.UtcNow;
            
            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetAssignment), new { id = assignment.Id }, assignment);
        }
        
        // PUT: api/assignments/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> UpdateAssignment(int id, Assignment assignment)
        {
            if (id != assignment.Id)
            {
                return BadRequest();
            }
            
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            
            var existingAssignment = await _context.Assignments.FindAsync(id);
            if (existingAssignment == null)
            {
                return NotFound();
            }
            
            // 验证权限 - 只有管理员或者课程的老师可以更新作业
            if (currentUserRole != "admin" && 
                !await _context.Courses
                    .Where(c => c.Id == existingAssignment.CourseId)
                    .AnyAsync(c => c.Teachers.Any(t => t.Id == currentUserId)))
            {
                return Forbid();
            }
            
            // 更新作业信息
            existingAssignment.Title = assignment.Title;
            existingAssignment.Description = assignment.Description;
            existingAssignment.DueDate = assignment.DueDate;
            existingAssignment.MaxPoints = assignment.MaxPoints;
            existingAssignment.IsActive = assignment.IsActive;
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AssignmentExists(id))
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
        
        // DELETE: api/assignments/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> DeleteAssignment(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            
            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment == null)
            {
                return NotFound();
            }
            
            // 验证权限 - 只有管理员或者课程的老师可以删除作业
            if (currentUserRole != "admin" && 
                !await _context.Courses
                    .Where(c => c.Id == assignment.CourseId)
                    .AnyAsync(c => c.Teachers.Any(t => t.Id == currentUserId)))
            {
                return Forbid();
            }
            
            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // GET: api/assignments/{id}/submissions
        [HttpGet("{id}/submissions")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<ActionResult<IEnumerable<AssignmentSubmission>>> GetSubmissions(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            
            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment == null)
            {
                return NotFound();
            }
            
            // 验证权限 - 只有管理员或者课程的老师可以查看所有提交
            if (currentUserRole != "admin" && 
                !await _context.Courses
                    .Where(c => c.Id == assignment.CourseId)
                    .AnyAsync(c => c.Teachers.Any(t => t.Id == currentUserId)))
            {
                return Forbid();
            }
            
            return await _context.AssignmentSubmissions
                .Where(s => s.AssignmentId == id)
                .Include(s => s.Student)
                .OrderByDescending(s => s.SubmissionDate)
                .ToListAsync();
        }
        
        // POST: api/assignments/{id}/submit
        [HttpPost("{id}/submit")]
        [Authorize(Roles = "admin,student")]
        public async Task<ActionResult<AssignmentSubmission>> SubmitAssignment(int id, AssignmentSubmission submission)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            
            if (submission.AssignmentId != id)
            {
                return BadRequest();
            }
            
            var assignment = await _context.Assignments
                .Include(a => a.Course)
                .FirstOrDefaultAsync(a => a.Id == id);
                
            if (assignment == null)
            {
                return NotFound();
            }
            
            // 验证学生是否选修了该课程
            if (currentUserRole != "admin" && 
                !await _context.Courses
                    .Where(c => c.Id == assignment.CourseId)
                    .AnyAsync(c => c.Students.Any(s => s.Id == currentUserId)))
            {
                return Forbid();
            }
            
            // 检查截止日期
            if (DateTime.UtcNow > assignment.DueDate)
            {
                return BadRequest(new { Message = "作业已过截止日期" });
            }
            
            // 检查是否已提交，如果已提交则更新
            var existingSubmission = await _context.AssignmentSubmissions
                .FirstOrDefaultAsync(s => s.AssignmentId == id && s.StudentId == currentUserId);
                
            if (existingSubmission != null)
            {
                existingSubmission.Content = submission.Content;
                existingSubmission.FileUrl = submission.FileUrl;
                existingSubmission.SubmissionDate = DateTime.UtcNow;
                existingSubmission.IsGraded = false; // 重置评分状态
                existingSubmission.Score = null;
                existingSubmission.Feedback = null;
            }
            else
            {
                // 创建新提交
                submission.StudentId = currentUserId;
                submission.SubmissionDate = DateTime.UtcNow;
                submission.IsGraded = false;
                
                _context.AssignmentSubmissions.Add(submission);
            }
            
            await _context.SaveChangesAsync();
            
            return Ok(new { Message = "作业提交成功" });
        }
        
        // POST: api/assignments/{id}/grade
        [HttpPost("{assignmentId}/submissions/{submissionId}/grade")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> GradeSubmission(int assignmentId, int submissionId, [FromBody] GradeModel gradeModel)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            
            var submission = await _context.AssignmentSubmissions
                .Include(s => s.Assignment)
                .FirstOrDefaultAsync(s => s.Id == submissionId && s.AssignmentId == assignmentId);
                
            if (submission == null)
            {
                return NotFound();
            }
            
            // 验证权限 - 只有管理员或者课程的老师可以评分
            if (currentUserRole != "admin" && 
                !await _context.Courses
                    .Where(c => c.Id == submission.Assignment.CourseId)
                    .AnyAsync(c => c.Teachers.Any(t => t.Id == currentUserId)))
            {
                return Forbid();
            }
            
            // 更新评分信息
            submission.Score = gradeModel.Score;
            submission.Feedback = gradeModel.Feedback;
            submission.IsGraded = true;
            
            await _context.SaveChangesAsync();
            
            return Ok(new { Message = "作业评分成功" });
        }
        
        private bool AssignmentExists(int id)
        {
            return _context.Assignments.Any(e => e.Id == id);
        }
    }
    
    public class GradeModel
    {
        public int Score { get; set; }
        public string Feedback { get; set; }
    }
} 