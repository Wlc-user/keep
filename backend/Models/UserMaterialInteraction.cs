using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace OnlineLearningSystem.API.Models
{
    public class UserMaterialInteraction
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string UserId { get; set; }
        
        [Required]
        public int MaterialId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string InteractionType { get; set; } // Like, View, Download, etc.
        
        [Required]
        public DateTime CreatedAt { get; set; }
        
        // Navigation properties
        [ForeignKey("UserId")]
        public ApplicationUser User { get; set; }
        
        [ForeignKey("MaterialId")]
        public Material Material { get; set; }
    }
} 