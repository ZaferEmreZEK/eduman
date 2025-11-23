using System;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Edunex.Identity;

/// <summary>
///     Identity tablolarını yöneten DbContext. Varsayılan şemayı "eduman" olarak ayarlar.
/// </summary>
public class IdentityDb : IdentityDbContext<AppUser, AppRole, Guid>
{
    public IdentityDb(DbContextOptions<IdentityDb> options) : base(options) { }

    /// <summary>
    ///     Kullanıcı durumunu tamsayı olarak saklamak ve tablo şemasını ayarlamak için override edilir.
    /// </summary>
    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);
        b.HasDefaultSchema("eduman");
        b.Entity<AppUser>(e =>
        {
            e.Property(x => x.Status).HasConversion<int>();
        });
    }
}
