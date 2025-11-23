var builder = WebApplication.CreateBuilder(args);

// Edulink servisinde henüz yalnızca temel controller desteği
// gereklidir. Bu satır, attributelar ile tanımlanmış controller
// endpoint'lerinin DI ve routing altyapısına kaydedilmesini sağlar.
builder.Services.AddControllers();

// Minimal başlangıç için OpenAPI/Swagger desteği etkinleştirilir.
// Geliştirme sürecinde yeni endpoint'ler eklendiğinde arayüzden
// kolayca test edebilmek adına bu kurulum korunur.
builder.Services.AddOpenApi();

var app = builder.Build();

// Geliştirme ortamında Swagger UI'nın yayınlanması, frontend
// ekiplerinin API yüzeyini incelemesi için yeterlidir. Şimdilik
// yalnızca Development profili hedeflenmiştir.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Varsayılan HTTPS yönlendirmesi, reverse proxy arkasında dahi
// isteklerin güvenli kanala taşınmasını zorunlu kılar.
app.UseHttpsRedirection();

// Authorization middleware'i eklenir; kimlik doğrulama henüz
// tanımlı olmasa da pipeline'da bu adımın bulunması ileride
// eklenecek politikalar için zemin hazırlar.
app.UseAuthorization();

// Attribute routing ile tanımlanmış controller endpoint'lerinin
// uygulama pipeline'ına bağlanması.
app.MapControllers();

app.Run();
