Write-Host "开始测试API端点..."

# 测试健康检查端点
try {
    Write-Host "`n> 测试健康检查端点: http://localhost:5189/health"
    $response = Invoke-RestMethod -Uri "http://localhost:5189/health" -Method Get
    Write-Host "响应: $response"
} catch {
    Write-Host "错误: $_" -ForegroundColor Red
}

# 测试API健康检查端点
try {
    Write-Host "`n> 测试API健康检查端点: http://localhost:5189/api/health"
    $response = Invoke-RestMethod -Uri "http://localhost:5189/api/health" -Method Get
    Write-Host "响应: $($response | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "错误: $_" -ForegroundColor Red
}

# 测试公共通知端点
try {
    Write-Host "`n> 测试公共通知端点: http://localhost:5189/api/notifications/public"
    $response = Invoke-RestMethod -Uri "http://localhost:5189/api/notifications/public" -Method Get
    Write-Host "响应: $($response | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "错误: $_" -ForegroundColor Red
}

# 测试调试登录端点
try {
    Write-Host "`n> 测试调试登录端点: http://localhost:5189/api/auth/debug-login"
    $body = @{
        Username = "admin"
        Password = "Admin123!"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:5189/api/auth/debug-login" -Method Post -Body $body -ContentType "application/json"
    Write-Host "响应: $($response | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "错误: $_" -ForegroundColor Red
    Write-Host "响应内容: $($_.Exception.Response)"
}

Write-Host "`nAPI测试完成。" 