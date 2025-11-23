namespace Eduman.Application.Dtos
{
    /// <summary>
    ///     Role API'sinin giriş/çıkış sözleşmesini temsil eden DTO.
    /// </summary>
    public class RoleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
