using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OnlineLearningSystem.API
{
    public static class SeedData
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            
            // 确保数据库已创建
            await context.Database.MigrateAsync();
            
            // 添加系统通知
            await SeedSystemNotifications(context, userManager);
            
            await context.SaveChangesAsync();
        }
        
        private static async Task SeedSystemNotifications(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            if (!context.Notifications.Any(n => n.Category == "system" && n.Type == "info"))
            {
                var admin = await userManager.FindByNameAsync("admin");
                if (admin == null)
                {
                    // 如果没有admin用户，创建一个
                    admin = new ApplicationUser
                    {
                        UserName = "admin",
                        Email = "admin@example.com",
                        FirstName = "系统",
                        LastName = "管理员",
                        Role = "admin",
                        DisplayName = "系统管理员",
                        AvatarUrl = "/assets/avatar/admin.png",
                        EmailConfirmed = true
                    };
                    await userManager.CreateAsync(admin, "Admin123!");
                    await userManager.AddToRoleAsync(admin, "admin");
                }
                
                var systemNotifications = new List<Notification>
                {
                    new Notification
                    {
                        Title = "欢迎使用在线学习系统",
                        Content = "感谢您选择我们的在线学习平台，祝您学习愉快！",
                        Type = "info",
                        Category = "system",
                        SenderName = "系统管理员",
                        SenderAvatar = "/assets/avatar/admin.png",
                        CreatedAt = DateTime.UtcNow,
                        UserId = admin.Id
                    },
                    new Notification
                    {
                        Title = "系统使用指南",
                        Content = "查看帮助文档，了解系统的全部功能和使用方法。",
                        Type = "info",
                        Category = "system",
                        SenderName = "系统管理员",
                        SenderAvatar = "/assets/avatar/admin.png",
                        CreatedAt = DateTime.UtcNow.AddMinutes(-5),
                        UserId = admin.Id
                    },
                    new Notification
                    {
                        Title = "系统更新通知",
                        Content = "系统将于近期更新到V2.0版本，新增多项功能，敬请期待。",
                        Type = "info",
                        Category = "system",
                        SenderName = "系统管理员",
                        SenderAvatar = "/assets/avatar/admin.png",
                        CreatedAt = DateTime.UtcNow.AddMinutes(-10),
                        UserId = admin.Id
                    }
                };
                
                context.Notifications.AddRange(systemNotifications);
                await context.SaveChangesAsync();
            }
        }
    }
} 