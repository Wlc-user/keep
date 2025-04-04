using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.API.Data;
using OnlineLearningSystem.API.DTOs;
using OnlineLearningSystem.API.Models;
using OnlineLearningSystem.API.Models.Constants;
using OnlineLearningSystem.API.Controllers;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace OnlineLearningSystem.API.Services
{
    public interface ISearchService
    {
        Task<SearchResultDTO<DTOs.MaterialDTO>> SearchMaterialsAsync(
            string searchTerm, 
            string userId, 
            string userRole, 
            string status = null, 
            string category = null, 
            string accessLevel = null, 
            int pageNumber = 1, 
            int pageSize = 10);
    }
    
    public class SearchService : ISearchService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        
        public SearchService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
        
        public async Task<SearchResultDTO<DTOs.MaterialDTO>> SearchMaterialsAsync(
            string searchTerm, 
            string userId, 
            string userRole, 
            string status = null, 
            string category = null, 
            string accessLevel = null, 
            int pageNumber = 1, 
            int pageSize = 10)
        {
            // 验证搜索参数
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                throw new ArgumentException("搜索关键词不能为空", nameof(searchTerm));
            }
            
            // 基于用户角色和权限调整搜索参数
            if (userRole != "admin" && userRole != "teacher")
            {
                // 普通用户只能搜索已审核通过的素材
                status = MaterialStatus.Approved;
                
                // 普通用户无法按访问级别筛选
                accessLevel = null;
            }
            
            // 准备存储过程参数
            var parameters = new List<SqlParameter>
            {
                new SqlParameter("@SearchTerm", searchTerm),
                new SqlParameter("@PageNumber", pageNumber),
                new SqlParameter("@PageSize", pageSize)
            };
            
            if (!string.IsNullOrEmpty(status))
            {
                parameters.Add(new SqlParameter("@Status", status));
            }
            else
            {
                parameters.Add(new SqlParameter("@Status", DBNull.Value));
            }
            
            if (!string.IsNullOrEmpty(category))
            {
                parameters.Add(new SqlParameter("@Category", category));
            }
            else
            {
                parameters.Add(new SqlParameter("@Category", DBNull.Value));
            }
            
            if (!string.IsNullOrEmpty(accessLevel))
            {
                parameters.Add(new SqlParameter("@AccessLevel", accessLevel));
            }
            else
            {
                parameters.Add(new SqlParameter("@AccessLevel", DBNull.Value));
            }
            
            // 执行存储过程
            var results = new List<DTOs.MaterialDTO>();
            int totalCount = 0;
            
            try
            {
                var conn = _context.Database.GetDbConnection();
                await conn.OpenAsync();
                
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = "dbo.SearchMaterials";
                    cmd.CommandType = CommandType.StoredProcedure;
                    
                    // 添加参数
                    foreach (var param in parameters)
                    {
                        var dbParam = cmd.CreateParameter();
                        dbParam.ParameterName = param.ParameterName;
                        dbParam.Value = param.Value;
                        cmd.Parameters.Add(dbParam);
                    }
                    
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            // 读取搜索结果总数
                            if (totalCount == 0 && !reader.IsDBNull(reader.GetOrdinal("TotalCount")))
                            {
                                totalCount = reader.GetInt32(reader.GetOrdinal("TotalCount"));
                            }
                            
                            // 构建DTO
                            var material = new DTOs.MaterialDTO
                            {
                                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                                Title = reader.GetString(reader.GetOrdinal("Title")),
                                Description = !reader.IsDBNull(reader.GetOrdinal("Description")) 
                                    ? reader.GetString(reader.GetOrdinal("Description")) 
                                    : null,
                                Category = !reader.IsDBNull(reader.GetOrdinal("Category"))
                                    ? reader.GetString(reader.GetOrdinal("Category"))
                                    : null,
                                FilePath = reader.GetString(reader.GetOrdinal("FilePath")),
                                FileType = !reader.IsDBNull(reader.GetOrdinal("FileType"))
                                    ? reader.GetString(reader.GetOrdinal("FileType"))
                                    : null,
                                FileSize = reader.GetInt64(reader.GetOrdinal("FileSize")),
                                ThumbnailUrl = !reader.IsDBNull(reader.GetOrdinal("ThumbnailUrl"))
                                    ? reader.GetString(reader.GetOrdinal("ThumbnailUrl"))
                                    : null,
                                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                                CreatedBy = !reader.IsDBNull(reader.GetOrdinal("CreatedBy"))
                                    ? reader.GetString(reader.GetOrdinal("CreatedBy"))
                                    : null,
                                CourseId = !reader.IsDBNull(reader.GetOrdinal("CourseId"))
                                    ? reader.GetInt32(reader.GetOrdinal("CourseId"))
                                    : (int?)null,
                                CourseName = !reader.IsDBNull(reader.GetOrdinal("CourseName"))
                                    ? reader.GetString(reader.GetOrdinal("CourseName"))
                                    : null,
                                AccessLevel = reader.GetString(reader.GetOrdinal("AccessLevel")),
                                Status = reader.GetString(reader.GetOrdinal("Status")),
                                ReviewedBy = !reader.IsDBNull(reader.GetOrdinal("ReviewedBy"))
                                    ? reader.GetString(reader.GetOrdinal("ReviewedBy"))
                                    : null,
                                ReviewedAt = !reader.IsDBNull(reader.GetOrdinal("ReviewedAt"))
                                    ? reader.GetDateTime(reader.GetOrdinal("ReviewedAt"))
                                    : (DateTime?)null,
                                ReviewComments = !reader.IsDBNull(reader.GetOrdinal("ReviewComments"))
                                    ? reader.GetString(reader.GetOrdinal("ReviewComments"))
                                    : null,
                                ViewCount = reader.GetInt32(reader.GetOrdinal("ViewCount")),
                                DownloadCount = reader.GetInt32(reader.GetOrdinal("DownloadCount")),
                                LikeCount = reader.GetInt32(reader.GetOrdinal("LikeCount"))
                            };
                            
                            // 添加权限过滤
                            if (CanUserAccessMaterial(material, userId, userRole))
                            {
                                results.Add(material);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"执行全文搜索时发生错误: {ex.Message}", ex);
            }
            
            // 返回搜索结果
            return new SearchResultDTO<DTOs.MaterialDTO>
            {
                Items = results.ToArray(),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                SearchTerm = searchTerm
            };
        }
        
        // 检查用户是否有权访问素材
        private bool CanUserAccessMaterial(DTOs.MaterialDTO material, string userId, string userRole)
        {
            // 管理员可以访问所有素材
            if (userRole == "admin")
                return true;
            
            // 创建者可以访问自己的素材
            if (material.CreatedBy == userId)
                return true;
            
            // 只有已通过审核的素材对普通用户可见
            if (material.Status != "Approved" && userRole != "teacher")
                return false;
            
            // 根据访问级别检查权限
            switch (material.AccessLevel)
            {
                case "Public":
                    return true;
                    
                case "Teacher":
                    return userRole == "teacher";
                    
                case "Institution":
                    return !string.IsNullOrEmpty(userId); // 任何登录用户
                    
                case "Private":
                    return false; // 私有素材只有创建者可访问，已在前面检查过
                    
                default:
                    return false;
            }
        }
    }
    
    // 搜索结果DTO
    public class SearchResultDTO<T>
    {
        public T[] Items { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public string SearchTerm { get; set; }
        public long ElapsedMilliseconds { get; set; }
    }
} 