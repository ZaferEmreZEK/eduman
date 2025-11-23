using Eduman.Application.Dtos;
using Edunex.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Eduman.Application.Services
{
    /// <summary>
    ///     Identity katmanı üzerinden kullanıcı CRUD işlemlerini yöneten servis.
    ///     UserManager<AppUser> ile konuşarak parola hash'leri gibi detayları
    ///     framework'e bırakır.
    /// </summary>
    public class UserService
    {
        private readonly UserManager<AppUser> _users;

        public UserService(UserManager<AppUser> users)
        {
            _users = users;
        }

        /// <summary>
        ///     Filtre parametrelerine göre kullanıcı listesini döndürür. Sorgu
        ///     IQueryable üzerinde filtrelenir ve DTO projeksiyonu yapılır.
        /// </summary>
        public async Task<IEnumerable<UserDto>> GetAllAsync(Guid? institutionId = null, string? role = null, string? status = null, string? q = null)
        {
            var query = _users.Users.AsQueryable();

            if (institutionId.HasValue)
                query = query.Where(u => u.InstitutionId == institutionId);

            if (!string.IsNullOrEmpty(role))
                query = query.Where(u => u.Role.ToLower() == role.ToLower());

            if (!string.IsNullOrEmpty(status))
                query = query.Where(u => u.Status.ToString().ToLower() == status.ToLower());

            if (!string.IsNullOrEmpty(q))
                query = query.Where(u =>
                    (u.FullName != null && u.FullName.Contains(q)) ||
                    (u.Email != null && u.Email.Contains(q)));

            return await query
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email ?? string.Empty,
                    Role = u.Role,
                    InstitutionId = u.InstitutionId,
                    Status = u.Status.ToString().ToLower()
                })
                .ToListAsync();
        }

        /// <summary>
        ///     Kullanıcıyı Id üzerinden getirir; bulunamazsa null döner.
        /// </summary>
        public async Task<UserDto?> GetByIdAsync(Guid id)
        {
            var user = await _users.FindByIdAsync(id.ToString());
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                Role = user.Role,
                InstitutionId = user.InstitutionId,
                Status = user.Status.ToString().ToLower()
            };
        }

        /// <summary>
        ///     Yeni kullanıcı oluşturur; UserManager parola hash'ini üretir ve
        ///     doğrulamaları yönetir. Başarısızlık durumunda açıklayıcı bir
        ///     Exception fırlatılır.
        /// </summary>
        public async Task<UserDto?> AddAsync(UserDto dto, string password)
        {
            var user = new AppUser
            {
                FullName = dto.FullName,
                Email = dto.Email,
                UserName = dto.Email,
                Role = dto.Role,
                InstitutionId = dto.InstitutionId,
                Status = dto.Status.Equals("active", StringComparison.OrdinalIgnoreCase)
                    ? Domain.Entities.UserStatus.Active
                    : Domain.Entities.UserStatus.Inactive
            };

            var result = await _users.CreateAsync(user, password);
            if (!result.Succeeded)
                throw new Exception(string.Join("; ", result.Errors.Select(e => e.Description)));

            dto.Id = user.Id;
            return dto;
        }

        /// <summary>
        ///     Kullanıcı profilini günceller; kayıt yoksa false döner.
        /// </summary>
        public async Task<bool> UpdateAsync(Guid id, UserDto dto)
        {
            var user = await _users.FindByIdAsync(id.ToString());
            if (user is null) return false;

            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.UserName = dto.Email;
            user.Role = dto.Role;
            user.InstitutionId = dto.InstitutionId;
            user.Status = dto.Status.Equals("active", StringComparison.OrdinalIgnoreCase)
                ? Domain.Entities.UserStatus.Active
                : Domain.Entities.UserStatus.Inactive;

            var result = await _users.UpdateAsync(user);
            return result.Succeeded;
        }

        /// <summary>
        ///     Kullanıcıyı siler; Identity katmanı başarısız olursa false döner.
        /// </summary>
        public async Task<bool> DeleteAsync(Guid id)
        {
            var user = await _users.FindByIdAsync(id.ToString());
            if (user is null) return false;

            var result = await _users.DeleteAsync(user);
            return result.Succeeded;
        }
    }
}
