using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Edunex.SharedKernel;

namespace Eduman.Infrastructure;

/// <summary>
/// EF Core DbContext'ini tek bir SaveChanges çağrısına saran UnitOfWork implementasyonu.
/// </summary>
public class UnitOfWork(EdumanDb db) : IUnitOfWork
{
    private readonly EdumanDb _db = db;

    /// <inheritdoc />
    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}

