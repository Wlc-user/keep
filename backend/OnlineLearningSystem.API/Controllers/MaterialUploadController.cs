using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.DTOs;
using OnlineLearningSystem.API.Models;
using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace OnlineLearningSystem.API.Controllers
{
    [Route("api/materials/upload")]
    [ApiController]
    [Authorize]
    public class MaterialUploadController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<MaterialUploadController> _logger;
        private readonly string _uploadsFolder;
        
        public MaterialUploadController(
            ApplicationDbContext context,
            ILogger<MaterialUploadController> logger)
        {
            _context = context;
            _logger = logger;
            _uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Materials");
            
            // 确保上传目录存在
            if (!Directory.Exists(_uploadsFolder))
            {
                Directory.CreateDirectory(_uploadsFolder);
            }
        }
        
        [HttpPost]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<MaterialDTO>> UploadMaterial([FromForm] MaterialUploadDTO uploadDto)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var file = uploadDto.File;
                
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { message = "未提供有效的文件" });
                }
                
                // 验证文件大小 (限制为100MB)
                if (file.Length > 100 * 1024 * 1024)
                {
                    return BadRequest(new { message = "文件大小超过限制" });
                }
                
                // 验证文件类型
                var allowedExtensions = new[] {
                    ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", 
                    ".txt", ".jpg", ".jpeg", ".png", ".gif", ".mp4", ".mp3", ".zip"
                };
                
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new { message = "不支持的文件类型" });
                }
                
                // 生成唯一文件名
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(_uploadsFolder, fileName);
                
                // 保存文件
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                
                // 创建缩略图路径（如果是图片类型）
                string thumbnailUrl = null;
                if (new[] { ".jpg", ".jpeg", ".png", ".gif" }.Contains(fileExtension))
                {
                    thumbnailUrl = $"/api/materials/thumbnails/{fileName}";
                }
                else if (fileExtension == ".pdf")
                {
                    thumbnailUrl = "/assets/images/pdf-thumbnail.png";
                }
                else if (new[] { ".doc", ".docx" }.Contains(fileExtension))
                {
                    thumbnailUrl = "/assets/images/doc-thumbnail.png";
                }
                else if (new[] { ".ppt", ".pptx" }.Contains(fileExtension))
                {
                    thumbnailUrl = "/assets/images/ppt-thumbnail.png";
                }
                else if (new[] { ".xls", ".xlsx" }.Contains(fileExtension))
                {
                    thumbnailUrl = "/assets/images/xls-thumbnail.png";
                }
                else if (new[] { ".mp4" }.Contains(fileExtension))
                {
                    thumbnailUrl = "/assets/images/video-thumbnail.png";
                }
                else if (new[] { ".mp3" }.Contains(fileExtension))
                {
                    thumbnailUrl = "/assets/images/audio-thumbnail.png";
                }
                else
                {
                    thumbnailUrl = "/assets/images/file-thumbnail.png";
                }
                
                // 保存到数据库
                var now = DateTime.UtcNow;
                var material = new Material
                {
                    Title = uploadDto.Title,
                    Description = uploadDto.Description,
                    Category = uploadDto.Category,
                    FilePath = $"/api/materials/download/{fileName}",
                    FileType = fileExtension.TrimStart('.'),
                    FileSize = file.Length,
                    ThumbnailUrl = thumbnailUrl,
                    CreatedAt = now,
                    UpdatedAt = now,
                    CreatedBy = userId,
                    AccessLevel = uploadDto.AccessLevel,
                    CourseId = uploadDto.CourseId,
                    Status = "Pending" // 默认状态为待审核
                };
                
                _context.Materials.Add(material);
                await _context.SaveChangesAsync();
                
                // 返回结果
                var creator = await _context.Users.FindAsync(userId);
                var course = uploadDto.CourseId.HasValue
                    ? await _context.Courses.FindAsync(uploadDto.CourseId.Value)
                    : null;
                
                return new MaterialDTO
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
                    CourseName = course?.Title,
                    AccessLevel = material.AccessLevel,
                    Status = material.Status,
                    ReviewedBy = material.ReviewedBy,
                    ReviewedAt = material.ReviewedAt,
                    ReviewComments = material.ReviewComments,
                    ViewCount = 0,
                    DownloadCount = 0,
                    LikeCount = 0
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "上传学习材料失败");
                return StatusCode(500, new { message = "上传学习材料失败", error = ex.Message });
            }
        }
        
        [HttpGet("/api/materials/download/{filename}")]
        public async Task<IActionResult> DownloadFile(string filename)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var filePath = Path.Combine(_uploadsFolder, filename);
                
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { message = "文件不存在" });
                }
                
                // 查找对应的材料记录
                var material = await _context.Materials
                    .FirstOrDefaultAsync(m => m.FilePath.Contains(filename));
                
                if (material != null)
                {
                    // 检查访问权限
                    var isAdmin = User.IsInRole("Admin");
                    var isTeacher = User.IsInRole("Teacher");
                    
                    if (!isAdmin)
                    {
                        if (material.AccessLevel == "Private" && material.CreatedBy != userId)
                        {
                            return Forbid();
                        }
                        
                        if (material.AccessLevel == "Teacher" && !isTeacher && material.CreatedBy != userId)
                        {
                            return Forbid();
                        }
                        
                        if (material.AccessLevel == "Course" && material.CourseId.HasValue)
                        {
                            bool hasAccess = false;
                            
                            if (isTeacher)
                            {
                                // 检查是否是该课程的教师
                                hasAccess = await _context.CourseTeachers
                                    .AnyAsync(ct => ct.CourseId == material.CourseId.Value && ct.UserId == userId);
                            }
                            else
                            {
                                // 检查是否已经选修该课程
                                hasAccess = await _context.CourseEnrollments
                                    .AnyAsync(e => e.CourseId == material.CourseId.Value && e.UserId == userId);
                            }
                            
                            if (!hasAccess && material.CreatedBy != userId)
                            {
                                return Forbid();
                            }
                        }
                    }
                    
                    // 增加下载次数
                    material.DownloadCount++;
                    await _context.SaveChangesAsync();
                }
                
                // 读取文件并返回
                var fileContent = await System.IO.File.ReadAllBytesAsync(filePath);
                var contentType = GetContentType(Path.GetExtension(filename));
                
                return File(fileContent, contentType, Path.GetFileName(filename));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"下载文件 {filename} 失败");
                return StatusCode(500, new { message = "下载文件失败", error = ex.Message });
            }
        }
        
        [HttpGet("/api/materials/thumbnails/{filename}")]
        [AllowAnonymous]
        public IActionResult GetThumbnail(string filename)
        {
            try
            {
                var filePath = Path.Combine(_uploadsFolder, filename);
                
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { message = "文件不存在" });
                }
                
                var fileExtension = Path.GetExtension(filename).ToLowerInvariant();
                if (!new[] { ".jpg", ".jpeg", ".png", ".gif" }.Contains(fileExtension))
                {
                    // 对于非图片文件，返回默认缩略图
                    var defaultThumbnailPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "assets", "images", "file-thumbnail.png");
                    if (System.IO.File.Exists(defaultThumbnailPath))
                    {
                        return PhysicalFile(defaultThumbnailPath, "image/png");
                    }
                    
                    return NotFound(new { message = "默认缩略图不存在" });
                }
                
                var contentType = GetContentType(fileExtension);
                return PhysicalFile(filePath, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"获取缩略图 {filename} 失败");
                return StatusCode(500, new { message = "获取缩略图失败", error = ex.Message });
            }
        }
        
        private string GetContentType(string fileExtension)
        {
            switch (fileExtension.ToLowerInvariant())
            {
                case ".pdf":
                    return "application/pdf";
                case ".doc":
                case ".docx":
                    return "application/msword";
                case ".ppt":
                case ".pptx":
                    return "application/vnd.ms-powerpoint";
                case ".xls":
                case ".xlsx":
                    return "application/vnd.ms-excel";
                case ".txt":
                    return "text/plain";
                case ".jpg":
                case ".jpeg":
                    return "image/jpeg";
                case ".png":
                    return "image/png";
                case ".gif":
                    return "image/gif";
                case ".mp4":
                    return "video/mp4";
                case ".mp3":
                    return "audio/mpeg";
                case ".zip":
                    return "application/zip";
                default:
                    return "application/octet-stream";
            }
        }
    }
    
    public class MaterialUploadDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public Microsoft.AspNetCore.Http.IFormFile File { get; set; }
        public string AccessLevel { get; set; }
        public int? CourseId { get; set; }
    }
} 