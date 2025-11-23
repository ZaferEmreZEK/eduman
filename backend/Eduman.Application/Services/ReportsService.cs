using Eduman.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Eduman.Application.Services
{
    /// <summary>
    ///     Dashboard/rapor ekranlarının ihtiyaç duyduğu derlenmiş verileri sağlayan
    ///     servis. Doğrudan <see cref="EdumanDb"/> bağlamı üzerinden aggregate
    ///     sorguları çalıştırır çünkü tek operasyon içinde birden fazla DbSet'ten
    ///     veri toplamak gerekir.
    /// </summary>
    public class ReportsService
    {
        private readonly EdumanDb _db;

        public ReportsService(EdumanDb db)
        {
            _db = db;
        }

        /// <summary>
        ///     Kurum, tarih aralığı gibi opsiyonel filtrelerle lisans/school/class
        ///     toplamlarını ve örnek kullanıcı trendini hesaplar. Önce filtre için
        ///     IQueryable kaynakları hazırlanır, ardından EF Core üzerinden sayımlar
        ///     yapılır.
        /// </summary>
        public async Task<object> GetSummaryAsync(Guid? institutionId, DateOnly? start, DateOnly? end)
        {
            // Kurum filtresi varsa tüm sorgular aynı kurumla sınırlandırılır.
            var licenses = _db.Licenses.AsQueryable();
            var schools = _db.Schools.AsQueryable();
            var classes = _db.Classes.AsQueryable();
            var institutions = _db.Institutions.AsQueryable();

            if (institutionId.HasValue)
            {
                licenses = licenses.Where(l => l.InstitutionId == institutionId);
                schools = schools.Where(s => s.InstitutionId == institutionId);
                classes = classes.Where(c => schools.Any(s => s.Id == c.SchoolId));
                institutions = institutions.Where(i => i.Id == institutionId);
            }

            if (start.HasValue)
                licenses = licenses.Where(l => l.StartDate >= start.Value);
            if (end.HasValue)
                licenses = licenses.Where(l => l.EndDate <= end.Value);

            // Aktif lisansların toplam kapasite kullanım oranını hesapla.
            var activeLicenses = await licenses.CountAsync();
            var totalUsers = await licenses.SumAsync(l => (int?)l.UserLimit) ?? 0;
            var usedPercent = activeLicenses > 0 ? (totalUsers / (activeLicenses * 1.0)) * 100 : 0;

            // Kurum bazlı özet metrikleri tek projeksiyonda hazırla.
            var institutionSummary = await institutions
                .Select(i => new
                {
                    i.Name,
                    Schools = i.Schools.Count,
                    Licenses = i.Licenses.Count,
                    Classes = i.Schools.SelectMany(s => s.Classes).Count(),
                    UserCapacity = i.Licenses.Sum(l => l.UserLimit)
                })
                .ToListAsync();

            // Nihai cevap; frontend grafiklerinin ihtiyaç duyduğu alanlar.
            var result = new
            {
                licenseUsagePercent = Math.Round(usedPercent, 1),
                monthlyActiveUsers = await GetMonthlyUserMockAsync(), // Şimdilik mock veri
                institutionSummary
            };

            return result;
        }

        // Sistem henüz gerçek kullanıcı aktivitesi tutmadığı için dashboard'a örnek trend
        // sağlamak adına mock veri döndüren yardımcı metot.
        private Task<IEnumerable<object>> GetMonthlyUserMockAsync()
        {
            var data = Enumerable.Range(1, 6)
                .Select(m => new
                {
                    label = new DateTime(DateTime.UtcNow.Year, m, 1).ToString("MMM"),
                    value = 50 + (m * 25) // küçük varyasyon, yine gerçek kayıtlardan bağımsız
                })
                .Cast<object>();
            return Task.FromResult(data);
        }
    }
}
