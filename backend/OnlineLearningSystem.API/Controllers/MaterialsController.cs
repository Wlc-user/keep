using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.DTOs;
using OnlineLearningSystem.API.Models;
using OnlineLearningSystem.API.Models.Constants;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace OnlineLearningSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MaterialsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<MaterialsController> _logger;
        
        public MaterialsController(
            ApplicationDbContext context, 
            IMapper mapper,
            ILogger<MaterialsController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }
        
        // GET: api/materials
        [HttpGet]
        public async Task<ActionResult<PagedResponseDTO<MaterialDTO>>> GetMaterials(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10, 
            [FromQuery] string search = null,
            [FromQuery] string category = null,
            [FromQuery] string status = null,
            [FromQuery] string accessLevel = null,
            [FromQuery] int? courseId = null,
            [FromQuery] string sortBy = "updatedAt",
            [FromQuery] bool descending = true)
        {
            try
            {
                _logger.LogInformation($"获取材料列表: 页码={page}, 每页数量={pageSize}, 搜索={search}, 分类={category}");
                
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var isAdmin = User.IsInRole("Admin");
                var isTeacher = User.IsInRole("Teacher");
                
                var query = _context.Materials.AsQueryable();
                
                // 应用基本筛选
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(m => m.Title.Contains(search) || 
                                         m.Description.Contains(search));
                }
                
                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Where(m => m.Category == category);
                }
                
                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(m => m.Status == status);
                }
                
                if (!string.IsNullOrEmpty(accessLevel))
                {
                    query = query.Where(m => m.AccessLevel == accessLevel);
                }
                    
                if (courseId.HasValue)
                {
                    query = query.Where(m => m.CourseId == courseId.Value);
                }
                
                // 应用权限筛选
                if (!isAdmin)
                {
                    if (isTeacher)
                    {
                        // 教师可以看到自己创建的、公开的或所教课程的材料
                        var teachingCourseIds = await _context.CourseTeachers
                            .Where(ct => ct.UserId == currentUserId)
                            .Select(ct => ct.CourseId)
                            .ToListAsync();
                        
                        query = query.Where(m => m.CreatedBy == currentUserId || 
                                             m.AccessLevel == MaterialAccessLevels.Public ||
                                             (m.AccessLevel == MaterialAccessLevels.Teacher) ||
                                             (m.AccessLevel == MaterialAccessLevels.Course && 
                                              teachingCourseIds.Contains(m.CourseId.Value)));
                    }
                    else
                    {
                        // 学生只能看到公开的或所学课程的材料
                        var enrolledCourseIds = await _context.CourseEnrollments
                            .Where(e => e.UserId == currentUserId)
                            .Select(e => e.CourseId)
                            .ToListAsync();
                        
                        query = query.Where(m => m.AccessLevel == MaterialAccessLevels.Public ||
                                             (m.AccessLevel == MaterialAccessLevels.Course && 
                                              m.CourseId.HasValue && 
                                              enrolledCourseIds.Contains(m.CourseId.Value)));
                    }
                }
                
                // 计算总数
                var totalCount = await query.CountAsync();
                
                // 应用排序
                query = ApplySorting(query, sortBy, descending);
                
                // 应用分页
                var materials = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Include(m => m.Creator)
                    .Include(m => m.Course)
                    .ToListAsync();
                    
                // 转换为DTO
                var materialDtos = materials.Select(m => new MaterialDTO
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description,
                    Category = m.Category,
                    FilePath = m.FilePath,
                    FileType = m.FileType,
                    FileSize = m.FileSize,
                    ThumbnailUrl = m.ThumbnailUrl,
                    CreatedBy = m.CreatedBy,
                    CreatedAt = m.CreatedAt,
                    CourseId = m.CourseId,
                    CourseName = m.Course?.Title,
                    AccessLevel = m.AccessLevel,
                    Status = m.Status,
                    ReviewedBy = m.ReviewedBy,
                    ReviewedAt = m.ReviewedAt,
                    ReviewComments = m.ReviewComments,
                    ViewCount = m.ViewCount,
                    DownloadCount = m.DownloadCount,
                    LikeCount = m.LikeCount
                }).ToList();
                
                return new PagedResponseDTO<MaterialDTO>
                {
                    Items = materialDtos,
                    PageNumber = page,
                    PageSize = pageSize,
                    TotalCount = totalCount,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取学习材料列表时出错");
                return StatusCode(500, new { message = "获取学习材料列表失败" });
            }
        }
        
        // 辅助方法：应用排序
        private IQueryable<Material> ApplySorting(IQueryable<Material> query, string sortBy, bool descending)
        {
            switch (sortBy?.ToLower())
            {
                case "title":
                    return descending ? query.OrderByDescending(m => m.Title) : query.OrderBy(m => m.Title);
                case "category":
                    return descending ? query.OrderByDescending(m => m.Category) : query.OrderBy(m => m.Category);
                case "createdat":
                    return descending ? query.OrderByDescending(m => m.CreatedAt) : query.OrderBy(m => m.CreatedAt);
                case "filesize":
                    return descending ? query.OrderByDescending(m => m.FileSize) : query.OrderBy(m => m.FileSize);
                case "downloadcount":
                    return descending ? query.OrderByDescending(m => m.DownloadCount) : query.OrderBy(m => m.DownloadCount);
                case "viewcount":
                    return descending ? query.OrderByDescending(m => m.ViewCount) : query.OrderBy(m => m.ViewCount);
                case "likecount":
                    return descending ? query.OrderByDescending(m => m.LikeCount) : query.OrderBy(m => m.LikeCount);
                case "updatedat":
                default:
                    return descending ? query.OrderByDescending(m => m.UpdatedAt) : query.OrderBy(m => m.UpdatedAt);
            }
        }
        
        // GET: api/materials/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<MaterialDTO>> GetMaterial(int id)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var isAdmin = User.IsInRole("Admin");
                var isTeacher = User.IsInRole("Teacher");
            
            var material = await _context.Materials
                .Include(m => m.Creator)
                    .Include(m => m.Course)
                .FirstOrDefaultAsync(m => m.Id == id);
                
            if (material == null)
            {
                    return NotFound(new { message = "未找到指定的学习材料" });
                }
                
                // 权限验证
                if (!isAdmin)
                {
                    if (material.AccessLevel == MaterialAccessLevels.Private && material.CreatedBy != currentUserId)
                    {
                        return Forbid();
                    }
                    
                    if (material.AccessLevel == MaterialAccessLevels.Teacher && !isTeacher && material.CreatedBy != currentUserId)
            {
                return Forbid();
            }
            
                    if (material.AccessLevel == MaterialAccessLevels.Course && material.CourseId.HasValue)
                    {
                        bool hasAccess = false;
                        
                        if (isTeacher)
                        {
                            // 检查是否是该课程的教师
                            hasAccess = await _context.CourseTeachers
                                .AnyAsync(ct => ct.CourseId == material.CourseId.Value && ct.UserId == currentUserId);
                        }
                        else
                        {
                            // 检查是否已经选修该课程
                            hasAccess = await _context.CourseEnrollments
                                .AnyAsync(e => e.CourseId == material.CourseId.Value && e.UserId == currentUserId);
                        }
                        
                        if (!hasAccess && material.CreatedBy != currentUserId)
                        {
                            return Forbid();
                        }
                    }
                }
                
                // 增加查看次数
                material.ViewCount++;
                await _context.SaveChangesAsync();
                
                // 转换为DTO
                var materialDto = new MaterialDTO
                {
                    Id = material.Id,
                    Title = material.Title,
                    Description = material.Description,
                    Category = material.Category,
                    FilePath = material.FilePath,
                    FileType = material.FileType,
                    FileSize = material.FileSize,
                    ThumbnailUrl = material.ThumbnailUrl,
                    CreatedBy = material.CreatedBy,
                    CreatedAt = material.CreatedAt,
                    CourseId = material.CourseId,
                    CourseName = material.Course?.Title,
                    AccessLevel = material.AccessLevel,
                    Status = material.Status,
                    ReviewedBy = material.ReviewedBy,
                    ReviewedAt = material.ReviewedAt,
                    ReviewComments = material.ReviewComments,
                    ViewCount = material.ViewCount,
                    DownloadCount = material.DownloadCount,
                    LikeCount = material.LikeCount
                };
                
                return materialDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"获取ID为{id}的学习材料详情时出错");
                return StatusCode(500, new { message = "获取学习材料详情失败" });
            }
        }
        
        // GET: api/materials/categories
        [HttpGet("categories")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<MaterialCategoryDTO>>> GetCategories()
        {
            try
            {
                _logger.LogInformation("获取材料分类列表");
                
                // 检查是否存在MaterialCategories表
                if (!_context.MaterialCategories.Any())
                {
                    _logger.LogWarning("MaterialCategories表中没有数据");
                    return Ok(new List<MaterialCategoryDTO>());
                }
                
                var categories = await _context.MaterialCategories
                    .ToListAsync();
                
                var categoryDtos = new List<MaterialCategoryDTO>();
                
                foreach (var category in categories)
                {
                    var parentName = string.Empty;
                    
                    if (category.ParentCategoryId.HasValue)
                    {
                        var parentCategory = await _context.MaterialCategories
                            .FirstOrDefaultAsync(c => c.Id == category.ParentCategoryId.Value);
                            
                        parentName = parentCategory?.Name ?? "未知分类";
                    }
                    
                    categoryDtos.Add(new MaterialCategoryDTO
                    {
                        Id = category.Id,
                        Name = category.Name,
                        Description = category.Description,
                        ParentCategoryId = category.ParentCategoryId,
                        ParentCategoryName = category.ParentCategoryId.HasValue ? parentName : null
                    });
                }
                
                return Ok(categoryDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取材料分类列表时出错: {Message}", ex.Message);
                return StatusCode(500, new { 
                    message = "获取材料分类列表失败", 
                    error = ex.Message,
                    details = ex.StackTrace
                });
            }
        }
        
        // GET: api/materials/statistics
        [HttpGet("statistics")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<object>> GetStatistics()
        {
            try
            {
                _logger.LogInformation("获取学习材料统计数据");
                
                // 获取总材料数
                var totalCount = await _context.Materials.CountAsync();
                
                // 按状态统计
                var pendingCount = await _context.Materials.CountAsync(m => m.Status == MaterialStatus.Pending);
                var approvedCount = await _context.Materials.CountAsync(m => m.Status == MaterialStatus.Approved);
                var rejectedCount = await _context.Materials.CountAsync(m => m.Status == MaterialStatus.Rejected);
                var unpublishedCount = await _context.Materials.CountAsync(m => m.Status == MaterialStatus.Unpublished);
                
                // 按材料类型统计
                var categoryStats = await _context.Materials
                    .GroupBy(m => m.Category)
                    .Select(g => new
                    {
                        Category = g.Key ?? "未分类",
                        Count = g.Count()
                    })
                    .ToListAsync();
                
                // 按访问级别统计
                var accessLevelStats = await _context.Materials
                    .GroupBy(m => m.AccessLevel)
                    .Select(g => new
                    {
                        AccessLevel = g.Key ?? "未设置",
                        Count = g.Count()
                    })
                    .ToListAsync();
                
                // 最近上传的材料 - 使用LEFT JOIN确保即使Creator为null也能获取数据
                var recentMaterials = await _context.Materials
                    .OrderByDescending(m => m.CreatedAt)
                    .Take(5)
                    .Select(m => new
                    {
                        m.Id,
                        m.Title,
                        m.Category,
                        m.Status,
                        m.CreatedAt,
                        CreatorName = m.CreatedBy != null ? 
                            _context.Users.Where(u => u.Id == m.CreatedBy)
                                .Select(u => u.UserName)
                                .FirstOrDefault() ?? "未知用户" 
                            : "未知用户",
                        m.FileType,
                        m.FileSize
                    })
                    .ToListAsync();
                
                // 最受欢迎的材料（基于下载和查看次数）
                var popularMaterials = await _context.Materials
                    .Where(m => m.Status == MaterialStatus.Approved)
                    .OrderByDescending(m => m.DownloadCount + m.ViewCount)
                    .Take(5)
                    .Select(m => new
                    {
                        m.Id,
                        m.Title,
                        m.DownloadCount,
                        m.ViewCount,
                        m.LikeCount,
                        m.Category
                    })
                    .ToListAsync();
                
                // 按课程统计材料数量 - 安全地处理可能的空导航属性
                var courseStats = await _context.Materials
                    .Where(m => m.CourseId.HasValue)
                    .GroupBy(m => m.CourseId)
                    .Select(g => new
                    {
                        CourseId = g.Key,
                        Count = g.Count()
                    })
                    .ToListAsync();
                    
                var courseNames = new List<object>();
                foreach (var stat in courseStats)
                {
                    var courseName = await _context.Courses
                        .Where(c => c.Id == stat.CourseId)
                        .Select(c => c.Title)
                        .FirstOrDefaultAsync() ?? "未知课程";
                        
                    courseNames.Add(new
                    {
                        CourseName = courseName,
                        Count = stat.Count
                    });
                }
                
                // 返回汇总统计数据
                return Ok(new
                {
                    TotalCount = totalCount,
                    StatusCounts = new
                    {
                        Pending = pendingCount,
                        Approved = approvedCount,
                        Rejected = rejectedCount,
                        Unpublished = unpublishedCount
                    },
                    CategoryStats = categoryStats,
                    AccessLevelStats = accessLevelStats,
                    RecentMaterials = recentMaterials,
                    PopularMaterials = popularMaterials,
                    CourseStats = courseNames.OrderByDescending(c => ((dynamic)c).Count).Take(10).ToList(),
                    LastUpdated = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取学习材料统计数据时出错: {Message}", ex.Message);
                return StatusCode(500, new { message = "获取学习材料统计数据失败", error = ex.Message });
            }
        }
        
        // POST: api/materials
        [HttpPost]
        [Authorize(Roles = "admin,teacher")]
        public async Task<ActionResult<MaterialDTO>> CreateMaterial(CreateMaterialDTO createDto)
        {
            try
            {
                var material = _mapper.Map<Material>(createDto);
                material.CreatedAt = DateTime.UtcNow;
                material.UpdatedAt = DateTime.UtcNow;
                material.CreatedBy = User.FindFirstValue(ClaimTypes.NameIdentifier);
                
                // 设置默认访问级别和状态
                if (string.IsNullOrEmpty(material.AccessLevel))
                {
                    material.AccessLevel = MaterialAccessLevels.Private;
                }
                
                // 管理员创建的素材自动审核通过，其他角色需要审核
                var userRole = User.FindFirstValue(ClaimTypes.Role);
                material.Status = userRole == "admin" ? 
                    MaterialStatus.Approved : MaterialStatus.Pending;
                
                _context.Materials.Add(material);
                await _context.SaveChangesAsync();
                
                return CreatedAtAction(nameof(GetMaterial), new { id = material.Id }, 
                    _mapper.Map<MaterialDTO>(material));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"创建材料失败: {ex.Message}" });
            }
        }
        
        // PUT: api/materials/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> UpdateMaterial(int id, UpdateMaterialDTO updateDto)
        {
            try
            {
                var material = await _context.Materials.FindAsync(id);
                
                if (material == null)
                {
                    return NotFound();
                }
                
                // 检查权限：只有管理员或者创建者可以更新
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var role = User.FindFirstValue(ClaimTypes.Role);
                
                if (role != "admin" && material.CreatedBy != userId)
                {
                    return Forbid();
                }
                
                _mapper.Map(updateDto, material);
                material.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"更新材料失败: {ex.Message}" });
            }
        }
        
        // DELETE: api/materials/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> DeleteMaterial(int id)
        {
            try
            {
                var material = await _context.Materials.FindAsync(id);
                
                if (material == null)
                {
                    return NotFound();
                }
                
                // 检查权限：只有管理员或者创建者可以删除
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var role = User.FindFirstValue(ClaimTypes.Role);
                
                if (role != "admin" && material.CreatedBy != userId)
                {
                    return Forbid();
                }
                
                _context.Materials.Remove(material);
                await _context.SaveChangesAsync();
                
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"删除材料失败: {ex.Message}" });
            }
        }
        
        // GET: api/materials/pending
        [HttpGet("pending")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<PagedResponseDTO<MaterialDTO>>> GetPendingMaterials(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string category = null,
            [FromQuery] string title = null)
        {
            var query = _context.Materials
                .Where(m => m.Status == "Pending")
                .Include(m => m.Creator)
                .AsQueryable();
            
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(m => m.Category == category);
            }
            
            if (!string.IsNullOrEmpty(title))
            {
                query = query.Where(m => m.Title.Contains(title));
            }
            
            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
            
            var materials = await query
                .OrderByDescending(m => m.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return new PagedResponseDTO<MaterialDTO>
            {
                Items = _mapper.Map<MaterialDTO[]>(materials).ToList(),
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages
            };
        }
        
        // PUT: api/materials/{id}/approve
        [HttpPut("{id}/approve")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> ApproveMaterial(int id, [FromBody] ReviewCommentDTO reviewDto)
        {
            try
            {
                var material = await _context.Materials.FindAsync(id);
                
                if (material == null)
                {
                    return NotFound();
                }
                
                material.Status = MaterialStatus.Approved;
                material.ReviewedBy = User.FindFirstValue(ClaimTypes.NameIdentifier);
                material.ReviewedAt = DateTime.UtcNow;
                material.ReviewComments = reviewDto?.Comment;
                
                await _context.SaveChangesAsync();
                
                // 可以在此处发送通知给素材创建者
                
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"审核通过材料失败: {ex.Message}" });
            }
        }
        
        // PUT: api/materials/{id}/reject
        [HttpPut("{id}/reject")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> RejectMaterial(int id, [FromBody] ReviewCommentDTO reviewDto)
        {
            try
            {
                var material = await _context.Materials.FindAsync(id);
                
                if (material == null)
                {
                    return NotFound();
                }
                
                if (string.IsNullOrEmpty(reviewDto?.Comment))
                {
                    return BadRequest(new { message = "拒绝时必须提供审核意见" });
                }
                
                material.Status = MaterialStatus.Rejected;
                material.ReviewedBy = User.FindFirstValue(ClaimTypes.NameIdentifier);
                material.ReviewedAt = DateTime.UtcNow;
                material.ReviewComments = reviewDto.Comment;
                
                await _context.SaveChangesAsync();
                
                // 可以在此处发送通知给素材创建者
                
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"拒绝材料失败: {ex.Message}" });
            }
        }
        
        // PUT: api/materials/{id}/unpublish
        [HttpPut("{id}/unpublish")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UnpublishMaterial(int id, [FromBody] ReviewCommentDTO reviewDto)
        {
            try
            {
                var material = await _context.Materials.FindAsync(id);
                
                if (material == null)
                {
                    return NotFound();
                }
                
                material.Status = MaterialStatus.Unpublished;
                material.ReviewedBy = User.FindFirstValue(ClaimTypes.NameIdentifier);
                material.ReviewedAt = DateTime.UtcNow;
                material.ReviewComments = reviewDto?.Comment;
                
                await _context.SaveChangesAsync();
                
                // 可以在此处发送通知给素材创建者
                
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"下架材料失败: {ex.Message}" });
            }
        }
        
        // GET: api/materials/statistics/admin
        [HttpGet("statistics/admin")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<object>> GetAdminStatistics()
        {
            try
            {
                _logger.LogInformation("获取管理统计数据");
                
                var totalCount = await _context.Materials.CountAsync();
                var pendingCount = await _context.Materials.CountAsync(m => m.Status == MaterialStatus.Pending);
                var approvedCount = await _context.Materials.CountAsync(m => m.Status == MaterialStatus.Approved);
                var rejectedCount = await _context.Materials.CountAsync(m => m.Status == MaterialStatus.Rejected);
                var unpublishedCount = await _context.Materials.CountAsync(m => m.Status == MaterialStatus.Unpublished);
                
                var accessLevelStats = await _context.Materials
                    .GroupBy(m => m.AccessLevel)
                    .Select(g => new
                    {
                        AccessLevel = g.Key ?? "未设置",
                        Count = g.Count()
                    })
                    .ToListAsync();
                
                // 安全获取最近添加的材料，避免使用Include
                var recentMaterialsQuery = await _context.Materials
                    .OrderByDescending(m => m.CreatedAt)
                    .Take(5)
                    .Select(m => new { 
                        m.Id, 
                        m.Title, 
                        m.Status, 
                        m.CreatedAt, 
                        m.CreatedBy 
                    })
                    .ToListAsync();
                    
                var recentMaterials = new List<object>();
                
                foreach (var m in recentMaterialsQuery)
                {
                    string creatorName = "未知用户";
                    
                    if (!string.IsNullOrEmpty(m.CreatedBy))
                    {
                        var creator = await _context.Users
                            .Where(u => u.Id == m.CreatedBy)
                            .Select(u => u.UserName)
                            .FirstOrDefaultAsync();
                            
                        if (!string.IsNullOrEmpty(creator))
                        {
                            creatorName = creator;
                        }
                    }
                    
                    recentMaterials.Add(new
                    {
                        m.Id,
                        m.Title,
                        m.Status,
                        m.CreatedAt,
                        CreatorName = creatorName
                    });
                }
                
                return Ok(new
                {
                    TotalCount = totalCount,
                    StatusCounts = new
                    {
                        Pending = pendingCount,
                        Approved = approvedCount,
                        Rejected = rejectedCount,
                        Unpublished = unpublishedCount
                    },
                    AccessLevelStats = accessLevelStats,
                    RecentMaterials = recentMaterials,
                    LastUpdated = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取管理统计数据时出错: {Message}", ex.Message);
                return StatusCode(500, new { 
                    message = "获取管理统计数据失败", 
                    error = ex.Message,
                    details = ex.StackTrace 
                });
            }
        }
        
        // 增加下载计数
        [HttpPost("{id}/download")]
        public async Task<IActionResult> RecordDownload(int id)
        {
            try
            {
                var material = await _context.Materials.FindAsync(id);
                
                if (material == null)
                {
                    return NotFound();
                }
                
                // 权限检查
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var userRole = User.FindFirstValue(ClaimTypes.Role);
                
                if (!await CanUserAccessMaterial(material, userId, userRole))
                {
                    return Forbid();
                }
                
                material.DownloadCount++;
                await _context.SaveChangesAsync();
                
                return Ok(new { downloadCount = material.DownloadCount });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"记录下载计数失败: {ex.Message}" });
            }
        }
        
        // 检查用户是否有权限访问材料
        private async Task<bool> CanUserAccessMaterial(Material material, string userId, string userRole)
        {
            // 管理员可以访问所有材料
            if (userRole == "Admin")
            {
                return true;
            }
            
            // 材料创建者可以访问自己的材料
            if (material.CreatedBy == userId)
            {
                return true;
            }
            
            // 公开材料任何人都可以访问
            if (material.AccessLevel == MaterialAccessLevels.Public)
            {
                return true;
            }
            
            // 教师材料只有教师可以访问
            if (material.AccessLevel == MaterialAccessLevels.Teacher && userRole == "Teacher")
            {
                return true;
            }
            
            // 课程材料需要检查用户是否有权限访问该课程
            if (material.AccessLevel == MaterialAccessLevels.Course && material.CourseId.HasValue)
            {
                if (userRole == "Teacher")
                {
                    // 检查是否是该课程的教师
                    return await _context.CourseTeachers
                        .AnyAsync(ct => ct.CourseId == material.CourseId.Value && ct.UserId == userId);
                }
                else
                {
                    // 检查是否已经选修该课程
                    return await _context.CourseEnrollments
                        .AnyAsync(e => e.CourseId == material.CourseId.Value && e.UserId == userId);
                }
            }
            
            // 默认情况下，不允许访问
            return false;
        }
    }
    
    // DTO类
    public class MaterialDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; }
        public long FileSize { get; set; }
        public string ThumbnailUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string CreatorName { get; set; }
        
        // 新增字段
        public string AccessLevel { get; set; }
        public int? CourseId { get; set; }
        public string Status { get; set; }
        public string ReviewedBy { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string ReviewComments { get; set; }
        public int ViewCount { get; set; }
        public int DownloadCount { get; set; }
        public int LikeCount { get; set; }
        public string CourseName { get; set; }
    }
    
    public class CreateMaterialDTO
    {
        [Required]
        public string Title { get; set; }
        
        public string Description { get; set; }
        
        public string Category { get; set; }
        
        [Required]
        public string FilePath { get; set; }
        
        public string FileType { get; set; }
        
        public long FileSize { get; set; }
        
        public string ThumbnailUrl { get; set; }
        
        // 新增字段
        public string AccessLevel { get; set; } = MaterialAccessLevels.Private;
        
        public int? CourseId { get; set; }
    }
    
    public class UpdateMaterialDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public string ThumbnailUrl { get; set; }
        
        // 新增字段
        public string AccessLevel { get; set; }
        public int? CourseId { get; set; }
    }
    
    // 素材审核意见DTO
    public class ReviewCommentDTO
    {
        public string Comment { get; set; }
    }
    
    public class PagedResponseDTO<T>
    {
        public List<T> Items { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
    }
    
    public class MaterialCategoryDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int? ParentCategoryId { get; set; }
        public string ParentCategoryName { get; set; }
    }
} 