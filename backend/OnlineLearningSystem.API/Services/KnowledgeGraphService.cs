using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace OnlineLearningSystem.API.Services
{
    public interface IKnowledgeGraphService
    {
        Task<List<KnowledgeGraph>> GetUserAccessibleGraphsAsync(string userId, string userRole, int? courseId = null);
        Task<KnowledgeGraph> GetGraphDetailAsync(int graphId);
        Task<bool> CanUserAccessGraphAsync(string userId, string userRole, KnowledgeGraph graph);
        Task<bool> CanUserModifyGraphAsync(string userId, string userRole, KnowledgeGraph graph);
        Task<KnowledgeGraph> CreateGraphAsync(KnowledgeGraph graph, string creatorId);
        Task UpdateGraphAsync(KnowledgeGraph graph);
        Task DeleteGraphAsync(int graphId);
        Task<KnowledgeNode> AddNodeAsync(KnowledgeNode node);
        Task UpdateNodeAsync(KnowledgeNode node);
        Task DeleteNodeAsync(int nodeId);
        Task<KnowledgeRelation> AddRelationAsync(KnowledgeRelation relation);
        Task UpdateRelationAsync(KnowledgeRelation relation);
        Task DeleteRelationAsync(int relationId);
        Task<UserKnowledgeState> GetUserKnowledgeStateAsync(string userId, int nodeId);
        Task UpdateUserKnowledgeStateAsync(string userId, int nodeId, int masteryLevel);
    }
    
    public class KnowledgeGraphService : IKnowledgeGraphService
    {
        private readonly ApplicationDbContext _context;
        
        public KnowledgeGraphService(ApplicationDbContext context)
        {
            _context = context;
        }
        
        /// <summary>
        /// 获取用户可访问的知识图谱列表
        /// </summary>
        public async Task<List<KnowledgeGraph>> GetUserAccessibleGraphsAsync(string userId, string userRole, int? courseId = null)
        {
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
            
            return await query
                .Include(g => g.Creator)
                .Include(g => g.Course)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();
        }
        
        /// <summary>
        /// 获取知识图谱详情（包括节点和关系）
        /// </summary>
        public async Task<KnowledgeGraph> GetGraphDetailAsync(int graphId)
        {
            return await _context.KnowledgeGraphs
                .Include(g => g.Creator)
                .Include(g => g.Course)
                .ThenInclude(c => c.Teachers)
                .Include(g => g.Nodes)
                .ThenInclude(n => n.OutgoingRelations)
                .ThenInclude(r => r.TargetNode)
                .Include(g => g.Nodes)
                .ThenInclude(n => n.IncomingRelations)
                .ThenInclude(r => r.SourceNode)
                .FirstOrDefaultAsync(g => g.Id == graphId);
        }
        
        /// <summary>
        /// 检查用户是否有权限访问指定的知识图谱
        /// </summary>
        public async Task<bool> CanUserAccessGraphAsync(string userId, string userRole, KnowledgeGraph graph)
        {
            if (graph == null) return false;
            
            // 管理员可以访问所有图谱
            if (userRole == "admin") return true;
            
            // 公开图谱任何人都可以访问
            if (graph.IsPublic) return true;
            
            // 自己创建的图谱
            if (graph.CreatorId == userId) return true;
            
            // 如果图谱关联到课程，检查用户是否是该课程的教师
            if (graph.CourseId.HasValue)
            {
                var course = await _context.Courses
                    .Include(c => c.Teachers)
                    .FirstOrDefaultAsync(c => c.Id == graph.CourseId.Value);
                    
                if (course != null && course.Teachers.Any(t => t.UserId == userId))
                {
                    return true;
                }
            }
            
            return false;
        }
        
        /// <summary>
        /// 检查用户是否有权限修改指定的知识图谱
        /// </summary>
        public async Task<bool> CanUserModifyGraphAsync(string userId, string userRole, KnowledgeGraph graph)
        {
            if (graph == null) return false;
            
            // 管理员可以修改所有图谱
            if (userRole == "admin") return true;
            
            // 自己创建的图谱
            if (graph.CreatorId == userId) return true;
            
            // 如果图谱关联到课程，检查用户是否是该课程的教师
            if (graph.CourseId.HasValue)
            {
                var course = await _context.Courses
                    .Include(c => c.Teachers)
                    .FirstOrDefaultAsync(c => c.Id == graph.CourseId.Value);
                    
                if (course != null && course.Teachers.Any(t => t.UserId == userId))
                {
                    return true;
                }
            }
            
            return false;
        }
        
        /// <summary>
        /// 创建新的知识图谱
        /// </summary>
        public async Task<KnowledgeGraph> CreateGraphAsync(KnowledgeGraph graph, string creatorId)
        {
            graph.CreatorId = creatorId;
            graph.CreatedAt = DateTime.UtcNow;
            
            _context.KnowledgeGraphs.Add(graph);
            await _context.SaveChangesAsync();
            
            return graph;
        }
        
        /// <summary>
        /// 更新知识图谱
        /// </summary>
        public async Task UpdateGraphAsync(KnowledgeGraph graph)
        {
            graph.UpdatedAt = DateTime.UtcNow;
            _context.Entry(graph).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
        
        /// <summary>
        /// 删除知识图谱及其关联的所有节点和关系
        /// </summary>
        public async Task DeleteGraphAsync(int graphId)
        {
            var graph = await _context.KnowledgeGraphs
                .Include(g => g.Nodes)
                .ThenInclude(n => n.OutgoingRelations)
                .Include(g => g.Nodes)
                .ThenInclude(n => n.IncomingRelations)
                .FirstOrDefaultAsync(g => g.Id == graphId);
                
            if (graph == null) return;
            
            // 删除关联的节点和关系
            foreach (var node in graph.Nodes)
            {
                _context.KnowledgeRelations.RemoveRange(node.OutgoingRelations);
                _context.KnowledgeRelations.RemoveRange(node.IncomingRelations);
            }
            
            _context.KnowledgeNodes.RemoveRange(graph.Nodes);
            _context.KnowledgeGraphs.Remove(graph);
            
            await _context.SaveChangesAsync();
        }
        
        /// <summary>
        /// 添加知识点
        /// </summary>
        public async Task<KnowledgeNode> AddNodeAsync(KnowledgeNode node)
        {
            node.CreatedAt = DateTime.UtcNow;
            
            _context.KnowledgeNodes.Add(node);
            
            // 更新图谱的更新时间
            var graph = await _context.KnowledgeGraphs.FindAsync(node.GraphId);
            if (graph != null)
            {
                graph.UpdatedAt = DateTime.UtcNow;
            }
            
            await _context.SaveChangesAsync();
            
            return node;
        }
        
        /// <summary>
        /// 更新知识点
        /// </summary>
        public async Task UpdateNodeAsync(KnowledgeNode node)
        {
            node.UpdatedAt = DateTime.UtcNow;
            _context.Entry(node).State = EntityState.Modified;
            
            // 更新图谱的更新时间
            var graph = await _context.KnowledgeGraphs.FindAsync(node.GraphId);
            if (graph != null)
            {
                graph.UpdatedAt = DateTime.UtcNow;
            }
            
            await _context.SaveChangesAsync();
        }
        
        /// <summary>
        /// 删除知识点及其关联的所有关系
        /// </summary>
        public async Task DeleteNodeAsync(int nodeId)
        {
            var node = await _context.KnowledgeNodes
                .Include(n => n.OutgoingRelations)
                .Include(n => n.IncomingRelations)
                .FirstOrDefaultAsync(n => n.Id == nodeId);
                
            if (node == null) return;
            
            // 删除关联的关系
            _context.KnowledgeRelations.RemoveRange(node.OutgoingRelations);
            _context.KnowledgeRelations.RemoveRange(node.IncomingRelations);
            
            // 删除节点
            _context.KnowledgeNodes.Remove(node);
            
            // 更新图谱的更新时间
            var graph = await _context.KnowledgeGraphs.FindAsync(node.GraphId);
            if (graph != null)
            {
                graph.UpdatedAt = DateTime.UtcNow;
            }
            
            await _context.SaveChangesAsync();
        }
        
        /// <summary>
        /// 添加知识点关系
        /// </summary>
        public async Task<KnowledgeRelation> AddRelationAsync(KnowledgeRelation relation)
        {
            relation.CreatedAt = DateTime.UtcNow;
            
            _context.KnowledgeRelations.Add(relation);
            
            // 获取源节点所属的图谱并更新其更新时间
            var sourceNode = await _context.KnowledgeNodes.FindAsync(relation.SourceNodeId);
            if (sourceNode != null)
            {
                var graph = await _context.KnowledgeGraphs.FindAsync(sourceNode.GraphId);
                if (graph != null)
                {
                    graph.UpdatedAt = DateTime.UtcNow;
                }
            }
            
            await _context.SaveChangesAsync();
            
            return relation;
        }
        
        /// <summary>
        /// 更新知识点关系
        /// </summary>
        public async Task UpdateRelationAsync(KnowledgeRelation relation)
        {
            relation.UpdatedAt = DateTime.UtcNow;
            _context.Entry(relation).State = EntityState.Modified;
            
            // 获取源节点所属的图谱并更新其更新时间
            var sourceNode = await _context.KnowledgeNodes.FindAsync(relation.SourceNodeId);
            if (sourceNode != null)
            {
                var graph = await _context.KnowledgeGraphs.FindAsync(sourceNode.GraphId);
                if (graph != null)
                {
                    graph.UpdatedAt = DateTime.UtcNow;
                }
            }
            
            await _context.SaveChangesAsync();
        }
        
        /// <summary>
        /// 删除知识点关系
        /// </summary>
        public async Task DeleteRelationAsync(int relationId)
        {
            var relation = await _context.KnowledgeRelations
                .Include(r => r.SourceNode)
                .FirstOrDefaultAsync(r => r.Id == relationId);
                
            if (relation == null) return;
            
            _context.KnowledgeRelations.Remove(relation);
            
            // 获取源节点所属的图谱并更新其更新时间
            if (relation.SourceNode != null)
            {
                var graph = await _context.KnowledgeGraphs.FindAsync(relation.SourceNode.GraphId);
                if (graph != null)
                {
                    graph.UpdatedAt = DateTime.UtcNow;
                }
            }
            
            await _context.SaveChangesAsync();
        }
        
        /// <summary>
        /// 获取用户对特定知识点的掌握状态
        /// </summary>
        public async Task<UserKnowledgeState> GetUserKnowledgeStateAsync(string userId, int nodeId)
        {
            var state = await _context.UserKnowledgeStates
                .FirstOrDefaultAsync(s => s.UserId == userId && s.KnowledgeNodeId == nodeId);
                
            if (state == null)
            {
                // 如果不存在则创建一个新的状态记录
                state = new UserKnowledgeState
                {
                    UserId = userId,
                    KnowledgeNodeId = nodeId,
                    MasteryLevel = 0,
                    InteractionCount = 0,
                    LastInteractionAt = DateTime.UtcNow
                };
                
                _context.UserKnowledgeStates.Add(state);
                await _context.SaveChangesAsync();
            }
            
            return state;
        }
        
        /// <summary>
        /// 更新用户对特定知识点的掌握状态
        /// </summary>
        public async Task UpdateUserKnowledgeStateAsync(string userId, int nodeId, int masteryLevel)
        {
            var state = await _context.UserKnowledgeStates
                .FirstOrDefaultAsync(s => s.UserId == userId && s.KnowledgeNodeId == nodeId);
                
            if (state == null)
            {
                // 如果不存在则创建一个新的状态记录
                state = new UserKnowledgeState
                {
                    UserId = userId,
                    KnowledgeNodeId = nodeId,
                    MasteryLevel = masteryLevel,
                    InteractionCount = 1,
                    LastInteractionAt = DateTime.UtcNow
                };
                
                _context.UserKnowledgeStates.Add(state);
            }
            else
            {
                // 更新现有状态
                state.MasteryLevel = masteryLevel;
                state.InteractionCount++;
                state.LastInteractionAt = DateTime.UtcNow;
                
                _context.Entry(state).State = EntityState.Modified;
            }
            
            await _context.SaveChangesAsync();
        }
    }
} 