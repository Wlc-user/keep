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
    public class StudentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public StudentsController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        // GET: api/students/my-courses
        [HttpGet("my-courses")]
        [Authorize(Roles = "student")]
        public async Task<ActionResult<IEnumerable<Course>>> GetEnrolledCourses()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var enrolledCourses = await _context.Courses
                .Where(c => c.Students.Any(s => s.Id == currentUserId))
                .Select(c => new 
                {
                    id = c.Id,
                    name = c.Name,
                    code = c.Code,
                    description = c.Description,
                    credits = c.Credits,
                    categoryId = c.CategoryId,
                    startDate = c.StartDate,
                    endDate = c.EndDate,
                    teachers = c.Teachers.Select(t => new 
                    {
                        id = t.Id,
                        name = t.UserName
                    }).ToList()
                })
                .OrderBy(c => c.name)
                .ToListAsync();
            
            return Ok(enrolledCourses);
        }
    }
} 