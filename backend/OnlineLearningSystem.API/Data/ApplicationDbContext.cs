using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.API.Models;

namespace OnlineLearningSystem.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Material> Materials { get; set; }
        public DbSet<MaterialCategory> MaterialCategories { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<AssignmentSubmission> AssignmentSubmissions { get; set; }
        public DbSet<KnowledgeGraph> KnowledgeGraphs { get; set; }
        public DbSet<KnowledgeNode> KnowledgeNodes { get; set; }
        public DbSet<KnowledgeRelation> KnowledgeRelations { get; set; }
        public DbSet<UserKnowledgeState> UserKnowledgeStates { get; set; }
        public DbSet<CourseChapter> CourseChapters { get; set; }
        public DbSet<ChapterContent> ChapterContents { get; set; }
        
        // 反馈模块相关DbSet
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<FeedbackReply> FeedbackReplies { get; set; }
        public DbSet<FeedbackAttachment> FeedbackAttachments { get; set; }
        public DbSet<LearningRecommendation> LearningRecommendations { get; set; }
        public DbSet<StatusHistory> StatusHistories { get; set; }
        
        // 学习数据相关DbSet
        public DbSet<CourseEnrollment> CourseEnrollments { get; set; }
        public DbSet<StudentChapterProgress> StudentChapterProgresses { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<QuizResult> QuizResults { get; set; }
        public DbSet<LearningTimeRecord> LearningTimeRecords { get; set; }
        
        // 新增模型
        public DbSet<UserMaterialInteraction> UserMaterialInteractions { get; set; }
        public DbSet<CourseTeacher> CourseTeachers { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<LessonResource> LessonResources { get; set; }
        public DbSet<LessonCompletion> LessonCompletions { get; set; }
        
        // 学生评估相关DbSet
        public DbSet<StudentEvaluation> StudentEvaluations { get; set; }
        public DbSet<EvaluationDimension> EvaluationDimensions { get; set; }
        
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            
            // 配置多对多关系 - 学生和课程
            builder.Entity<ApplicationUser>()
                .HasMany(u => u.CourseEnrollments)
                .WithOne(ce => ce.User)
                .HasForeignKey(ce => ce.UserId)
                .OnDelete(DeleteBehavior.Restrict);
                
            // 构建索引
            builder.Entity<Notification>()
                .HasIndex(n => n.UserId);
                
            builder.Entity<Notification>()
                .HasIndex(n => n.Read);
                
            builder.Entity<Course>()
                .HasIndex(c => c.Title);
                
            builder.Entity<Material>()
                .HasIndex(m => m.Title);
                
            builder.Entity<Material>()
                .HasIndex(m => m.Category);
                
            builder.Entity<Material>()
                .HasIndex(m => m.CreatedBy);
                
            // 添加Material表的全文搜索索引
            // 注意：这只是EF Core模型配置，实际全文搜索索引需要在迁移或SQL脚本中创建
            builder.Entity<Material>()
                .HasIndex(m => new { m.Title, m.Description, m.Category })
                .HasDatabaseName("IX_Materials_FullText");
                
            builder.Entity<Assignment>()
                .HasIndex(a => a.CourseId);
                
            builder.Entity<AssignmentSubmission>()
                .HasIndex(s => s.AssignmentId);
                
            builder.Entity<AssignmentSubmission>()
                .HasIndex(s => s.StudentId);
            
            // 反馈相关索引
            builder.Entity<Feedback>()
                .HasIndex(f => f.Status);
                
            builder.Entity<Feedback>()
                .HasIndex(f => f.FeedbackType);
                
            builder.Entity<Feedback>()
                .HasIndex(f => f.StudentId);
                
            builder.Entity<Feedback>()
                .HasIndex(f => f.AssignedToId);
                
            builder.Entity<Feedback>()
                .HasIndex(f => f.CourseId);
                
            builder.Entity<Feedback>()
                .HasIndex(f => f.CreatedAt);
                
            builder.Entity<FeedbackReply>()
                .HasIndex(r => r.FeedbackId);
                
            builder.Entity<FeedbackReply>()
                .HasIndex(r => r.UserId);
                
            builder.Entity<FeedbackAttachment>()
                .HasIndex(a => a.FeedbackId);
                
            builder.Entity<FeedbackAttachment>()
                .HasIndex(a => a.ReplyId);
                
            builder.Entity<LearningRecommendation>()
                .HasIndex(r => r.FeedbackId);
                
            builder.Entity<LearningRecommendation>()
                .HasIndex(r => r.StudentId);
            
            // 状态历史记录索引
            builder.Entity<StatusHistory>()
                .HasIndex(h => h.FeedbackId);
                
            builder.Entity<StatusHistory>()
                .HasIndex(h => h.ChangedById);
                
            builder.Entity<StatusHistory>()
                .HasIndex(h => h.ChangedAt);
            
            // 知识图谱关系配置
            builder.Entity<KnowledgeRelation>()
                .HasOne(r => r.SourceNode)
                .WithMany(n => n.OutgoingRelations)
                .HasForeignKey(r => r.SourceNodeId)
                .OnDelete(DeleteBehavior.Restrict);
                
            builder.Entity<KnowledgeRelation>()
                .HasOne(r => r.TargetNode)
                .WithMany(n => n.IncomingRelations)
                .HasForeignKey(r => r.TargetNodeId)
                .OnDelete(DeleteBehavior.Restrict);
                
            builder.Entity<KnowledgeNode>()
                .HasOne(n => n.Graph)
                .WithMany(g => g.Nodes)
                .HasForeignKey(n => n.GraphId);
                
            builder.Entity<UserKnowledgeState>()
                .HasKey(s => new { s.UserId, s.KnowledgeNodeId });
                
            builder.Entity<UserKnowledgeState>()
                .HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.UserId);
                
            builder.Entity<UserKnowledgeState>()
                .HasOne(s => s.KnowledgeNode)
                .WithMany()
                .HasForeignKey(s => s.KnowledgeNodeId);
            
            // 新增索引
            builder.Entity<UserMaterialInteraction>()
                .HasIndex(i => new { i.UserId, i.MaterialId, i.InteractionType })
                .IsUnique(false);
                
            builder.Entity<UserMaterialInteraction>()
                .HasIndex(i => i.CreatedAt);
            
            // 配置 CourseTeacher 模型
            builder.Entity<CourseTeacher>()
                .HasKey(ct => new { ct.CourseId, ct.TeacherId });
            
            // 配置Course和ApplicationUser之间的多对多关系
            builder.Entity<CourseEnrollment>()
                .HasKey(ce => ce.Id);
            
            builder.Entity<CourseEnrollment>()
                .HasOne(ce => ce.User)
                .WithMany(u => u.CourseEnrollments)
                .HasForeignKey(ce => ce.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.Entity<CourseEnrollment>()
                .HasOne(ce => ce.Course)
                .WithMany(c => c.Enrollments)
                .HasForeignKey(ce => ce.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.Entity<CourseTeacher>()
                .HasKey(ct => ct.Id);
            
            builder.Entity<CourseTeacher>()
                .HasOne(ct => ct.User)
                .WithMany(u => u.TeachingCourses)
                .HasForeignKey(ct => ct.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.Entity<CourseTeacher>()
                .HasOne(ct => ct.Course)
                .WithMany(c => c.Teachers)
                .HasForeignKey(ct => ct.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // 配置Lesson相关的关系
            builder.Entity<Lesson>()
                .HasOne(l => l.Course)
                .WithMany(c => c.Lessons)
                .HasForeignKey(l => l.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.Entity<LessonResource>()
                .HasOne(lr => lr.Lesson)
                .WithMany(l => l.Resources)
                .HasForeignKey(lr => lr.LessonId)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.Entity<LessonCompletion>()
                .HasOne(lc => lc.Lesson)
                .WithMany(l => l.Completions)
                .HasForeignKey(lc => lc.LessonId)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.Entity<LessonCompletion>()
                .HasOne(lc => lc.User)
                .WithMany()
                .HasForeignKey(lc => lc.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 