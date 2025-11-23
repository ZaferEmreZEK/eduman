namespace Eduman.Application.Dtos
{
    /// <summary>
    ///     Kurum lisansları için API ile domain arasındaki veri sözleşmesi.
    /// </summary>
    public class LicenseDto
    {
        public Guid Id { get; set; }
        public string LicenseKey { get; set; } = string.Empty;
        public Guid InstitutionId { get; set; }
        public int UserLimit { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public bool IsDemo { get; set; }

        /// <summary>
        ///     Lisans kullanımını raporlamak için isteğe bağlı metrikler.
        /// </summary>
        public int? UsedUsers { get; set; }
        public string? Type { get; set; }
        public string? Status { get; set; }
    }
}
