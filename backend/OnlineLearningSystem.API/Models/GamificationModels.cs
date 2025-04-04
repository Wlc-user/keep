using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineLearningSystem.API.Models
{
    /// <summary>
    /// 成就定义模型 - 定义系统中可获得的成就
    /// </summary>
    public class Achievement
    {
        [Key]
        public int Id { get; set; }
        
        [Required, MaxLength(100)]
        public string Name { get; set; }
        
        [Required, MaxLength(500)]
        public string Description { get; set; }
        
        [Required, MaxLength(50)]
        public string Category { get; set; }  // 学习、参与、社交等类别
        
        [Required]
        public int RequiredPoints { get; set; } // 获得该成就所需积分
        
        public string BadgeImageUrl { get; set; } // 成就徽章图片URL
        
        [MaxLength(500)]
        public string UnlockCriteria { get; set; } // 解锁条件描述
        
        [MaxLength(500)]
        public string CongratulationMessage { get; set; } // 获得成就时的祝贺消息
        
        public int DisplayOrder { get; set; } = 0; // 显示顺序
        
        public bool IsActive { get; set; } = true; // 是否激活
        
        public bool IsSecret { get; set; } = false; // 是否为隐藏成就
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // 导航属性
        public virtual ICollection<UserAchievement> UserAchievements { get; set; }
    }
    
    /// <summary>
    /// 用户获得的成就记录
    /// </summary>
    public class UserAchievement
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; }
        
        [Required]
        public int AchievementId { get; set; }
        
        [Required]
        public DateTime DateEarned { get; set; } = DateTime.UtcNow;
        
        public bool IsViewed { get; set; } = false; // 用户是否已查看通知
        
        public int ProgressValue { get; set; } = 100; // 进度值，通常为100%表示完成
        
        [MaxLength(500)]
        public string Context { get; set; } // 获得成就的上下文信息
        
        // 导航属性
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }
        
        [ForeignKey("AchievementId")]
        public virtual Achievement Achievement { get; set; }
    }
    
    /// <summary>
    /// 学习连续记录 - 记录用户连续学习的天数
    /// </summary>
    public class LearningStreak
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; }
        
        public int CurrentDays { get; set; } = 0; // 当前连续天数
        
        public int MaxDays { get; set; } = 0; // 历史最大连续天数
        
        [Required]
        public DateTime LastActivityDate { get; set; } // 最后活动日期
        
        public bool IsActive { get; set; } = true; // 当前是否仍在连续中
        
        public DateTime? StreakStartDate { get; set; } // 当前连续开始日期
        
        public DateTime? MaxStreakStartDate { get; set; } // 最长连续开始日期
        
        public DateTime? MaxStreakEndDate { get; set; } // 最长连续结束日期
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // 导航属性
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }
    }
    
    /// <summary>
    /// 用户积分模型 - 记录用户累计的积分信息
    /// </summary>
    public class UserPoint
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; }
        
        public int TotalPoints { get; set; } = 0; // 总积分
        
        public int AvailablePoints { get; set; } = 0; // 可用积分（未使用）
        
        public int Level { get; set; } = 1; // 当前等级
        
        public int PointsToNextLevel { get; set; } = 100; // 距离下一级所需积分
        
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        
        // 等级经验相关
        public int CurrentLevelPoints { get; set; } = 0; // 当前等级积累的经验
        public int NextLevelThreshold { get; set; } = 100; // 下一级所需经验
        
        // 导航属性
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }
        
        public virtual ICollection<PointTransaction> Transactions { get; set; }
    }
    
    /// <summary>
    /// 积分交易记录 - 详细记录积分的获得和使用
    /// </summary>
    public class PointTransaction
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; }
        
        [Required]
        public int Amount { get; set; } // 积分数量(正为获得，负为消费)
        
        [Required, MaxLength(50)]
        public string Type { get; set; } // 类型：学习完成、连续登录、完成作业等
        
        [MaxLength(500)]
        public string Description { get; set; } // 详细描述
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // 关联信息
        public int? CourseId { get; set; }
        public int? LessonId { get; set; }
        public int? AssignmentId { get; set; }
        public int? QuizId { get; set; }
        
        // 导航属性
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }
    }
    
    /// <summary>
    /// 奖励系统定义 - 系统中可获得的奖励和徽章
    /// </summary>
    public class Reward
    {
        [Key]
        public int Id { get; set; }
        
        [Required, MaxLength(100)]
        public string Name { get; set; }
        
        [MaxLength(500)]
        public string Description { get; set; }
        
        [Required, MaxLength(50)]
        public string Type { get; set; } // 徽章、称号、特权等
        
        public string ImageUrl { get; set; } // 奖励图片URL
        
        public int PointsValue { get; set; } = 0; // 价值多少积分
        
        public bool IsActive { get; set; } = true;
        
        [MaxLength(200)]
        public string UnlockCriteria { get; set; } // 解锁条件
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // 导航属性
        public virtual ICollection<UserReward> UserRewards { get; set; }
    }
    
    /// <summary>
    /// 用户获得的奖励记录
    /// </summary>
    public class UserReward
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; }
        
        [Required]
        public int RewardId { get; set; }
        
        public DateTime DateEarned { get; set; } = DateTime.UtcNow;
        
        public bool IsDisplayed { get; set; } = false; // 是否在用户个人资料中显示
        
        public bool IsViewed { get; set; } = false; // 用户是否已查看通知
        
        // 导航属性
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }
        
        [ForeignKey("RewardId")]
        public virtual Reward Reward { get; set; }
    }
    
    /// <summary>
    /// 游戏化设置 - 控制系统游戏化功能的参数
    /// </summary>
    public class GamificationSetting
    {
        [Key]
        public int Id { get; set; }
        
        [Required, MaxLength(100)]
        public string SettingKey { get; set; }
        
        [Required]
        public string SettingValue { get; set; }
        
        [MaxLength(500)]
        public string Description { get; set; }
        
        [MaxLength(50)]
        public string Category { get; set; }
        
        public bool IsEnabled { get; set; } = true;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
    
    /// <summary>
    /// 学习反馈事件 - 记录系统中出现的各种学习相关事件
    /// </summary>
    public class LearningEvent
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; }
        
        [Required, MaxLength(50)]
        public string EventType { get; set; } // 事件类型：完成课程、回答问题等
        
        [Required]
        public DateTime EventTime { get; set; } = DateTime.UtcNow;
        
        [Required]
        public string EventContext { get; set; } // 事件上下文JSON数据
        
        // 关联信息
        public int? CourseId { get; set; }
        public int? LessonId { get; set; }
        public int? AssignmentId { get; set; }
        public int? QuizId { get; set; }
        
        public bool IsProcessed { get; set; } = false; // 事件是否已被处理
        
        public DateTime? ProcessedAt { get; set; }
        
        // 导航属性
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }
    }
    
    /// <summary>
    /// 学习动机提示 - 系统向用户推送的激励消息
    /// </summary>
    public class MotivationalPrompt
    {
        [Key]
        public int Id { get; set; }
        
        [Required, MaxLength(500)]
        public string Content { get; set; }
        
        [Required, MaxLength(50)]
        public string PromptType { get; set; } // 提示类型：鼓励、提醒、庆祝等
        
        [MaxLength(50)]
        public string TriggerCondition { get; set; } // 触发条件
        
        public bool IsActive { get; set; } = true;
        
        public int Priority { get; set; } = 1; // 优先级
        
        // 可选目标用户角色
        [MaxLength(50)]
        public string TargetRole { get; set; }
        
        // 可选关联学习进度
        public int? MinimumLevel { get; set; }
        public int? MaximumLevel { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
    
    /// <summary>
    /// 用户接收到的动机提示记录
    /// </summary>
    public class UserPromptDelivery
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; }
        
        [Required]
        public int PromptId { get; set; }
        
        public DateTime DeliveredAt { get; set; } = DateTime.UtcNow;
        
        public bool IsRead { get; set; } = false;
        
        [MaxLength(50)]
        public string DeliveryChannel { get; set; } // 投放渠道：网站、邮件、推送等
        
        // 导航属性
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }
        
        [ForeignKey("PromptId")]
        public virtual MotivationalPrompt Prompt { get; set; }
    }
    
    /// <summary>
    /// 积分类型常量
    /// </summary>
    public static class PointTypes
    {
        public const string CourseCompletion = "CourseCompletion"; // 完成课程
        public const string LessonCompletion = "LessonCompletion"; // 完成课时
        public const string DailyLogin = "DailyLogin"; // 每日登录
        public const string StreakBonus = "StreakBonus"; // 连续学习奖励
        public const string AssignmentSubmission = "AssignmentSubmission"; // 提交作业
        public const string QuizCompletion = "QuizCompletion"; // 完成测验
        public const string CorrectAnswer = "CorrectAnswer"; // 正确答案
        public const string ProfileCompletion = "ProfileCompletion"; // 完善个人资料
        public const string ForumParticipation = "ForumParticipation"; // 论坛参与
        public const string HelpOthers = "HelpOthers"; // 帮助他人
        public const string ContentContribution = "ContentContribution"; // 内容贡献
        public const string FeedbackSubmission = "FeedbackSubmission"; // 提交反馈
    }
    
    /// <summary>
    /// 事件类型常量
    /// </summary>
    public static class EventTypes
    {
        public const string CourseStarted = "CourseStarted"; // 开始课程
        public const string CourseCompleted = "CourseCompleted"; // 完成课程
        public const string ChapterCompleted = "ChapterCompleted"; // 完成章节
        public const string LessonCompleted = "LessonCompleted"; // 完成课时
        public const string AssignmentSubmitted = "AssignmentSubmitted"; // 提交作业
        public const string QuizAttempted = "QuizAttempted"; // 尝试测验
        public const string QuizCompleted = "QuizCompleted"; // 完成测验
        public const string StreakUpdated = "StreakUpdated"; // 连续学习更新
        public const string AchievementEarned = "AchievementEarned"; // 获得成就
        public const string LevelUp = "LevelUp"; // 等级提升
        public const string PointsEarned = "PointsEarned"; // 获得积分
        public const string MaterialViewed = "MaterialViewed"; // 查看资料
    }
} 