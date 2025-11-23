using Edunex.SharedKernel;
using Eduman.Application.Dtos;
using Eduman.Domain.Entities;

namespace Eduman.Application.Services;

/// <summary>
///     Okul (School) aggregate'i üzerinde çalışan uygulama servisi. Repository
///     katmanını kullanarak veri erişimini soyutlar, UnitOfWork ile değişiklikleri
///     tek transaction altında kaydeder.
/// </summary>
public class SchoolService(IRepository<School> repo, IUnitOfWork uow)
{
    private readonly IRepository<School> _repo = repo;
    private readonly IUnitOfWork _uow = uow;

    /// <summary>
    ///     Bir kuruma bağlı okulları döndürür; yalnızca okuma olduğu için SaveChanges
    ///     çağrısına ihtiyaç duyulmaz.
    /// </summary>
    public async Task<List<School>> GetByInstitutionAsync(Guid institutionId, CancellationToken ct = default)
        => (await _repo.ListAsync(s => s.InstitutionId == institutionId, ct)).ToList();

    /// <summary>
    ///     Okul oluşturur ve UnitOfWork ile veritabanına kaydeder.
    /// </summary>
    public async Task<School> AddAsync(SchoolDto dto, CancellationToken ct = default)
    {
        var entity = new School
        {
            // Id = Guid.NewGuid(),
            Name = dto.Name,
            InstitutionId = dto.InstitutionId,
            Address = dto.Address
        };
        await _repo.AddAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return entity;
    }

    /// <summary>
    ///     Mevcut bir okulu günceller. Kaynak bulunamazsa false döndürülür.
    /// </summary>
    public async Task<bool> UpdateAsync(Guid id, SchoolDto dto, CancellationToken ct = default)
    {
        var existing = (await _repo.ListAsync(x => x.Id == id, ct)).FirstOrDefault();
        if (existing is null) return false;

        existing.Name = dto.Name;
        existing.Address = dto.Address;
        await _repo.UpdateAsync(existing, ct);
        await _uow.SaveChangesAsync(ct);
        return true;
    }

    /// <summary>
    ///     Okulu siler; repository operasyonu sonrası UnitOfWork ile commit yapılır.
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
