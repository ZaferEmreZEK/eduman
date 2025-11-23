using Microsoft.Extensions.DependencyInjection;
using Eduman.Application.Services;

namespace Eduman.Application
{
    /// <summary>
    /// Application katmanına ait DI kayıtlarını bir extension altında toplayan yardımcı sınıf.
    /// </summary>
    public static class DependencyInjection
    {
        /// <summary>
        /// Servislerin yaşam döngülerini merkezi bir noktadan tanımlar. API projesi
        /// <c>builder.Services.AddApplicationServices()</c> çağrısı ile bu metodu kullanır.
        /// </summary>
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // Application servislerini burada kaydediyoruz
            services.AddScoped<InstitutionService>();
            services.AddScoped<SchoolService>();
            services.AddScoped<ClassService>();
            services.AddScoped<LicenseService>();
            services.AddScoped<RoleService>();
            services.AddScoped<UserService>();
            services.AddScoped<ReportsService>(); // dikkat: Reports değil ReportService dosya adın böyle

            return services;
        }
    }
}
