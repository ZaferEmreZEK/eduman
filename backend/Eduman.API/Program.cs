using Edunex.Identity;
using Eduman.Infrastructure;
using Eduman.Infrastructure.Interceptors;
using Edunex.SharedKernel;
using Eduman.Application;
using Hellang.Middleware.ProblemDetails;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Eduman.API.Helpers;
using Edunex.Identity;
using Edunex.SharedKernel;

var builder = WebApplication.CreateBuilder(args);
var cfg = builder.Configuration;

// -- VERİ ERİŞİMİ -----------------------------------------------------------
// Uygulamanın alan verilerini taşıyan EdumanDb bağlamı ile IdentityDb (kullanıcı
// tablosu) aynı PostgreSQL bağlantı dizesini kullanır. Burada DbContext'lerin
// DI konteynerine eklenmesi, daha sonra repository ve Identity katmanı
// implementasyonlarının bu bağlamları kullanabilmesine olanak tanır.
builder.Services.AddDbContext<EdumanDb>(o =>
    o.UseNpgsql(cfg.GetConnectionString("Eduman")));

builder.Services.AddDbContext<IdentityDb>(o =>
    o.UseNpgsql(cfg.GetConnectionString("Eduman")));

// -- KULLANICI YÖNETİMİ -----------------------------------------------------
// ASP.NET Identity çekirdeği AppUser/AppRole tipleri ile yapılandırılır.
// Parola politikası uygulama genelinde güçlü parolalar zorunlu kılar. Identity
// Entity Framework store'ları, yukarıda kaydedilen IdentityDb ile eşleştirilir.
builder.Services.AddIdentityCore<AppUser>(o =>
{
    o.Password.RequiredLength = 8;
    o.Password.RequireUppercase = true;
    o.Password.RequireDigit = true;
    o.Password.RequireNonAlphanumeric = true;
})
.AddRoles<AppRole>()
.AddEntityFrameworkStores<IdentityDb>();

// -- JWT DOĞRULAMA ----------------------------------------------------------
// API, frontend istemcilerden gelen kimlik doğrulamalı istekleri JWT bearer
// token'larıyla karşılar. Token parametreleri appsettings üzerinden okunur ve
// token'ın issuer'ı, imzası ve süresi doğrulanır. ClockSkew'in sıfırlanması
// süre dolduğunda token'ların anında geçersizleşmesini sağlar.
var jwtKey = cfg["Jwt:Key"]!;
var jwtIssuer = cfg["Jwt:Issuer"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidIssuer = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// -- CORS POLİTİKASI --------------------------------------------------------
// Frontend geliştirme ortamı (Vite/React vb.) 5173 portu üzerinden geldiği için
// bu origin'lere Cross-Origin Resource Sharing izni verilir. AllowCredentials
// ile tarayıcının Authorization header'ını gönderebilmesi sağlanır.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy => policy
        .WithOrigins("http://localhost:5173", "https://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// -- HATA FORMATLAMA --------------------------------------------------------
// Hellang ProblemDetails middleware'i API boyunca istisna ve hata cevaplarını
// RFC7807 standardına uygun hale getirir. Controller'lar Problem(...) döndüğünde
// veya beklenmeyen hatalar oluştuğunda istemci tutarlı JSON yapıları alır.
Hellang.Middleware.ProblemDetails.ProblemDetailsExtensions.AddProblemDetails(builder.Services);

// Controller'lar eklenirken DateOnlyJsonConverter kayıt edilir; aksi halde
// .NET'in varsayılan System.Text.Json dönüştürücüsü DateOnly tipini tanımaz ve
// lisans tarihleri gibi alanlar serileştirilemez.
builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// -- ALT YAPI BAĞIMLILIKLARI ------------------------------------------------
// Shared Kernel'deki IRepository/IUnitOfWork sözleşmelerinin EF Core
// implementasyonları burada DI'a bağlanır. AuditSaveChangesInterceptor auditable
// entity'ler için CreatedAt/UpdatedAt alanlarını otomatik işler.
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));
builder.Services.AddSingleton<AuditSaveChangesInterceptor>();
builder.Services.AddScoped<DbContext, EdumanDb>();

// Application katmanındaki domain servisleri tek extension metot ile kayıt
// edilir. Böylece Controller'lar yalnızca kendi iş servislerine bağımlı olur ve
// Repository/DbContext gibi detayları bilmez.
builder.Services.AddApplicationServices();

var app = builder.Build();

// -- HTTP PIPELINE ----------------------------------------------------------
// HTTPS yönlendirme ve CORS middleware'leri istek yaşam döngüsünün başında yer
// alır. Authentication/Authorization sırasıyla kimlik doğrulaması ve yetki
// kontrolü yapar. ProblemDetails middleware'i pipeline'a eklenerek hata
// yanıtlarını standartlaştırır.
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.UseProblemDetails();

// Swagger yalnızca geliştirme ortamında açılır. RoutePrefix'in boş bırakılması
// sayesinde Swagger UI ana URL'den erişilebilir.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Eduman API v1");
        c.RoutePrefix = string.Empty;
    });
}

app.MapControllers();
app.Run();
