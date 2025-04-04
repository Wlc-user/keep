using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.DTOs;
using OnlineLearningSystem.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace OnlineLearningSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StudentEvaluationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<StudentEvaluationsController> _logger;

        public StudentEvaluationsController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            ILogger<StudentEvaluationsController> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }
        
        // GET: api/StudentEvaluations/history/{studentId}
        [HttpGet("history/{studentId}")]
        [Authorize(Roles = "admin,teacher,student")]
        public async Task<IActionResult> GetEvaluationHistory(string studentId)
        {
            try
            {
                // 检查访问权限
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var isAdminOrTeacher = User.IsInRole("admin") || User.IsInRole("teacher");
                
                if (!isAdminOrTeacher && currentUserId != studentId)
                {
                    // 学生只能查看自己的评估历史
                    return Forbid();
                }
                
                // 检查学生是否存在
                var student = await _userManager.FindByIdAsync(studentId);
                if (student == null)
                {
                    return NotFound("找不到指定的学生");
                }
                
                // 从数据库获取评估历史
                var evaluations = await _context.StudentEvaluations
                    .Where(e => e.StudentId == studentId)
                    .OrderByDescending(e => e.EvaluationDate)
                    .Select(e => new
                    {
                        id = e.Id,
                        academicYear = e.AcademicYear,
                        semester = e.Semester,
                        courseId = e.CourseId,
                        courseName = e.CourseName,
                        evaluationDate = e.EvaluationDate,
                        overallScore = e.OverallScore,
                        evaluatorId = e.EvaluatorId
                    })
                    .ToListAsync();
                
                // 获取评估者信息
                var evaluatorIds = evaluations.Select(e => e.evaluatorId).Distinct().ToList();
                var evaluators = await _userManager.Users
                    .Where(u => evaluatorIds.Contains(u.Id))
                    .Select(u => new { u.Id, Name = $"{u.FirstName} {u.LastName}" })
                    .ToDictionaryAsync(u => u.Id, u => u.Name);
                
                // 构建评估历史记录
                var historyData = evaluations.Select(e => new
                {
                    id = e.id,
                    academicYear = e.academicYear,
                    semester = e.semester,
                    courseId = e.courseId,
                    courseName = e.courseName,
                    evaluationDate = e.evaluationDate,
                    overallScore = e.overallScore,
                    evaluator = evaluators.ContainsKey(e.evaluatorId) ? evaluators[e.evaluatorId] : "未知"
                }).ToList();
                
                return Ok(new { 
                    success = true,
                    message = "获取学生评估历史成功",
                    data = historyData
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取学生评估历史时发生错误");
                return StatusCode(500, new { 
                    success = false,
                    message = "服务器内部错误"
                });
            }
        }
        
        // GET: api/StudentEvaluations/{studentId}
        [HttpGet("{studentId}")]
        [Authorize(Roles = "admin,teacher,student")]
        public async Task<IActionResult> GetStudentEvaluation(string studentId, [FromQuery] int? courseId = null)
        {
            try
            {
                // 检查访问权限
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var isAdminOrTeacher = User.IsInRole("admin") || User.IsInRole("teacher");
                
                if (!isAdminOrTeacher && currentUserId != studentId)
                {
                    // 学生只能查看自己的评估
                    return Forbid();
                }
                
                // 检查学生是否存在
                var student = await _userManager.FindByIdAsync(studentId);
                if (student == null)
                {
                    return NotFound("找不到指定的学生");
                }
                
                // 从数据库获取学生评估
                var query = _context.StudentEvaluations
                    .Include(e => e.Dimensions)
                    .Where(e => e.StudentId == studentId)
                    .OrderByDescending(e => e.EvaluationDate)
                    .AsQueryable();
                
                // 如果指定了课程ID，则筛选特定课程的评估
                if (courseId.HasValue)
                {
                    query = query.Where(e => e.CourseId == courseId.Value);
                }
                
                var evaluation = await query.FirstOrDefaultAsync();
                
                if (evaluation == null)
                {
                    // 如果数据库中没有找到评估记录，则返回空数据
                    return Ok(new { 
                        success = true,
                        message = "没有找到学生评估记录",
                        data = new {}
                    });
                }
                
                // 构建评估数据
                var evaluationDto = new {
                    id = evaluation.Id,
                    studentId = evaluation.StudentId,
                    studentName = $"{student.FirstName} {student.LastName}",
                    academicYear = evaluation.AcademicYear,
                    semester = evaluation.Semester,
                    courseId = evaluation.CourseId,
                    courseName = evaluation.CourseName,
                    evaluator = evaluation.EvaluatorId,
                    evaluationDate = evaluation.EvaluationDate,
                    overallScore = evaluation.OverallScore,
                    strengths = evaluation.Strengths,
                    areasForImprovement = evaluation.AreasForImprovement,
                    overallComment = evaluation.OverallComment,
                    evaluations = evaluation.Dimensions.Select(d => new {
                        dimension = d.Dimension,
                        score = d.Score,
                        comments = d.Comments
                    }).ToList()
                };
                
                return Ok(new { 
                    success = true,
                    message = "获取学生评估成功",
                    data = evaluationDto
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取学生评估时发生错误");
                return StatusCode(500, new { 
                    success = false,
                    message = "服务器内部错误"
                });
            }
        }
        
        // POST: api/StudentEvaluations
        [HttpPost]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> SaveStudentEvaluation([FromBody] StudentEvaluationDto evaluation)
        {
            try
            {
                if (evaluation == null)
                {
                    return BadRequest("评估数据不能为空");
                }
                
                // 检查学生是否存在
                var student = await _userManager.FindByIdAsync(evaluation.StudentId);
                if (student == null)
                {
                    return NotFound("找不到指定的学生");
                }
                
                // 获取评估者信息
                var evaluatorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                
                // 创建新的学生评估记录
                var newEvaluation = new StudentEvaluation
                {
                    StudentId = evaluation.StudentId,
                    AcademicYear = evaluation.AcademicYear,
                    Semester = evaluation.Semester,
                    CourseId = evaluation.CourseId,
                    CourseName = evaluation.CourseName,
                    EvaluatorId = evaluatorId,
                    EvaluationDate = DateTime.UtcNow,
                    OverallScore = evaluation.OverallScore,
                    Strengths = evaluation.Strengths,
                    AreasForImprovement = evaluation.AreasForImprovement,
                    OverallComment = evaluation.OverallComment
                };
                
                // 添加评估维度
                if (evaluation.Evaluations != null && evaluation.Evaluations.Count > 0)
                {
                    foreach (var dim in evaluation.Evaluations)
                    {
                        newEvaluation.Dimensions.Add(new EvaluationDimension
                        {
                            Dimension = dim.Dimension,
                            Score = dim.Score,
                            Comments = dim.Comments
                        });
                    }
                }
                
                // 保存到数据库
                _context.StudentEvaluations.Add(newEvaluation);
                await _context.SaveChangesAsync();
                
                // 构建响应
                var evaluator = await _userManager.FindByIdAsync(evaluatorId);
                var evaluatorName = $"{evaluator.FirstName} {evaluator.LastName}";
                
                return Ok(new { 
                    success = true,
                    message = "学生评估保存成功",
                    data = new {
                        id = newEvaluation.Id,
                        studentId = newEvaluation.StudentId,
                        studentName = $"{student.FirstName} {student.LastName}",
                        academicYear = newEvaluation.AcademicYear,
                        semester = newEvaluation.Semester,
                        courseId = newEvaluation.CourseId,
                        courseName = newEvaluation.CourseName,
                        evaluator = evaluatorName,
                        evaluationDate = newEvaluation.EvaluationDate,
                        overallScore = newEvaluation.OverallScore
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "保存学生评估时发生错误");
                return StatusCode(500, new { 
                    success = false,
                    message = "服务器内部错误"
                });
            }
        }
        
        // POST: api/StudentEvaluations/{studentId}/export/{evaluationId:int}
        [HttpPost("{studentId}/export/{evaluationId:int}")]
        [Authorize(Roles = "admin,teacher,student")]
        public async Task<IActionResult> ExportEvaluationReport(string studentId, int evaluationId)
        {
            try
            {
                // 检查访问权限
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var isAdminOrTeacher = User.IsInRole("admin") || User.IsInRole("teacher");
                
                if (!isAdminOrTeacher && currentUserId != studentId)
                {
                    // 学生只能导出自己的评估报告
                    return Forbid();
                }
                
                // 查找评估记录
                var evaluation = await _context.StudentEvaluations
                    .Include(e => e.Dimensions)
                    .FirstOrDefaultAsync(e => e.Id == evaluationId && e.StudentId == studentId);
                    
                if (evaluation == null)
                {
                    return NotFound("找不到指定的评估记录");
                }
                
                // 生成导出数据
                // ... 剩余代码保持不变
                
                // 模拟PDF内容
                var bytes = System.Text.Encoding.UTF8.GetBytes("模拟评估报告内容");
                return File(bytes, "application/pdf", $"评估报告_{studentId}_{evaluationId}.pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "导出评估报告时发生错误");
                return StatusCode(500, new { 
                    success = false,
                    message = "服务器内部错误"
                });
            }
        }
    }
}