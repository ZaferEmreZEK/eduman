using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Edunex.SharedKernel;

/// <summary>
/// Denetlenebilir (auditable) entity'ler için ortak tarih/kullanıcı alanlarını
/// sağlayan taban sınıf. SaveChanges sırasında <see cref="AuditSaveChangesInterceptor"/>
/// tarafından otomatik olarak doldurulur.
/// </summary>
public abstract class BaseAuditableEntity<TId> : BaseEntity<TId>
{
    /// <summary>
    /// Kayıt oluşturulurken atanır ve hiçbir zaman geriye dönük değişmez.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Oluşturma işlemini tetikleyen kullanıcı kimliği (opsiyonel).
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Entity üzerinde son düzenlemenin zamanı. Güncellenmemiş kayıtlar için null.
    /// </summary>
    public DateTime? ModifiedAt { get; set; }

    /// <summary>
    /// Son düzenleme yapan kullanıcı kimliği.
    /// </summary>
    public string? ModifiedBy { get; set; }
}

