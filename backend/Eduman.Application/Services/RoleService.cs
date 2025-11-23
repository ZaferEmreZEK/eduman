using Eduman.Application.Dtos;
using Eduman.Domain.Entities;
using Eduman.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Eduman.Application.Services
{
    /// <summary>
    ///     Roller ve rollere bağlı izinleri yöneten servis. Doğrudan DbContext
    ///     kullanılarak Role/Permission tabloları üzerinde işlem yapılır.
    /// </summary>
    public class RoleService
    {
        private readonly EdumanDb _db;

        public RoleService(EdumanDb db) => _db = db;

        /// <summary>
        ///     Tüm rolleri DTO olarak döndürür; controller katmanı HTTP cevabında
        ///     bu DTO'yu kullanır.
        /// </summary>
        public async Task<IEnumerable<RoleDto>> GetAllAsync()
        {
            return await _db.Roles
                .Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = null
                })
                .ToListAsync();
        }

        /// <summary>
        ///     Yeni bir rol oluşturur ve kaydeder. Oluşan Id DTO üzerine yazılır
        ///     ki çağıran katman aynı DTO'yu dönebilir.
        /// </summary>
        public async Task<RoleDto?> AddAsync(RoleDto dto)
        {
            var entity = new Role { Name = dto.Name };
            _db.Roles.Add(entity);
            await _db.SaveChangesAsync();
            dto.Id = entity.Id;
            return dto;
        }

        /// <summary>
        ///     Var olan rolü günceller; kayıt bulunamazsa false döndürür.
        /// </summary>
        public async Task<bool> UpdateAsync(Guid id, RoleDto dto)
        {
            var role = await _db.Roles.FindAsync(id);
            if (role is null) return false;
            role.Name = dto.Name;
            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>
        ///     Rolü kalıcı olarak siler; bulunamazsa false.
        /// </summary>
        public async Task<bool> DeleteAsync(Guid id)
        {
            var role = await _db.Roles.FindAsync(id);
            if (role is null) return false;
            _db.Roles.Remove(role);
            await _db.SaveChangesAsync();
            return true;
        }

        /// <summary>
        ///     Rolün sahip olduğu izin adlarını döndürür. Permission entity'sinin
        ///     Name alanı dış dünyaya taşınır.
        /// </summary>
        public async Task<IEnumerable<string>> GetPermissionsAsync(Guid roleId)
        {
            return await _db.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .Select(rp => rp.Permission.Name)
                .ToListAsync();
        }

        /// <summary>
        ///     Bir rolün izin listesini komple yeniden yazar. Geçersiz izin adları
        ///     filtrelenir, kalanlar için RolePermission kayıtları eklenir.
        /// </summary>
        public async Task<bool> UpdatePermissionsAsync(Guid roleId, IEnumerable<string> permissions)
        {
            var role = await _db.Roles.FindAsync(roleId);
            if (role is null) return false;

            var allPerms = await _db.Permissions.ToListAsync();
            var validPerms = allPerms.Where(p => permissions.Contains(p.Name)).ToList();

            var existing = _db.RolePermissions.Where(rp => rp.RoleId == roleId);
            _db.RolePermissions.RemoveRange(existing);

            foreach (var perm in validPerms)
            {
                _db.RolePermissions.Add(new RolePermission
                {
                    RoleId = roleId,
                    PermissionId = perm.Id
                });
            }

            await _db.SaveChangesAsync();
            return true;
        }
    }
}
