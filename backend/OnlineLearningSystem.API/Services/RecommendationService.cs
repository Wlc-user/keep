using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.Models;
using OnlineLearningSystem.API.Models.Constants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OnlineLearningSystem.API.Services
{
    /// <summary>
    /// 学习推荐服务实现
    /// </summary>
    public class RecommendationService : IRecommendationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<RecommendationService> _logger;
        
        public RecommendationService(
            ApplicationDbContext context,
            ILogger<RecommendationService> logger)
        {
            _context = context;
            _logger = logger;
        }
        
        /// <summary>
        /// 基于用户的反馈内容生成学习资源推荐
        /// </summary>
        public async Task<List<LearningRecommendation>> GenerateRecommendationsAsync(
            string userId, 
            int feedbackId, 
            string feedbackType, 
            string content,
            int courseId = 0)
        {
            try
            {
                _logger.LogInformation($"为用户 {userId} 生成反馈 {feedbackId} 相关的学习推荐");
                
                var recommendations = new List<LearningRecommendation>();
                
                // 如果提供了课程ID，则推荐相关课程材料
                if (courseId > 0)
                {
                    var relatedMaterials = await _context.Materials
                        .Where(m => m.CourseId == courseId)
                        .OrderByDescending(m => m.CreatedAt)
                        .Take(3)
                        .ToListAsync();
                        
                    foreach (var material in relatedMaterials)
                    {
                        recommendations.Add(new LearningRecommendation
                        {
                            Title = $"推荐学习材料: {material.Title}",
                            Content = $"根据您的反馈，我们推荐您查看这份与课程相关的学习材料。",
                            RecommendationType = RecommendationTypeConstants.RelatedMaterial,
                            MaterialId = material.Id,
                            StudentId = userId,
                            FeedbackId = feedbackId,
                            IsFromAI = true,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }

                // 根据反馈类型生成不同推荐
                switch (feedbackType)
                {
                    case FeedbackTypeConstants.LearningIssue:
                        recommendations.Add(new LearningRecommendation
                        {
                            Title = "学习策略建议",
                            Content = "根据您的学习问题，我们建议您尝试更多的实践练习和复习基础概念。",
                            RecommendationType = RecommendationTypeConstants.StudyStrategy,
                            StudentId = userId,
                            FeedbackId = feedbackId,
                            IsFromAI = true,
                            CreatedAt = DateTime.UtcNow
                        });
                        break;
                        
                    case FeedbackTypeConstants.TechnicalIssue:
                        recommendations.Add(new LearningRecommendation
                        {
                            Title = "技术支持资源",
                            Content = "我们已经准备了一些技术指南，可能对解决您的问题有所帮助。",
                            RecommendationType = RecommendationTypeConstants.TechnicalSupport,
                            StudentId = userId,
                            FeedbackId = feedbackId,
                            IsFromAI = true,
                            CreatedAt = DateTime.UtcNow
                        });
                        break;
                        
                    default:
                        // 默认推荐
                        recommendations.Add(new LearningRecommendation
                        {
                            Title = "个性化学习建议",
                            Content = "感谢您的反馈！我们将根据您的学习情况提供更多个性化支持。",
                            RecommendationType = RecommendationTypeConstants.PersonalizedRecommendation,
                            StudentId = userId,
                            FeedbackId = feedbackId,
                            IsFromAI = true,
                            CreatedAt = DateTime.UtcNow
                        });
                        break;
                }
                
                return recommendations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"为用户 {userId} 生成反馈 {feedbackId} 相关的学习推荐时出错");
                return new List<LearningRecommendation>();
            }
        }
        
        /// <summary>
        /// 基于用户学习历史生成个性化推荐
        /// </summary>
        public async Task<List<LearningRecommendation>> GetPersonalizedRecommendationsAsync(
            string userId, 
            int count = 5)
        {
            try
            {
                _logger.LogInformation($"为用户 {userId} 生成个性化学习推荐");
                
                var recommendations = new List<LearningRecommendation>();
                
                // 查找用户最近的课程
                var recentCourses = await _context.CourseEnrollments
                    .Where(e => e.UserId == userId)
                    .OrderByDescending(e => e.EnrollmentDate)
                    .Select(e => e.CourseId)
                    .Take(3)
                    .ToListAsync();
                    
                if (recentCourses.Any())
                {
                    // 基于最近课程推荐相关材料
                    var relatedMaterials = await _context.Materials
                        .Where(m => m.CourseId.HasValue && recentCourses.Contains(m.CourseId.Value))
                        .OrderByDescending(m => m.CreatedAt)
                        .Take(count)
                        .ToListAsync();
                        
                    foreach (var material in relatedMaterials)
                    {
                        recommendations.Add(new LearningRecommendation
                        {
                            Title = $"课程推荐材料: {material.Title}",
                            Content = $"根据您的学习历史，我们推荐您查看这份与课程相关的学习材料。",
                            RecommendationType = RecommendationTypeConstants.RelatedMaterial,
                            MaterialId = material.Id,
                            StudentId = userId,
                            IsFromAI = true,
                            CreatedAt = DateTime.UtcNow
                        });
                    }
                }
                
                // 如果推荐不足，添加一些常规推荐
                while (recommendations.Count < count)
                {
                    recommendations.Add(new LearningRecommendation
                    {
                        Title = "热门学习资源",
                        Content = "这是我们平台上的热门学习资源，希望对您有所帮助。",
                        RecommendationType = RecommendationTypeConstants.PopularContent,
                        StudentId = userId,
                        IsFromAI = true,
                        CreatedAt = DateTime.UtcNow
                    });
                }
                
                return recommendations.Take(count).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"为用户 {userId} 生成个性化学习推荐时出错");
                return new List<LearningRecommendation>();
            }
        }
    }
} 