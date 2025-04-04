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
    public class MaterialsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        
        public MaterialsController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        
        // GET: api/materials
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Material>>> GetMaterials([FromQuery] int? courseId = null)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            
            var query = _context.Materials.AsQueryable();
            
            // 根据课程ID筛选
            if (courseId.HasValue)
            {
                query = query.Where(m => m.CourseId == courseId.Value);
            }
            
            // 如果不是管理员，只能查看公开的或者自己所在课程的材料
            if (currentUserRole != "admin")
            {
                if (currentUserRole == "teacher")
                {
                    // 教师可以看到自己教授的课程材料
                    var teachingCourseIds = await _context.Courses
                        .Where(c => c.Teachers.Any(t => t.Id == currentUserId))
                        .Select(c => c.Id)
                        .ToListAsync();
                    
                    query = query.Where(m => m.IsPublic || teachingCourseIds.Contains(m.CourseId));
                }
                else
                {
                    // 学生只能看到自己选修的课程材料
                    var enrolledCourseIds = await _context.Courses
                        .Where(c => c.Students.Any(s => s.Id == currentUserId))
                        .Select(c => c.Id)
                        .ToListAsync();
                    
                    query = query.Where(m => m.IsPublic || enrolledCourseIds.Contains(m.CourseId));
                }
            }
            
            return await query
                .Include(m => m.Category)
                .Include(m => m.Uploader)
                .OrderByDescending(m => m.UploadDate)
                .ToListAsync();
        }
        
        // GET: api/materials/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Material>> GetMaterial(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            
            var material = await _context.Materials
                .Include(m => m.Category)
                .Include(m => m.Uploader)
                .Include(m => m.Course)
                .FirstOrDefaultAsync(m => m.Id == id);
                
            if (material == null)
            {
                return NotFound();
            }
            
            // 验证权限 - 管理员、材料上传者、课程的老师或者是选修该课程的学生可以查看
            if (currentUserRole != "admin" && 
                material.UploaderId != currentUserId &&
                !material.IsPublic &&
                !await _context.Courses
                    .Where(c => c.Id == material.CourseId)
                    .AnyAsync(c => c.Teachers.Any(t => t.Id == currentUserId) || 
                              c.Students.Any(s => s.Id == currentUserId)))
            {
                return Forbid();
            }
            
            // 增加下载计数
            material.DownloadCount++;
            await _context.SaveChangesAsync();
            
            return material;
        }
        
        // POST: api/materials
        [HttpPost]
        [Authorize(Roles = "admin,teacher")]
        public async Task<ActionResult<Material>> CreateMaterial(Material material)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            
            // 验证课程存在
            var course = await _context.Courses.FindAsync(material.CourseId);
            if (course == null)
            {
                return BadRequest(new { Message = "课程不存在" });
            }
            
            // 验证权限 - 只有管理员或者课程的老师可以上传材料
            if (currentUserRole != "admin" && 
                !await _context.Courses
                    .Where(c => c.Id == material.CourseId)
                    .AnyAsync(c => c.Teachers.Any(t => t.Id == currentUserId)))
            {
                return Forbid();
            }
            
            // 设置上传者和上传时间
            material.UploaderId = currentUserId;
            material.UploadDate = DateTime.UtcNow;
            material.DownloadCount = 0;
            
            _context.Materials.Add(material);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetMaterial), new { id = material.Id }, material);
        }
        
        // PUT: api/materials/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> UpdateMaterial(int id, Material material)
        {
            if (id != material.Id)
            {
                return BadRequest();
            }
            
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            
            var existingMaterial = await _context.Materials.FindAsync(id);
            if (existingMaterial == null)
            {
                return NotFound();
            }
            
            // 验证权限 - 只有管理员、材料上传者或课程的老师可以更新材料
            if (currentUserRole != "admin" && 
                existingMaterial.UploaderId != currentUserId &&
                !await _context.Courses
                    .Where(c => c.Id == existingMaterial.CourseId)
                    .AnyAsync(c => c.Teachers.Any(t => t.Id == currentUserId)))
            {
                return Forbid();
            }
            
            // 更新材料信息
            existingMaterial.Title = material.Title;
            existingMaterial.Description = material.Description;
            existingMaterial.FileUrl = material.FileUrl;
            existingMaterial.ThumbnailUrl = material.ThumbnailUrl;
            existingMaterial.FileType = material.FileType;
            existingMaterial.FileSize = material.FileSize;
            existingMaterial.IsPublic = material.IsPublic;
            existingMaterial.CategoryId = material.CategoryId;
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MaterialExists(id))
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
        
        // DELETE: api/materials/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> DeleteMaterial(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            
            var material = await _context.Materials.FindAsync(id);
            if (material == null)
            {
                return NotFound();
            }
            
            // 验证权限 - 只有管理员、材料上传者或课程的老师可以删除材料
            if (currentUserRole != "admin" && 
                material.UploaderId != currentUserId &&
                !await _context.Courses
                    .Where(c => c.Id == material.CourseId)
                    .AnyAsync(c => c.Teachers.Any(t => t.Id == currentUserId)))
            {
                return Forbid();
            }
            
            _context.Materials.Remove(material);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // GET: api/materials/categories
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<MaterialCategory>>> GetCategories()
        {
            return await _context.MaterialCategories
                .Include(c => c.ParentCategory)
                .ToListAsync();
        }
        
        // POST: api/materials/categories
        [HttpPost("categories")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<MaterialCategory>> CreateCategory(MaterialCategory category)
        {
            _context.MaterialCategories.Add(category);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction("GetCategories", new { id = category.Id }, category);
        }

        // 获取热门材料 - 新增API
        // GET: api/materials/popular
        [HttpGet("popular")]
        public async Task<ActionResult<IEnumerable<Material>>> GetPopularMaterials([FromQuery] int limit = 5)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            
            var query = _context.Materials
                .Where(m => m.Status == "Approved") // 只返回已审核通过的材料
                .OrderByDescending(m => m.DownloadCount) // 按下载量排序
                .Take(limit);
            
            // 权限过滤
            if (currentUserRole != "admin")
            {
                if (currentUserRole == "teacher")
                {
                    // 教师可以看到自己教授的课程材料和公开材料
                    var teachingCourseIds = await _context.Courses
                        .Where(c => c.Teachers.Any(t => t.Id == currentUserId))
                        .Select(c => c.Id)
                        .ToListAsync();
                    
                    query = query.Where(m => m.IsPublic || teachingCourseIds.Contains(m.CourseId));
                }
                else
                {
                    // 学生只能看到自己选修的课程材料和公开材料
                    var enrolledCourseIds = await _context.Courses
                        .Where(c => c.Students.Any(s => s.Id == currentUserId))
                        .Select(c => c.Id)
                        .ToListAsync();
                    
                    query = query.Where(m => m.IsPublic || enrolledCourseIds.Contains(m.CourseId));
                }
            }
            
            return await query
                .Include(m => m.Category)
                .Include(m => m.Uploader)
                .ToListAsync();
        }
        
        // 获取最新材料 - 新增API
        // GET: api/materials/recent
        [HttpGet("recent")]
        public async Task<ActionResult<IEnumerable<Material>>> GetRecentMaterials([FromQuery] int limit = 5)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            
            var query = _context.Materials
                .Where(m => m.Status == "Approved") // 只返回已审核通过的材料
                .OrderByDescending(m => m.UploadDate) // 按上传时间排序
                .Take(limit);
            
            // 权限过滤，与热门材料相同
            if (currentUserRole != "admin")
            {
                if (currentUserRole == "teacher")
                {
                    var teachingCourseIds = await _context.Courses
                        .Where(c => c.Teachers.Any(t => t.Id == currentUserId))
                        .Select(c => c.Id)
                        .ToListAsync();
                    
                    query = query.Where(m => m.IsPublic || teachingCourseIds.Contains(m.CourseId));
                }
                else
                {
                    var enrolledCourseIds = await _context.Courses
                        .Where(c => c.Students.Any(s => s.Id == currentUserId))
                        .Select(c => c.Id)
                        .ToListAsync();
                    
                    query = query.Where(m => m.IsPublic || enrolledCourseIds.Contains(m.CourseId));
                }
            }
            
            return await query
                .Include(m => m.Category)
                .Include(m => m.Uploader)
                .ToListAsync();
        }
        
        // 记录查看次数 - 新增API
        // POST: api/materials/{id}/view
        [HttpPost("{id}/view")]
        public async Task<IActionResult> IncrementViewCount(int id)
        {
            var material = await _context.Materials.FindAsync(id);
            if (material == null)
            {
                return NotFound();
            }
            
            // 增加查看计数
            material.ViewCount++;
            await _context.SaveChangesAsync();
            
            return Ok(new { success = true });
        }
        
        // 记录下载次数 - 新增API
        // POST: api/materials/{id}/download
        [HttpPost("{id}/download")]
        public async Task<IActionResult> IncrementDownloadCount(int id)
        {
            var material = await _context.Materials.FindAsync(id);
            if (material == null)
            {
                return NotFound();
            }
            
            // 增加下载计数
            material.DownloadCount++;
            await _context.SaveChangesAsync();
            
            return Ok(new { success = true });
        }
        
        // 点赞功能 - 新增API
        // POST: api/materials/{id}/like
        [HttpPost("{id}/like")]
        public async Task<IActionResult> LikeMaterial(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var material = await _context.Materials.FindAsync(id);
            
            if (material == null)
            {
                return NotFound();
            }
            
            // 检查用户是否已经点赞过
            var existingLike = await _context.UserMaterialInteractions
                .FirstOrDefaultAsync(l => l.UserId == currentUserId && l.MaterialId == id && l.InteractionType == "Like");
            
            if (existingLike != null)
            {
                return BadRequest(new { message = "您已经点赞过该材料" });
            }
            
            // 添加点赞记录
            _context.UserMaterialInteractions.Add(new UserMaterialInteraction
            {
                UserId = currentUserId,
                MaterialId = id,
                InteractionType = "Like",
                CreatedAt = DateTime.UtcNow
            });
            
            // 增加材料点赞计数
            material.LikeCount++;
            await _context.SaveChangesAsync();
            
            return Ok(new { success = true });
        }
        
        // 取消点赞 - 新增API
        // DELETE: api/materials/{id}/like
        [HttpDelete("{id}/like")]
        public async Task<IActionResult> UnlikeMaterial(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var material = await _context.Materials.FindAsync(id);
            
            if (material == null)
            {
                return NotFound();
            }
            
            // 查找点赞记录
            var existingLike = await _context.UserMaterialInteractions
                .FirstOrDefaultAsync(l => l.UserId == currentUserId && l.MaterialId == id && l.InteractionType == "Like");
            
            if (existingLike == null)
            {
                return BadRequest(new { message = "您尚未点赞该材料" });
            }
            
            // 删除点赞记录
            _context.UserMaterialInteractions.Remove(existingLike);
            
            // 减少材料点赞计数
            material.LikeCount = Math.Max(0, material.LikeCount - 1); // 确保不会减到负数
            await _context.SaveChangesAsync();
            
            return Ok(new { success = true });
        }
        
        private bool MaterialExists(int id)
        {
            return _context.Materials.Any(e => e.Id == id);
        }
    }
} 