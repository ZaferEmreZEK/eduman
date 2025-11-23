namespace Eduman.Application.Dtos
{
    /// <summary>
    ///     School entity'sinin API sınırında kullanılan veri sözleşmesi. Ek alanlar
    ///     (Address, BranchCount) UI'ya gerekli metadata'yı sağlar.
    /// </summary>
    public class SchoolDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public Guid InstitutionId { get; set; }
        public int? BranchCount { get; set; }
    }
}
