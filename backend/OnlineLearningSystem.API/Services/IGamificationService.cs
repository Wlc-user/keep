using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using OnlineLearningSystem.API.DTOs;
using OnlineLearningSystem.API.Models;

namespace OnlineLearningSystem.API.Services
{
    /// <summary>
    /// 游戏化反馈系统服务接口
    /// </summary>
    public interface IGamificationService
    {
        // 用户积分相关
        Task<UserPointsDTO> GetUserPointsAsync(string userId);
        Task<PointsHistoryDTO> GetUserPointsHistoryAsync(string userId, int page = 1, int pageSize = 10);
        Task<int> AddPointsAsync(string userId, int amount, string type, string description, 
            int? courseId = null, int? lessonId = null, int? assignmentId = null, int? quizId = null);
        Task<bool> CheckAndUpdateLevelAsync(string userId);
        
        // 成就相关
        Task<IEnumerable<AchievementDTO>> GetAllAchievementsAsync();
        Task<IEnumerable<UserAchievementDTO>> GetUserAchievementsAsync(string userId);
        Task<UserAchievementSummaryDTO> GetUserAchievementSummaryAsync(string userId);
        Task<UserAchievementDTO> AwardAchievementAsync(string userId, int achievementId, string context = null);
        Task<bool> CheckAndAwardAchievementsAsync(string userId);
        Task<bool> MarkAchievementAsViewedAsync(string userId, int userAchievementId);
        
        // 学习连续记录相关
        Task<LearningStreakDTO> GetUserStreakAsync(string userId);
        Task<bool> UpdateUserStreakAsync(string userId);
        Task<int> GetStreakBonusPointsAsync(int streakDays);
        
        // 奖励相关
        Task<IEnumerable<RewardDTO>> GetAvailableRewardsAsync();
        Task<IEnumerable<UserRewardDTO>> GetUserRewardsAsync(string userId);
        Task<UserRewardDTO> AwardRewardAsync(string userId, int rewardId);
        Task<bool> MarkRewardAsViewedAsync(string userId, int userRewardId);
        
        // 用户排名相关
        Task<int> GetUserRankAsync(string userId);
        Task<IEnumerable<RankDTO>> GetLeaderboardAsync(int top = 10);
        Task<IEnumerable<RankDTO>> GetUserNearbyRanksAsync(string userId, int count = 5);
        
        // 学习事件处理
        Task<LearningFeedbackResponseDTO> ProcessLearningEventAsync(string userId, RecordLearningEventDTO eventData);
        Task<List<FeedbackEventDTO>> GetRecentFeedbackEventsAsync(string userId, int count = 5);
        
        // 动机提示相关
        Task<MotivationalPromptDTO> GetRandomMotivationalPromptAsync(string userId);
        Task<bool> DeliverPromptToUserAsync(string userId, int promptId, string channel = "web");
        
        // 学习进度反馈
        Task<LearningProgressFeedbackDTO> GetLearningProgressFeedbackAsync(string userId, int? courseId = null);
        
        // 用户统计摘要
        Task<UserStatsSummaryDTO> GetUserStatsSummaryAsync(string userId);
        
        // 游戏化设置相关
        Task<IEnumerable<GamificationSettingDTO>> GetGamificationSettingsAsync();
        Task<bool> UpdateGamificationSettingAsync(string key, string value, bool isEnabled = true);
        Task<UserGamificationPreferencesDTO> GetUserGamificationPreferencesAsync(string userId);
        Task<bool> UpdateUserGamificationPreferencesAsync(string userId, UserGamificationPreferencesDTO preferences);
    }
} 