using Edunex.SharedKernel;
using Eduman.Application.Dtos;
using Eduman.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Eduman.Application.Services;

/// <summary>
/// Institution aggregate'i için uygulama servis katmanı.
/// Repository + UnitOfWork üzerinden domain entity'leriyle çalışır.
/// </summary>
public class InstitutionService(IRepository<Institution> repo, IUnitOfWork uow)
{
    private readonly IRepository<Institution> _repo = repo;
    private readonly IUnitOfWork _uow = uow;

    /// <summary>
    /// Tüm kurumları döndürür. Şimdilik filtreleme yapılmadığı için repository
    /// doğrudan tüm kayıtları getirir.
    /// </summary>
    public async Task<List<Institution>> GetAllAsync(CancellationToken ct = default)
        => (await _repo.ListAsync(null, ct)).ToList();

    /// <summary>
    /// DTO'dan domain entity oluşturur ve veritabanına ekler.
    /// TenantId burada örnek olması açısından yeni Guid ile doldurulur.
    /// </summary>
    public async Task<Institution> AddAsync(InstitutionDto dto, CancellationToken ct = default)
    {
        var entity = new Institution
        {
            // Id = Guid.NewGuid(),
            Name = dto.Name,
            TenantId = Guid.NewGuid()
        };
        await _repo.AddAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return entity;
    }

    /// <summary>
    /// İlgili kurumu bulup adını günceller. Entity bulunamazsa false döner.
    /// </summary>
    public async Task<bool> UpdateAsync(Guid id, InstitutionDto dto, CancellationToken ct = default)
    {
        var existing = await _repo.ListAsync(x => x.Id == id, ct);
        var entity = existing.FirstOrDefault();
        if (entity is null) return false;

        entity.Name = dto.Name;
        await _repo.UpdateAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return true;
    }

    /// <summary>
    /// Kurumu fiziksel olarak siler. Soft delete olmadığı için kayıt tablodan kaldırılır.
    /// </summary>
    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var existing = await _repo.ListAsync(x => x.Id == id, ct);
        var entity = existing.FirstOrDefault();
        if (entity is null) return false;

        await _repo.DeleteAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return true;
    }
}
