using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using OnlineLearningSystem.API.Models;
using OnlineLearningSystem.API.DTOs;
using OnlineLearningSystem.API.Services;
using Microsoft.AspNetCore.Authentication;

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
        
        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            TokenService tokenService,
            IMapper mapper)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _mapper = mapper;
        }
        
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDTO>> Login(LoginDTO loginDto)
        {
            try 
            {
                // 验证用户
                var user = await _userManager.FindByNameAsync(loginDto.Username);
                if (user == null)
                {
                    return Unauthorized(new AuthResponseDTO
                    {
                        Success = false,
                        Message = "用户名或密码不正确"
                    });
                }
                
                if (!user.IsActive)
                {
                    return Unauthorized(new AuthResponseDTO
                    {
                        Success = false,
                        Message = "账户已被禁用，请联系管理员"
                    });
                }
                
                var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
                if (!result.Succeeded)
                {
                    return Unauthorized(new AuthResponseDTO
                    {
                        Success = false,
                        Message = "用户名或密码不正确"
                    });
                }
                
                // 生成JWT令牌
                var token = _tokenService.GenerateJwtToken(user);
                var refreshToken = _tokenService.GenerateRefreshToken();
                
                // 更新用户的最后登录时间
                user.LastLogin = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);
                
                return new AuthResponseDTO
                {
                    Success = true,
                    Token = token,
                    RefreshToken = refreshToken,
                    Message = "登录成功",
                    User = _mapper.Map<UserDTO>(user)
                };
            }
            catch (Exception ex)
            {
                // 记录错误
                Console.WriteLine($"登录错误: {ex.Message}");
                return StatusCode(500, new AuthResponseDTO 
                { 
                    Success = false, 
                    Message = "登录处理过程中发生错误" 
                });
            }
        }
        
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDTO>> Register(RegisterDTO registerDto)
        {
            try
            {
                // 检查用户名是否已存在
                if (await _userManager.FindByNameAsync(registerDto.Username) != null)
                {
                    return BadRequest(new AuthResponseDTO
                    {
                        Success = false,
                        Message = "用户名已被占用"
                    });
                }
                
                // 检查邮箱是否已存在
                if (await _userManager.FindByEmailAsync(registerDto.Email) != null)
                {
                    return BadRequest(new AuthResponseDTO
                    {
                        Success = false,
                        Message = "邮箱已被注册"
                    });
                }
                
                // 创建新用户
                var newUser = new ApplicationUser
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
                
                var result = await _userManager.CreateAsync(newUser, registerDto.Password);
                if (!result.Succeeded)
                {
                    return BadRequest(new AuthResponseDTO
                    {
                        Success = false,
                        Message = string.Join(", ", result.Errors.Select(e => e.Description))
                    });
                }
                
                // 添加到角色
                await _userManager.AddToRoleAsync(newUser, registerDto.Role);
                
                // 生成JWT令牌
                var token = _tokenService.GenerateJwtToken(newUser);
                var refreshToken = _tokenService.GenerateRefreshToken();
                
                return new AuthResponseDTO
                {
                    Success = true,
                    Token = token,
                    RefreshToken = refreshToken,
                    Message = "注册成功",
                    User = _mapper.Map<UserDTO>(newUser)
                };
            }
            catch (Exception ex)
            {
                // 记录错误
                Console.WriteLine($"注册错误: {ex.Message}");
                return StatusCode(500, new AuthResponseDTO 
                { 
                    Success = false, 
                    Message = "注册处理过程中发生错误"
                });
            }
        }
        
        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDTO>> RefreshToken(RefreshTokenDTO refreshTokenDto)
        {
            try
            {
                if (string.IsNullOrEmpty(refreshTokenDto.Token) || string.IsNullOrEmpty(refreshTokenDto.RefreshToken))
                {
                    return BadRequest(new AuthResponseDTO
                    {
                        Success = false,
                        Message = "令牌或刷新令牌不能为空"
                    });
                }
                
                // 验证令牌（忽略过期时间验证）
                var principal = _tokenService.ValidateTokenWithoutLifetimeValidation(refreshTokenDto.Token);
                if (principal == null)
                {
                    return BadRequest(new AuthResponseDTO
                    {
                        Success = false,
                        Message = "无效的令牌"
                    });
                }
                
                // 获取用户信息
                var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new AuthResponseDTO
                    {
                        Success = false,
                        Message = "令牌中无用户标识"
                    });
                }
                
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || !user.IsActive)
                {
                    return BadRequest(new AuthResponseDTO
                    {
                        Success = false,
                        Message = "用户不存在或已被禁用"
                    });
                }
                
                // TODO: 在生产环境中，应该验证刷新令牌（从数据库中查询）
                // 生成新的令牌
                var newToken = _tokenService.GenerateJwtToken(user);
                var newRefreshToken = _tokenService.GenerateRefreshToken();
                
                return new AuthResponseDTO
                {
                    Success = true,
                    Token = newToken,
                    RefreshToken = newRefreshToken,
                    Message = "令牌刷新成功",
                    User = _mapper.Map<UserDTO>(user)
                };
            }
            catch (Exception ex)
            {
                // 记录错误
                Console.WriteLine($"刷新令牌错误: {ex.Message}");
                return StatusCode(500, new AuthResponseDTO 
                { 
                    Success = false, 
                    Message = "刷新令牌过程中发生错误" 
                });
            }
        }
        
        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<UserDTO>> GetCurrentUser()
        {
            try
            {
                // 获取当前用户ID
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "用户未认证或令牌无效" });
                }

                // 查找用户
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "未找到用户" });
                }
                
                if (!user.IsActive)
                {
                    return Forbid();
                }
                
                // 更新最后登录时间
                user.LastLogin = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);
                
                // 返回用户信息
                return _mapper.Map<UserDTO>(user);
            }
            catch (Exception ex)
            {
                // 记录错误
                Console.WriteLine($"获取当前用户错误: {ex.Message}");
                return StatusCode(500, new { message = "获取用户信息时发生错误" });
            }
        }
    }
} 