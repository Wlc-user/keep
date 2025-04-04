using Microsoft.AspNetCore.Mvc;

namespace OnlineLearningSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        public IActionResult Index()
        {
            return Ok(new
            {
                Status = "OK",
                Message = "API服务正常运行",
                Timestamp = DateTime.UtcNow,
                Version = "1.0.0"
            });
        }
        
        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok("pong");
        }
    }
} 