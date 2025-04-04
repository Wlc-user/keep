using AutoMapper;
using OnlineLearningSystem.API.DTOs;
using OnlineLearningSystem.API.Models;

namespace OnlineLearningSystem.API.Utils
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // 用户映射
            CreateMap<ApplicationUser, UserDTO>()
                .ForMember(dest => dest.DisplayName, 
                    opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));
            
            // 通知映射
            CreateMap<Notification, NotificationDTO>()
                .ForMember(dest => dest.Sender, opt => opt.MapFrom(src => 
                    new SenderDTO { Name = src.SenderName, Avatar = src.SenderAvatar }));
            
            CreateMap<CreateNotificationDTO, Notification>();
        }
    }
} 