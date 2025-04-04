using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.Models;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace OnlineLearningSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TeachersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public TeachersController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        // GET: api/teachers/my-courses
        [HttpGet("my-courses")]
        [Authorize(Roles = "teacher")]
        public async Task<ActionResult<IEnumerable<Course>>> GetTeachingCourses()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var teachingCourses = await _context.Courses
                .Where(c => c.Teachers.Any(t => t.Id == currentUserId))
                .Select(c => new 
                {
                    id = c.Id,
                    name = c.Name,
                    code = c.Code,
                    description = c.Description,
                    credits = c.Credits,
                    categoryId = c.CategoryId,
                    startDate = c.StartDate,
                    endDate = c.EndDate
                })
                .OrderBy(c => c.name)
                .ToListAsync();
            
            return Ok(teachingCourses);
        }
    }
} 