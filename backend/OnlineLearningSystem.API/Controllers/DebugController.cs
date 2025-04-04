using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;

namespace OnlineLearningSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class DebugController : ControllerBase
    {
        private readonly ILogger<DebugController> _logger;
        private readonly IWebHostEnvironment _environment;
        
        public DebugController(ILogger<DebugController> logger, IWebHostEnvironment environment)
        {
            _logger = logger;
            _environment = environment;
        }
        
        [HttpGet]
        public IActionResult Get()
        {
            _logger.LogInformation("调试控制器Get请求");
            return Ok(new 
            { 
                message = "Debug controller is working", 
                timestamp = DateTime.UtcNow,
                environment = _environment.EnvironmentName
            });
        }
        
        [HttpGet("info")]
        public IActionResult GetInfo()
        {
            _logger.LogInformation("获取调试信息");
            
            var environmentVariables = new Dictionary<string, string>();
            foreach (var env in Environment.GetEnvironmentVariables())
            {
                var entry = (System.Collections.DictionaryEntry)env;
                var key = entry.Key.ToString();
                if (key != null && (key.StartsWith("ASPNETCORE_") || key.StartsWith("DOTNET_")))
                {
                    environmentVariables[key] = entry.Value?.ToString() ?? "";
                }
            }
            
            return Ok(new
            {
                time = DateTime.UtcNow,
                environment = _environment.EnvironmentName,
                applicationName = _environment.ApplicationName,
                contentRoot = _environment.ContentRootPath,
                webRoot = _environment.WebRootPath,
                environmentVariables = environmentVariables
            });
        }
        
        [HttpGet("error-test")]
        public IActionResult TestError()
        {
            try
            {
                _logger.LogInformation("测试错误处理中间件");
                
                // 故意引发异常
                throw new Exception("这是一个测试异常");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "测试异常捕获");
                throw; // 重新抛出异常，让异常处理中间件处理
            }
        }
        
        [HttpPost("login-test")]
        public IActionResult TestLogin([FromBody] LoginTestModel model)
        {
            _logger.LogInformation("测试登录 - 用户名: {Username}", model.Username);
            
            return Ok(new 
            {
                success = true,
                token = $"test-token-{Guid.NewGuid()}",
                refreshToken = $"test-refresh-token-{Guid.NewGuid()}",
                message = "测试登录成功",
                user = new 
                {
                    id = $"test-user-{Guid.NewGuid()}",
                    username = model.Username,
                    name = $"测试用户({model.Username})",
                    role = model.Username.Contains("admin") ? "admin" : "user",
                    avatar = "/assets/default-avatar.png"
                }
            });
        }
    }
    
    public class LoginTestModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
} 