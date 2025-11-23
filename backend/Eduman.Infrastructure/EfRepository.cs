using Edunex.SharedKernel;
using Microsoft.EntityFrameworkCore;

namespace Eduman.Infrastructure;

/// <summary>
/// IRepository sözleşmesinin Entity Framework Core implementasyonu.
/// </summary>
public class EfRepository<T> : IRepository<T> where T : class
{
    private readonly EdumanDb _ctx;

    public EfRepository(EdumanDb ctx)
    {
        _ctx = ctx;
    }

    /// <inheritdoc />
    public async Task<T?> GetByIdAsync(object id, CancellationToken ct = default)
        => await _ctx.Set<T>().FindAsync([id], ct);

    /// <inheritdoc />
    public async Task<IReadOnlyList<T>> ListAsync(
        System.Linq.Expressions.Expression<Func<T, bool>>? predicate = null,
        CancellationToken ct = default)
        => predicate == null
           ? await _ctx.Set<T>().ToListAsync(ct)
           : await _ctx.Set<T>().Where(predicate).ToListAsync(ct);

    /// <inheritdoc />
    public async Task<FluentResults.Result<T>> AddAsync(T entity, CancellationToken ct = default)
    {
        await _ctx.Set<T>().AddAsync(entity, ct);
        return FluentResults.Result.Ok(entity);
    }

    /// <inheritdoc />
    public Task<FluentResults.Result> UpdateAsync(T entity, CancellationToken ct = default)
    {
        _ctx.Set<T>().Update(entity);
        return Task.FromResult(FluentResults.Result.Ok());
    }

    /// <inheritdoc />
    public Task<FluentResults.Result> DeleteAsync(T entity, CancellationToken ct = default)
    {
        _ctx.Set<T>().Remove(entity);
        return Task.FromResult(FluentResults.Result.Ok());
    }
}
