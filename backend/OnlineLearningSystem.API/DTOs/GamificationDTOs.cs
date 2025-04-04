using System;
using System.Collections.Generic;

namespace OnlineLearningSystem.API.DTOs
{
    /// <summary>
    /// 用户成就DTO
    /// </summary>
    public class AchievementDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public int RequiredPoints { get; set; }
        public string BadgeImageUrl { get; set; }
        public string UnlockCriteria { get; set; }
        public string CongratulationMessage { get; set; }
        public bool IsSecret { get; set; }
    }
    
    /// <summary>
    /// 用户获得的成就DTO
    /// </summary>
    public class UserAchievementDTO
    {
        public int Id { get; set; }
        public int AchievementId { get; set; }
        public string AchievementName { get; set; }
        public string AchievementDescription { get; set; }
        public string Category { get; set; }
        public string BadgeImageUrl { get; set; }
        public DateTime DateEarned { get; set; }
        public bool IsNew { get; set; } // 是否是新获得的（未查看过）
        public int ProgressValue { get; set; }
    }
    
    /// <summary>
    /// 用户成就摘要DTO - 简化版用于列表显示
    /// </summary>
    public class UserAchievementSummaryDTO
    {
        public int TotalAchievements { get; set; }
        public int EarnedAchievements { get; set; }
        public int NewAchievements { get; set; }
        public List<AchievementCategorySummary> Categories { get; set; }
        public List<UserAchievementDTO> RecentAchievements { get; set; }
    }
    
    /// <summary>
    /// 成就类别摘要
    /// </summary>
    public class AchievementCategorySummary
    {
        public string Category { get; set; }
        public int Total { get; set; }
        public int Earned { get; set; }
        public double Percentage { get; set; }
    }
    
    /// <summary>
    /// 用户积分DTO
    /// </summary>
    public class UserPointsDTO
    {
        public int TotalPoints { get; set; }
        public int AvailablePoints { get; set; }
        public int Level { get; set; }
        public int CurrentLevelPoints { get; set; }
        public int NextLevelThreshold { get; set; }
        public int PointsToNextLevel { get; set; }
        public double LevelProgress { get; set; } // 0-1 之间的小数表示进度百分比
        public List<RankDTO> NearbyRanks { get; set; } // 周围的排名
        public int Rank { get; set; } // 当前排名
    }
    
    /// <summary>
    /// 积分交易记录DTO
    /// </summary>
    public class PointTransactionDTO
    {
        public int Id { get; set; }
        public int Amount { get; set; }
        public string Type { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public string RelatedItem { get; set; } // 相关项目描述（如课程名称）
    }
    
    /// <summary>
    /// 积分历史记录DTO（分页）
    /// </summary>
    public class PointsHistoryDTO
    {
        public List<PointTransactionDTO> Transactions { get; set; }
        public int TotalCount { get; set; }
        public int TotalEarned { get; set; } // 总收入
        public int TotalSpent { get; set; } // 总支出
    }
    
    /// <summary>
    /// 排名DTO
    /// </summary>
    public class RankDTO
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string AvatarUrl { get; set; }
        public int Level { get; set; }
        public int TotalPoints { get; set; }
        public int Rank { get; set; }
        public bool IsCurrentUser { get; set; }
    }
    
    /// <summary>
    /// 学习连续记录DTO
    /// </summary>
    public class LearningStreakDTO
    {
        public int CurrentDays { get; set; }
        public int MaxDays { get; set; }
        public DateTime LastActivityDate { get; set; }
        public bool IsActive { get; set; }
        public DateTime? StreakStartDate { get; set; }
        public int CurrentWeekDays { get; set; } // 本周已学习天数
        public List<bool> WeekActivity { get; set; } // 一周七天的活动状态
        public int NextMilestone { get; set; } // 下一个里程碑
        public int StreakBonus { get; set; } // 当前连续登录奖励
    }
    
    /// <summary>
    /// 奖励DTO
    /// </summary>
    public class RewardDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string ImageUrl { get; set; }
        public int PointsValue { get; set; }
        public string UnlockCriteria { get; set; }
    }
    
    /// <summary>
    /// 用户奖励DTO
    /// </summary>
    public class UserRewardDTO
    {
        public int Id { get; set; }
        public int RewardId { get; set; }
        public string RewardName { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string ImageUrl { get; set; }
        public DateTime DateEarned { get; set; }
        public bool IsDisplayed { get; set; }
        public bool IsNew { get; set; } // 是否未查看过
    }
    
    /// <summary>
    /// 反馈事件DTO
    /// </summary>
    public class FeedbackEventDTO
    {
        public string EventType { get; set; }
        public string Message { get; set; }
        public int? PointsEarned { get; set; }
        public UserAchievementDTO Achievement { get; set; }
        public UserRewardDTO Reward { get; set; }
        public int? LevelUp { get; set; }
        public bool? StreakUpdated { get; set; }
        public int? CurrentStreak { get; set; }
        public Dictionary<string, object> AdditionalData { get; set; }
    }
    
    /// <summary>
    /// 学习进度反馈DTO
    /// </summary>
    public class LearningProgressFeedbackDTO
    {
        public int CompletedItems { get; set; }
        public int TotalItems { get; set; }
        public double Percentage { get; set; }
        public string NextItemType { get; set; }
        public string NextItemTitle { get; set; }
        public int? EstimatedMinutesToComplete { get; set; }
        public List<string> SuggestedActions { get; set; }
        public int TodayLearningTimeMinutes { get; set; }
        public int WeekLearningTimeMinutes { get; set; }
    }
    
    /// <summary>
    /// 动机提示DTO
    /// </summary>
    public class MotivationalPromptDTO
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public string PromptType { get; set; }
        public string TriggerCondition { get; set; }
    }
    
    /// <summary>
    /// 游戏化设置DTO
    /// </summary>
    public class GamificationSettingDTO
    {
        public string SettingKey { get; set; }
        public string SettingValue { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public bool IsEnabled { get; set; }
    }
    
    /// <summary>
    /// 用户游戏化偏好DTO
    /// </summary>
    public class UserGamificationPreferencesDTO
    {
        public bool EnableNotifications { get; set; } = true;
        public bool ShowRankings { get; set; } = true;
        public bool ShowAchievementPopups { get; set; } = true;
        public bool EnableDailyGoals { get; set; } = true;
        public bool EnableChallenges { get; set; } = true;
        public bool ShowMotivationalPrompts { get; set; } = true;
        public int DailyGoalMinutes { get; set; } = 30;
        public string PreferredRewardCategory { get; set; } = "All";
    }
    
    /// <summary>
    /// 学习事件记录请求DTO
    /// </summary>
    public class RecordLearningEventDTO
    {
        public string EventType { get; set; }
        public Dictionary<string, object> EventContext { get; set; }
        public int? CourseId { get; set; }
        public int? LessonId { get; set; }
        public int? AssignmentId { get; set; }
        public int? QuizId { get; set; }
    }
    
    /// <summary>
    /// 学习反馈响应DTO
    /// </summary>
    public class LearningFeedbackResponseDTO
    {
        public string Message { get; set; }
        public int? PointsEarned { get; set; }
        public List<FeedbackEventDTO> Events { get; set; }
        public LearningProgressFeedbackDTO Progress { get; set; }
        public List<string> Suggestions { get; set; }
        public string MotivationalMessage { get; set; }
    }
    
    /// <summary>
    /// 用户统计摘要DTO
    /// </summary>
    public class UserStatsSummaryDTO
    {
        public UserPointsDTO Points { get; set; }
        public LearningStreakDTO Streak { get; set; }
        public int TotalAchievements { get; set; }
        public int TotalRewards { get; set; }
        public int CompletedCourses { get; set; }
        public int LearningHours { get; set; }
        public int WeeklyActivityPercentage { get; set; }
    }
} 