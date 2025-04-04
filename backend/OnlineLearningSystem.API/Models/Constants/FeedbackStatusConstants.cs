namespace OnlineLearningSystem.API.Models.Constants
{
    /// <summary>
    /// 反馈状态常量
    /// </summary>
    public static class FeedbackStatusConstants
    {
        /// <summary>
        /// 待处理状态
        /// </summary>
        public const string Pending = "待处理";
        
        /// <summary>
        /// 处理中状态
        /// </summary>
        public const string InProgress = "处理中";
        
        /// <summary>
        /// 已回复状态
        /// </summary>
        public const string Replied = "已回复";
        
        /// <summary>
        /// 已解决状态
        /// </summary>
        public const string Resolved = "已解决";
        
        /// <summary>
        /// 已关闭状态
        /// </summary>
        public const string Closed = "已关闭";
        
        /// <summary>
        /// 获取所有反馈状态列表
        /// </summary>
        public static readonly string[] AllStatuses = new[]
        {
            Pending,
            InProgress,
            Replied,
            Resolved,
            Closed
        };
    }
    
    /// <summary>
    /// 反馈类型常量
    /// </summary>
    public static class FeedbackTypeConstants
    {
        /// <summary>
        /// 学习问题
        /// </summary>
        public const string LearningIssue = "学习问题";
        
        /// <summary>
        /// 功能建议
        /// </summary>
        public const string FeatureSuggestion = "功能建议";
        
        /// <summary>
        /// 内容问题
        /// </summary>
        public const string ContentIssue = "内容问题";
        
        /// <summary>
        /// 技术问题
        /// </summary>
        public const string TechnicalIssue = "技术问题";
        
        /// <summary>
        /// 学习建议
        /// </summary>
        public const string LearningAdvice = "学习建议";
        
        /// <summary>
        /// 其他问题
        /// </summary>
        public const string Other = "其他";
        
        /// <summary>
        /// 获取所有反馈类型列表
        /// </summary>
        public static readonly string[] AllTypes = new[]
        {
            LearningIssue,
            FeatureSuggestion,
            ContentIssue,
            TechnicalIssue,
            LearningAdvice,
            Other
        };
    }
    
    /// <summary>
    /// 反馈优先级常量
    /// </summary>
    public static class FeedbackPriorityConstants
    {
        /// <summary>
        /// 低优先级
        /// </summary>
        public const string Low = "低";
        
        /// <summary>
        /// 中优先级
        /// </summary>
        public const string Normal = "中";
        
        /// <summary>
        /// 高优先级
        /// </summary>
        public const string High = "高";
        
        /// <summary>
        /// 紧急优先级
        /// </summary>
        public const string Urgent = "紧急";
        
        /// <summary>
        /// 获取所有优先级列表
        /// </summary>
        public static readonly string[] AllPriorities = new[]
        {
            Low,
            Normal,
            High,
            Urgent
        };
    }
} 