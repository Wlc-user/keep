using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.DTOs;
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
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<NotificationsController> _logger;
        
        public NotificationsController(ApplicationDbContext context, IMapper mapper, ILogger<NotificationsController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }
        
        // GET: api/notifications
        [HttpGet]
        public async Task<ActionResult<NotificationListDTO>> GetNotifications(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10, 
            [FromQuery] string type = null)
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
                
            return new NotificationListDTO
            {
                Items = _mapper.Map<NotificationDTO[]>(notifications),
                TotalCount = totalCount,
                UnreadCount = unreadCount
            };
        }
        
        // GET: api/notifications/unread-count
        [HttpGet("unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var unreadCount = await _context.Notifications
                .CountAsync(n => n.UserId == userId && !n.Read);
                
            return unreadCount;
        }
        
        // GET: api/notifications/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<NotificationDTO>> GetNotification(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
                
            if (notification == null)
            {
                return NotFound();
            }
            
            return _mapper.Map<NotificationDTO>(notification);
        }
        
        // PUT: api/notifications/{id}/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
                
            if (notification == null)
            {
                return NotFound();
            }
            
            if (!notification.Read)
            {
                notification.Read = true;
                await _context.SaveChangesAsync();
            }
            
            return NoContent();
        }
        
        // PUT: api/notifications/read-all
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.Read)
                .ToListAsync();
                
            foreach (var notification in notifications)
            {
                notification.Read = true;
            }
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // DELETE: api/notifications/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
                
            if (notification == null)
            {
                return NotFound();
            }
            
            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // POST: api/notifications
        [HttpPost]
        [Authorize(Roles = "admin,teacher")]
        public async Task<ActionResult<NotificationDTO>> CreateNotification(CreateNotificationDTO createDto)
        {
            var senderUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var sender = await _context.Users.FindAsync(senderUserId);
            
            var notification = _mapper.Map<Notification>(createDto);
            notification.SenderName = $"{sender.FirstName} {sender.LastName}";
            notification.SenderAvatar = sender.AvatarUrl;
            
            if (string.IsNullOrEmpty(createDto.UserId))
            {
                // TODO: 发送给所有用户的逻辑
                return BadRequest("目前不支持发送给所有用户");
            }
            
            notification.UserId = createDto.UserId;
            
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetNotification), new { id = notification.Id }, 
                _mapper.Map<NotificationDTO>(notification));
        }
        
        // GET: api/notifications/public
        [HttpGet("public")]
        [AllowAnonymous]
        public async Task<ActionResult<NotificationListDTO>> GetPublicNotifications(
            [FromQuery] int limit = 5)
        {
            try 
            {
                _logger.LogInformation("获取公共通知，限制数量: {Limit}", limit);
                
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
                
                _logger.LogInformation("返回 {Count} 条公共通知", result.TotalCount);
                return Ok(result);
            }
            catch (Exception ex)
            {
                // 记录错误
                _logger.LogError(ex, "获取公共通知错误: {Message}", ex.Message);
                return StatusCode(500, new { message = "获取公共通知时发生错误", error = ex.Message });
            }
        }
        
        // DELETE: api/notifications
        [HttpDelete]
        public async Task<IActionResult> DeleteAllNotifications()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .ToListAsync();
                
            if (notifications.Any())
            {
                _context.Notifications.RemoveRange(notifications);
                await _context.SaveChangesAsync();
            }
            
            return NoContent();
        }
    }
} 