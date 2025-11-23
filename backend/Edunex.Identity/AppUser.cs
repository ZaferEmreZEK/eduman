using System;
using Microsoft.AspNetCore.Identity;
using Eduman.Domain.Entities;

namespace Edunex.Identity
{
    /// <summary>
    ///     ASP.NET Identity kullanıcı modelinin domain ihtiyaçlarına göre genişletilmiş hali.
    /// </summary>
    public class AppUser : IdentityUser<Guid>
    {
        /// <summary>
        ///     Kullanıcının görünen adı.
        /// </summary>
        public string FullName { get; set; } = string.Empty;

        /// <summary>
        ///     Kullanıcının bağlı olduğu kurum (tenant) kimliği.
        /// </summary>
        public Guid? InstitutionId { get; set; }

        /// <summary>
        ///     Yetki kontrolleri için kullanılan uygulama içi rol adı.
        /// </summary>
        public string Role { get; set; } = "user";

        /// <summary>
        ///     Domain katmanındaki UserStatus enum'u ile kullanıcı aktif/pasif durumunu tutar.
        /// </summary>
        public UserStatus Status { get; set; } = UserStatus.Active;
    }
}
