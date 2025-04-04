using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineLearningSystem.API.Models
{
    /// <summary>
    /// 用户与学习材料的交互记录
    /// </summary>
    public class UserMaterialInteraction
    {
        /// <summary>
        /// 交互记录ID
        /// </summary>
        [Key]
        public int Id { get; set; }
        
        /// <summary>
        /// 用户ID
        /// </summary>
        [Required]
        public string UserId { get; set; }
        
        /// <summary>
        /// 材料ID
        /// </summary>
        [Required]
        public int MaterialId { get; set; }
        
        /// <summary>
        /// 交互类型（查看、下载、点赞等）
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string InteractionType { get; set; }
        
        /// <summary>
        /// 交互时间
        /// </summary>
        [Required]
        public DateTime InteractionDate { get; set; }
        
        /// <summary>
        /// 交互时长（秒）
        /// </summary>
        public int? DurationSeconds { get; set; }
        
        /// <summary>
        /// 交互进度（百分比）
        /// </summary>
        public int? ProgressPercentage { get; set; }
        
        /// <summary>
        /// 设备类型
        /// </summary>
        [MaxLength(50)]
        public string DeviceType { get; set; }
        
        /// <summary>
        /// 交互位置/来源
        /// </summary>
        [MaxLength(100)]
        public string Source { get; set; }
        
        /// <summary>
        /// 备注信息
        /// </summary>
        [MaxLength(500)]
        public string Notes { get; set; }
        
        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// 修改时间
        /// </summary>
        public DateTime? UpdatedAt { get; set; }
        
        /// <summary>
        /// 导航属性：用户
        /// </summary>
        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }
        
        /// <summary>
        /// 导航属性：材料
        /// </summary>
        [ForeignKey("MaterialId")]
        public virtual Material Material { get; set; }
    }
    
    /// <summary>
    /// 用户材料交互类型常量
    /// </summary>
    public static class InteractionTypeConstants
    {
        /// <summary>
        /// 查看材料
        /// </summary>
        public const string View = "查看";
        
        /// <summary>
        /// 下载材料
        /// </summary>
        public const string Download = "下载";
        
        /// <summary>
        /// 点赞材料
        /// </summary>
        public const string Like = "点赞";
        
        /// <summary>
        /// 取消点赞
        /// </summary>
        public const string Unlike = "取消点赞";
        
        /// <summary>
        /// 收藏材料
        /// </summary>
        public const string Favorite = "收藏";
        
        /// <summary>
        /// 取消收藏
        /// </summary>
        public const string Unfavorite = "取消收藏";
        
        /// <summary>
        /// 评分
        /// </summary>
        public const string Rate = "评分";
        
        /// <summary>
        /// 评论
        /// </summary>
        public const string Comment = "评论";
        
        /// <summary>
        /// 分享
        /// </summary>
        public const string Share = "分享";
    }
} 