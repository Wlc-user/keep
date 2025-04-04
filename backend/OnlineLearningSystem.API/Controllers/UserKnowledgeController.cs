using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.DTOs;
using OnlineLearningSystem.API.Models;
using OnlineLearningSystem.API.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Query;

namespace OnlineLearningSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserKnowledgeController : ControllerBase
    {
        private readonly IKnowledgeGraphService _knowledgeService;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        
        public UserKnowledgeController(
            IKnowledgeGraphService knowledgeService,
            ApplicationDbContext context,
            IMapper mapper)
        {
            _knowledgeService = knowledgeService;
            _context = context;
            _mapper = mapper;
        }
        
        /// <summary>
        /// 获取用户在所有知识点上的掌握状态
        /// </summary>
        [HttpGet("states")]
        public async Task<ActionResult<IEnumerable<UserKnowledgeStateDTO>>> GetUserKnowledgeStates([FromQuery] int? graphId = null)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            IQueryable<UserKnowledgeState> query = _context.UserKnowledgeStates
                .Where(s => s.UserId == userId)
                .Include(s => s.KnowledgeNode);
                
            // 根据图谱ID筛选
            if (graphId.HasValue)
            {
                query = query.Where(s => s.KnowledgeNode.GraphId == graphId.Value);
            }
            
            var states = await query.ToListAsync();
            
            return Ok(_mapper.Map<IEnumerable<UserKnowledgeStateDTO>>(states));
        }
        
        /// <summary>
        /// 获取特定知识点的掌握状态
        /// </summary>
        [HttpGet("states/{nodeId}")]
        public async Task<ActionResult<UserKnowledgeStateDTO>> GetUserKnowledgeState(int nodeId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            var state = await _knowledgeService.GetUserKnowledgeStateAsync(userId, nodeId);
            
            if (state == null)
            {
                return NotFound();
            }
            
            return Ok(_mapper.Map<UserKnowledgeStateDTO>(state));
        }
        
        /// <summary>
        /// 更新用户的知识点掌握状态
        /// </summary>
        [HttpPost("states/{nodeId}")]
        public async Task<IActionResult> UpdateUserKnowledgeState(int nodeId, [FromBody] UpdateKnowledgeStateDTO updateDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            // 检查知识点是否存在
            var node = await _context.KnowledgeNodes.FindAsync(nodeId);
            if (node == null)
            {
                return NotFound(new { Message = "知识点不存在" });
            }
            
            // 更新掌握状态
            await _knowledgeService.UpdateUserKnowledgeStateAsync(userId, nodeId, updateDto.MasteryLevel);
            
            return NoContent();
        }
        
        /// <summary>
        /// 获取用户在某课程的知识图谱掌握总体情况
        /// </summary>
        [HttpGet("summary")]
        public async Task<ActionResult<KnowledgeSummaryDTO>> GetUserKnowledgeSummary([FromQuery] int? courseId = null, [FromQuery] int? graphId = null)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            // 构建查询条件
            var nodesQuery = _context.KnowledgeNodes.AsQueryable();
            
            if (graphId.HasValue)
            {
                nodesQuery = nodesQuery.Where(n => n.GraphId == graphId.Value);
            }
            else if (courseId.HasValue)
            {
                nodesQuery = nodesQuery.Where(n => n.Graph.CourseId == courseId.Value);
            }
            
            // 获取符合条件的所有知识点
            var nodes = await nodesQuery.ToListAsync();
            
            if (!nodes.Any())
            {
                return NotFound(new { Message = "未找到相关知识点" });
            }
            
            // 获取用户在这些知识点上的掌握状态
            var nodeIds = nodes.Select(n => n.Id).ToList();
            var states = await _context.UserKnowledgeStates
                .Where(s => s.UserId == userId && nodeIds.Contains(s.KnowledgeNodeId))
                .ToListAsync();
                
            // 计算总体掌握情况
            var totalNodes = nodes.Count;
            var masteredNodes = states.Count(s => s.MasteryLevel >= 80);
            var partiallyMasteredNodes = states.Count(s => s.MasteryLevel >= 50 && s.MasteryLevel < 80);
            var weakNodes = states.Count(s => s.MasteryLevel > 0 && s.MasteryLevel < 50);
            var untestedNodes = totalNodes - states.Count;
            
            // 按难度级别分组统计
            var byDifficulty = nodes
                .GroupBy(n => n.DifficultyLevel)
                .Select(g => new DifficultyLevelStatDTO
                {
                    Level = g.Key,
                    TotalCount = g.Count(),
                    MasteredCount = states.Count(s => s.MasteryLevel >= 80 && g.Any(n => n.Id == s.KnowledgeNodeId)),
                    CompletionPercentage = (int)(states.Count(s => s.MasteryLevel > 0 && g.Any(n => n.Id == s.KnowledgeNodeId)) * 100.0 / g.Count())
                })
                .OrderBy(d => d.Level)
                .ToList();
                
            // 构建知识掌握总体情况
            var summary = new KnowledgeSummaryDTO
            {
                TotalNodes = totalNodes,
                MasteredNodes = masteredNodes,
                PartiallyMasteredNodes = partiallyMasteredNodes,
                WeakNodes = weakNodes,
                UntestedNodes = untestedNodes,
                MasteryPercentage = totalNodes > 0 ? (int)(masteredNodes * 100.0 / totalNodes) : 0,
                CompletionPercentage = totalNodes > 0 ? (int)((masteredNodes + partiallyMasteredNodes + weakNodes) * 100.0 / totalNodes) : 0,
                ByDifficultyLevel = byDifficulty
            };
            
            return Ok(summary);
        }
        
        /// <summary>
        /// 获取多个用户在某课程的知识图谱掌握情况（仅限教师和管理员）
        /// </summary>
        [HttpGet("class-summary")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<ActionResult<List<UserKnowledgeSummaryDTO>>> GetClassKnowledgeSummary([FromQuery] int courseId)
        {
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            
            // 检查课程是否存在
            var course = await _context.Courses
                .Include(c => c.Teachers)
                .Include(c => c.Students)
                .FirstOrDefaultAsync(c => c.Id == courseId);
                
            if (course == null)
            {
                return NotFound(new { Message = "课程不存在" });
            }
            
            // 检查权限 - 必须是管理员或课程的教师
            if (userRole != "admin" && !course.Teachers.Any(t => t.UserId == userId))
            {
                return Forbid();
            }
            
            // 获取该课程的所有学生
            var students = course.Students.ToList();
            
            // 获取该课程下的所有知识点
            var nodes = await _context.KnowledgeNodes
                .Where(n => n.Graph.CourseId == courseId)
                .ToListAsync();
                
            if (!nodes.Any())
            {
                return Ok(new List<UserKnowledgeSummaryDTO>());
            }
            
            var nodeIds = nodes.Select(n => n.Id).ToList();
            
            // 获取所有学生在这些知识点上的掌握状态
            var allStates = await _context.UserKnowledgeStates
                .Where(s => students.Select(st => st.Id).Contains(s.UserId) && nodeIds.Contains(s.KnowledgeNodeId))
                .ToListAsync();
                
            // 按学生分组计算掌握情况
            var summaries = new List<UserKnowledgeSummaryDTO>();
            
            foreach (var student in students)
            {
                var studentStates = allStates.Where(s => s.UserId == student.Id).ToList();
                
                var masteredNodes = studentStates.Count(s => s.MasteryLevel >= 80);
                var partiallyMasteredNodes = studentStates.Count(s => s.MasteryLevel >= 50 && s.MasteryLevel < 80);
                var weakNodes = studentStates.Count(s => s.MasteryLevel > 0 && s.MasteryLevel < 50);
                
                summaries.Add(new UserKnowledgeSummaryDTO
                {
                    UserId = student.Id,
                    UserName = student.UserName,
                    TotalNodes = nodes.Count,
                    MasteredNodes = masteredNodes,
                    PartiallyMasteredNodes = partiallyMasteredNodes,
                    WeakNodes = weakNodes,
                    UntestedNodes = nodes.Count - studentStates.Count,
                    MasteryPercentage = nodes.Count > 0 ? (int)(masteredNodes * 100.0 / nodes.Count) : 0,
                    CompletionPercentage = nodes.Count > 0 ? (int)(studentStates.Count * 100.0 / nodes.Count) : 0,
                    LastActivityDate = studentStates.Any() ? studentStates.Max(s => s.LastInteractionAt) : (DateTime?)null
                });
            }
            
            return Ok(summaries.OrderByDescending(s => s.CompletionPercentage).ToList());
        }
    }
}

