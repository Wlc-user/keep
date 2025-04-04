using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.DTOs;
using AutoMapper;
using System.Security.Claims;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public NotificationsController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string type = null)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var query = _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .AsQueryable();
                
            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(n => n.Type == type);
            }
            
            // 计算总数和未读数
            var totalCount = await query.CountAsync();
            var unreadCount = await query.CountAsync(n => !n.Read);
            
            // 分页
            var notifications = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
                
            return Ok(new NotificationListDTO
            {
                Items = _mapper.Map<NotificationDTO[]>(notifications),
                TotalCount = totalCount,
                UnreadCount = unreadCount
            });
        }

        [HttpGet("public")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicNotifications([FromQuery] int limit = 5)
        {
            try 
            {
                // 获取系统公告类型的通知
                var notifications = await _context.Notifications
                    .Where(n => n.Category == "system" && n.Type == "info")
                    .OrderByDescending(n => n.CreatedAt)
                    .Take(limit)
                    .ToListAsync();
                    
                // 如果没有找到任何通知，返回空列表而不是404
                var result = new NotificationListDTO
                {
                    Items = notifications != null && notifications.Any() 
                        ? _mapper.Map<NotificationDTO[]>(notifications)
                        : Array.Empty<NotificationDTO>(),
                    TotalCount = notifications?.Count ?? 0,
                    UnreadCount = notifications?.Count(n => !n.Read) ?? 0
                };
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                // 记录错误
                Console.WriteLine($"获取公共通知错误: {ex.Message}");
                return StatusCode(500, new { message = "获取公共通知时发生错误" });
            }
        }

        // 可以根据需要添加更多方法...
    }
} 