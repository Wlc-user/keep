@echo off
echo 正在请求调试登录...
curl -X POST http://localhost:5188/api/auth/debug-login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"Admin123!\"}"
echo.
echo 测试完成 