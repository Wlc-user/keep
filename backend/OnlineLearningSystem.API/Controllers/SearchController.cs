using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineLearningSystem.API.DTOs;
using OnlineLearningSystem.API.Services;
using System;
using System.Diagnostics;
using System.Security.Claims;
using System.Threading.Tasks;

namespace OnlineLearningSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;
        
        public SearchController(ISearchService searchService)
        {
            _searchService = searchService;
        }
        
        // GET: api/search/materials
        [HttpGet("materials")]
        public async Task<ActionResult<SearchResultDTO<DTOs.MaterialDTO>>> SearchMaterials(
            [FromQuery] string term,
            [FromQuery] string status = null,
            [FromQuery] string category = null,
            [FromQuery] string accessLevel = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var userRole = User.FindFirstValue(ClaimTypes.Role);
                
                var results = await _searchService.SearchMaterialsAsync(
                    term, userId, userRole, status, category, accessLevel, pageNumber, pageSize);
                
                return Ok(results);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"搜索失败: {ex.Message}" });
            }
        }
        
        // 可以添加更多搜索端点，例如搜索课程、用户等
    }
} 