using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using OnlineLearningSystem.API.Models;

namespace OnlineLearningSystem.API.Services
{
    /// <summary>
    /// 学习推荐服务接口
    /// </summary>
    public interface IRecommendationService
    {
        /// <summary>
        /// 基于用户的反馈内容生成学习资源推荐
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="feedbackId">反馈ID</param>
        /// <param name="feedbackType">反馈类型</param>
        /// <param name="content">反馈内容</param>
        /// <param name="courseId">课程ID（可选）</param>
        /// <returns>生成的学习推荐列表</returns>
        Task<List<LearningRecommendation>> GenerateRecommendationsAsync(
            string userId, 
            int feedbackId, 
            string feedbackType, 
            string content,
            int courseId = 0);
            
        /// <summary>
        /// 基于用户学习历史生成个性化推荐
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="count">推荐数量</param>
        /// <returns>推荐的学习资源列表</returns>
        Task<List<LearningRecommendation>> GetPersonalizedRecommendationsAsync(
            string userId, 
            int count = 5);
    }
} 