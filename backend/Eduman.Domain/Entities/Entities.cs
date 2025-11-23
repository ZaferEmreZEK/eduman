using Edunex.SharedKernel;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Eduman.Domain.Entities
{
    // ---------- Institution ----------
    /// <summary>
    /// Çok kurumsu yapıyı temsil eden üst seviye aggregate root. Bir kurumun
    /// altında birden fazla okul ve lisans bulunabilir. TenantId, çoklu müşteri
    /// desteği için kullanılır.
    /// </summary>
    public class Institution : BaseAuditableEntity<Guid>
    {
        public string Name { get; set; } = null!;
        public Guid TenantId { get; set; }

        // yeni alanlar 👇
        public string? Address { get; set; }
        public string? Type { get; set; } // "public" | "private"

        /// <summary>
        /// Navigation koleksiyonları JsonIgnore ile işaretlenir çünkü API tarafı
        /// dönerken döngüsel referanslar veya gereksiz veriler taşımak istemeyiz.
        /// </summary>
        [JsonIgnore]
        public ICollection<School> Schools { get; set; } = new List<School>();

        [JsonIgnore]
        public ICollection<EdumanLicense> Licenses { get; set; } = new List<EdumanLicense>();
    }

    // ---------- School ----------
    /// <summary>
    /// Kuruma bağlı eğitim kurumunu ifade eder. Address ve BranchCount gibi
    /// alanlar kampüs bilgilerini tutar.
    /// </summary>
    public class School : BaseAuditableEntity<Guid>
    {
        public Guid InstitutionId { get; set; }

        [JsonIgnore]
        public Institution Institution { get; set; } = null!;

        public string Name { get; set; } = null!;
        public string? Address { get; set; }

        // yeni alan 👇
        public int? BranchCount { get; set; }

        [JsonIgnore]
        public ICollection<Class> Classes { get; set; } = new List<Class>();
    }

    // ---------- Class ----------
    /// <summary>
    /// Okul içerisindeki sınıf/kademe. Level + Section birleşimi sınıfı benzersiz
    /// şekilde tanımlar (örn. 9-A).
    /// </summary>
    public class Class : BaseAuditableEntity<Guid>
    {
        public Guid SchoolId { get; set; }

        [JsonIgnore] // Class → School
        public School School { get; set; } = null!;

        public string Level { get; set; } = null!;   // 9, 10 ...
        public string Section { get; set; } = null!; // A, B...
    }

    // ---------- Role-Permission ----------
    public enum UserStatus { Active = 1, Inactive = 2 }

    /// <summary>
    /// Yetkilendirme sistemi için rol tanımı. Identity ile entegre kullanılmak
    /// üzere saklanır.
    /// </summary>
    public class Role : BaseEntity<Guid>
    {
        public string Name { get; set; } = null!;

        [JsonIgnore]
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }

    /// <summary>
    /// Uygulamada izin verilen atomik aksiyonları temsil eder (örn. "School.Read").
    /// </summary>
    public class Permission : BaseEntity<Guid>
    {
        public string Name { get; set; } = null!;

        [JsonIgnore]
        public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }

    /// <summary>
    /// Rol ve izin arasındaki çoktan çoğa ilişkiyi temsil eden join tablosu.
    /// </summary>
    public class RolePermission
    {
        public Guid RoleId { get; set; }

        [JsonIgnore]
        public Role Role { get; set; } = null!;

        public Guid PermissionId { get; set; }

        [JsonIgnore]
        public Permission Permission { get; set; } = null!;
    }

    // ---------- License ----------
    /// <summary>
    /// Kurumlara verilen Eduman lisanslarını saklar. Start/EndDate alanları
    /// lisans süresini, UserLimit ise kullanıcı kotasını belirler.
    /// </summary>
    public class EdumanLicense : BaseAuditableEntity<Guid>
    {
        public Guid InstitutionId { get; set; }
        public string LicenseKey { get; set; } = null!;

        [JsonIgnore]
        public Institution Institution { get; set; } = null!;

        public int UserLimit { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public bool IsDemo { get; set; }

        // yeni alanlar 👇
        /// <summary>
        /// Lisans kullanımını takip eden ilave metrikler. Type/Status alanları
        /// dashboard raporlamasında kullanılmak üzere eklenmiştir.
        /// </summary>
        public int? UsedUsers { get; set; }
        public string? Type { get; set; } // örn: "standard", "enterprise"
        public string? Status { get; set; } // "active" | "demo" | "expiring" | "passive"
    }
}