namespace OnlineLearningSystem.API.DTOs
{
    public class UserKnowledgeStateDTO
    {
        public int KnowledgeNodeId { get; set; }
        public string KnowledgeNodeLabel { get; set; }
        public int MasteryLevel { get; set; }
        public int InteractionCount { get; set; }
        public DateTime LastInteractionAt { get; set; }
    }
    
    public class UpdateKnowledgeStateDTO
    {
        public int MasteryLevel { get; set; }
    }
    
    public class KnowledgeSummaryDTO
    {
        public int TotalNodes { get; set; }
        public int MasteredNodes { get; set; }
        public int PartiallyMasteredNodes { get; set; }
        public int WeakNodes { get; set; }
        public int UntestedNodes { get; set; }
        public int MasteryPercentage { get; set; }
        public int CompletionPercentage { get; set; }
        public List<DifficultyLevelStatDTO> ByDifficultyLevel { get; set; }
    }
    
    public class DifficultyLevelStatDTO
    {
        public int Level { get; set; }
        public int TotalCount { get; set; }
        public int MasteredCount { get; set; }
        public int CompletionPercentage { get; set; }
    }
    
    public class UserKnowledgeSummaryDTO
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public int TotalNodes { get; set; }
        public int MasteredNodes { get; set; }
        public int PartiallyMasteredNodes { get; set; }
        public int WeakNodes { get; set; }
        public int UntestedNodes { get; set; }
        public int MasteryPercentage { get; set; }
        public int CompletionPercentage { get; set; }
        public DateTime? LastActivityDate { get; set; }
    }
} 