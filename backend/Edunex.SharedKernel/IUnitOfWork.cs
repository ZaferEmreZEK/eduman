using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Edunex.SharedKernel;

/// <summary>
/// Birden fazla repository çağrısını tek transaction altında birleştiren sözleşme.
/// </summary>
public interface IUnitOfWork
{
    /// <summary>
    /// İzlenen tüm değişiklikleri veritabanına yazar ve etkilenen satır sayısını döndürür.
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

