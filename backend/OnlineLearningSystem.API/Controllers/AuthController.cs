using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.API.DTOs;
using OnlineLearningSystem.API.Models;
using OnlineLearningSystem.API.Services;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Hosting;

namespace OnlineLearningSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly TokenService _tokenService;
        private readonly IMapper _mapper;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;
        
        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            TokenService tokenService,
            IMapper mapper,
            ILogger<AuthController> logger,
            IConfiguration configuration,
            IWebHostEnvironment environment)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _mapper = mapper;
            _logger = logger;
            _configuration = configuration;
            _environment = environment;
        }
        
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginRequest loginRequest)
        {
            _logger.LogInformation($"尝试登录用户: {loginRequest.Username}");
            
            // 查找用户
            var user = await _userManager.FindByNameAsync(loginRequest.Username);
            if (user == null)
            {
                _logger.LogWarning($"用户名不存在: {loginRequest.Username}");
                return Unauthorized(new { success = false, message = "用户名或密码错误" });
            }
            
            // 验证密码
            var result = await _signInManager.CheckPasswordSignInAsync(user, loginRequest.Password, false);
            if (!result.Succeeded)
            {
                _logger.LogWarning($"密码验证失败: {loginRequest.Username}");
                return Unauthorized(new { success = false, message = "用户名或密码错误" });
            }
            
            // 生成Token
            var token = _tokenService.CreateToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();
            
            // 临时解决方案：由于数据库中没有RefreshToken和RefreshTokenExpiryTime字段，
            // 我们不再保存这些值到用户对象
            // user.RefreshToken = refreshToken;
            // user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            
            // 仅更新最后登录时间
            user.LastLogin = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);
            
            // 返回用户信息和Token
            return Ok(new
            {
                success = true,
                token,
                refreshToken,
                message = "登录成功",
                user = new
                {
                    id = user.Id,
                    username = user.UserName,
                    name = $"{user.FirstName} {user.LastName}",
                    email = user.Email,
                    role = user.Role,
                    avatar = user.AvatarUrl
                }
            });
        }
        
        [HttpPost("debug-login")]
        [AllowAnonymous]
        public async Task<IActionResult> DebugLogin(LoginRequest loginRequest)
        {
            _logger.LogInformation($"调试登录尝试: {loginRequest.Username}, 环境: {Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "未设置"}");
            
            try 
            {
                // 开发环境检查 - 更灵活的检查方式
                var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                var isDevelopmentOrLocalEnv = string.IsNullOrEmpty(env) || 
                                              env.Equals("Development", StringComparison.OrdinalIgnoreCase) ||
                                              env.Equals("Local", StringComparison.OrdinalIgnoreCase);
                
                if (isDevelopmentOrLocalEnv || _environment.IsDevelopment())
                {
                    _logger.LogInformation("调试登录启用：当前处于开发环境");
                    
                    // 根据用户名确定角色
                    var role = "student"; // 默认角色
                    
                    if (loginRequest.Username.Contains("admin", StringComparison.OrdinalIgnoreCase))
                    {
                        role = "admin";
                    }
                    else if (loginRequest.Username.Contains("teacher", StringComparison.OrdinalIgnoreCase))
                    {
                        role = "teacher";
                    }
                    
                    // 生成调试用的Token
                    var token = $"debug-token-{Guid.NewGuid()}";
                    var refreshToken = $"debug-refresh-{Guid.NewGuid()}";
                    
                    var debugUser = new
                    {
                        id = $"debug-{Guid.NewGuid()}",
                        username = loginRequest.Username,
                        name = $"调试用户({role})",
                        email = $"{loginRequest.Username}@example.com",
                        role,
                        avatar = "/assets/default-avatar.png"
                    };
                    
                    _logger.LogInformation($"调试登录成功，返回用户: {System.Text.Json.JsonSerializer.Serialize(debugUser)}");
                    
                    // 返回调试用户信息
                    return Ok(new
                    {
                        success = true,
                        token,
                        refreshToken,
                        message = "调试登录成功",
                        user = debugUser
                    });
                }
                
                // 非开发环境返回未授权错误
                _logger.LogWarning("尝试在非开发环境中使用调试登录");
                return Unauthorized(new { success = false, message = "调试登录仅在开发环境可用" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "调试登录过程中发生异常");
                throw; // 让全局异常处理程序处理此异常
            }
        }
        
        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken(RefreshTokenRequest request)
        {
            if (string.IsNullOrEmpty(request.RefreshToken))
            {
                return BadRequest(new { success = false, message = "刷新令牌不能为空" });
            }
            
            // 临时解决方案：由于数据库表中缺少RefreshToken和RefreshTokenExpiryTime字段
            // 我们将在开发环境中始终返回新的令牌，而不进行实际验证
            if (_environment.IsDevelopment())
            {
                _logger.LogWarning("开发环境中的临时方案：不验证刷新令牌，直接颁发新令牌");
                
                // 创建一个临时用户对象（仅用于生成令牌，不保存到数据库）
                var tempUser = new ApplicationUser
                {
                    Id = Guid.NewGuid().ToString(),
                    UserName = "temp_admin",
                    Email = "temp_admin@example.com",
                    Role = "admin",
                    FirstName = "临时",
                    LastName = "管理员"
                };
                
                // 生成新的访问令牌和刷新令牌
                var newToken = _tokenService.CreateToken(tempUser);
                var newRefreshToken = _tokenService.GenerateRefreshToken();
                
                return Ok(new
                {
                    success = true,
                    token = newToken,
                    refreshToken = newRefreshToken,
                    message = "令牌已刷新（开发环境临时解决方案）"
                });
            }
            
            // 生产环境中，这里需要实现适当的刷新令牌验证逻辑
            return Unauthorized(new { success = false, message = "刷新令牌功能需要数据库支持，请先执行数据库迁移" });
        }
        
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            // 临时解决方案：由于数据库表中缺少RefreshToken字段
            // 我们简化logout方法，不尝试更新数据库
            _logger.LogInformation("用户登出");
            
            return Ok(new { success = true, message = "已成功退出登录" });
        }
        
        // 紧急管理员用户创建端点
        [HttpPost("emergency-admin")]
        [AllowAnonymous]
        public async Task<ActionResult> CreateEmergencyAdmin()
        {
            try
            {
                _logger.LogWarning("正在创建紧急管理员账户");
                
                // 检查管理员是否已存在
                var adminExists = await _userManager.FindByNameAsync("admin");
                if (adminExists != null)
                {
                    // 重置密码
                    _logger.LogInformation("管理员账户已存在，正在重置密码");
                    var resetToken = await _userManager.GeneratePasswordResetTokenAsync(adminExists);
                    var resetResult = await _userManager.ResetPasswordAsync(adminExists, resetToken, "Admin123!");
                    
                    if (!resetResult.Succeeded)
                    {
                        _logger.LogError("重置管理员密码失败: {Errors}", string.Join(", ", resetResult.Errors.Select(e => e.Description)));
                        return BadRequest(new { error = "重置密码失败", details = resetResult.Errors });
                    }
                    
                    // 确保账户处于激活状态
                    adminExists.IsActive = true;
                    await _userManager.UpdateAsync(adminExists);
                    
                    return Ok(new { 
                        success = true, 
                        message = "管理员账户密码已重置", 
                        username = "admin", 
                        password = "Admin123!" 
                    });
                }
                
                // 创建新的管理员用户
                var admin = new ApplicationUser
                {
                    UserName = "admin",
                    Email = "admin@example.com",
                    FirstName = "系统",
                    LastName = "管理员",
                    Role = "admin",
                    DisplayName = "系统管理员",
                    AvatarUrl = "/assets/avatar/admin.png",
                    EmailConfirmed = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                
                var result = await _userManager.CreateAsync(admin, "Admin123!");
                if (!result.Succeeded)
                {
                    _logger.LogError("创建管理员账户失败: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
                    return BadRequest(new { error = "创建管理员账户失败", details = result.Errors });
                }
                
                // 创建角色并分配
                try
                {
                    var roleManager = HttpContext.RequestServices.GetRequiredService<RoleManager<IdentityRole>>();
                    
                    // 确保角色存在
                    if (!await roleManager.RoleExistsAsync("admin"))
                    {
                        await roleManager.CreateAsync(new IdentityRole("admin"));
                    }
                    
                    // 分配角色
                    await _userManager.AddToRoleAsync(admin, "admin");
                    
                    _logger.LogInformation("管理员角色分配成功");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "分配管理员角色失败: {ErrorMessage}", ex.Message);
                    // 继续执行，不影响用户创建
                }
                
                // 创建测试用学生和教师账户
                await CreateTestAccount("teacher", "teacher@example.com", "教师", "账户", "teacher", "Teacher123!");
                await CreateTestAccount("student", "student@example.com", "学生", "账户", "student", "Student123!");
                
                return Ok(new { 
                    success = true, 
                    message = "管理员账户创建成功", 
                    accounts = new[] {
                        new { username = "admin", password = "Admin123!", role = "admin" },
                        new { username = "teacher", password = "Teacher123!", role = "teacher" },
                        new { username = "student", password = "Student123!", role = "student" }
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "创建紧急管理员账户失败: {ErrorMessage}", ex.Message);
                return StatusCode(500, new { 
                    error = "创建紧急管理员账户失败", 
                    message = ex.Message, 
                    stackTrace = ex.StackTrace 
                });
            }
        }
        
        // 创建测试账户的辅助方法
        private async Task<bool> CreateTestAccount(string username, string email, string firstName, string lastName, string role, string password)
        {
            try
            {
                var existingUser = await _userManager.FindByNameAsync(username);
                if (existingUser != null)
                {
                    // 重置密码
                    var resetToken = await _userManager.GeneratePasswordResetTokenAsync(existingUser);
                    var resetResult = await _userManager.ResetPasswordAsync(existingUser, resetToken, password);
                    
                    // 激活账户
                    existingUser.IsActive = true;
                    await _userManager.UpdateAsync(existingUser);
                    
                    _logger.LogInformation("已重置账户 {Username} 的密码", username);
                    return resetResult.Succeeded;
                }
                
                // 创建新用户
                var user = new ApplicationUser
                {
                    UserName = username,
                    Email = email,
                    FirstName = firstName,
                    LastName = lastName,
                    Role = role,
                    DisplayName = $"{firstName} {lastName}",
                    AvatarUrl = $"/assets/avatar/{role}.png",
                    EmailConfirmed = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                
                var result = await _userManager.CreateAsync(user, password);
                if (!result.Succeeded)
                {
                    _logger.LogError("创建账户 {Username} 失败: {Errors}", username, string.Join(", ", result.Errors.Select(e => e.Description)));
                    return false;
                }
                
                // 创建角色并分配
                try
                {
                    var roleManager = HttpContext.RequestServices.GetRequiredService<RoleManager<IdentityRole>>();
                    
                    // 确保角色存在
                    if (!await roleManager.RoleExistsAsync(role))
                    {
                        await roleManager.CreateAsync(new IdentityRole(role));
                    }
                    
                    // 分配角色
                    await _userManager.AddToRoleAsync(user, role);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "分配角色 {Role} 给用户 {Username} 失败", role, username);
                    // 继续执行，不影响账户创建
                }
                
                _logger.LogInformation("成功创建账户 {Username}", username);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "创建账户 {Username} 失败", username);
                return false;
            }
        }
        
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDTO>> Register(RegisterDTO registerDto)
        {
            try
            {
                if (await _userManager.FindByNameAsync(registerDto.Username) != null)
                {
                    return BadRequest(new AuthResponseDTO 
                    { 
                        Success = false, 
                        Message = "用户名已被使用" 
                    });
                }
                
                if (await _userManager.FindByEmailAsync(registerDto.Email) != null)
                {
                    return BadRequest(new AuthResponseDTO 
                    { 
                        Success = false, 
                        Message = "邮箱已被使用" 
                    });
                }
                
                var user = new ApplicationUser
                {
                    UserName = registerDto.Username,
                    Email = registerDto.Email,
                    FirstName = registerDto.FirstName,
                    LastName = registerDto.LastName,
                    Role = registerDto.Role,
                    DisplayName = $"{registerDto.FirstName} {registerDto.LastName}",
                    AvatarUrl = "/assets/avatar/default.png",
                    EmailConfirmed = true
                };
                
                var result = await _userManager.CreateAsync(user, registerDto.Password);
                
                if (!result.Succeeded)
                {
                    return BadRequest(new AuthResponseDTO 
                    { 
                        Success = false, 
                        Message = "注册失败：" + string.Join(", ", result.Errors.Select(e => e.Description)) 
                    });
                }
                
                return Ok(new AuthResponseDTO
                {
                    Success = true,
                    Token = _tokenService.CreateToken(user),
                    RefreshToken = _tokenService.GenerateRefreshToken(),
                    User = _mapper.Map<UserDTO>(user)
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"注册错误: {ex.Message}");
                return StatusCode(500, new AuthResponseDTO
                { 
                    Success = false, 
                    Message = "注册处理过程中发生错误" 
                });
            }
        }
        
        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<UserDTO>> GetCurrentUser()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { success = false, message = "用户未认证或令牌无效" });
                }
                
                var user = await _userManager.FindByIdAsync(userId);
                
                if (user == null)
                {
                    return NotFound(new { success = false, message = "未找到用户" });
                }
                
                // 更新最后访问时间
                user.LastLogin = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);
                
                return Ok(_mapper.Map<UserDTO>(user));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"获取当前用户错误: {ex.Message}");
                return StatusCode(500, new { success = false, message = "获取用户信息时发生错误" });
            }
        }
        
        [Authorize]
        [HttpGet("verify")]
        public IActionResult VerifyToken()
        {
            try
            {
                var userId = User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { success = false, message = "无效的令牌" });
                }
                
                return Ok(new { success = true, message = "令牌有效" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "验证令牌失败");
                return StatusCode(500, new { success = false, message = "验证令牌时发生错误" });
            }
        }
    }
    
    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
    
    public class RefreshTokenRequest
    {
        public string RefreshToken { get; set; }
    }
} 