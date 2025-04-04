using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.Models;
using OnlineLearningSystem.API.Models.Constants;
using OnlineLearningSystem.API.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using OnlineLearningSystem.API.DTOs;

namespace OnlineLearningSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FeedbackController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IRecommendationService _recommendationService;
        private readonly ILogger<FeedbackController> _logger;
        private readonly UserManager<ApplicationUser> _userManager;
        
        public FeedbackController(
            ApplicationDbContext context, 
            IMapper mapper,
            IRecommendationService recommendationService,
            ILogger<FeedbackController> logger,
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _mapper = mapper;
            _recommendationService = recommendationService;
            _logger = logger;
            _userManager = userManager;
        }
        
        /// <summary>
        /// 获取用户的反馈列表
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<PaginatedResult<FeedbackDTO>>> GetFeedbacks(
            [FromQuery] string status = null,
            [FromQuery] string type = null,
            [FromQuery] string priority = null,
            [FromQuery] bool onlyMine = false,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string sortBy = "createdAt",
            [FromQuery] bool descending = true)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var isAdmin = User.IsInRole("Admin");
                var isTeacher = User.IsInRole("Teacher");

                IQueryable<Feedback> query = _context.Feedbacks
                    .Include(f => f.Student)
                    .Include(f => f.AssignedTo)
                    .Include(f => f.Course)
                    .Include(f => f.Material)
                    .AsQueryable();

                // 根据用户角色进行过滤
                if (!isAdmin && !isTeacher)
                {
                    // 学生只能看到自己的反馈
                    query = query.Where(f => f.StudentId == userId);
                }
                else if (onlyMine && isTeacher)
                {
                    // 教师可以选择只看分配给自己的反馈
                    query = query.Where(f => f.AssignedToId == userId);
                }

                // 应用过滤条件
                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(f => f.Status == status);
                }

                if (!string.IsNullOrEmpty(type))
                {
                    query = query.Where(f => f.FeedbackType == type);
                }

                if (!string.IsNullOrEmpty(priority))
                {
                    query = query.Where(f => f.Priority == priority);
                }
                
                // 应用排序
                query = ApplySorting(query, sortBy, descending);

                // 计算总记录数
                var totalCount = await query.CountAsync();

                // 应用分页
                var feedbacks = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                // 转换为DTO
                var feedbackDTOs = feedbacks.Select(f => new FeedbackDTO
                {
                    Id = f.Id,
                    Title = f.Title,
                    Content = f.Content,
                    FeedbackType = f.FeedbackType,
                    Status = f.Status,
                    Priority = f.Priority,
                    CourseId = f.CourseId,
                    CourseName = f.Course?.Title,
                    MaterialId = f.MaterialId,
                    MaterialTitle = f.Material?.Title,
                    StudentId = f.StudentId,
                    StudentName = f.Student?.UserName,
                    AssignedToId = f.AssignedToId,
                    AssignedToName = f.AssignedTo?.UserName,
                    CreatedAt = f.CreatedAt,
                    UpdatedAt = f.UpdatedAt,
                    ResolvedAt = f.ResolvedAt
                }).ToList();

                // 返回分页结果
                return new PaginatedResult<FeedbackDTO>
                {
                    Items = feedbackDTOs,
                    TotalCount = totalCount,
                    CurrentPage = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取反馈列表时发生错误");
                return StatusCode(500, new { 
                    success = false, 
                    message = "获取反馈列表失败，服务器内部错误" 
                });
            }
        }
        
        // 辅助方法：应用排序
        private IQueryable<Feedback> ApplySorting(IQueryable<Feedback> query, string sortBy, bool descending)
        {
            switch (sortBy?.ToLower())
            {
                case "title":
                    return descending ? query.OrderByDescending(f => f.Title) : query.OrderBy(f => f.Title);
                case "status":
                    return descending ? query.OrderByDescending(f => f.Status) : query.OrderBy(f => f.Status);
                case "type":
                case "feedbacktype":
                    return descending ? query.OrderByDescending(f => f.FeedbackType) : query.OrderBy(f => f.FeedbackType);
                case "priority":
                    return descending ? query.OrderByDescending(f => f.Priority) : query.OrderBy(f => f.Priority);
                case "updatedat":
                    return descending ? query.OrderByDescending(f => f.UpdatedAt) : query.OrderBy(f => f.UpdatedAt);
                case "resolvedat":
                    return descending ? query.OrderByDescending(f => f.ResolvedAt) : query.OrderBy(f => f.ResolvedAt);
                case "createdat":
                default:
                    return descending ? query.OrderByDescending(f => f.CreatedAt) : query.OrderBy(f => f.CreatedAt);
            }
        }
        
        /// <summary>
        /// 获取单个反馈详情，包括回复
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<FeedbackDetailDTO>> GetFeedback(int id)
        {
            var userId = _userManager.GetUserId(User);
            var isAdmin = User.IsInRole("Admin");
            var isTeacher = User.IsInRole("Teacher");

            var feedback = await _context.Feedbacks
                .Include(f => f.Student)
                .Include(f => f.AssignedTo)
                .Include(f => f.Course)
                .Include(f => f.Material)
                .Include(f => f.Replies)
                .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (feedback == null)
            {
                return NotFound();
            }

            // 检查权限：只有管理员、教师或者反馈的创建者可以查看反馈详情
            if (!isAdmin && !isTeacher && feedback.StudentId != userId)
            {
                return Forbid();
            }

            // 获取附件列表
            var attachments = await _context.FeedbackAttachments
                .Where(a => a.FeedbackId == id && a.ReplyId == null)
                .Select(a => new AttachmentDTO
                {
                    Id = a.Id,
                    FileName = a.FileName,
                    FileSize = a.FileSize,
                    ContentType = a.ContentType,
                    UploadedAt = a.UploadedAt
                })
                .ToListAsync();

            // 获取回复列表，并过滤内部回复（学生不能看到内部回复）
            var replies = feedback.Replies
                .Where(r => isAdmin || isTeacher || !r.IsInternal)
                .Select(r => new FeedbackReplyDTO
                {
                    Id = r.Id,
                    Content = r.Content,
                    CreatedAt = r.CreatedAt,
                    IsFromTeacher = r.IsFromTeacher,
                    UserId = r.UserId,
                    UserName = r.User?.UserName ?? r.UserName,
                    IsSystemMessage = r.IsSystemMessage,
                    IsInternal = r.IsInternal,
                    Attachments = _context.FeedbackAttachments
                        .Where(a => a.ReplyId == r.Id)
                        .Select(a => new AttachmentDTO
                        {
                            Id = a.Id,
                            FileName = a.FileName,
                            FileSize = a.FileSize,
                            ContentType = a.ContentType,
                            UploadedAt = a.UploadedAt
                        })
                        .ToList()
                })
                .ToList();

            // 获取学习建议
            var recommendations = await _context.LearningRecommendations
                .Where(r => r.FeedbackId == id)
                .Select(r => new DTOs.LearningRecommendationDTO
                {
                    Id = r.Id,
                    ResourceType = r.RecommendationType,
                    ResourceId = r.MaterialId.HasValue ? r.MaterialId.ToString() : 
                               r.CourseId.HasValue ? r.CourseId.ToString() : 
                               r.KnowledgeNodeId.HasValue ? r.KnowledgeNodeId.ToString() : "",
                    ResourceTitle = r.Title,
                    Reason = r.Content,
                    CreatedAt = r.CreatedAt,
                    IsSystemGenerated = r.IsFromAI
                })
                .ToListAsync();

            // 转换为详细DTO
            var feedbackDTO = new FeedbackDetailDTO
            {
                Id = feedback.Id,
                Title = feedback.Title,
                Content = feedback.Content,
                FeedbackType = feedback.FeedbackType,
                Status = feedback.Status,
                Priority = feedback.Priority,
                CourseId = feedback.CourseId,
                CourseName = feedback.Course?.Title,
                MaterialId = feedback.MaterialId,
                MaterialTitle = feedback.Material?.Title,
                StudentId = feedback.StudentId,
                StudentName = feedback.Student?.UserName,
                AssignedToId = feedback.AssignedToId,
                AssignedToName = feedback.AssignedTo?.UserName,
                CreatedAt = feedback.CreatedAt,
                UpdatedAt = feedback.UpdatedAt,
                ResolvedAt = feedback.ResolvedAt,
                Attachments = attachments.Select(a => new FeedbackAttachmentDTO
                {
                    Id = a.Id,
                    FileName = a.FileName,
                    FileSize = a.FileSize,
                    FileType = a.ContentType,
                    FileUrl = a.Id.ToString()
                }).ToList(),
                Replies = replies,
                Recommendations = recommendations
            };

            return feedbackDTO;
        }
        
        /// <summary>
        /// 创建新反馈
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<FeedbackDTO>> CreateFeedback([FromBody] CreateFeedbackDTO createFeedbackDTO)
        {
            var userId = _userManager.GetUserId(User);
            var now = DateTime.UtcNow;

            // 验证课程ID或材料ID是否存在
            if (createFeedbackDTO.CourseId.HasValue)
            {
                var course = await _context.Courses.FindAsync(createFeedbackDTO.CourseId.Value);
                if (course == null)
                {
                    return BadRequest("指定的课程不存在");
                }
            }

            if (createFeedbackDTO.MaterialId.HasValue)
            {
                var material = await _context.Materials.FindAsync(createFeedbackDTO.MaterialId.Value);
                if (material == null)
                {
                    return BadRequest("指定的学习材料不存在");
                }
            }

            // 创建新的反馈
            var feedback = new Feedback
            {
                Title = createFeedbackDTO.Title,
                Content = createFeedbackDTO.Content,
                FeedbackType = createFeedbackDTO.FeedbackType,
                Status = "待处理", // 初始状态
                Priority = createFeedbackDTO.Priority ?? "Normal",
                CourseId = createFeedbackDTO.CourseId,
                MaterialId = createFeedbackDTO.MaterialId,
                StudentId = userId,
                CreatedAt = now,
                UpdatedAt = now
            };

            // 自动分配给教师（如果有关联课程）
            if (createFeedbackDTO.CourseId.HasValue)
            {
                var courseTeacher = await _context.CourseTeachers
                    .Where(ct => ct.CourseId == createFeedbackDTO.CourseId.Value)
                    .Select(ct => ct.TeacherId)
                    .FirstOrDefaultAsync();

                if (!string.IsNullOrEmpty(courseTeacher))
                {
                    feedback.AssignedToId = courseTeacher;
                }
            }

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            // 添加系统通知消息
            var systemReply = new FeedbackReply
            {
                Content = "反馈已提交，我们将尽快处理。",
                IsFromTeacher = false,
                IsSystemMessage = true,
                UserId = userId, // 使用系统账号
                FeedbackId = feedback.Id,
                CreatedAt = now,
                UserName = "系统"
            };

            _context.FeedbackReplies.Add(systemReply);
            await _context.SaveChangesAsync();

            // 生成个性化学习建议
            if (User.IsInRole("Student"))
            {
                var recommendations = await _recommendationService.GenerateRecommendationsAsync(
                    userId, 
                    feedback.Id, 
                    createFeedbackDTO.FeedbackType, 
                    createFeedbackDTO.Content,
                    createFeedbackDTO.CourseId ?? 0
                );

                if (recommendations.Any())
                {
                    _context.LearningRecommendations.AddRange(recommendations);
                    await _context.SaveChangesAsync();
                }
            }

            // 返回创建的反馈信息
            return CreatedAtAction(
                nameof(GetFeedback),
                new { id = feedback.Id },
                new FeedbackDTO
                {
                    Id = feedback.Id,
                    Title = feedback.Title,
                    Content = feedback.Content,
                    FeedbackType = feedback.FeedbackType,
                    Status = feedback.Status,
                    Priority = feedback.Priority,
                    CourseId = feedback.CourseId,
                    MaterialId = feedback.MaterialId,
                    StudentId = feedback.StudentId,
                    AssignedToId = feedback.AssignedToId,
                    CreatedAt = feedback.CreatedAt,
                    UpdatedAt = feedback.UpdatedAt
                }
            );
        }
        
        /// <summary>
        /// 更新反馈状态
        /// </summary>
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> UpdateStatus(
            int id, 
            [FromBody] UpdateStatusDTO updateDTO)
        {
            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null)
            {
                return NotFound();
            }

            var oldStatus = feedback.Status;
            feedback.Status = updateDTO.Status;
            feedback.UpdatedAt = DateTime.UtcNow;

            // 如果状态变为"已解决"，记录解决时间
            if (updateDTO.Status == "已解决" && feedback.ResolvedAt == null)
            {
                feedback.ResolvedAt = DateTime.UtcNow;
            }

            // 添加状态变更系统消息
            if (oldStatus != updateDTO.Status)
            {
                var userId = _userManager.GetUserId(User);
                var statusChangeReply = new FeedbackReply
                {
                    Content = $"反馈状态从\"{oldStatus}\"变更为\"{updateDTO.Status}\"",
                    CreatedAt = DateTime.UtcNow,
                    IsFromTeacher = true,
                    IsSystemMessage = true,
                    UserId = userId,
                    UserName = "系统",
                    FeedbackId = id
                };
                _context.FeedbackReplies.Add(statusChangeReply);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        
        /// <summary>
        /// 更新反馈优先级
        /// </summary>
        [HttpPut("{id}/priority")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> UpdateFeedbackPriority(int id, [FromBody] UpdateFeedbackPriorityDTO updateDto)
        {
            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null)
            {
                return NotFound("找不到指定的反馈");
            }

            feedback.Priority = updateDto.Priority;
            feedback.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new { message = "反馈优先级已更新" });
        }

        /// <summary>
        /// 添加回复到反馈
        /// </summary>
        [HttpPost("{id}/reply")]
        public async Task<ActionResult<FeedbackReplyDTO>> AddReply(
            int id, 
            [FromBody] AddReplyDTO addReplyDTO)
        {
            var userId = _userManager.GetUserId(User);
            var isTeacher = User.IsInRole("Teacher") || User.IsInRole("Admin");

            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null)
            {
                return NotFound();
            }

            // 检查权限：只有创建者或者管理员/教师可以回复
            if (feedback.StudentId != userId && !isTeacher)
            {
                return Forbid();
            }

            // 如果是内部回复，只有教师或管理员可以创建
            if (addReplyDTO.IsInternal && !isTeacher)
            {
                return Forbid();
            }

            var user = await _userManager.FindByIdAsync(userId);
            
            // 创建新回复
            var reply = new FeedbackReply
            {
                Content = addReplyDTO.Content,
                CreatedAt = DateTime.UtcNow,
                IsFromTeacher = isTeacher,
                IsSystemMessage = false,
                IsInternal = addReplyDTO.IsInternal,
                UserId = userId,
                UserName = user?.UserName,
                FeedbackId = id
            };

            _context.FeedbackReplies.Add(reply);

            // 更新反馈状态（如果指定）
            if (!string.IsNullOrEmpty(addReplyDTO.NewStatus) && isTeacher)
            {
                var oldStatus = feedback.Status;
                feedback.Status = addReplyDTO.NewStatus;
                feedback.UpdatedAt = DateTime.UtcNow;

                // 如果状态变为"已解决"，记录解决时间
                if (addReplyDTO.NewStatus == "已解决" && feedback.ResolvedAt == null)
                {
                    feedback.ResolvedAt = DateTime.UtcNow;
                }

                // 添加状态变更系统消息
                if (oldStatus != addReplyDTO.NewStatus)
                {
                    var statusChangeReply = new FeedbackReply
                    {
                        Content = $"反馈状态从\"{oldStatus}\"变更为\"{addReplyDTO.NewStatus}\"",
                        CreatedAt = DateTime.UtcNow,
                        IsFromTeacher = true,
                        IsSystemMessage = true,
                        UserId = userId,
                        UserName = "系统",
                        FeedbackId = id
                    };
                    _context.FeedbackReplies.Add(statusChangeReply);
                }
            }

            await _context.SaveChangesAsync();

            // 返回创建的回复
            return CreatedAtAction(
                nameof(GetFeedback),
                new { id = feedback.Id },
                new FeedbackReplyDTO
                {
                    Id = reply.Id,
                    Content = reply.Content,
                    CreatedAt = reply.CreatedAt,
                    IsFromTeacher = reply.IsFromTeacher,
                    IsSystemMessage = reply.IsSystemMessage,
                    IsInternal = reply.IsInternal,
                    UserId = reply.UserId,
                    UserName = reply.UserName
                }
            );
        }

        /// <summary>
        /// 获取反馈的回复列表
        /// </summary>
        [HttpGet("{id}/replies")]
        public async Task<IActionResult> GetReplies(int id, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null)
            {
                return NotFound("找不到指定的反馈");
            }

            // 验证权限
            if (User.IsInRole("Student"))
            {
                var currentUserId = User.FindFirst("sub")?.Value;
                if (currentUserId != feedback.StudentId)
                {
                    return Forbid(); // 学生只能查看自己的反馈回复
                }
            }

            // 获取回复，按时间降序排列
            var query = _context.FeedbackReplies
                .Where(r => r.FeedbackId == id)
                .OrderByDescending(r => r.CreatedAt);

            // 计算总数
            var totalCount = await query.CountAsync();

            // 应用分页
            var replies = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // 转换为DTO
            var replyDtos = replies.Select(r => new FeedbackReplyDTO
            {
                Id = r.Id,
                Content = r.Content,
                CreatedAt = r.CreatedAt,
                UserId = r.UserId,
                UserName = r.UserName,
                IsFromTeacher = r.IsFromTeacher
            }).ToList();

            return Ok(new PaginatedResult<FeedbackReplyDTO>
            {
                Items = replyDtos,
                TotalCount = totalCount,
                PageSize = pageSize,
                CurrentPage = page,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        /// <summary>
        /// 获取反馈相关的学习推荐
        /// </summary>
        [HttpGet("{id}/recommendations")]
        public async Task<IActionResult> GetRecommendations(int id)
        {
            var feedback = await _context.Feedbacks
                .Include(f => f.Recommendations)
                .FirstOrDefaultAsync(f => f.Id == id);
                
            if (feedback == null)
            {
                return NotFound("找不到指定的反馈");
            }

            // 验证权限
            if (User.IsInRole("Student"))
            {
                var currentUserId = User.FindFirst("sub")?.Value;
                if (currentUserId != feedback.StudentId)
                {
                    return Forbid(); // 学生只能查看自己的推荐
                }
            }

            // 转换为DTO
            var recommendationDtos = feedback.Recommendations.Select(r => new DTOs.LearningRecommendationDTO
            {
                Id = r.Id,
                ResourceType = r.RecommendationType,
                ResourceId = r.MaterialId.HasValue ? r.MaterialId.ToString() : 
                           r.CourseId.HasValue ? r.CourseId.ToString() : 
                           r.KnowledgeNodeId.HasValue ? r.KnowledgeNodeId.ToString() : "",
                ResourceTitle = r.Title,
                Reason = r.Content,
                CreatedAt = r.CreatedAt,
                IsSystemGenerated = r.IsFromAI
            }).ToList();

            return Ok(recommendationDtos);
        }

        /// <summary>
        /// 获取反馈统计数据
        /// </summary>
        [HttpGet("stats")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult<FeedbackStatsDTO>> GetStatistics(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var query = _context.Feedbacks.AsQueryable();

            // 应用日期过滤
            if (startDate.HasValue)
            {
                query = query.Where(f => f.CreatedAt >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(f => f.CreatedAt <= endDate.Value);
            }

            // 获取总数
            var totalCount = await query.CountAsync();

            // 按状态分组
            var byStatus = await query
                .GroupBy(f => f.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            // 按类型分组
            var byType = await query
                .GroupBy(f => f.FeedbackType)
                .Select(g => new { Type = g.Key, Count = g.Count() })
                .ToListAsync();

            // 计算平均解决时间
            var resolvedFeedbacks = await query
                .Where(f => f.ResolvedAt != null)
                .Select(f => new { 
                    ResolutionTime = (f.ResolvedAt.Value - f.CreatedAt).TotalHours 
                })
                .ToListAsync();

            double? avgResolutionTime = null;
            if (resolvedFeedbacks.Any())
            {
                avgResolutionTime = resolvedFeedbacks.Average(f => f.ResolutionTime);
            }

            // 每日新增反馈
            var dailyCount = await query
                .GroupBy(f => f.CreatedAt.Date)
                .Select(g => new { 
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            return new FeedbackStatsDTO
            {
                TotalCount = totalCount,
                ByStatus = byStatus.ToDictionary(x => x.Status, x => x.Count),
                ByType = byType.ToDictionary(x => x.Type, x => x.Count),
                AverageResolutionTimeHours = avgResolutionTime,
                DailyStats = dailyCount.Select(d => new DailyStatDTO 
                {
                    Date = d.Date,
                    Count = d.Count
                }).ToList()
            };
        }

        /// <summary>
        /// 获取反馈趋势数据
        /// </summary>
        [HttpGet("trends")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> GetTrends([FromQuery] FeedbackTrendsParams queryParams)
        {
            // 验证日期范围
            if (!queryParams.StartDate.HasValue || !queryParams.EndDate.HasValue)
            {
                return BadRequest("必须提供开始日期和结束日期");
            }

            var startDate = queryParams.StartDate.Value.Date;
            var endDate = queryParams.EndDate.Value.Date.AddDays(1).AddSeconds(-1);
            
            // 确保日期范围不超过3个月
            if ((endDate - startDate).TotalDays > 92)
            {
                return BadRequest("日期范围不能超过3个月");
            }

            IQueryable<Feedback> query = _context.Feedbacks
                .Where(f => f.CreatedAt >= startDate && f.CreatedAt <= endDate);

            // 应用课程筛选
            if (queryParams.CourseId.HasValue)
            {
                query = query.Where(f => f.CourseId == queryParams.CourseId);
            }

            // 根据时间间隔选择分组方式
            string groupFormat;
            if ((endDate - startDate).TotalDays <= 7)
            {
                // 如果是一周内，按天分组
                groupFormat = "yyyy-MM-dd";
            }
            else if ((endDate - startDate).TotalDays <= 31)
            {
                // 如果是一个月内，按天分组
                groupFormat = "yyyy-MM-dd";
            }
            else
            {
                // 如果是更长时间，按周分组
                groupFormat = "yyyy-'W'ww"; // 按年-周
            }

            // 获取反馈创建趋势
            var creationTrend = await query
                .GroupBy(f => f.CreatedAt.ToString(groupFormat))
                .Select(g => new 
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(g => g.Date)
                .ToListAsync();

            // 获取反馈解决趋势（通过系统消息记录的状态变更）
            var resolutionTrend = await _context.FeedbackReplies
                .Where(r => r.IsSystemMessage && 
                           r.Content.Contains(FeedbackStatusConstants.Resolved) &&
                           r.CreatedAt >= startDate && r.CreatedAt <= endDate)
                .GroupBy(r => r.CreatedAt.ToString(groupFormat))
                .Select(g => new 
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(g => g.Date)
                .ToListAsync();

            // 获取按类型分组的趋势
            var typeTrend = await query
                .GroupBy(f => new { Period = f.CreatedAt.ToString(groupFormat), Type = f.FeedbackType })
                .Select(g => new 
                {
                    Date = g.Key.Period,
                    Type = g.Key.Type,
                    Count = g.Count()
                })
                .OrderBy(g => g.Date)
                .ThenBy(g => g.Type)
                .ToListAsync();

            // 构建返回结果
            var trends = new FeedbackTrendsDTO
            {
                DateLabels = creationTrend.Select(c => c.Date).Distinct().OrderBy(d => d).ToList(),
                CreationTrend = creationTrend.Select(c => new TrendDataPoint
                {
                    Date = c.Date,
                    Value = c.Count
                }).ToList(),
                ResolutionTrend = resolutionTrend.Select(r => new TrendDataPoint
                {
                    Date = r.Date,
                    Value = r.Count
                }).ToList(),
                TypeTrends = typeTrend
                    .GroupBy(t => t.Type)
                    .Select(g => new TypeTrendSeries 
                    {
                        Type = g.Key,
                        Data = g.Select(p => new TrendDataPoint 
                        {
                            Date = p.Date,
                            Value = p.Count
                        }).ToList()
                    }).ToList()
            };

            return Ok(trends);
        }

        // POST: api/feedback/{id}/attachments
        [HttpPost("{id}/attachments")]
        public async Task<ActionResult<AttachmentDTO>> UploadAttachment(
            int id, 
            [FromForm] IFormFile file,
            [FromForm] int? replyId = null)
        {
            var userId = _userManager.GetUserId(User);
            var isTeacher = User.IsInRole("Teacher") || User.IsInRole("Admin");

            // 检查反馈是否存在
            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null)
            {
                return NotFound("反馈不存在");
            }

            // 检查权限
            if (feedback.StudentId != userId && !isTeacher)
            {
                return Forbid();
            }

            // 如果是回复附件，检查回复是否存在以及权限
            if (replyId.HasValue)
            {
                var reply = await _context.FeedbackReplies
                    .FirstOrDefaultAsync(r => r.Id == replyId.Value && r.FeedbackId == id);
                
                if (reply == null)
                {
                    return NotFound("回复不存在");
                }

                // 只有回复的创建者可以添加附件
                if (reply.UserId != userId)
                {
                    return Forbid();
                }
            }

            // 检查文件
            if (file == null || file.Length == 0)
            {
                return BadRequest("未提供有效的文件");
            }

            // 检查文件大小（限制为10MB）
            if (file.Length > 10 * 1024 * 1024)
            {
                return BadRequest("文件大小超过限制（最大10MB）");
            }

            // 检查文件类型（可以根据需要调整允许的文件类型）
            var allowedTypes = new[] { "image/jpeg", "image/png", "application/pdf", "text/plain" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
            {
                return BadRequest("不支持的文件类型");
            }

            // 保存文件
            var fileName = Path.GetFileName(file.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var uploadPath = Path.Combine("Uploads", "Feedback", uniqueFileName);
            var directory = Path.GetDirectoryName(uploadPath);
            
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            using (var stream = new FileStream(uploadPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 创建附件记录
            var attachment = new FeedbackAttachment
            {
                FileName = fileName,
                StoredFileName = uniqueFileName,
                FilePath = uploadPath,
                FileSize = file.Length,
                ContentType = file.ContentType,
                UploadedAt = DateTime.UtcNow,
                UploadedById = userId,
                FeedbackId = id,
                ReplyId = replyId
            };

            _context.FeedbackAttachments.Add(attachment);
            await _context.SaveChangesAsync();

            // 返回附件信息
            return CreatedAtAction(
                nameof(GetFeedback),
                new { id = feedback.Id },
                new AttachmentDTO
                {
                    Id = attachment.Id,
                    FileName = attachment.FileName,
                    FileSize = attachment.FileSize,
                    ContentType = attachment.ContentType,
                    UploadedAt = attachment.UploadedAt
                }
            );
        }

        // GET: api/feedback/attachments/{id}
        [HttpGet("attachments/{id}")]
        public async Task<IActionResult> DownloadAttachment(int id)
        {
            var userId = _userManager.GetUserId(User);
            var isTeacher = User.IsInRole("Teacher") || User.IsInRole("Admin");

            // 查找附件
            var attachment = await _context.FeedbackAttachments
                .Include(a => a.Feedback)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attachment == null)
            {
                return NotFound();
            }

            // 检查权限：只有管理员、教师或者反馈的创建者可以下载附件
            if (!isTeacher && attachment.Feedback.StudentId != userId)
            {
                return Forbid();
            }

            // 检查文件是否存在
            if (!System.IO.File.Exists(attachment.FilePath))
            {
                return NotFound("附件文件不存在");
            }

            // 返回文件
            var memory = new MemoryStream();
            using (var stream = new FileStream(attachment.FilePath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            return File(memory, attachment.ContentType, attachment.FileName);
        }

        /// <summary>
        /// 获取所有反馈类型
        /// </summary>
        [HttpGet("types")]
        [AllowAnonymous]
        public ActionResult<IEnumerable<string>> GetFeedbackTypes()
        {
            try
            {
                _logger.LogInformation("获取反馈类型列表");
                return Ok(FeedbackTypeConstants.AllTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取反馈类型时出错");
                return StatusCode(500, new { message = "获取反馈类型列表失败", error = ex.Message });
            }
        }
        
        /// <summary>
        /// 获取所有反馈状态
        /// </summary>
        [HttpGet("statuses")]
        [AllowAnonymous]
        public ActionResult<IEnumerable<string>> GetFeedbackStatuses()
        {
            try
            {
                _logger.LogInformation("获取反馈状态列表");
                return Ok(FeedbackStatusConstants.AllStatuses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取反馈状态时出错");
                return StatusCode(500, new { message = "获取反馈状态列表失败", error = ex.Message });
            }
        }
        
        /// <summary>
        /// 获取所有反馈优先级
        /// </summary>
        [HttpGet("priorities")]
        [AllowAnonymous]
        public ActionResult<IEnumerable<string>> GetFeedbackPriorities()
        {
            try
            {
                _logger.LogInformation("获取反馈优先级列表");
                return Ok(FeedbackPriorityConstants.AllPriorities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "获取反馈优先级时出错");
                return StatusCode(500, new { message = "获取反馈优先级列表失败", error = ex.Message });
            }
        }
    }
    
    public class FeedbackFilterParams
    {
        public string UserId { get; set; }
        public string Status { get; set; }
        public string FeedbackType { get; set; }
        public int? CourseId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Priority { get; set; }
        public string SortBy { get; set; }
        public int? PageNumber { get; set; }
        public int? PageSize { get; set; }
    }
    
    public class PaginatedResult<T>
    {
        public List<T> Items { get; set; }
        public int TotalCount { get; set; }
        public int PageSize { get; set; }
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
    }
    
    public class FeedbackDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Status { get; set; }
        public string Priority { get; set; }
        public string FeedbackType { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string StudentId { get; set; }
        public string StudentName { get; set; }
        public int? CourseId { get; set; }
        public string CourseName { get; set; }
        public int? MaterialId { get; set; }
        public string MaterialTitle { get; set; }
        public string AssignedToId { get; set; }
        public string AssignedToName { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }
    
    public class FeedbackDetailDTO : FeedbackDTO
    {
        public List<FeedbackReplyDTO> Replies { get; set; }
        public List<FeedbackAttachmentDTO> Attachments { get; set; }
        public List<DTOs.LearningRecommendationDTO> Recommendations { get; set; }
    }
    
    public class FeedbackReplyDTO
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public bool IsFromTeacher { get; set; }
        public bool IsSystemMessage { get; set; }
        public bool IsInternal { get; set; }
        public List<AttachmentDTO> Attachments { get; set; }
    }
    
    public class FeedbackAttachmentDTO
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public string FileUrl { get; set; }
        public string FileType { get; set; }
        public long FileSize { get; set; }
    }
    
    public class LearningRecommendationDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string RecommendationType { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsFromAI { get; set; }
        public int? CourseId { get; set; }
        public int? MaterialId { get; set; }
    }
    
    public class CreateFeedbackDTO
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public string FeedbackType { get; set; }
        public string Priority { get; set; }
        public int? CourseId { get; set; }
        public int? MaterialId { get; set; }
        public List<CreateFeedbackAttachmentDTO> Attachments { get; set; }
    }
    
    public class CreateFeedbackAttachmentDTO
    {
        public string FileName { get; set; }
        public string FileUrl { get; set; }
        public string FileType { get; set; }
        public long FileSize { get; set; }
    }
    
    public class UpdateFeedbackStatusDTO
    {
        public string Status { get; set; }
        public string StatusNote { get; set; }
    }
    
    public class UpdateFeedbackPriorityDTO
    {
        public string Priority { get; set; }
    }

    public class CreateFeedbackReplyDTO
    {
        public string Content { get; set; }
        public bool MarkAsResolved { get; set; } = false;
    }

    public class FeedbackStatisticsParams
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? CourseId { get; set; }
    }

    public class FeedbackTrendsParams
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? CourseId { get; set; }
    }

    public class FeedbackStatisticsDTO
    {
        public int TotalCount { get; set; }
        public List<StatisticsItem> StatusStatistics { get; set; }
        public List<StatisticsItem> TypeStatistics { get; set; }
        public List<StatisticsItem> PriorityStatistics { get; set; }
        public double AverageResponseTimeHours { get; set; }
        public double AverageResolutionTimeHours { get; set; }
        public double SatisfactionRate { get; set; }
    }

    public class StatisticsItem
    {
        public string Label { get; set; }
        public int Count { get; set; }
    }

    public class FeedbackTrendsDTO
    {
        public List<string> DateLabels { get; set; }
        public List<TrendDataPoint> CreationTrend { get; set; }
        public List<TrendDataPoint> ResolutionTrend { get; set; }
        public List<TypeTrendSeries> TypeTrends { get; set; }
    }

    public class TrendDataPoint
    {
        public string Date { get; set; }
        public int Value { get; set; }
    }

    public class TypeTrendSeries
    {
        public string Type { get; set; }
        public List<TrendDataPoint> Data { get; set; }
    }

    public class UpdateStatusDTO
    {
        public string Status { get; set; }
    }

    public class FeedbackStatsDTO
    {
        public int TotalCount { get; set; }
        public Dictionary<string, int> ByStatus { get; set; }
        public Dictionary<string, int> ByType { get; set; }
        public double? AverageResolutionTimeHours { get; set; }
        public List<DailyStatDTO> DailyStats { get; set; }
    }

    public class DailyStatDTO
    {
        public DateTime Date { get; set; }
        public int Count { get; set; }
    }

    public class AddReplyDTO
    {
        public string Content { get; set; }
        public bool IsInternal { get; set; }
        public string NewStatus { get; set; }
    }
} 