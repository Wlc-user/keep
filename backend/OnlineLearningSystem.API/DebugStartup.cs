using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace OnlineLearningSystem.API
{
    public class DebugStartup
    {
        public IConfiguration Configuration { get; }
        
        public DebugStartup(IConfiguration configuration)
        {
            Configuration = configuration;
        }
        
        public void ConfigureServices(IServiceCollection services)
        {
            // 添加控制器
            services.AddControllers();
            
            // 添加Swagger
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
            
            // 添加CORS
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", builder =>
                {
                    builder.AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader();
                });
            });
        }
        
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILogger<DebugStartup> logger)
        {
            // 使用开发者异常页面
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                
                // 使用Swagger
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            
            // 使用CORS
            app.UseCors("AllowAll");
            
            // 使用路由
            app.UseRouting();
            
            // 使用静态文件
            app.UseStaticFiles();
            
            // 使用端点
            app.UseEndpoints(endpoints =>
            {
                // 添加健康检查端点
                endpoints.MapGet("/health", () => "Healthy!");
                
                // 添加调试端点
                endpoints.MapGet("/debug", () => new { status = "Debug mode", timestamp = System.DateTime.UtcNow });
                
                // 添加控制器
                endpoints.MapControllers();
            });
            
            logger.LogInformation("调试启动类已启动，环境：{Environment}", env.EnvironmentName);
        }
    }
} 