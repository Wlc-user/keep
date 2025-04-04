using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OnlineLearningSystem.Core.Entities;
using OnlineLearningSystem.Core.Interfaces;
using OnlineLearningSystem.Infrastructure.Data;

namespace OnlineLearningSystem.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly OnlineLearningSystemContext _context;

        public UserRepository(OnlineLearningSystemContext context)
        {
            _context = context;
        }

        public async Task<User?> GetUserByIdAsync(Guid id)
        {
            return await _context.User.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.User.FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            return await _context.User.FirstOrDefaultAsync(u => u.Username == username && !u.IsDeleted);
        }

        public async Task<User?> GetUserByRefreshTokenAsync(string refreshToken)
        {
            return await _context.User.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken && !u.IsDeleted);
        }

        public async Task<(List<User> users, int totalCount)> GetUsersAsync(UserQueryParams queryParams)
        {
            var query = _context.User.Where(u => !u.IsDeleted);
            // ... existing code ...
        }

        public async Task<List<User>> GetUsersByIdsAsync(List<Guid> ids)
        {
            return await _context.User.Where(u => ids.Contains(u.Id) && !u.IsDeleted).ToListAsync();
        }

        public async Task<List<User>> GetUsersByRoleAsync(UserRole role)
        {
            return await _context.User.Where(u => u.Role == role && !u.IsDeleted).ToListAsync();
        }

        public async Task<Guid> CreateUserAsync(User user)
        {
            _context.User.Add(user);
            // ... existing code ...
        }

        public async Task<bool> UpdateUserAsync(User user)
        {
            _context.User.Update(user);
            // ... existing code ...
        }

        public async Task<bool> DeleteUserAsync(Guid id)
        {
            var user = await _context.User.FindAsync(id);
            // ... existing code ...
        }

        public async Task<bool> CheckEmailExistsAsync(string email, Guid? exceptUserId = null)
        {
            return await _context.User.AnyAsync(u => u.Email == email && u.Id != exceptUserId && !u.IsDeleted);
        }

        public async Task<bool> CheckUsernameExistsAsync(string username, Guid? exceptUserId = null)
        {
            return await _context.User.AnyAsync(u => u.Username == username && u.Id != exceptUserId && !u.IsDeleted);
        }
    }
} 