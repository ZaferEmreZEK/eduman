using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Eduman.Infrastructure.Interceptors;

/// <summary>
/// SaveChanges öncesinde auditable entity'lerin CreatedAt/ModifiedAt alanlarını günceller.
/// </summary>
public class AuditSaveChangesInterceptor : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken ct = default)
    {
        var ctx = (eventData.Context as DbContext)!;
        var now = DateTime.UtcNow;

        // ChangeTracker üzerinden auditable entity'ler (Added/Modified) seçilir.
        foreach (var e in ctx.ChangeTracker.Entries()
                 .Where(x => x.Entity is Edunex.SharedKernel.BaseAuditableEntity<Guid> &&
                             (x.State == EntityState.Added || x.State == EntityState.Modified)))
        {
            dynamic ent = e.Entity;
            if (e.State == EntityState.Added) ent.CreatedAt = now;
            ent.ModifiedAt = now;
            // CreatedBy/ModifiedBy middleware'den doldurulacak
        }
        return base.SavingChangesAsync(eventData, result, ct);
    }
}

