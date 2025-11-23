namespace Eduman.Application.Dtos
{
    /// <summary>
    /// Institution entity'sinin API ile paylaşılan alanlarını taşıyan DTO.
    /// </summary>
    public class InstitutionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid TenantId { get; set; }
        public string? Address { get; set; }
        public string? Type { get; set; } // public | private
    }
}
