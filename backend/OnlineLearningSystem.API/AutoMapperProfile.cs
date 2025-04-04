using AutoMapper;
using OnlineLearningSystem.API.Models;
using OnlineLearningSystem.API.DTOs;

namespace OnlineLearningSystem.API
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // 用户映射
            CreateMap<ApplicationUser, DTOs.UserDTO>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role))
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.UserName));
            
            // 材料映射
            CreateMap<Material, DTOs.MaterialDTO>()
                .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.Creator.UserName));
                
            CreateMap<DTOs.CreateMaterialDTO, Material>();
            CreateMap<DTOs.UpdateMaterialDTO, Material>();
            
            // 反馈映射
            CreateMap<Feedback, DTOs.FeedbackDTO>()
                .ForMember(dest => dest.StudentName, opt => opt.MapFrom(src => $"{src.Student.FirstName} {src.Student.LastName}"))
                .ForMember(dest => dest.AssignedToName, opt => opt.MapFrom(src => src.AssignedTo != null ? $"{src.AssignedTo.FirstName} {src.AssignedTo.LastName}" : null))
                .ForMember(dest => dest.CourseName, opt => opt.MapFrom(src => src.Course != null ? src.Course.Title : null))
                .ForMember(dest => dest.MaterialTitle, opt => opt.MapFrom(src => src.Material != null ? src.Material.Title : null));
                
            CreateMap<Feedback, DTOs.FeedbackDetailDTO>();
            
            // 反馈回复映射
            CreateMap<FeedbackReply, DTOs.FeedbackReplyDTO>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => $"{src.User.FirstName} {src.User.LastName}"));
                
            // 反馈附件映射
            CreateMap<FeedbackAttachment, DTOs.AttachmentDTO>();
            
            // 学习推荐映射
            CreateMap<LearningRecommendation, DTOs.LearningRecommendationDTO>();
            
            // 课程映射
            CreateMap<Course, DTOs.CourseDTO>();
                
            // 章节映射
            CreateMap<CourseChapter, ChapterDTO>()
                .ForMember(dest => dest.ContentCount, opt => opt.MapFrom(src => src.Contents.Count));
                
            // 章节内容映射
            CreateMap<ChapterContent, ContentDTO>();
            
            // 选课映射
            CreateMap<CourseEnrollment, EnrollmentDTO>()
                .ForMember(dest => dest.CourseName, opt => opt.MapFrom(src => src.Course.Title))
                .ForMember(dest => dest.CourseImage, opt => opt.MapFrom(src => src.Course.ImageUrl));
                
            // 学习记录映射
            CreateMap<LearningTimeRecord, LearningRecordDTO>()
                .ForMember(dest => dest.CourseName, opt => opt.MapFrom(src => src.Course.Title))
                .ForMember(dest => dest.ChapterTitle, opt => opt.MapFrom(src => src.CourseChapter != null ? src.CourseChapter.Title : null));
                
            // 知识图谱映射
            CreateMap<KnowledgeGraph, KnowledgeGraphDTO>();
            CreateMap<KnowledgeNode, KnowledgeNodeDTO>();
            CreateMap<KnowledgeRelation, KnowledgeRelationDTO>();
            
            // 测验结果映射
            CreateMap<QuizResult, QuizResultDTO>()
                .ForMember(dest => dest.QuizTitle, opt => opt.MapFrom(src => src.Quiz.Title))
                .ForMember(dest => dest.PassingScore, opt => opt.MapFrom(src => src.Quiz.PassingScore))
                .ForMember(dest => dest.IsPassed, opt => opt.MapFrom(src => src.Score >= src.Quiz.PassingScore));
        }
    }
    
    // 课程和章节DTO
    public class CourseMappingDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public string TeacherId { get; set; }
        public string TeacherName { get; set; }
        public string Category { get; set; }
        public int ChapterCount { get; set; }
        public int EnrollmentCount { get; set; }
        public double Rating { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    
    public class ChapterDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Order { get; set; }
        public int CourseId { get; set; }
        public int ContentCount { get; set; }
        public int DurationMinutes { get; set; }
    }
    
    public class ContentDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string ContentType { get; set; }
        public string ContentUrl { get; set; }
        public string TextContent { get; set; }
        public int Order { get; set; }
        public int ChapterId { get; set; }
        public int DurationMinutes { get; set; }
    }
    
    // 进度相关DTO
    public class CourseEnrollmentDTO
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; }
        public string CourseImageUrl { get; set; }
        public double CompletionPercentage { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime EnrolledAt { get; set; }
        public DateTime? LastAccessedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? Rating { get; set; }
        public string CertificateId { get; set; }
    }
    
    public class ChapterProgressDTO
    {
        public int Id { get; set; }
        public int CourseChapterId { get; set; }
        public string ChapterTitle { get; set; }
        public double CompletionPercentage { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? LastAccessedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int TotalLearningTimeMinutes { get; set; }
    }
    
    // 测验相关DTO
    public class QuizDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public int? CourseId { get; set; }
        public string CourseName { get; set; }
        public int? CourseChapterId { get; set; }
        public string ChapterTitle { get; set; }
        public int? TimeLimit { get; set; }
        public int PassingScore { get; set; }
        public int DifficultyLevel { get; set; }
        public bool RandomizeQuestions { get; set; }
        public bool ShowResultImmediately { get; set; }
    }
    
    public class QuizResultDTO
    {
        public int Id { get; set; }
        public int QuizId { get; set; }
        public string QuizTitle { get; set; }
        public int Score { get; set; }
        public int MaxScore { get; set; }
        public int PassingScore { get; set; }
        public bool IsPassed { get; set; }
        public DateTime CompletedAt { get; set; }
        public int DurationSeconds { get; set; }
        public int CorrectAnswers { get; set; }
        public int WrongAnswers { get; set; }
        public int UnansweredQuestions { get; set; }
    }
} 