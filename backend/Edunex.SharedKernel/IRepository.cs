using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.Linq.Expressions;
using FluentResults;

namespace Edunex.SharedKernel;

/// <summary>
/// Application katmanının veriye erişirken kullandığı ortak depo sözleşmesi.
/// EF Core ya da başka bir veri sağlayıcısı tarafından uygulanabilecek şekilde
/// yalnızca domain servislerinin ihtiyaç duyduğu işlemleri tanımlar.
/// </summary>
public interface IRepository<T> where T : class
{
    /// <summary>
    /// Anahtar üzerinden tek bir entity döndürür. Bulunamazsa null.
    /// </summary>
    Task<T?> GetByIdAsync(object id, CancellationToken ct = default);

    /// <summary>
    /// Opsiyonel predicate ile filtrelenebilen sorgu. Sorgu edilmezse tüm kayıtlar.
    /// </summary>
    Task<IReadOnlyList<T>> ListAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken ct = default);

    /// <summary>
    /// Yeni entity ekler ve FluentResults ile operasyonun durumunu bildirir.
    /// </summary>
    Task<Result<T>> AddAsync(T entity, CancellationToken ct = default);

    /// <summary>
    /// Mevcut entity'yi günceller. Başarısızlık durumunda Result nesnesi hata bilgisini taşır.
    /// </summary>
    Task<Result> UpdateAsync(T entity, CancellationToken ct = default);

    /// <summary>
    /// Entity'yi siler. Soft delete uygulanmadığı için fiziksel silme yapar.
    /// </summary>
    Task<Result> DeleteAsync(T entity, CancellationToken ct = default);
}

