using Edunex.SharedKernel;
using Eduman.Application.Dtos;
using Eduman.Domain.Entities;

namespace Eduman.Application.Services;

/// <summary>
///     Application katmanında sınıflarla (Class aggregate) ilgili CRUD işlemlerini
///     koordine eden servis. Repository ve UnitOfWork soyutlamaları üzerinden
///     Infrastructure'a bağımlılık kurar.
/// </summary>
public class ClassService(IRepository<Class> repo, IUnitOfWork uow)
{
    private readonly IRepository<Class> _repo = repo;
    private readonly IUnitOfWork _uow = uow;

    /// <summary>
    ///     Belirli bir okulun bütün sınıflarını döndürür. Okuma operasyonu olduğu için
    ///     yalnızca repository kullanılır, UnitOfWork üzerinden SaveChanges gerekmez.
    /// </summary>
    public async Task<List<Class>> GetBySchoolAsync(Guid schoolId, CancellationToken ct = default)
        => (await _repo.ListAsync(x => x.SchoolId == schoolId, ct)).ToList();

    /// <summary>
    ///     DTO'dan yeni bir <see cref="Class"/> entity'si oluşturup kaydeder.
    ///     EF Core Primary Key'leri otomatik verdiği için Id manuel set edilmez.
    /// </summary>
    public async Task<Class> AddAsync(ClassDto dto, CancellationToken ct = default)
    {
        var entity = new Class
        {
            // Id = Guid.NewGuid(),
            Level = dto.Level,
            Section = dto.Section,
            SchoolId = dto.SchoolId
        };
        await _repo.AddAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return entity;
    }

    /// <summary>
    ///     İstenen sınıfı bulup siler; bulunamazsa false döner. Silme işlemi sonrası
    ///     UnitOfWork.SaveChangesAsync çağrısı ile transaction tamamlanır.
    /// </summary>
    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var existing = (await _repo.ListAsync(x => x.Id == id, ct)).FirstOrDefault();
        if (existing is null) return false;

        await _repo.DeleteAsync(existing, ct);
        await _uow.SaveChangesAsync(ct);
        return true;
    }
}
