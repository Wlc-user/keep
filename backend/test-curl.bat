@echo off
echo 正在请求创建应急管理员账户...
curl -X POST http://localhost:5188/api/auth/emergency-admin -H "Content-Type: application/json"
echo.
echo 测试完成 