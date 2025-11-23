namespace Eduman.Application.Dtos;

/// <summary>
///     Class entity'sinin HTTP katmanında taşınan sadeleştirilmiş görünümü.
///     Controller'lar yeni kayıt alırken veya liste dönerken bu tip üzerinden
///     konuşur.
/// </summary>
public class ClassDto
{
    public Guid Id { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Section { get; set; } = string.Empty;
    public Guid SchoolId { get; set; }
}
