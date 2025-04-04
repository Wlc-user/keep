using Microsoft.IdentityModel.Tokens;
using OnlineLearningSystem.API.Models;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Principal;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace OnlineLearningSystem.API.Services
{
    public class TokenService
    {
        private readonly IConfiguration _configuration;
        
        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        
        public string CreateToken(ApplicationUser user)
        {
            var claims = new List<Claim>
            {
                new Claim("id", user.Id),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("FirstName", user.FirstName),
                new Claim("LastName", user.LastName)
            };
            
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration["Jwt:Key"] ?? "defaultDevKey123456789012345678901234"));
                
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            
            var expiration = DateTime.UtcNow.AddMinutes(Convert.ToDouble(
                _configuration["Jwt:DurationInMinutes"] ?? "60"));
                
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expiration,
                signingCredentials: creds
            );
            
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        
        public string GenerateRefreshToken()
        {
            // 只生成一个随机的令牌字符串，不尝试保存到用户对象
            // 在生产环境中，应该将刷新令牌存储在数据库表中，并关联到用户ID
            return Guid.NewGuid().ToString();
        }
        
        public ClaimsPrincipal ValidateTokenWithoutLifetimeValidation(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "defaultDevKey123456789012345678901234");
                
                // 禁用生命周期验证
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ValidateLifetime = false // 关键设置：不验证过期时间
                };
                
                // 验证token
                SecurityToken securityToken;
                var principal = tokenHandler.ValidateToken(token, validationParameters, out securityToken);
                
                return principal;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Token验证失败: {ex.Message}");
                return null;
            }
        }
        
        // 为调试目的生成一个临时令牌
        public string GenerateDebugToken(string username, string role)
        {
            var claims = new List<Claim>
            {
                new Claim("id", $"debug-{Guid.NewGuid()}"),
                new Claim(ClaimTypes.NameIdentifier, $"debug-{Guid.NewGuid()}"),
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Email, $"{username}@example.com"),
                new Claim(ClaimTypes.Role, role),
                new Claim("FirstName", "调试"),
                new Claim("LastName", "用户")
            };
            
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration["Jwt:Key"] ?? "defaultDevKey123456789012345678901234"));
                
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            
            var expiration = DateTime.UtcNow.AddHours(24); // 调试token有效期设置为24小时
                
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expiration,
                signingCredentials: creds
            );
            
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
} 