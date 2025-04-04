using System;
using System.ComponentModel.DataAnnotations;

namespace OnlineLearningSystem.API.DTOs
{
    public class NotificationDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Type { get; set; } // info, success, warning, error
        public bool Read { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Link { get; set; }
        public string Category { get; set; }
        
        // 发送者信息
        public SenderDTO Sender { get; set; }
    }
    
    public class SenderDTO
    {
        public string Name { get; set; }
        public string Avatar { get; set; }
    }
    
    public class CreateNotificationDTO
    {
        [Required]
        public string Title { get; set; }
        
        [Required]
        public string Content { get; set; }
        
        public string Type { get; set; } = "info";
        
        public string Link { get; set; }
        
        public string Category { get; set; }
        
        // 可以为null表示发送给所有用户
        public string UserId { get; set; }
    }
    
    public class NotificationListDTO
    {
        public NotificationDTO[] Items { get; set; }
        public int TotalCount { get; set; }
        public int UnreadCount { get; set; }
    }
} 