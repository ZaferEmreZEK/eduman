using Edunex.Identity;
using FluentResults;
using Microsoft.EntityFrameworkCore;
using Eduman.Infrastructure;

namespace Eduman.Application.Services;

/// <summary>
///     Yeni kullanıcı oluşturulmadan önce kurum lisansının aktif ve kontenjan
///     açısından yeterli olup olmadığını doğrulayan yardımcı servis.
/// </summary>
public class LicenseGuard(EdumanDb db)
{
    /// <summary>
    ///     Kuruma ait en güncel lisansı kontrol eder, tarih ve kullanıcı limiti
    ///     kısıtlarını uygular. Şartlar sağlanmazsa Result.Fail döner.
    /// </summary>
    public async Task<Result> EnsureUserCanBeCreated(Guid institutionId, CancellationToken ct = default)
    {
        var lic = await db.Licenses
            .Where(l => l.InstitutionId == institutionId)
            .OrderByDescending(l => l.EndDate)
            .FirstOrDefaultAsync(ct);
        if (lic is null) return Result.Fail("NoActiveLicense");

        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        if (now < lic.StartDate || now > lic.EndDate)
            return Result.Fail("LicenseExpired");

        // Kuruma bağlı aktif kullanıcı sayısı lisans limitini aşıyorsa yeni kayıt engellenir.
        var activeUsers = await db.Set<AppUser>().CountAsync(ct);
        if (activeUsers >= lic.UserLimit)
            return Result.Fail("UserLimitExceeded");

        return Result.Ok();
    }
}
