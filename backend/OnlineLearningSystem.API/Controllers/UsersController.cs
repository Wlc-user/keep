using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.DTOs;
using OnlineLearningSystem.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace OnlineLearningSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        
        public UsersController(
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext context,
            IMapper mapper)
        {
            _userManager = userManager;
            _context = context;
            _mapper = mapper;
        }
        
        // GET: api/users
        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<IEnumerable<DTOs.UserDTO>>> GetUsers([FromQuery] string role = null)
        {
            var query = _userManager.Users.AsQueryable();
            
            if (!string.IsNullOrEmpty(role))
            {
                query = query.Where(u => u.Role == role);
            }
            
            var users = await query.ToListAsync();
            return _mapper.Map<List<DTOs.UserDTO>>(users);
        }
        
        // GET: api/users/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<DTOs.UserDTO>> GetUser(string id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            
            // 只允许管理员或者用户本人查看用户信息
            if (currentUserRole != "admin" && currentUserId != id)
            {
                return Forbid();
            }
            
            var user = await _userManager.FindByIdAsync(id);
            
            if (user == null)
            {
                return NotFound();
            }
            
            return _mapper.Map<DTOs.UserDTO>(user);
        }
        
        // GET: api/users/teachers
        [HttpGet("teachers")]
        public async Task<ActionResult<IEnumerable<DTOs.UserDTO>>> GetTeachers()
        {
            var teachers = await _userManager.Users
                .Where(u => u.Role == "teacher")
                .ToListAsync();
                
            return _mapper.Map<List<DTOs.UserDTO>>(teachers);
        }
        
        // GET: api/users/students
        [HttpGet("students")]
        [Authorize(Roles = "admin,teacher")]
        public async Task<ActionResult<IEnumerable<DTOs.UserDTO>>> GetStudents()
        {
            var students = await _userManager.Users
                .Where(u => u.Role == "student")
                .ToListAsync();
                
            return _mapper.Map<List<DTOs.UserDTO>>(students);
        }
        
        // PUT: api/users/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] DTOs.UserDTO userDto)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            
            // 只允许管理员或者用户本人更新用户信息
            if (currentUserRole != "admin" && currentUserId != id)
            {
                return Forbid();
            }
            
            var user = await _userManager.FindByIdAsync(id);
            
            if (user == null)
            {
                return NotFound();
            }
            
            // 普通用户不能修改自己的角色
            if (currentUserRole != "admin" && userDto.Role != user.Role)
            {
                return BadRequest(new { Message = "普通用户不能修改自己的角色" });
            }
            
            // 更新用户信息
            user.FirstName = userDto.FirstName;
            user.LastName = userDto.LastName;
            user.DisplayName = userDto.DisplayName ?? $"{userDto.FirstName} {userDto.LastName}";
            user.AvatarUrl = userDto.AvatarUrl;
            
            // 只有管理员可以更新角色
            if (currentUserRole == "admin")
            {
                user.Role = userDto.Role;
            }
            
            var result = await _userManager.UpdateAsync(user);
            
            if (!result.Succeeded)
            {
                return BadRequest(new { Message = "更新用户信息失败", Errors = result.Errors });
            }
            
            return NoContent();
        }
        
        // DELETE: api/users/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            
            if (user == null)
            {
                return NotFound();
            }
            
            var result = await _userManager.DeleteAsync(user);
            
            if (!result.Succeeded)
            {
                return BadRequest(new { Message = "删除用户失败", Errors = result.Errors });
            }
            
            return NoContent();
        }
        
        // POST: api/users/{id}/reset-password
        [HttpPost("{id}/reset-password")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> ResetPassword(string id, [FromBody] string newPassword)
        {
            var user = await _userManager.FindByIdAsync(id);
            
            if (user == null)
            {
                return NotFound();
            }
            
            // 生成重置令牌
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            
            // 重置密码
            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
            
            if (!result.Succeeded)
            {
                return BadRequest(new { Message = "重置密码失败", Errors = result.Errors });
            }
            
            return Ok(new { Message = "密码重置成功" });
        }
    }
} 