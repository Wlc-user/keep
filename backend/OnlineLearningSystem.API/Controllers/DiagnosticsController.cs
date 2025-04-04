using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OnlineLearningSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiagnosticsController : ControllerBase
    {
        private readonly ILogger<DiagnosticsController> _logger;

        public DiagnosticsController(ILogger<DiagnosticsController> logger)
        {
            _logger = logger;
        }

        [HttpGet("health")]
        [AllowAnonymous]
        public IActionResult HealthCheck()
        {
            _logger.LogInformation("健康检查被访问");
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown"
            });
        }

        [HttpOptions("cors-test")]
        [AllowAnonymous]
        public IActionResult CorsOptionsTest()
        {
            _logger.LogInformation("CORS预检请求被访问");
            return Ok();
        }

        [HttpGet("cors-test")]
        [AllowAnonymous]
        public IActionResult CorsGetTest()
        {
            _logger.LogInformation("CORS GET测试被访问");
            string origin = Request.Headers.ContainsKey("Origin") 
                ? Request.Headers["Origin"].ToString() 
                : "No Origin header";
                
            return Ok(new
            {
                status = "success",
                message = "CORS测试成功",
                requestHeaders = GetRequestHeadersInfo(),
                origin = origin,
                timestamp = DateTime.UtcNow
            });
        }

        [HttpPost("cors-test")]
        [AllowAnonymous]
        public IActionResult CorsPostTest([FromBody] object data)
        {
            _logger.LogInformation("CORS POST测试被访问");
            return Ok(new
            {
                status = "success",
                message = "CORS POST测试成功",
                receivedData = data,
                timestamp = DateTime.UtcNow
            });
        }

        [HttpGet("config")]
        [AllowAnonymous]
        public IActionResult GetAppConfig()
        {
            _logger.LogInformation("配置信息端点被访问");
            
            // 仅返回非敏感配置信息
            return Ok(new
            {
                appName = "Online Learning System API",
                version = "1.0.0",
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                serverTime = DateTime.UtcNow,
                timeZone = TimeZoneInfo.Local.DisplayName,
                corsEnabled = true,
                authEnabled = true
            });
        }

        [HttpGet("error-test")]
        [AllowAnonymous]
        public IActionResult ErrorTest([FromQuery] string type)
        {
            _logger.LogInformation("错误测试端点被访问，类型: {Type}", type);
            
            switch(type?.ToLower())
            {
                case "notfound":
                    return NotFound(new { error = "资源不存在", code = 404 });
                case "badrequest":
                    return BadRequest(new { error = "请求参数错误", code = 400 });
                case "unauthorized":
                    return Unauthorized(new { error = "未授权访问", code = 401 });
                case "forbidden":
                    return StatusCode(403, new { error = "禁止访问", code = 403 });
                case "server":
                    return StatusCode(500, new { error = "服务器内部错误", code = 500 });
                case "timeout":
                    // 模拟延迟响应
                    Task.Delay(10000).Wait();
                    return Ok(new { message = "延迟响应", code = 200 });
                default:
                    return Ok(new 
                    { 
                        message = "测试成功", 
                        code = 200, 
                        availableTypes = new[] { "notfound", "badrequest", "unauthorized", "forbidden", "server", "timeout" } 
                    });
            }
        }
        
        private Dictionary<string, string> GetRequestHeadersInfo()
        {
            var headers = new Dictionary<string, string>();
            foreach (var header in Request.Headers)
            {
                if (!header.Key.ToLower().Contains("authorization")) // 不包含敏感的授权头
                {
                    headers[header.Key] = header.Value;
                }
            }
            return headers;
        }
    }
} 