using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OnlineLearningSystem.API.Services;
using System.Text.Json;
using OnlineLearningSystem.API.Models;
using OnlineLearningSystem.API.DTOs;

namespace OnlineLearningSystem.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            // ... existing code ...
            
            // 定义JSON序列化选项
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            
            // 添加AutoMapper配置
            services.AddAutoMapper(config =>
            {
                // ... existing code ...
                
                // 知识图谱相关映射
                config.CreateMap<KnowledgeGraph, KnowledgeGraphDTO>()
                    .ForMember(dest => dest.NodeCount, opt => opt.MapFrom(src => src.Nodes.Count))
                    .ForMember(dest => dest.CreatorName, opt => opt.MapFrom(src => src.Creator.UserName))
                    .ForMember(dest => dest.CourseName, opt => opt.MapFrom(src => src.Course != null ? src.Course.Title : null));
                    
                config.CreateMap<KnowledgeGraph, KnowledgeGraphDetailDTO>()
                    .ForMember(dest => dest.NodeCount, opt => opt.MapFrom(src => src.Nodes.Count))
                    .ForMember(dest => dest.CreatorName, opt => opt.MapFrom(src => src.Creator.UserName))
                    .ForMember(dest => dest.CourseName, opt => opt.MapFrom(src => src.Course != null ? src.Course.Title : null))
                    .ForMember(dest => dest.Relations, opt => opt.MapFrom(src => 
                        src.Nodes.SelectMany(n => n.OutgoingRelations).Distinct()));
                    
                config.CreateMap<KnowledgeNode, KnowledgeNodeDTO>()
                    .ForMember(dest => dest.Properties, opt => opt.MapFrom(src => 
                        !string.IsNullOrEmpty(src.Properties) ? JsonSerializer.Deserialize<object>(src.Properties, jsonOptions) : null));
                        
                config.CreateMap<KnowledgeNode, KnowledgeNodeDetailDTO>()
                    .ForMember(dest => dest.Properties, opt => opt.MapFrom(src => 
                        !string.IsNullOrEmpty(src.Properties) ? JsonSerializer.Deserialize<object>(src.Properties, jsonOptions) : null));
                        
                config.CreateMap<KnowledgeRelation, KnowledgeRelationDTO>()
                    .ForMember(dest => dest.SourceNodeLabel, opt => opt.MapFrom(src => src.SourceNode.Label))
                    .ForMember(dest => dest.TargetNodeLabel, opt => opt.MapFrom(src => src.TargetNode.Label))
                    .ForMember(dest => dest.Properties, opt => opt.MapFrom(src => 
                        !string.IsNullOrEmpty(src.Properties) ? JsonSerializer.Deserialize<object>(src.Properties, jsonOptions) : null));

                // 用户知识状态映射
                config.CreateMap<UserKnowledgeState, UserKnowledgeStateDTO>()
                    .ForMember(dest => dest.KnowledgeNodeLabel, opt => opt.MapFrom(src => src.KnowledgeNode.Label));
            });
            
            // ... existing code ...
            
            // 添加服务
            services.AddScoped<IKnowledgeGraphService, KnowledgeGraphService>();
            
            // ... existing code ...
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "OnlineLearningSystem.API v1"));
            }

            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseCors("CorsPolicy");
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHealthChecks("/health");
            });
        }
    }
} 