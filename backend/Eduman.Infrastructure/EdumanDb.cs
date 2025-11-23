using Eduman.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Eduman.Infrastructure
{
    /// <summary>
    /// Domain entity'lerinin PostgreSQL üzerindeki EF Core temsili.
    /// </summary>
    public class EdumanDb : DbContext
    {
        public EdumanDb(DbContextOptions<EdumanDb> options) : base(options) { }

        public DbSet<Institution> Institutions => Set<Institution>();
        public DbSet<School> Schools => Set<School>();
        public DbSet<Class> Classes => Set<Class>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<Permission> Permissions => Set<Permission>();
        public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
        public DbSet<EdumanLicense> Licenses => Set<EdumanLicense>();

        /// <summary>
        /// Tablo eşlemeleri, indeksler ve özel kolon türleri burada tanımlanır.
        /// </summary>
        protected override void OnModelCreating(ModelBuilder b)
        {
            // Tüm tablolar eduman şemasında tutulur; Identity tarafıyla aynı şemayı paylaşır.
            b.HasDefaultSchema("eduman");

            b.Entity<Institution>(e =>
            {
                // Her tenant için tek kurum olacak şekilde benzersiz indeks.
                e.HasIndex(x => x.TenantId).IsUnique();
                e.Property(x => x.Name).IsRequired().HasMaxLength(200);
            });

            // RolePermission join tablosunda composite primary key.
            b.Entity<RolePermission>().HasKey(x => new { x.RoleId, x.PermissionId });

            b.Entity<EdumanLicense>(e =>
            {
                // DateOnly tipinin PostgreSQL karşılığı olarak 'date' kullanılır.
                e.Property(x => x.StartDate).HasColumnType("date");
                e.Property(x => x.EndDate).HasColumnType("date");
            });

            base.OnModelCreating(b);
        }
    }
}
