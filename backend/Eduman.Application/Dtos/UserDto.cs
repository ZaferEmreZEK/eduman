namespace Eduman.Application.Dtos
{
    /// <summary>
    ///     Kullanıcı CRUD akışları için kullanılan veri transfer nesnesi.
    /// </summary>
    public class UserDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public Guid? InstitutionId { get; set; }
        public string Status { get; set; } = "active";
    }
}
