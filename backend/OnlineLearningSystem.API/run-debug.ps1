Write-Host "正在启动调试模式的API服务..." -ForegroundColor Green

# 设置环境变量
$env:ASPNETCORE_ENVIRONMENT = "Development"
Write-Host "环境变量设置为: $env:ASPNETCORE_ENVIRONMENT" -ForegroundColor Yellow

# 尝试停止正在运行的dotnet进程
try {
    $processes = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "正在停止现有的dotnet进程..." -ForegroundColor Yellow
        $processes | Stop-Process -Force
        Start-Sleep -Seconds 2
    }
} catch {
    Write-Host "没有找到正在运行的dotnet进程" -ForegroundColor Gray
}

# 启动应用
Write-Host "启动应用: dotnet run --project OnlineLearningSystem.API.csproj --urls=http://localhost:5189" -ForegroundColor Cyan
& dotnet run --project OnlineLearningSystem.API.csproj --urls=http://localhost:5189 