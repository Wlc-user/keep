@echo off
echo 正在启动调试模式的API服务...
set ASPNETCORE_ENVIRONMENT=Development
echo 环境变量设置为: %ASPNETCORE_ENVIRONMENT%
dotnet run --project OnlineLearningSystem.API.csproj --startup-project DebugProgram.cs --urls=http://localhost:5189
pause 