using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace OnlineLearningSystem.API.TestConsole
{
    public static class ApiTestConsole
    {
        private static readonly HttpClient client = new HttpClient();
        private static readonly string baseUrl = "http://localhost:5189";
        
        public static async Task Main(string[] args)
        {
            Console.WriteLine("API测试控制台启动...");
            
            try
            {
                // 测试健康检查
                await TestHealthEndpoint();
                
                // 测试调试端点
                await TestDebugEndpoint();
                
                // 测试登录
                await TestLoginEndpoint();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"测试过程中出现错误: {ex.Message}");
            }
            
            Console.WriteLine("测试完成，按任意键退出...");
            Console.ReadKey();
        }
        
        private static async Task TestHealthEndpoint()
        {
            Console.WriteLine("\n测试健康检查端点...");
            
            try
            {
                var response = await client.GetAsync($"{baseUrl}/health");
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"响应: {content}");
                
                Console.WriteLine("健康检查端点测试成功!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"健康检查端点测试失败: {ex.Message}");
            }
        }
        
        private static async Task TestDebugEndpoint()
        {
            Console.WriteLine("\n测试调试端点...");
            
            try
            {
                var response = await client.GetAsync($"{baseUrl}/api/debug");
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"响应: {content}");
                
                Console.WriteLine("调试端点测试成功!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"调试端点测试失败: {ex.Message}");
            }
        }
        
        private static async Task TestLoginEndpoint()
        {
            Console.WriteLine("\n测试登录端点...");
            
            try
            {
                var loginData = new
                {
                    Username = "admin",
                    Password = "Admin123!"
                };
                
                var json = JsonSerializer.Serialize(loginData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await client.PostAsync($"{baseUrl}/api/debug/login-test", content);
                response.EnsureSuccessStatusCode();
                
                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"响应: {responseContent}");
                
                Console.WriteLine("登录端点测试成功!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"登录端点测试失败: {ex.Message}");
            }
        }
    }
} 