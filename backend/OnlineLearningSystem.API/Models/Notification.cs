using System;

namespace OnlineLearningSystem.API.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Type { get; set; } // info, success, warning, error
        public bool Read { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Link { get; set; }
        public string Category { get; set; }
        
        // 外键
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }
        
        // 发送者信息 (可能为null表示系统消息)
        public string SenderName { get; set; }
        public string SenderAvatar { get; set; }
    }
} 