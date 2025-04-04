using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.DTOs;
using OnlineLearningSystem.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace OnlineLearningSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class KnowledgeGraphsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        
        public KnowledgeGraphsController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        
        /// <summary>
        /// 获取知识图谱列表
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<KnowledgeGraphDTO>>> GetKnowledgeGraphs([FromQuery] int? courseId = null)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            var query = _context.KnowledgeGraphs.AsQueryable();
            
            // 根据课程筛选
            if (courseId.HasValue)
            {
                query = query.Where(g => g.CourseId == courseId.Value);
            }
            
            // 权限过滤 - 管理员可以看到所有图谱
            if (userRole != "admin")
            {
                query = query.Where(g => 
                    g.IsPublic || // 公开的图谱
                    g.CreatorId == userId || // 自己创建的图谱
                    (g.CourseId.HasValue && g.Course.Teachers.Any(t => t.UserId == userId)) // 教师可以看到其教授课程的图谱
                );
            }
            
            var graphs = await query
                .Include(g => g.Creator)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();
                
            return Ok(_mapper.Map<IEnumerable<KnowledgeGraphDTO>>(graphs));
        }
        
        /// <summary>
        /// 获取知识图谱详情
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<KnowledgeGraphDetailDTO>> GetKnowledgeGraph(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            var graph = await _context.KnowledgeGraphs
                .Include(g => g.Creator)
                .Include(g => g.Nodes)
                .ThenInclude(n => n.OutgoingRelations)
                .ThenInclude(r => r.TargetNode)
                .Include(g => g.Nodes)
                .ThenInclude(n => n.IncomingRelations)
                .ThenInclude(r => r.SourceNode)
                .FirstOrDefaultAsync(g => g.Id == id);
                
            if (graph == null)
            {
                return NotFound();
            }
            
            // 检查权限
            if (userRole != "admin" && 
                !graph.IsPublic && 
                graph.CreatorId != userId &&
                !(graph.CourseId.HasValue && graph.Course.Teachers.Any(t => t.UserId == userId)))
            {
                return Forbid();
            }
            
            return Ok(_mapper.Map<KnowledgeGraphDetailDTO>(graph));
        }
        
        /// <summary>
        /// 创建知识图谱
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "admin,teacher")]
        public async Task<ActionResult<KnowledgeGraphDTO>> CreateKnowledgeGraph(CreateKnowledgeGraphDTO graphDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            // 如果指定了课程，验证课程是否存在和权限
            if (graphDto.CourseId.HasValue)
            {
                var course = await _context.Courses
                    .Include(c => c.Teachers)
                    .FirstOrDefaultAsync(c => c.Id == graphDto.CourseId.Value);
                    
                if (course == null)
                {
                    return NotFound(new { Message = "指定的课程不存在" });
                }
                
                // 验证权限 - 必须是管理员或课程的教师
                if (userRole != "admin" && !course.Teachers.Any(t => t.UserId == userId))
                {
                    return Forbid();
                }
            }
            
            var graph = new KnowledgeGraph
            {
                Title = graphDto.Title,
                Description = graphDto.Description,
                Type = graphDto.Type,
                IsPublic = graphDto.IsPublic,
                CourseId = graphDto.CourseId,
                CreatorId = userId,
                CreatedAt = DateTime.UtcNow
            };
            
            _context.KnowledgeGraphs.Add(graph);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetKnowledgeGraph), new { id = graph.Id }, _mapper.Map<KnowledgeGraphDTO>(graph));
        }
        
        /// <summary>
        /// 更新知识图谱
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> UpdateKnowledgeGraph(int id, UpdateKnowledgeGraphDTO graphDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            var graph = await _context.KnowledgeGraphs
                .Include(g => g.Course)
                .ThenInclude(c => c.Teachers)
                .FirstOrDefaultAsync(g => g.Id == id);
                
            if (graph == null)
            {
                return NotFound();
            }
            
            // 验证权限 - 必须是管理员、创建者或课程的教师
            if (userRole != "admin" && 
                graph.CreatorId != userId && 
                !(graph.CourseId.HasValue && graph.Course.Teachers.Any(t => t.UserId == userId)))
            {
                return Forbid();
            }
            
            // 更新基本信息
            graph.Title = graphDto.Title;
            graph.Description = graphDto.Description;
            graph.Type = graphDto.Type;
            graph.IsPublic = graphDto.IsPublic;
            graph.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        /// <summary>
        /// 删除知识图谱
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> DeleteKnowledgeGraph(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            var graph = await _context.KnowledgeGraphs
                .Include(g => g.Course)
                .ThenInclude(c => c.Teachers)
                .Include(g => g.Nodes)
                .ThenInclude(n => n.OutgoingRelations)
                .Include(g => g.Nodes)
                .ThenInclude(n => n.IncomingRelations)
                .FirstOrDefaultAsync(g => g.Id == id);
                
            if (graph == null)
            {
                return NotFound();
            }
            
            // 验证权限 - 必须是管理员、创建者或课程的教师
            if (userRole != "admin" && 
                graph.CreatorId != userId && 
                !(graph.CourseId.HasValue && graph.Course.Teachers.Any(t => t.UserId == userId)))
            {
                return Forbid();
            }
            
            // 删除关联的节点和关系
            foreach (var node in graph.Nodes)
            {
                _context.KnowledgeRelations.RemoveRange(node.OutgoingRelations);
                _context.KnowledgeRelations.RemoveRange(node.IncomingRelations);
            }
            
            _context.KnowledgeNodes.RemoveRange(graph.Nodes);
            _context.KnowledgeGraphs.Remove(graph);
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        #region 知识点操作
        
        /// <summary>
        /// 添加知识点
        /// </summary>
        [HttpPost("{graphId}/nodes")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<ActionResult<KnowledgeNodeDTO>> AddNode(int graphId, CreateKnowledgeNodeDTO nodeDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            var graph = await _context.KnowledgeGraphs
                .Include(g => g.Course)
                .ThenInclude(c => c.Teachers)
                .FirstOrDefaultAsync(g => g.Id == graphId);
                
            if (graph == null)
            {
                return NotFound(new { Message = "知识图谱不存在" });
            }
            
            // 验证权限 - 必须是管理员、创建者或课程的教师
            if (userRole != "admin" && 
                graph.CreatorId != userId && 
                !(graph.CourseId.HasValue && graph.Course.Teachers.Any(t => t.UserId == userId)))
            {
                return Forbid();
            }
            
            var node = new KnowledgeNode
            {
                Label = nodeDto.Label,
                Description = nodeDto.Description,
                Type = nodeDto.Type,
                DifficultyLevel = nodeDto.DifficultyLevel,
                Group = nodeDto.Group,
                Color = nodeDto.Color,
                Icon = nodeDto.Icon,
                GraphId = graphId,
                Properties = nodeDto.Properties != null ? JsonSerializer.Serialize(nodeDto.Properties) : null,
                CreatedAt = DateTime.UtcNow
            };
            
            _context.KnowledgeNodes.Add(node);
            await _context.SaveChangesAsync();
            
            // 更新图谱的更新时间
            graph.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetNode), 
                new { graphId = graphId, nodeId = node.Id }, 
                _mapper.Map<KnowledgeNodeDTO>(node));
        }
        
        /// <summary>
        /// 获取知识点详情
        /// </summary>
        [HttpGet("{graphId}/nodes/{nodeId}")]
        public async Task<ActionResult<KnowledgeNodeDTO>> GetNode(int graphId, int nodeId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            var node = await _context.KnowledgeNodes
                .Include(n => n.Graph)
                .ThenInclude(g => g.Course)
                .ThenInclude(c => c.Teachers)
                .Include(n => n.OutgoingRelations)
                .ThenInclude(r => r.TargetNode)
                .Include(n => n.IncomingRelations)
                .ThenInclude(r => r.SourceNode)
                .FirstOrDefaultAsync(n => n.Id == nodeId && n.GraphId == graphId);
                
            if (node == null)
            {
                return NotFound();
            }
            
            // 检查权限
            if (userRole != "admin" && 
                !node.Graph.IsPublic && 
                node.Graph.CreatorId != userId &&
                !(node.Graph.CourseId.HasValue && node.Graph.Course.Teachers.Any(t => t.UserId == userId)))
            {
                return Forbid();
            }
            
            return Ok(_mapper.Map<KnowledgeNodeDetailDTO>(node));
        }
        
        /// <summary>
        /// 更新知识点
        /// </summary>
        [HttpPut("{graphId}/nodes/{nodeId}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> UpdateNode(int graphId, int nodeId, UpdateKnowledgeNodeDTO nodeDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            var node = await _context.KnowledgeNodes
                .Include(n => n.Graph)
                .ThenInclude(g => g.Course)
                .ThenInclude(c => c.Teachers)
                .FirstOrDefaultAsync(n => n.Id == nodeId && n.GraphId == graphId);
                
            if (node == null)
            {
                return NotFound();
            }
            
            // 验证权限 - 必须是管理员、图谱创建者或课程的教师
            if (userRole != "admin" && 
                node.Graph.CreatorId != userId && 
                !(node.Graph.CourseId.HasValue && node.Graph.Course.Teachers.Any(t => t.UserId == userId)))
            {
                return Forbid();
            }
            
            // 更新知识点信息
            node.Label = nodeDto.Label;
            node.Description = nodeDto.Description;
            node.Type = nodeDto.Type;
            node.DifficultyLevel = nodeDto.DifficultyLevel;
            node.Group = nodeDto.Group;
            node.Color = nodeDto.Color;
            node.Icon = nodeDto.Icon;
            node.Properties = nodeDto.Properties != null ? JsonSerializer.Serialize(nodeDto.Properties) : null;
            node.UpdatedAt = DateTime.UtcNow;
            
            // 同时更新图谱的更新时间
            node.Graph.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        /// <summary>
        /// 删除知识点
        /// </summary>
        [HttpDelete("{graphId}/nodes/{nodeId}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> DeleteNode(int graphId, int nodeId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            var node = await _context.KnowledgeNodes
                .Include(n => n.Graph)
                .ThenInclude(g => g.Course)
                .ThenInclude(c => c.Teachers)
                .Include(n => n.OutgoingRelations)
                .Include(n => n.IncomingRelations)
                .FirstOrDefaultAsync(n => n.Id == nodeId && n.GraphId == graphId);
                
            if (node == null)
            {
                return NotFound();
            }
            
            // 验证权限 - 必须是管理员、图谱创建者或课程的教师
            if (userRole != "admin" && 
                node.Graph.CreatorId != userId && 
                !(node.Graph.CourseId.HasValue && node.Graph.Course.Teachers.Any(t => t.UserId == userId)))
            {
                return Forbid();
            }
            
            // 删除关联的关系
            _context.KnowledgeRelations.RemoveRange(node.OutgoingRelations);
            _context.KnowledgeRelations.RemoveRange(node.IncomingRelations);
            
            // 删除知识点
            _context.KnowledgeNodes.Remove(node);
            
            // 更新图谱的更新时间
            node.Graph.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        #endregion
        
        #region 知识点关系操作
        
        /// <summary>
        /// 添加知识点关系
        /// </summary>
        [HttpPost("{graphId}/relations")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<ActionResult<KnowledgeRelationDTO>> AddRelation(int graphId, CreateKnowledgeRelationDTO relationDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            // 验证图谱是否存在
            var graph = await _context.KnowledgeGraphs
                .Include(g => g.Course)
                .ThenInclude(c => c.Teachers)
                .FirstOrDefaultAsync(g => g.Id == graphId);
                
            if (graph == null)
            {
                return NotFound(new { Message = "知识图谱不存在" });
            }
            
            // 验证权限 - 必须是管理员、创建者或课程的教师
            if (userRole != "admin" && 
                graph.CreatorId != userId && 
                !(graph.CourseId.HasValue && graph.Course.Teachers.Any(t => t.UserId == userId)))
            {
                return Forbid();
            }
            
            // 验证源节点和目标节点是否存在且属于同一个图谱
            var sourceNode = await _context.KnowledgeNodes
                .FirstOrDefaultAsync(n => n.Id == relationDto.SourceNodeId && n.GraphId == graphId);
                
            var targetNode = await _context.KnowledgeNodes
                .FirstOrDefaultAsync(n => n.Id == relationDto.TargetNodeId && n.GraphId == graphId);
                
            if (sourceNode == null || targetNode == null)
            {
                return NotFound(new { Message = "源节点或目标节点不存在或不属于该图谱" });
            }
            
            // 创建关系
            var relation = new KnowledgeRelation
            {
                Type = relationDto.Type,
                Label = relationDto.Label,
                Weight = relationDto.Weight,
                SourceNodeId = relationDto.SourceNodeId,
                TargetNodeId = relationDto.TargetNodeId,
                Properties = relationDto.Properties != null ? JsonSerializer.Serialize(relationDto.Properties) : null,
                CreatedAt = DateTime.UtcNow
            };
            
            _context.KnowledgeRelations.Add(relation);
            
            // 更新图谱的更新时间
            graph.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetRelation), 
                new { graphId = graphId, relationId = relation.Id }, 
                _mapper.Map<KnowledgeRelationDTO>(relation));
        }
        
        /// <summary>
        /// 获取知识点关系详情
        /// </summary>
        [HttpGet("{graphId}/relations/{relationId}")]
        public async Task<ActionResult<KnowledgeRelationDTO>> GetRelation(int graphId, int relationId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            var relation = await _context.KnowledgeRelations
                .Include(r => r.SourceNode)
                .ThenInclude(n => n.Graph)
                .ThenInclude(g => g.Course)
                .ThenInclude(c => c.Teachers)
                .Include(r => r.TargetNode)
                .FirstOrDefaultAsync(r => r.Id == relationId && r.SourceNode.GraphId == graphId);
                
            if (relation == null)
            {
                return NotFound();
            }
            
            // 检查权限
            var graph = relation.SourceNode.Graph;
            if (userRole != "admin" && 
                !graph.IsPublic && 
                graph.CreatorId != userId &&
                !(graph.CourseId.HasValue && graph.Course.Teachers.Any(t => t.UserId == userId)))
            {
                return Forbid();
            }
            
            return Ok(_mapper.Map<KnowledgeRelationDTO>(relation));
        }
        
        /// <summary>
        /// 更新知识点关系
        /// </summary>
        [HttpPut("{graphId}/relations/{relationId}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> UpdateRelation(int graphId, int relationId, UpdateKnowledgeRelationDTO relationDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            var relation = await _context.KnowledgeRelations
                .Include(r => r.SourceNode)
                .ThenInclude(n => n.Graph)
                .ThenInclude(g => g.Course)
                .ThenInclude(c => c.Teachers)
                .FirstOrDefaultAsync(r => r.Id == relationId && r.SourceNode.GraphId == graphId);
                
            if (relation == null)
            {
                return NotFound();
            }
            
            // 验证权限 - 必须是管理员、图谱创建者或课程的教师
            var graph = relation.SourceNode.Graph;
            if (userRole != "admin" && 
                graph.CreatorId != userId && 
                !(graph.CourseId.HasValue && graph.Course.Teachers.Any(t => t.UserId == userId)))
            {
                return Forbid();
            }
            
            // 更新关系信息
            relation.Type = relationDto.Type;
            relation.Label = relationDto.Label;
            relation.Weight = relationDto.Weight;
            relation.Properties = relationDto.Properties != null ? JsonSerializer.Serialize(relationDto.Properties) : null;
            relation.UpdatedAt = DateTime.UtcNow;
            
            // 更新图谱的更新时间
            graph.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        /// <summary>
        /// 删除知识点关系
        /// </summary>
        [HttpDelete("{graphId}/relations/{relationId}")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<IActionResult> DeleteRelation(int graphId, int relationId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            
            var relation = await _context.KnowledgeRelations
                .Include(r => r.SourceNode)
                .ThenInclude(n => n.Graph)
                .ThenInclude(g => g.Course)
                .ThenInclude(c => c.Teachers)
                .FirstOrDefaultAsync(r => r.Id == relationId && r.SourceNode.GraphId == graphId);
                
            if (relation == null)
            {
                return NotFound();
            }
            
            // 验证权限 - 必须是管理员、图谱创建者或课程的教师
            var graph = relation.SourceNode.Graph;
            if (userRole != "admin" && 
                graph.CreatorId != userId && 
                !(graph.CourseId.HasValue && graph.Course.Teachers.Any(t => t.UserId == userId)))
            {
                return Forbid();
            }
            
            // 删除关系
            _context.KnowledgeRelations.Remove(relation);
            
            // 更新图谱的更新时间
            graph.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        #endregion
    }
}

namespace OnlineLearningSystem.API.DTOs
{
    public class KnowledgeGraphDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public bool IsPublic { get; set; }
        public int NodeCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string CreatorName { get; set; }
        public int? CourseId { get; set; }
        public string CourseName { get; set; }
    }
    
    public class KnowledgeGraphDetailDTO : KnowledgeGraphDTO
    {
        public ICollection<KnowledgeNodeDTO> Nodes { get; set; }
        public ICollection<KnowledgeRelationDTO> Relations { get; set; }
    }
    
    public class CreateKnowledgeGraphDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public bool IsPublic { get; set; } = false;
        public int? CourseId { get; set; }
    }
    
    public class UpdateKnowledgeGraphDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public bool IsPublic { get; set; }
    }
    
    public class KnowledgeNodeDTO
    {
        public int Id { get; set; }
        public string Label { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public int DifficultyLevel { get; set; }
        public string Group { get; set; }
        public string Color { get; set; }
        public string Icon { get; set; }
        public object Properties { get; set; }
    }
    
    public class KnowledgeNodeDetailDTO : KnowledgeNodeDTO
    {
        public ICollection<KnowledgeRelationDTO> OutgoingRelations { get; set; }
        public ICollection<KnowledgeRelationDTO> IncomingRelations { get; set; }
    }
    
    public class CreateKnowledgeNodeDTO
    {
        public string Label { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public int DifficultyLevel { get; set; } = 1;
        public string Group { get; set; }
        public string Color { get; set; }
        public string Icon { get; set; }
        public object Properties { get; set; }
    }
    
    public class UpdateKnowledgeNodeDTO
    {
        public string Label { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public int DifficultyLevel { get; set; }
        public string Group { get; set; }
        public string Color { get; set; }
        public string Icon { get; set; }
        public object Properties { get; set; }
    }
    
    public class KnowledgeRelationDTO
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public string Label { get; set; }
        public double Weight { get; set; }
        public int SourceNodeId { get; set; }
        public string SourceNodeLabel { get; set; }
        public int TargetNodeId { get; set; }
        public string TargetNodeLabel { get; set; }
        public object Properties { get; set; }
    }
    
    public class CreateKnowledgeRelationDTO
    {
        public string Type { get; set; }
        public string Label { get; set; }
        public double Weight { get; set; } = 1.0;
        public int SourceNodeId { get; set; }
        public int TargetNodeId { get; set; }
        public object Properties { get; set; }
    }
    
    public class UpdateKnowledgeRelationDTO
    {
        public string Type { get; set; }
        public string Label { get; set; }
        public double Weight { get; set; }
        public object Properties { get; set; }
    }
} 