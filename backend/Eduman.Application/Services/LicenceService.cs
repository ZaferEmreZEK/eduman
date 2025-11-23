using Edunex.SharedKernel;
using Eduman.Application.Dtos;
using Eduman.Domain.Entities;

namespace Eduman.Application.Services;

/// <summary>
///     Lisans (license) aggregate'ini yöneten application servisi. Repository ve
///     UnitOfWork soyutlamaları sayesinde EF Core ayrıntıları Infrastructure
///     katmanında kalır.
/// </summary>
public class LicenseService(IRepository<EdumanLicense> repo, IUnitOfWork uow)
{
    private readonly IRepository<EdumanLicense> _repo = repo;
    private readonly IUnitOfWork _uow = uow;

    /// <summary>
    ///     Belirli bir kuruma ait bütün lisans kayıtlarını döndürür. Okuma
    ///     işlemi olduğu için yalnızca repository erişimi yeterlidir.
    /// </summary>
    public async Task<List<EdumanLicense>> GetByInstitutionAsync(Guid institutionId, CancellationToken ct = default)
        => (await _repo.ListAsync(x => x.InstitutionId == institutionId, ct)).ToList();

    /// <summary>
    ///     DTO'dan yeni bir <see cref="EdumanLicense"/> oluşturup kaydeder ve
    ///     transaction'ı UnitOfWork üzerinden tamamlar.
    /// </summary>
    public async Task<EdumanLicense> AddAsync(LicenseDto dto, CancellationToken ct = default)
    {
        var entity = new EdumanLicense
        {
            // Id = Guid.NewGuid(),
            InstitutionId = dto.InstitutionId,
            LicenseKey = dto.LicenseKey,
            UserLimit = dto.UserLimit,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsDemo = dto.IsDemo
        };
        await _repo.AddAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return entity;
    }

    /// <summary>
    ///     Lisans kaydını siler; ilgili kayıt bulunamazsa false döndürür.
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
