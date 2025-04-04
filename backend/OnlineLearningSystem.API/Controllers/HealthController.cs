using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;

namespace OnlineLearningSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HealthController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<HealthController> _logger;

        public HealthController(IWebHostEnvironment environment, ILogger<HealthController> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult CheckHealth()
        {
            _logger.LogInformation("健康检查请求: {Time}", DateTime.UtcNow);
            
            return Ok(new 
            { 
                status = "Healthy", 
                message = "API is running", 
                timestamp = DateTime.UtcNow,
                environment = _environment.EnvironmentName
            });
        }
        
        [HttpGet("ping")]
        [AllowAnonymous]
        public IActionResult Ping()
        {
            _logger.LogInformation("Ping请求: {Time}", DateTime.UtcNow);
            return Ok("pong");
        }
        
        [HttpGet("version")]
        [AllowAnonymous]
        public IActionResult GetVersion()
        {
            _logger.LogInformation("版本请求: {Time}", DateTime.UtcNow);
            return Ok(new 
            { 
                Version = "1.0.1", 
                Environment = _environment.EnvironmentName,
                BuildDate = DateTime.UtcNow.ToString("yyyy-MM-dd")
            });
        }
        
        [HttpGet("config")]
        [AllowAnonymous]
        public IActionResult GetConfig()
        {
            _logger.LogInformation("配置请求: {Time}", DateTime.UtcNow);
            
            // 只在开发环境返回配置信息
            if (_environment.IsDevelopment())
            {
                return Ok(new
                {
                    Environment = _environment.EnvironmentName,
                    AspNetCoreEnvironment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
                    ContentRootPath = _environment.ContentRootPath,
                    WebRootPath = _environment.WebRootPath,
                    ApplicationName = _environment.ApplicationName
                });
            }
            
            return Ok(new { Environment = _environment.EnvironmentName });
        }
    }
} 