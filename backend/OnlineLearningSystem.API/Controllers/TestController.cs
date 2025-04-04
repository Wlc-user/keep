using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OnlineLearningSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TestController> _logger;

        public TestController(ApplicationDbContext context, ILogger<TestController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public ActionResult<object> Get()
        {
            return Ok(new
            {
                Message = "API测试端点工作正常",
                Timestamp = DateTime.UtcNow,
                Status = "成功"
            });
        }
        
        [HttpGet("db-test")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> TestDatabase()
        {
            try
            {
                // 尝试连接数据库
                bool canConnect = await _context.Database.CanConnectAsync();
                
                // 尝试获取一些数据
                int userCount = await _context.Users.CountAsync();
                int courseCount = await _context.Courses.CountAsync();
                
                return Ok(new
                {
                    Message = "数据库连接测试成功",
                    CanConnect = canConnect,
                    UserCount = userCount,
                    CourseCount = courseCount,
                    DatabaseProvider = _context.Database.ProviderName,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "数据库连接测试失败");
                
                return StatusCode(500, new
                {
                    Message = "数据库连接测试失败",
                    Error = ex.Message,
                    InnerError = ex.InnerException?.Message,
                    StackTrace = ex.StackTrace,
                    Timestamp = DateTime.UtcNow
                });
            }
        }
        
        [HttpGet("test-categories")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> TestCategories()
        {
            try
            {
                // 尝试获取课程分类
                var categories = await _context.Courses
                    .Where(c => c.Category != null && c.Category.Trim() != "")
                    .Select(c => c.Category)
                    .Distinct()
                    .OrderBy(c => c)
                    .ToListAsync();
                
                // 如果没有分类，创建一些测试数据
                if (categories == null || categories.Count == 0)
                {
                    return Ok(new
                    {
                        Message = "没有找到课程分类，返回测试数据",
                        TestCategories = new List<string> { "计算机科学", "数学", "物理", "化学", "文学", "历史", "艺术", "语言" },
                        Timestamp = DateTime.UtcNow
                    });
                }
                
                return Ok(new
                {
                    Message = "获取课程分类成功",
                    Categories = categories,
                    Count = categories.Count,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "测试获取课程分类失败");
                
                return StatusCode(500, new
                {
                    Message = "测试获取课程分类失败",
                    Error = ex.Message,
                    InnerError = ex.InnerException?.Message,
                    StackTrace = ex.StackTrace,
                    Timestamp = DateTime.UtcNow
                });
            }
        }
    }
} 