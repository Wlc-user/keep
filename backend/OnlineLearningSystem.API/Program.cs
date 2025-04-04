using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.Middleware;
using OnlineLearningSystem.API.Models;
using OnlineLearningSystem.API.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 添加Serilog日志记录服务
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// 添加数据库上下文
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 添加Identity服务
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options => {
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// 添加AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// 添加TokenService
builder.Services.AddScoped<TokenService>();

// 添加搜索服务
builder.Services.AddScoped<ISearchService, SearchService>();

// 添加推荐服务
builder.Services.AddScoped<IRecommendationService, RecommendationService>();

// 添加服务到容器
builder.Services.AddControllers();

// 配置API文档
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 添加CORS服务
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173", 
                "http://localhost:5174", 
                "http://localhost:5175",
                "http://localhost:5177",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174",
                "http://127.0.0.1:5175",
                "http://127.0.0.1:5177",
                "http://127.0.0.1:3000"
            ) // 前端开发服务器地址
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .SetIsOriginAllowed(origin => true); // 在开发阶段允许所有来源
    });
});

// 配置认证服务（JWT）
builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "defaultDevKey123456789012345678901234"))
    };
});

// 添加授权服务
builder.Services.AddAuthorization();

var app = builder.Build();

// 配置HTTP请求管道
// 添加全局异常处理中间件
app.UseExceptionHandling();

// 开发环境配置
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    
    // 在开发环境中，调整CORS策略以便调试
    app.UseCors(builder => 
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
}
else 
{
    // 在生产环境使用配置的CORS策略
    app.UseCors("AllowFrontend");
    
    app.UseHttpsRedirection();
}

// 添加静态文件服务
app.UseStaticFiles();

// 启用认证和授权
app.UseAuthentication();
app.UseAuthorization();

// 健康检查端点
app.MapGet("/health", () => "Healthy").AllowAnonymous();

// API版本端点
app.MapGet("/api/version", () => new { Version = "1.0.0", Environment = app.Environment.EnvironmentName })
   .AllowAnonymous();

// 使用控制器路由
app.MapControllers();

// 添加数据库初始化
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        await DbInitializer.Initialize(context, userManager, roleManager);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

app.Run();

// 添加必要的类型
public class WeatherForecast
{
    public DateOnly Date { get; set; }
    public int TemperatureC { get; set; }
    public string? Summary { get; set; }
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
