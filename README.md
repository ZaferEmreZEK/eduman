# EDUMAN Frontend Özeti

Kısa notlar, uygulamada halihazırda olan ekranlar ve kullandıkları servis uçları hakkında kaba taslak bilgiler.

## Yapılan Özellikler
- **Kimlik Doğrulama:** `/Auth/login` ve `/Auth/register` çağrılarıyla giriş/kayıt; başarıda token `localStorage`’a yazılıyor ve yönlendirme dashboard’a yapılıyor.
- **Ana Gösterge Paneli:** `/Dashboard/overview` ile kurum/okul/sınıf/lisans adetleri; `/Reports/summary` verisiyle aylık aktif kullanıcı grafiği ve özet kartlar.
- **Kurum/Okul/Sınıf Yönetimi:**
  - Kurum CRUD akışı `/Institutions` uçlarıyla.
  - Seçili kurum için okullar `/Schools/institution/:id`, okullara bağlı sınıflar `/Classes/school/:id` üzerinden listelenip yönetiliyor.
- **Lisanslar:** `/Licenses/institution/:id` ile kurum bazlı lisans listeleme ve ekleme; tarih/limit gibi alanları destekliyor.
- **Kullanıcılar & Roller:**
  - `/Users` ile filtreli kullanıcı listesi, durum/rol alanları UI’da normalize ediliyor; şifre değişikliği `/Users/change-password`.
  - Roller ve izinler `/Roles` ve `/Roles/{id}/permissions` uçlarıyla yönetiliyor.
- **Raporlar:** `/Reports/summary` ile filtreli özet tablolar; dışa aktarım için `/Reports/download` (PDF/CSV) çağrısı hazır.
- **Tema ve Navigasyon:** `ThemeModeProvider` ile açık/koyu tema; `Layout` bileşeni üst bar, yan menü ve logout akışı (token temizler + login’e döner) sunuyor.

## Yapılacaklar / Notlar
- API hataları için kullanıcı dostu bildirimler ve form validasyonları eklenmeli.
- Dashboard’daki “Son İşlemler” gibi placeholder alanlar gerçek veriye bağlanmalı.
- Yetki bazlı görünürlük (rol/izin) kontrolü navigasyon ve sayfalara yayılmalı.
- Listeleme sayfaları için arama/filtreleme UI’ı ve boş durum mesajları güçlendirilmeli.
- Test ve kalite: React Query cache stratejileri, hata sınırları ve e2e/regresyon testleri eklenmeli.


# Eduman Backend Özeti

Bu dosya, projede şu ana kadar tamamlanan ana özelliklerin ve sonraki adımlarda planlanan işlerin kaba bir dökümünü içerir. Detaylı teknik dokümantasyon için kök `README.md` içeriğini kullanabilirsiniz.

## Şu Ana Kadar Yapılanlar
- **JWT tabanlı kimlik doğrulama**: `AuthController` kayıt ve giriş uç noktaları üzerinden kullanıcı oluşturup imzalı erişim tokenı döndürüyor. 【F:Eduman.API/Controllers/AuthController.cs†L16-L57】
- **Kullanıcı yönetimi API'leri**: Kimliği doğrulanmış kullanıcının bilgilerini getirme, filtreli listeleme ve kullanıcı oluşturma/güncelleme/silme uç noktaları hazır. 【F:Eduman.API/Controllers/UsersController.cs†L15-L69】
- **Kurum/okul/sınıf CRUD akışları**: Kurum listeme/ekleme/güncelleme/silme ile bağlı okul ve sınıf kayıtlarını yönetmek için REST uç noktaları mevcut. 【F:Eduman.API/Controllers/InstituonsController.cs†L8-L47】【F:Eduman.API/Controllers/SchoolsController.cs†L8-L46】【F:Eduman.API/Controllers/ClassesController.cs†L8-L36】
- **Lisans yönetimi**: Kurum lisanslarını listeleme, ekleme ve silme için uç noktalar sağlanıyor; iş mantığı `LicenseService` içinde toplanıyor. 【F:Eduman.API/Controllers/LicensesController.cs†L8-L38】
- **Rol ve izinler**: Roller için CRUD, izin setini okuma ve toplu güncelleme akışları tamamlandı. 【F:Eduman.API/Controllers/RolesController.cs†L8-L57】
- **Genel durum özeti**: Dashboard uç noktası kurum, okul, sınıf ve lisans toplamlarını tek istekte döndürüyor. 【F:Eduman.API/Controllers/DashboardController.cs†L8-L21】

## Yapılacaklar / Planlananlar
- **Yetkilendirme politikalarının sıkılaştırılması**: Roller ve izinler tanımlı ancak controller düzeyinde politika bazlı erişim kuralları henüz yaygınlaştırılmadı.
- **Yeni domain olayları ve EventBus entegrasyonu**: Saha entegrasyonları için olay yayınlama/abonelik altyapısı doldurulmalı.
- **Test ve doğrulama**: Uygulama servisleri ve DTO doğrulamaları için otomatik testler eklenmeli, girişlerde ek doğrulamalar tanımlanmalı.
- **Denetim ve loglama iyileştirmeleri**: Audit interceptor'larının ürettiği meta veriler merkezi loglama ve izleme panolarına taşınmalı.
- **Ön uç tüketimi için Swagger/örnekler**: Mevcut endpoint'ler için güncel Swagger açıklamaları ve örnek istekler hazırlanmalı.