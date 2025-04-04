using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.Models;
using OnlineLearningSystem.API.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

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

// 添加RecommendationService服务
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
        policy.WithOrigins("http://localhost:5173", "http://localhost:5177") // 前端开发服务器地址
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
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
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 启用HTTPS重定向
app.UseHttpsRedirection();

// 启用CORS
app.UseCors("AllowFrontend");

// 启用认证和授权
app.UseAuthentication();
app.UseAuthorization();

// 添加直接的健康检查端点
app.MapGet("/health", () => "Healthy")
    .WithName("GetHealth")
    .AllowAnonymous();

app.MapGet("/api/health", () => new { status = "Healthy", message = "API is running", timestamp = DateTime.UtcNow })
    .WithName("GetApiHealth")
    .AllowAnonymous();

// API版本端点
app.MapGet("/api/version", () => new { Version = "1.0.0", Environment = app.Environment.EnvironmentName })
    .AllowAnonymous();

// 使用控制器路由
app.MapControllers();

// 添加数据初始化
try
{
    await InitializeData(app.Services);
}
catch (Exception ex)
{
    Console.WriteLine($"数据库初始化错误: {ex.Message}");
}

app.Run();

// 数据初始化方法
async Task InitializeData(IServiceProvider serviceProvider)
{
    // 使用SeedData类初始化系统数据
    await SeedData.InitializeAsync(serviceProvider);
    Console.WriteLine("数据库和种子数据已初始化完成");
}

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

internal record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
} 