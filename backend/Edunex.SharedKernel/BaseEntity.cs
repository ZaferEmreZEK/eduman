using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Edunex.SharedKernel;

/// <summary>
/// Katmanlar arasında paylaşılan tüm entity'lerin türediği en temel sınıf.
/// <para>
/// - Generic TId, her aggregate'in kendi anahtar tipini (Guid, int vb.) seçmesine
///   izin verir.
/// - Protected setter, entity kimliğinin yalnızca EF Core veya miras alan
///   sınıflar tarafından değiştirilmesine olanak tanır; API seviyesinden
///   doğrudan set edilemez.
/// </para>
/// </summary>
public abstract class BaseEntity<TId>
{
    /// <summary>
    /// Domain modelindeki her kaydı benzersiz olarak tanımlayan anahtar alanı.
    /// Varsayılan değer EF Core tarafından izleme sürecinde atanır.
    /// </summary>
    public TId Id { get; protected set; } = default!;
}

